import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow, mapRows } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: rows } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({ codes: mapRows(rows ?? []) });
}

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderValue, maxUses, expiresAt } = body;

  if (!code || !discountType || discountValue == null) {
    return NextResponse.json({ error: 'code, discountType and discountValue are required' }, { status: 400 });
  }
  if (discountType === 'percent' && (discountValue <= 0 || discountValue > 100)) {
    return NextResponse.json({ error: 'Percent discount must be between 1 and 100' }, { status: 400 });
  }
  if (discountType === 'flat' && discountValue <= 0) {
    return NextResponse.json({ error: 'Flat discount must be greater than 0' }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from('promo_codes')
    .insert({
      code:            (code as string).trim().toUpperCase(),
      description:     description || null,
      discount_type:   discountType,
      discount_value:  discountValue,
      min_order_value: minOrderValue || null,
      max_uses:        maxUses || null,
      expires_at:      expiresAt || null,
      is_active:       true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A promo code with that name already exists' }, { status: 409 });
    }
    console.error('Create promo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ promo: mapRow(row) }, { status: 201 });
}
