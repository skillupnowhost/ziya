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
    const action = searchParams.get('action') || '';
    const skip   = (page - 1) * limit;

    let query = supabase
      .from('coupon_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (action) query = query.eq('action', action);

    const { data: rows, count, error } = await query.range(skip, skip + limit - 1);

    if (error) {
      console.error('Coupon logs error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const { count: unreadCount } = await supabase
      .from('coupon_logs')
      .select('id', { count: 'exact', head: true })
      .eq('is_admin_read', false);

    const total = count ?? 0;
    return NextResponse.json({
      logs:        mapRows(rows ?? []),
      unreadCount: unreadCount ?? 0,
      pagination:  { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Coupon logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mark all logs as read
export async function PATCH(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('coupon_logs')
      .update({ is_admin_read: true })
      .eq('is_admin_read', false);

    if (error) {
      console.error('Mark logs read error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark logs read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
