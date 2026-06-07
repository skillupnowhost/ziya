import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

interface ReviewData {
  _id: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string;
  productName: string;
  isVerifiedPurchase: boolean;
}

interface Stats {
  avgRating: number;
  total: number;
}

async function getFeaturedReviews(): Promise<{ reviews: ReviewData[]; stats: Stats }> {
  try {
    await connectDB();

    const reviews = await Review.find({ rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    if (reviews.length === 0) {
      return { reviews: [], stats: { avgRating: 0, total: 0 } };
    }

    const productIds = [...new Set(reviews.map((r) => r.productId.toString()))];
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name')
      .lean();

    const productMap = Object.fromEntries(
      (products as Array<{ _id: { toString(): string }; name: string }>).map((p) => [
        p._id.toString(),
        p.name,
      ])
    );

    const [total, ratingAgg] = await Promise.all([
      Review.countDocuments(),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    const avgRating = ratingAgg[0]?.avg ? Math.round(ratingAgg[0].avg * 10) / 10 : 0;

    const enriched: ReviewData[] = (
      reviews as Array<{
        _id: { toString(): string };
        userName: string;
        userAvatar?: string;
        rating: number;
        comment: string;
        productId: { toString(): string };
        isVerifiedPurchase: boolean;
      }>
    ).map((r) => ({
      _id: r._id.toString(),
      userName: r.userName,
      userAvatar: r.userAvatar || null,
      rating: r.rating,
      comment: r.comment,
      productName: productMap[r.productId.toString()] || 'Ziya Product',
      isVerifiedPurchase: r.isVerifiedPurchase,
    }));

    return { reviews: enriched, stats: { avgRating, total } };
  } catch {
    return { reviews: [], stats: { avgRating: 0, total: 0 } };
  }
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xl' }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`${size === 'xl' ? 'text-xl' : 'text-sm'} ${
            i < rating ? 'text-amber-400' : 'text-gray-200'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200"
      />
    );
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-rose-400',
    'bg-pink-400',
    'bg-fuchsia-400',
    'bg-purple-400',
    'bg-indigo-400',
    'bg-sky-400',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`w-10 h-10 rounded-full ring-2 ring-rose-200 ${color} flex items-center justify-center text-white text-sm font-semibold`}
    >
      {initials}
    </div>
  );
}

export default async function TestimonialsSection() {
  const { reviews, stats } = await getFeaturedReviews();

  if (reviews.length === 0) return null;

  const displayRating = stats.avgRating > 0 ? stats.avgRating : null;
  const displayTotal = stats.total > 0 ? stats.total : null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-rose-400 text-sm tracking-[0.3em] uppercase font-medium mb-2">
            Reviews
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
            Our Happy Customers
          </h2>
          {displayRating && displayTotal && (
            <div className="flex items-center justify-center gap-1 mt-3">
              <StarRating rating={Math.round(displayRating)} size="xl" />
              <span className="ml-2 text-gray-600 text-sm font-medium">
                {displayRating} out of 5 ({displayTotal.toLocaleString()}+ reviews)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.slice(0, 4).map((review) => (
            <div
              key={review._id}
              className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={review.userName} avatar={review.userAvatar} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{review.userName}</p>
                </div>
              </div>
              <div className="mb-3">
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>
              {review.isVerifiedPurchase && (
                <p className="text-xs text-rose-400 font-medium mt-3">
                  Verified purchase: {review.productName}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
