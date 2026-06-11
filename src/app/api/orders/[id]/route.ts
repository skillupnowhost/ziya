import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const orderUserId = String((order as { userId: { toString(): string } }).userId);
    if (payload.role !== 'admin' && orderUserId !== String(payload.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Only allow safe fields to be updated
    const update: Record<string, unknown> = {};
    if (body.status !== undefined) update.status = body.status;
    if (body.paymentStatus !== undefined) update.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) update.trackingNumber = body.trackingNumber;
    if (body.notes !== undefined) update.notes = body.notes;

    // Deduct stock when admin confirms payment for manual orders
    if (body.paymentStatus === 'paid') {
      const existing = await Order.findById(id).lean() as { paymentStatus: string; paymentMethod: string; items: { productId: unknown; quantity: number }[] } | null;
      if (existing && existing.paymentStatus !== 'paid' && existing.paymentMethod === 'manual') {
        for (const item of existing.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
      }
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Customer-only: update shipping address before payment confirmation / shipping
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const existing = await Order.findById(id).lean() as { userId: { toString(): string }; paymentStatus: string; status: string } | null;
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (String(existing.userId) !== String(payload.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const lockedStatuses = ['shipped', 'delivered', 'cancelled'];
    if (existing.paymentStatus === 'paid' || lockedStatuses.includes(existing.status)) {
      return NextResponse.json({ error: 'Order can no longer be modified' }, { status: 400 });
    }

    const { shippingAddress } = await req.json();
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return NextResponse.json({ error: 'shippingAddress is required' }, { status: 400 });
    }

    const update: Record<string, string> = {};
    const allowed = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    for (const field of allowed) {
      if (typeof shippingAddress[field] === 'string' && shippingAddress[field].trim()) {
        update[`shippingAddress.${field}`] = shippingAddress[field].trim();
      }
    }

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true });
    return NextResponse.json({ order });
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

    await connectDB();
    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
