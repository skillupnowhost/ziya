'use client';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import { ChevronLeftIcon, ChevronRightIcon, FireIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export default function TrendingSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get('/api/products?trending=true&limit=8')
      .then((r) => setProducts(r.data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [products]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-white relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            {/* Sub-label row with LIVE badge */}
            <div className="flex items-center gap-2.5 mb-2">
              <p className="text-rose-400 text-xs tracking-[0.35em] uppercase font-semibold">Popular</p>
              <span className="flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md shadow-rose-400/30">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                LIVE
              </span>
            </div>

            {/* Title row */}
            <div className="flex items-center gap-3">
              <FireIcon className="flame-icon w-8 h-8 text-rose-500 shrink-0" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
                Trending{' '}
                <span className="trending-shimmer">Now</span>
              </h2>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`group p-2.5 liquid-glass rounded-full transition-all duration-200 shadow-sm
                ${canScrollLeft
                  ? 'text-gray-600 hover:text-rose-500 hover:shadow-rose-200/50 hover:scale-110 active:scale-95'
                  : 'text-gray-300 cursor-not-allowed opacity-50'}`}
            >
              <ChevronLeftIcon className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`group p-2.5 liquid-glass rounded-full transition-all duration-200 shadow-sm
                ${canScrollRight
                  ? 'text-gray-600 hover:text-rose-500 hover:shadow-rose-200/50 hover:scale-110 active:scale-95'
                  : 'text-gray-300 cursor-not-allowed opacity-50'}`}
            >
              <ChevronRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
            <Link
              href="/products?trending=true"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-600 transition-colors group"
            >
              View all
              <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Scroll progress indicators */}
        <div className="flex gap-1.5 mb-5 sm:hidden">
          <div className={`h-0.5 rounded-full transition-all duration-300 ${canScrollLeft ? 'bg-rose-200 flex-1' : 'bg-rose-400 flex-1'}`} />
          <div className={`h-0.5 rounded-full transition-all duration-300 ${canScrollRight ? 'bg-rose-400 flex-1' : 'bg-rose-200 flex-1'}`} />
        </div>

        {/* Product carousel */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-none w-40 sm:w-48">
                <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-50 rounded-2xl animate-pulse" />
                <div className="mt-3 space-y-2 px-1">
                  <div className={`h-3 bg-gray-100 rounded-full animate-pulse w-3/4 ${i > 0 ? `pulse-delay-${i}` : ''}`} />
                  <div className={`h-3 bg-gray-100 rounded-full animate-pulse w-1/2 ${i > 0 ? `pulse-delay-${i}` : ''}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="flex-none w-40 sm:w-48"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile view-all link */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/products?trending=true"
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-rose-400 text-rose-400 font-semibold rounded-full hover:bg-rose-400 hover:text-white transition-all text-sm group"
          >
            View all trending
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
