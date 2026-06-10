import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const isTrending = searchParams.get('trending');
    const isNew = searchParams.get('new');
    const isFeatured = searchParams.get('featured');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');

    const query: Record<string, unknown> = { isActive: true };
    if (category) query.category = category;
    if (isTrending === 'true') query.isTrending = true;
    if (isNew === 'true') query.isNewProduct = true;
    if (isFeatured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    /* ── price range: match effective price (discountPrice when set, else price) ── */
    if (priceMin !== null || priceMax !== null) {
      const min = priceMin ? parseFloat(priceMin) : null;
      const max = priceMax ? parseFloat(priceMax) : null;
      const build = (field: string) => {
        const c: Record<string, number> = {};
        if (min !== null) c.$gte = min;
        if (max !== null) c.$lte = max;
        return { [field]: c };
      };
      /* match if discountPrice is in range OR (no discountPrice AND price is in range) */
      query.$or = [
        { discountPrice: { ...(min !== null ? { $gte: min } : {}), ...(max !== null ? { $lte: max } : {}), $exists: true, $gt: 0 } },
        { ...build('price'), $or: [{ discountPrice: { $exists: false } }, { discountPrice: null }, { discountPrice: 0 }] },
      ];
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
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

    await connectDB();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
