import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CouponLog from '@/models/CouponLog';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action') || '';
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (action) query.action = action;

    const [logs, total, unreadCount] = await Promise.all([
      CouponLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CouponLog.countDocuments(query),
      CouponLog.countDocuments({ isAdminRead: false }),
    ]);

    return NextResponse.json({
      logs,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
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

    await connectDB();
    await CouponLog.updateMany({ isAdminRead: false }, { isAdminRead: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark logs read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
