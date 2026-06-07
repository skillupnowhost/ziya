import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import NewsletterCoupon from '@/models/NewsletterCoupon';
import CouponLog from '@/models/CouponLog';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (payload.role !== 'admin') query.userId = payload.id;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
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

    await connectDB();
    const body = await req.json();
    const { items, shippingAddress, paymentMethod, promoCode } = body;

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }

      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });
    }

    const shippingCost = subtotal >= 999 ? 0 : 99;
    let discount = 0;

    // Validate newsletter coupons server-side (cannot be bypassed from client)
    let newsletterCoupon = null;
    if (promoCode) {
      const code = promoCode.trim().toUpperCase();
      if (code === 'ZIYA20') {
        discount = Math.round(subtotal * 0.2);
      } else if (code === 'FREESHIP') {
        discount = shippingCost;
      } else if (code.startsWith('ZIYA10-')) {
        newsletterCoupon = await NewsletterCoupon.findOne({ couponCode: code });
        if (!newsletterCoupon || newsletterCoupon.isUsed) {
          return NextResponse.json({ error: 'This coupon is invalid or has already been used' }, { status: 400 });
        }
        // Enforce first-order rule
        const priorOrders = await Order.countDocuments({
          userId: payload.id,
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
        });
        if (priorOrders > 0) {
          return NextResponse.json({ error: 'This coupon is valid on your first order only' }, { status: 400 });
        }
        discount = Math.round(subtotal * 0.1);
      }
    }

    const total = subtotal + shippingCost - discount;

    const order = await Order.create({
      userId: payload.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      promoCode,
      subtotal,
      shippingCost,
      discount,
      total,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    // Deduct stock for COD orders
    if (paymentMethod === 'cod') {
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
    }

    // Mark newsletter coupon as used
    if (newsletterCoupon) {
      await NewsletterCoupon.findByIdAndUpdate(newsletterCoupon._id, {
        isUsed: true,
        usedAt: new Date(),
        usedByUserId: payload.id,
        usedInOrderId: order._id,
      });
      await CouponLog.create({
        email: newsletterCoupon.email,
        couponCode: newsletterCoupon.couponCode,
        action: 'used',
        reason: `Redeemed on order ${order._id}`,
        userId: payload.id,
        orderId: order._id,
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
