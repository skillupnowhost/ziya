import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  try {
    const { couponCode, subtotal } = await req.json();
    if (!couponCode) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const code = (couponCode as string).trim().toUpperCase();
    const ipAddress = getClientIp(req);

    // Admin-created promo codes
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (promo) {
      if (!promo.is_active) {
        return NextResponse.json({ valid: false, error: 'This promo code is no longer active' });
      }
      if (promo.expires_at && new Date() > new Date(promo.expires_at as string)) {
        return NextResponse.json({ valid: false, error: 'This promo code has expired' });
      }
      if (promo.max_uses != null && (promo.used_count as number) >= (promo.max_uses as number)) {
        return NextResponse.json({ valid: false, error: 'This promo code has reached its usage limit' });
      }
      if (promo.min_order_value != null && subtotal != null && subtotal < (promo.min_order_value as number)) {
        return NextResponse.json({
          valid: false,
          error: `Minimum order value of ₹${promo.min_order_value} required for this code`,
        });
      }
      return NextResponse.json({
        valid: true,
        type:          promo.discount_type,
        value:         promo.discount_value,
        code,
        description:   promo.description || null,
        minOrderValue: promo.min_order_value || null,
      });
    }

    // Newsletter coupon (ZIYA10-XXXXXXXX format)
    if (code.startsWith('ZIYA10-')) {
      const payload = getUserFromRequest(req);

      const { data: coupon } = await supabase
        .from('newsletter_coupons')
        .select('*')
        .eq('coupon_code', code)
        .maybeSingle();

      if (!coupon) {
        if (payload) {
          await supabase.from('coupon_logs').insert({
            email:       'unknown',
            coupon_code: code,
            action:      'rejected_not_found',
            reason:      'Coupon code does not exist',
            ip_address:  ipAddress,
            user_id:     payload.id,
          });
        }
        return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
      }

      if (coupon.is_used) {
        await supabase.from('coupon_logs').insert({
          email:       coupon.email,
          coupon_code: code,
          action:      'rejected_already_used',
          reason:      'Coupon already redeemed',
          ip_address:  ipAddress,
          user_id:     payload?.id ?? null,
        });
        return NextResponse.json({ valid: false, error: 'This coupon has already been used' });
      }

      if (payload) {
        const { count: priorOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', payload.id as string)
          .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

        if ((priorOrders ?? 0) > 0) {
          await supabase.from('coupon_logs').insert({
            email:       coupon.email,
            coupon_code: code,
            action:      'rejected_not_first_order',
            reason:      'User already has prior orders',
            ip_address:  ipAddress,
            user_id:     payload.id,
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
