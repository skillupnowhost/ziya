import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRows } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      { count: totalOrders },
      { count: totalUsers },
      { count: totalProducts },
      { data: revenueRows },
      { data: recentRows },
      { data: statusRows },
      { count: outOfStockCount },
    ] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('total').eq('payment_status', 'paid'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('status'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true).lte('stock', 0),
    ]);

    const totalRevenue = (revenueRows ?? []).reduce((sum, r) => sum + ((r.total as number) || 0), 0);

    // Group orders by status
    const statusMap: Record<string, number> = {};
    for (const r of statusRows ?? []) {
      const s = r.status as string;
      statusMap[s] = (statusMap[s] || 0) + 1;
    }
    const ordersByStatus = Object.entries(statusMap).map(([_id, count]) => ({ _id, count }));

    return NextResponse.json({
      stats: {
        totalOrders:       totalOrders  ?? 0,
        totalUsers:        totalUsers   ?? 0,
        totalProducts:     totalProducts ?? 0,
        totalRevenue,
        outOfStockCount:   outOfStockCount ?? 0,
      },
      recentOrders:  mapRows(recentRows ?? []),
      ordersByStatus,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
