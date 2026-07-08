import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const { data: orderRow, error } = await supabase
      .from('orders')
      .update({
        payment_status:    'paid',
        payment_id:        razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        status:            'confirmed',
      })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error || !orderRow) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Auto-save shipping address to user's saved addresses
    try {
      const shippingAddress = orderRow.shipping_address as Record<string, string> | null;
      if (shippingAddress) {
        const { data: userData } = await supabase
          .from('users')
          .select('addresses')
          .eq('id', payload.id as string)
          .maybeSingle();

        const savedAddresses = (userData?.addresses as Record<string, string>[] | null) || [];
        const isDuplicate = savedAddresses.some((a) => {
          const addrKeys = ['doorNumber', 'streetName', 'city', 'state', 'pincode'] as const;
          return addrKeys.every((k) => (a[k] || '').toLowerCase().trim() === (shippingAddress[k] || '').toLowerCase().trim());
        });

        if (!isDuplicate) {
          const newAddr = {
            doorNumber: shippingAddress.doorNumber || '',
            streetName: shippingAddress.streetName || '',
            landmark: shippingAddress.landmark || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            pincode: shippingAddress.pincode || '',
            country: shippingAddress.country || 'India',
          };
          await supabase
            .from('users')
            .update({ addresses: [...savedAddresses, newAddr] })
            .eq('id', payload.id as string);
        }
      }
    } catch (addrErr) {
      console.error('Auto-save address error:', addrErr);
    }

    // Deduct stock for each item and check for out-of-stock
    const items = orderRow.items as { productId: string; quantity: number; name?: string }[];
    const outOfStockProducts: { id: string; name: string }[] = [];

    for (const item of items) {
      await supabase.rpc('decrement_product_stock', {
        p_id: item.productId,
        amount: item.quantity,
      });

      const { data: product } = await supabase
        .from('products')
        .select('id, name, stock')
        .eq('id', item.productId)
        .maybeSingle();

      if (product && (product.stock as number) <= 0) {
        outOfStockProducts.push({ id: product.id as string, name: product.name as string });
      }
    }

    // Notify admin about out-of-stock products
    if (outOfStockProducts.length > 0) {
      await supabase.from('admin_notifications').insert(
        outOfStockProducts.map(({ id: productId, name }) => ({
          type: 'out_of_stock',
          title: 'Product Out of Stock',
          message: `"${name}" is now out of stock after order #${orderId.slice(-8).toUpperCase()}`,
          product_id: productId,
          is_read: false,
        }))
      );
    }

    return NextResponse.json({ message: 'Payment verified', order: mapRow(orderRow) });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
