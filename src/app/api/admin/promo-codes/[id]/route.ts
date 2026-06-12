import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Map camelCase fields to snake_case
  const update: Record<string, unknown> = {};
  const camelToSnake: Record<string, string> = {
    discountType:   'discount_type',
    discountValue:  'discount_value',
    minOrderValue:  'min_order_value',
    maxUses:        'max_uses',
    usedCount:      'used_count',
    expiresAt:      'expires_at',
    isActive:       'is_active',
  };
  for (const [k, v] of Object.entries(body)) {
    update[camelToSnake[k] ?? k] = v;
  }

  const { data: row } = await supabase
    .from('promo_codes')
    .update(update)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ promo: mapRow(row) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { data: row } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
