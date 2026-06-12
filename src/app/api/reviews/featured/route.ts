import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Top 8 reviews with rating >= 4, newest first
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, user_name, user_avatar, rating, comment, product_id, is_verified_purchase, created_at')
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(8);

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ reviews: [], stats: { avgRating: 0, total: 0 } });
    }

    // Fetch product names for the reviewed products
    const productIds = [...new Set(reviews.map((r) => r.product_id as string))];
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productMap: Record<string, string> = {};
    for (const p of products ?? []) {
      productMap[p.id as string] = p.name as string;
    }

    // Total count and average rating across all reviews
    const { count: total } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true });

    const { data: avgRows } = await supabase
      .from('reviews')
      .select('rating');

    let avgRating = 0;
    if (avgRows && avgRows.length > 0) {
      const sum = avgRows.reduce((acc, r) => acc + (r.rating as number), 0);
      avgRating = Math.round((sum / avgRows.length) * 10) / 10;
    }

    const enriched = reviews.map((r) => ({
      _id:               r.id,
      userName:          r.user_name,
      userAvatar:        r.user_avatar || null,
      rating:            r.rating,
      comment:           r.comment,
      productName:       productMap[r.product_id as string] || 'Ziya Product',
      isVerifiedPurchase: r.is_verified_purchase,
      createdAt:         r.created_at,
    }));

    return NextResponse.json({ reviews: enriched, stats: { avgRating, total: total ?? 0 } });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
