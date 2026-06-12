import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: row } = await supabase
      .from('users')
      .select('id, name, email, role, phone, avatar, addresses, default_address, created_at, updated_at')
      .eq('id', payload.id as string)
      .maybeSingle();

    if (!row) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: mapRow(row) });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, phone, avatar, addresses, defaultAddress } = body;

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (avatar !== undefined) update.avatar = avatar;
    if (addresses !== undefined) update.addresses = addresses;
    if (defaultAddress !== undefined) update.default_address = defaultAddress;

    const { data: row, error } = await supabase
      .from('users')
      .update(update)
      .eq('id', payload.id as string)
      .select('id, name, email, role, phone, avatar, addresses, default_address, created_at, updated_at')
      .single();

    if (error || !row) {
      console.error('Update profile error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ user: mapRow(row) });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
