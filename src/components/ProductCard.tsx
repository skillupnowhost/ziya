'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBagIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import toast from 'react-hot-toast';

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
  gstEnabled?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [cartPopping, setCartPopping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const { addItem, items: cartItems } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const inCart = cartItems.some((i) => i.productId === product._id);
  const liked = isWishlisted(product._id);
  const total = product.images.length;

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Auto-slide every 2s, pause while hovering
  useEffect(() => {
    if (total <= 1 || hovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % total);
    }, 2000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total, hovered]);

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIdx((i) => (i - 1 + total) % total);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIdx((i) => (i + 1) % total);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartPopping || product.stock <= 0) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0] || '',
      quantity: 1,
      stock: product.stock,
      gstEnabled: product.gstEnabled ?? true,
    });
    setCartPopping(true);
    setTimeout(() => setCartPopping(false), 600);
    toast.success('Added to bag!', {
      icon: '🛍️',
      style: { fontWeight: '500' },
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0] || '',
      category: product.category,
    });
    if (!liked) toast('Saved to favourites ♡', { style: { fontWeight: '500' } });
  };

  return (
    <Link href={`/products/${product._id}`} className="block group">
      <div className="relative bg-white rounded-3xl border border-pink-100 shadow-[0_2px_12px_rgba(249,168,212,0.12)] hover:shadow-[0_12px_40px_rgba(249,168,212,0.35),0_4px_16px_rgba(249,168,212,0.15)] hover:-translate-y-1.5 transition-all duration-300 ease-out">

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.isNew && (
            <span className="bg-emerald-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm">New</span>
          )}
          {product.isTrending && (
            <span className="bg-gradient-to-r from-pink-300 to-rose-300 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm">Trending</span>
          )}
          {discount > 0 && (
            <span className="bg-rose-300 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm">-{discount}%</span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={handleWishlist}
          type="button"
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${liked ? 'bg-pink-300 scale-110' : 'bg-white/90 hover:bg-pink-50 hover:scale-110'}`}
        >
          {liked
            ? <HeartSolid className="w-4 h-4 text-white" />
            : <HeartIcon className="w-4 h-4 text-gray-500" />
          }
        </button>

        {/* Square image container */}
        <div
          className="relative overflow-hidden bg-gray-50 aspect-square rounded-t-3xl"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Crossfade image stack */}
          <div className="relative w-full h-full">
            {product.images.length > 0 ? product.images.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-[1.04] ${i === imgIdx ? 'opacity-100' : 'opacity-0'}`}
              />
            )) : (
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop"
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Liquid glass prev/next arrows */}
          {total > 1 && (
            <>
              <button
                onClick={goPrev}
                type="button"
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full backdrop-blur-md bg-white/20 border border-white/40 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40 hover:scale-110 active:scale-95"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5 text-white drop-shadow-sm" />
              </button>
              <button
                onClick={goNext}
                type="button"
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full backdrop-blur-md bg-white/20 border border-white/40 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40 hover:scale-110 active:scale-95"
              >
                <ChevronRightIcon className="w-3.5 h-3.5 text-white drop-shadow-sm" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1 pointer-events-none">
              {product.images.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${i === imgIdx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex flex-col items-center justify-center gap-2 z-10">
              <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <span className="text-white font-bold text-sm tracking-wider uppercase px-4 py-1.5 bg-red-500/80 rounded-full backdrop-blur-sm shadow-lg animate-pulse">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick Add */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out px-3 pb-3">
              {inCart ? (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/cart'); }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-semibold shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  In Cart · View →
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  type="button"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-semibold shadow-lg transition-all duration-200 ${
                    cartPopping
                      ? 'bg-emerald-400 text-white scale-95'
                      : 'bg-pink-300 hover:bg-pink-400 text-white'
                  }`}
                >
                  <ShoppingBagIcon className={`w-4 h-4 transition-transform duration-300 ${cartPopping ? 'scale-125' : ''}`} />
                  {cartPopping ? 'Added!' : 'Quick Add'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 rounded-b-3xl">
          <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>

          <div className="flex items-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon
                key={s}
                className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount})</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">
                ₹{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">{discount}% off</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
