import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: row, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !row) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product: mapRow(row) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Map any camelCase fields to snake_case for DB
    const update: Record<string, unknown> = {};
    const camelToSnake: Record<string, string> = {
      discountPrice: 'discount_price',
      reviewCount:   'review_count',
      isFeatured:    'is_featured',
      isNewProduct:  'is_new_product',
      isTrending:    'is_trending',
      isActive:      'is_active',
      gstEnabled:    'gst_enabled',
    };

    for (const [k, v] of Object.entries(body)) {
      const col = camelToSnake[k] ?? k;
      update[col] = v;
    }

    const { data: row, error } = await supabase
      .from('products')
      .update(update)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !row) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Restocked — clear any pending "out of stock" alerts for this product
    if ('stock' in update && (row.stock as number) > 0) {
      await supabase
        .from('admin_notifications')
        .delete()
        .eq('type', 'out_of_stock')
        .eq('product_id', id);
    }

    return NextResponse.json({ product: mapRow(row) });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await supabase.from('products').delete().eq('id', id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
