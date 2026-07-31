import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow, mapRows } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

async function requireAdmin(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return null;
  }
  return payload;
}

async function recalcProductStats(productId: string) {
  const { data: allReviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (error) throw error;

  const count = (allReviews ?? []).length;
  const avgRating = count > 0
    ? Math.round(((allReviews as { rating: number }[]).reduce((sum, r) => sum + (r.rating ?? 0), 0) / count) * 10) / 10
    : 0;

  await supabase
    .from('products')
    .update({ rating: avgRating, review_count: count })
    .eq('id', productId);
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const skip = (page - 1) * limit;

    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (productId) query = query.eq('product_id', productId);
    if (userId) query = query.eq('user_id', userId);

    const { data: rows, count, error } = await query.range(skip, skip + limit - 1);
    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      reviews: mapRows(rows ?? []),
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { id, rating, title, comment } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (rating !== undefined) updates.rating = rating;
    if (title !== undefined) updates.title = title;
    if (comment !== undefined) updates.comment = comment;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: reviewRow, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update review error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (rating !== undefined && reviewRow?.product_id) {
      await recalcProductStats(reviewRow.product_id as string);
    }

    return NextResponse.json({ review: mapRow(reviewRow) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
    }

    const { data: deletedReview, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Delete review error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!deletedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (deletedReview.product_id) {
      await recalcProductStats(deletedReview.product_id as string);
    }

    return NextResponse.json({ review: mapRow(deletedReview) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
