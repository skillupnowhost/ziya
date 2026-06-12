'use client';
import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { EASE_SMOOTH } from '@/lib/easing';

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

  const colors = ['bg-rose-400', 'bg-pink-400', 'bg-fuchsia-400', 'bg-purple-400', 'bg-indigo-400', 'bg-sky-400'];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={`w-10 h-10 rounded-full ring-2 ring-rose-200 ${color} flex items-center justify-center text-white text-sm font-semibold`}>
      {initials}
    </div>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, delay: i * 0.1, ease: EASE_SMOOTH },
  }),
};

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<Stats>({ avgRating: 0, total: 0 });

  useEffect(() => {
    fetch('/api/reviews/featured')
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews || []);
        setStats(d.stats || { avgRating: 0, total: 0 });
      })
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  const displayRating = stats.avgRating > 0 ? stats.avgRating : null;
  const displayTotal = stats.total > 0 ? stats.total : null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-rose-400 text-sm tracking-[0.3em] uppercase font-medium mb-2">Reviews</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">Our Happy Customers</h2>
          {displayRating && displayTotal && (
            <div className="flex items-center justify-center gap-1 mt-3">
              <StarRating rating={Math.round(displayRating)} size="xl" />
              <span className="ml-2 text-gray-600 text-sm font-medium">
                {displayRating} out of 5 ({displayTotal.toLocaleString()}+ reviews)
              </span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.slice(0, 4).map((review, i) => (
            <motion.div
              key={review._id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
