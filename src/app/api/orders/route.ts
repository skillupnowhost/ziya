import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow, mapRows } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { isSameAddressAndPhone } from '@/lib/addressDedupe';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get('page')  || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip  = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (payload.role !== 'admin') {
      query = query.eq('user_id', payload.id as string);
    }

    const { data: rows, count, error } = await query.range(skip, skip + limit - 1);

    if (error) {
      console.error('Get orders error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const total = count ?? 0;
    return NextResponse.json({
      orders: mapRows(rows ?? []),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { items, shippingAddress, paymentMethod, promoCode } = body;

    // Validate stock and calculate totals
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, images, price, discount_price, stock, gst_enabled')
        .eq('id', item.productId)
        .maybeSingle();

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }
      if ((product.stock as number) <= 0) {
        return NextResponse.json({ error: `"${product.name}" is out of stock` }, { status: 400 });
      }
      if ((product.stock as number) < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}. Only ${product.stock} left.` }, { status: 400 });
      }

      const price = (product.discount_price as number) || (product.price as number);
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      const gstEnabled = product.gst_enabled !== false;
      if (gstEnabled) {
        // 5% GST for items priced below ₹1000, 12% for ₹1000+
        const gstRate = price < 1000 ? 5 : 12;
        const halfRate = gstRate / 2;
        totalCgst += Math.ceil(lineTotal * halfRate / 100);
        totalSgst += Math.ceil(lineTotal * halfRate / 100);
      }

      const images = product.images as string[];
      orderItems.push({
        productId: product.id,
        name: product.name,
        image: images[0] || '',
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        gstEnabled,
      });
    }

    const cgst = totalCgst;
    const sgst = totalSgst;
    const gst = cgst + sgst;

    const customerState = ((shippingAddress?.state as string) || '').trim().toLowerCase().replace(/\s+/g, '');
    const isTamilNadu = customerState === 'tamilnadu' || customerState === 'tn';
    const shippingCost = subtotal >= 999 ? 0 : (isTamilNadu ? 79 : 99);
    let discount = 0;

    let appliedPromoCode: Record<string, unknown> | null = null;

    if (promoCode) {
      const code = (promoCode as string).trim().toUpperCase();

      // Admin-created promo codes
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (promo) {
        if (!promo.is_active) {
          return NextResponse.json({ error: 'This promo code is no longer active' }, { status: 400 });
        }
        if (promo.expires_at && new Date() > new Date(promo.expires_at as string)) {
          return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
        }
        if (promo.max_uses != null && (promo.used_count as number) >= (promo.max_uses as number)) {
          return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 });
        }
        if (promo.min_order_value != null && subtotal < (promo.min_order_value as number)) {
          return NextResponse.json({ error: `Minimum order value of ₹${promo.min_order_value} required` }, { status: 400 });
        }
        if (promo.discount_type === 'percent') {
          discount = Math.round(subtotal * (promo.discount_value as number) / 100);
        } else if (promo.discount_type === 'flat') {
          discount = Math.min(promo.discount_value as number, subtotal);
        } else if (promo.discount_type === 'shipping') {
          discount = shippingCost;
        }
        appliedPromoCode = promo;
      } else if (code.startsWith('ZIYA10-')) {
        // Newsletter discount has been discontinued — no longer redeemable
        return NextResponse.json({ error: 'This discount is currently unavailable' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
      }
    }

    const total = subtotal + gst + shippingCost - discount;

    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id:          payload.id,
        items:            orderItems,
        shipping_address: shippingAddress,
        payment_method:   paymentMethod,
        promo_code:       promoCode || null,
        subtotal,
        shipping_cost:    shippingCost,
        discount,
        cgst,
        sgst,
        gst,
        total,
        status:           paymentMethod === 'cod' ? 'confirmed' : 'pending',
        payment_status:   'pending',
      })
      .select()
      .single();

    if (orderErr || !orderRow) {
      console.error('Create order error:', orderErr);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const order = mapRow(orderRow);

    // Auto-save shipping address to user's saved addresses
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('addresses')
        .eq('id', payload.id as string)
        .maybeSingle();

      const savedAddresses = (userData?.addresses as Record<string, string>[] | null) || [];
      const matchIdx = savedAddresses.findIndex((a) => isSameAddressAndPhone(a, shippingAddress));

      let addressesToSave = savedAddresses;
      let defaultIdx = matchIdx;

      if (matchIdx === -1) {
        // No entry with this exact address + phone combo yet — save it as a
        // new entry (a different phone at the same address, or vice versa,
        // is a distinct, valid combination).
        const newAddr = {
          doorNumber: shippingAddress.doorNumber || '',
          streetName: shippingAddress.streetName || '',
          landmark: shippingAddress.landmark || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          pincode: shippingAddress.pincode || '',
          country: shippingAddress.country || 'India',
          phone: shippingAddress.phone || '',
        };
        addressesToSave = [...savedAddresses, newAddr];
        defaultIdx = addressesToSave.length - 1;
      }

      // The address used for this order becomes the default, so it's
      // pre-filled automatically next time the customer checks out.
      await supabase
        .from('users')
        .update({ addresses: addressesToSave, default_address: defaultIdx })
        .eq('id', payload.id as string);
    } catch (addrErr) {
      console.error('Auto-save address error:', addrErr);
    }

    // Deduct stock immediately for COD only
    if (paymentMethod === 'cod') {
      const outOfStockProducts: { id: string; name: string }[] = [];
      for (const item of items) {
        await supabase.rpc('decrement_product_stock', {
          p_id: item.productId,
          amount: item.quantity,
        });

        const { data: updatedProduct } = await supabase
          .from('products')
          .select('id, name, stock')
          .eq('id', item.productId)
          .maybeSingle();

        if (updatedProduct && (updatedProduct.stock as number) <= 0) {
          outOfStockProducts.push({ id: updatedProduct.id as string, name: updatedProduct.name as string });
        }
      }

      if (outOfStockProducts.length > 0) {
        await supabase.from('admin_notifications').insert(
          outOfStockProducts.map(({ id: productId, name }) => ({
            type: 'out_of_stock',
            title: 'Product Out of Stock',
            message: `"${name}" is now out of stock after COD order #${String(order.id).slice(-8).toUpperCase()}`,
            product_id: productId,
            is_read: false,
          }))
        );
      }
    }

    // Increment promo code usage
    if (appliedPromoCode) {
      await supabase.rpc('increment_promo_used_count', { p_id: appliedPromoCode.id });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
