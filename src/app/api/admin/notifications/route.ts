import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch unread notifications
    const { data: notifications } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Also fetch products currently at 0 stock
    const { data: outOfStockProducts } = await supabase
      .from('products')
      .select('id, name, stock, images')
      .eq('is_active', true)
      .lte('stock', 0)
      .order('updated_at', { ascending: false });

    return NextResponse.json({
      notifications: notifications ?? [],
      outOfStockProducts: (outOfStockProducts ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        image: (p.images as string[])?.[0] || '',
      })),
    });
  } catch (error) {
    console.error('Admin notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { notificationId } = await req.json();

    if (notificationId === 'all') {
      await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);
    } else if (notificationId) {
      await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
