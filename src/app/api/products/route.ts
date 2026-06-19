import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow, mapRows } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page      = parseInt(searchParams.get('page')  || '1');
    const limit     = parseInt(searchParams.get('limit') || '20');
    const category  = searchParams.get('category');
    const search    = searchParams.get('search');
    const sort      = searchParams.get('sort')  || 'created_at';
    const order     = searchParams.get('order') || 'desc';
    const isTrending = searchParams.get('trending');
    const isNew      = searchParams.get('new');
    const isFeatured = searchParams.get('featured');
    const priceMin   = searchParams.get('priceMin');
    const priceMax   = searchParams.get('priceMax');

    // Map camelCase sort field to snake_case column name
    const sortColumnMap: Record<string, string> = {
      createdAt: 'created_at',
      created_at: 'created_at',
      price: 'price',
      rating: 'rating',
      reviewCount: 'review_count',
      review_count: 'review_count',
    };
    const sortCol = sortColumnMap[sort] || 'created_at';
    const ascending = order === 'asc';

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (category)         query = query.eq('category', category);
    if (isTrending === 'true') query = query.eq('is_trending', true);
    if (isNew === 'true')      query = query.eq('is_new_product', true);
    if (isFeatured === 'true') query = query.eq('is_featured', true);

    // Full-text search
    if (search) {
      query = query.textSearch('fts', search, { type: 'websearch', config: 'english' });
    }

    // Price range — match discount_price when set, else price
    if (priceMin !== null || priceMax !== null) {
      const min = priceMin ? parseFloat(priceMin) : null;
      const max = priceMax ? parseFloat(priceMax) : null;

      const discountFilters: string[] = ['discount_price.not.is.null'];
      const priceFilters:    string[] = ['discount_price.is.null'];

      if (min !== null) { discountFilters.push(`discount_price.gte.${min}`); priceFilters.push(`price.gte.${min}`); }
      if (max !== null) { discountFilters.push(`discount_price.lte.${max}`); priceFilters.push(`price.lte.${max}`); }

      query = query.or(`and(${discountFilters.join(',')}),and(${priceFilters.join(',')})`);
    }

    const skip = (page - 1) * limit;
    const { data: rows, count, error } = await query
      .order(sortCol, { ascending })
      .range(skip, skip + limit - 1);

    if (error) {
      console.error('Get products error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const total = count ?? 0;
    return NextResponse.json({
      products: mapRows(rows ?? []),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Map camelCase body fields to snake_case columns
    const insert: Record<string, unknown> = {
      name:            body.name,
      description:     body.description,
      category:        body.category,
      subcategory:     body.subcategory,
      price:           body.price,
      discount_price:  body.discountPrice ?? body.discount_price,
      stock:           body.stock ?? 0,
      sizes:           body.sizes ?? [],
      colors:          body.colors ?? [],
      images:          body.images ?? [],
      tags:            body.tags ?? [],
      sku:             body.sku,
      brand:           body.brand ?? 'Ziya',
      is_featured:     body.isFeatured  ?? body.is_featured  ?? false,
      is_new_product:  body.isNewProduct ?? body.is_new_product ?? true,
      is_trending:     body.isTrending  ?? body.is_trending  ?? false,
      is_active:       body.isActive    ?? body.is_active    ?? true,
      gst_enabled:     body.gstEnabled  ?? body.gst_enabled  ?? true,
    };

    const { data: row, error } = await supabase
      .from('products')
      .insert(insert)
      .select()
      .single();

    if (error || !row) {
      console.error('Create product error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ product: mapRow(row) }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
