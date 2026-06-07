import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NewsletterCoupon from '@/models/NewsletterCoupon';
import CouponLog from '@/models/CouponLog';
import Order from '@/models/Order';
import { getUserFromRequest } from '@/lib/auth';

// Static admin-issued codes (not first-order restricted)
const STATIC_CODES: Record<string, { type: 'percent' | 'shipping'; value: number }> = {
  ZIYA20: { type: 'percent', value: 20 },
  FREESHIP: { type: 'shipping', value: 0 },
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  try {
    const { couponCode } = await req.json();
    if (!couponCode) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const code = couponCode.trim().toUpperCase();
    const ipAddress = getClientIp(req);

    // Static codes — no DB check needed
    if (STATIC_CODES[code]) {
      return NextResponse.json({ valid: true, ...STATIC_CODES[code], code });
    }

    // Newsletter coupon (ZIYA10-XXXXXXXX format)
    if (code.startsWith('ZIYA10-')) {
      await connectDB();
      const payload = getUserFromRequest(req);

      const coupon = await NewsletterCoupon.findOne({ couponCode: code });

      if (!coupon) {
        if (payload) {
          await CouponLog.create({
            email: 'unknown',
            couponCode: code,
            action: 'rejected_not_found',
            reason: 'Coupon code does not exist',
            ipAddress,
            userId: payload.id,
          });
        }
        return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
      }

      if (coupon.isUsed) {
        await CouponLog.create({
          email: coupon.email,
          couponCode: code,
          action: 'rejected_already_used',
          reason: 'Coupon already redeemed',
          ipAddress,
          userId: payload?.id,
        });
        return NextResponse.json({ valid: false, error: 'This coupon has already been used' });
      }

      // First-order check — only valid if user has no prior completed orders
      if (payload) {
        const priorOrders = await Order.countDocuments({
          userId: payload.id,
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
        });
        if (priorOrders > 0) {
          await CouponLog.create({
            email: coupon.email,
            couponCode: code,
            action: 'rejected_not_first_order',
            reason: 'User already has prior orders',
            ipAddress,
            userId: payload.id,
          });
          return NextResponse.json({ valid: false, error: 'This coupon is valid on your first order only' });
        }
      }

      return NextResponse.json({ valid: true, type: 'percent', value: 10, code });
    }

    return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}
