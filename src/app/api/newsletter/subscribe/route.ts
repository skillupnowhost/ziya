import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    const ipAddress = getClientIp(req);
    const normalizedEmail = (email as string).toLowerCase().trim();

    // Check if this email already claimed a coupon
    const { data: existing } = await supabase
      .from('newsletter_coupons')
      .select('coupon_code')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      await supabase.from('coupon_logs').insert({
        email:       normalizedEmail,
        coupon_code: existing.coupon_code,
        action:      'duplicate_email_attempt',
        reason:      'Email already subscribed',
        ip_address:  ipAddress,
      });
      return NextResponse.json({
        alreadyClaimed: true,
        couponCode: existing.coupon_code,
        message: 'You already have a coupon! Check your earlier subscription.',
      });
    }

    // Generate a unique coupon code
    let couponCode = generateCouponCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: clash } = await supabase
        .from('newsletter_coupons')
        .select('id')
        .eq('coupon_code', couponCode)
        .maybeSingle();
      if (!clash) break;
      couponCode = generateCouponCode();
      attempts++;
    }

    const { error } = await supabase
      .from('newsletter_coupons')
      .insert({ email: normalizedEmail, coupon_code: couponCode, ip_address: ipAddress });

    if (error) {
      console.error('Newsletter subscribe error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    await supabase.from('coupon_logs').insert({
      email:       normalizedEmail,
      coupon_code: couponCode,
      action:      'claimed',
      reason:      'Newsletter subscription',
      ip_address:  ipAddress,
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
