import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRows } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page   = parseInt(searchParams.get('page')  || '1');
    const limit  = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const skip   = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, name, email, role, phone, avatar, created_at, updated_at', { count: 'exact' })
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: rows, count, error } = await query.range(skip, skip + limit - 1);

    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    const total = count ?? 0;
    return NextResponse.json({
      users: mapRows(rows ?? []),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
