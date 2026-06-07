import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const [productCount, customerCount, ratingResult] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Product.aggregate([
        { $match: { isActive: true, rating: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
    ]);

    const avgRating = ratingResult[0]
      ? parseFloat(ratingResult[0].avg.toFixed(1))
      : 0;

    return NextResponse.json({ productCount, customerCount, avgRating });
  } catch {
    return NextResponse.json({ productCount: 0, customerCount: 0, avgRating: 0 });
  }
}
