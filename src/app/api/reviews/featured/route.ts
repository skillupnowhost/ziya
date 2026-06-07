import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();

    const reviews = await Review.find({ rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    if (reviews.length === 0) {
      return NextResponse.json({ reviews: [], stats: { avgRating: 0, total: 0 } });
    }

    const productIds = [...new Set(reviews.map((r) => r.productId.toString()))];
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name')
      .lean();

    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p.name]));

    const [total, ratingAgg] = await Promise.all([
      Review.countDocuments(),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    const avgRating = ratingAgg[0]?.avg ? Math.round(ratingAgg[0].avg * 10) / 10 : 0;

    const enriched = reviews.map((r) => ({
      _id: r._id.toString(),
      userName: r.userName,
      userAvatar: r.userAvatar || null,
      rating: r.rating,
      comment: r.comment,
      productName: productMap[r.productId.toString()] || 'Ziya Product',
      isVerifiedPurchase: r.isVerifiedPurchase,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ reviews: enriched, stats: { avgRating, total } });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
