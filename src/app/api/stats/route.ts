import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const [
      { count: productCount },
      { count: customerCount },
      { data: ratingRows },
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('products').select('rating').eq('is_active', true).gt('rating', 0),
    ]);

    let avgRating = 0;
    if (ratingRows && ratingRows.length > 0) {
      const sum = ratingRows.reduce((acc, r) => acc + ((r.rating as number) || 0), 0);
      avgRating = parseFloat((sum / ratingRows.length).toFixed(1));
    }

    return NextResponse.json({
      productCount:  productCount  ?? 0,
      customerCount: customerCount ?? 0,
      avgRating,
    });
  } catch {
    return NextResponse.json({ productCount: 0, customerCount: 0, avgRating: 0 });
  }
}
