import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { data: row } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!row) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (payload.role !== 'admin' && String(row.user_id) !== String(payload.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const order = mapRow(row);

    // Attach user email for invoice display
    const { data: userRow } = await supabase
      .from('users')
      .select('email, name, phone')
      .eq('id', row.user_id)
      .maybeSingle();

    if (userRow) {
      order.userEmail = userRow.email;
      order.userName = userRow.name;
      order.userPhone = userRow.phone;
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (body.status          !== undefined) update.status           = body.status;
    if (body.paymentStatus   !== undefined) update.payment_status   = body.paymentStatus;
    if (body.trackingNumber  !== undefined) update.tracking_number  = body.trackingNumber;
    if (body.courierService  !== undefined) update.courier_service  = body.courierService;
    if (body.notes           !== undefined) update.notes            = body.notes;

    // Deduct stock when admin confirms payment for manual orders
    if (body.paymentStatus === 'paid') {
      const { data: existing } = await supabase
        .from('orders')
        .select('payment_status, payment_method, items')
        .eq('id', id)
        .maybeSingle();

      if (existing && existing.payment_status !== 'paid' && existing.payment_method === 'manual') {
        const items = existing.items as { productId: string; quantity: number }[];
        for (const item of items) {
          await supabase.rpc('decrement_product_stock', {
            p_id: item.productId,
            amount: item.quantity,
          });
        }
      }
    }

    const { data: row } = await supabase
      .from('orders')
      .update(update)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!row) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order: mapRow(row) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Customer-only: update shipping address before payment confirmation / shipping
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { data: existing } = await supabase
      .from('orders')
      .select('user_id, payment_status, status, shipping_address')
      .eq('id', id)
      .maybeSingle();

    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (String(existing.user_id) !== String(payload.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const lockedStatuses = ['shipped', 'delivered', 'cancelled'];
    if (existing.payment_status === 'paid' || lockedStatuses.includes(existing.status as string)) {
      return NextResponse.json({ error: 'Order can no longer be modified' }, { status: 400 });
    }

    const { shippingAddress } = await req.json();
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return NextResponse.json({ error: 'shippingAddress is required' }, { status: 400 });
    }

    // Merge only allowed fields into existing shipping address
    const allowed = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    const current = (existing.shipping_address as Record<string, string>) || {};
    const merged: Record<string, string> = { ...current };
    for (const field of allowed) {
      if (typeof shippingAddress[field] === 'string' && shippingAddress[field].trim()) {
        merged[field] = shippingAddress[field].trim();
      }
    }

    const { data: row } = await supabase
      .from('orders')
      .update({ shipping_address: merged })
      .eq('id', id)
      .select()
      .maybeSingle();

    return NextResponse.json({ order: mapRow(row!) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { data: row } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!row) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
