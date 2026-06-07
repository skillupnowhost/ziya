import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NewsletterCoupon from '@/models/NewsletterCoupon';
import CouponLog from '@/models/CouponLog';

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ZIYA10-${code}`;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    await connectDB();
    const ipAddress = getClientIp(req);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if this email already claimed a coupon
    const existing = await NewsletterCoupon.findOne({ email: normalizedEmail });
    if (existing) {
      await CouponLog.create({
        email: normalizedEmail,
        couponCode: existing.couponCode,
        action: 'duplicate_email_attempt',
        reason: 'Email already subscribed',
        ipAddress,
      });
      return NextResponse.json({
        alreadyClaimed: true,
        couponCode: existing.couponCode,
        message: 'You already have a coupon! Check your earlier subscription.',
      });
    }

    // Generate a unique coupon code
    let couponCode = generateCouponCode();
    let attempts = 0;
    while (await NewsletterCoupon.findOne({ couponCode }) && attempts < 10) {
      couponCode = generateCouponCode();
      attempts++;
    }

    await NewsletterCoupon.create({ email: normalizedEmail, couponCode, ipAddress });

    // Log the claim — isAdminRead: false triggers admin notification
    await CouponLog.create({
      email: normalizedEmail,
      couponCode,
      action: 'claimed',
      reason: 'Newsletter subscription',
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      couponCode,
      message: 'Your 10% off coupon is ready! Use it on your first order.',
    }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
