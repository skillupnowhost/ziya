import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow, mapRows } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const page  = parseInt(searchParams.get('page')  || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip  = (page - 1) * limit;

    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (productId) query = query.eq('product_id', productId);

    const { data: rows, count, error } = await query.range(skip, skip + limit - 1);

    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    const total = count ?? 0;
    return NextResponse.json({
      reviews: mapRows(rows ?? []),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { productId, rating, title, comment, images, videos } = body;

    const { data: reviewRow, error } = await supabase
      .from('reviews')
      .insert({
        user_id:    payload.id,
        product_id: productId,
        user_name:  (payload.name as string) || 'Customer',
        rating,
        title,
        comment,
        images: images ?? [],
        videos: videos ?? [],
      })
      .select()
      .single();

    if (error) {
      // Unique constraint: user already reviewed this product
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
      }
      console.error('Create review error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Recalculate product rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + (r.rating as number), 0) / allReviews.length;
      await supabase
        .from('products')
        .update({
          rating:       Math.round(avg * 10) / 10,
          review_count: allReviews.length,
        })
        .eq('id', productId);
    }

    return NextResponse.json({ review: mapRow(reviewRow) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
