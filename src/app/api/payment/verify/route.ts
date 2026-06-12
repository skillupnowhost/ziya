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

    // Deduct stock for each item
    const items = orderRow.items as { productId: string; quantity: number }[];
    for (const item of items) {
      await supabase.rpc('decrement_product_stock', {
        p_id: item.productId,
        amount: item.quantity,
      });
    }

    return NextResponse.json({ message: 'Payment verified', order: mapRow(orderRow) });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
