'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRealtimeStock } from '@/hooks/useRealtimeStock';
import toast from 'react-hot-toast';
import { StarIcon, ShoppingBagIcon, HeartIcon, TruckIcon, ShieldCheckIcon, ChevronLeftIcon, ChevronRightIcon, BoltIcon, CheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import ProductCard from '@/components/ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  sizes?: string[];
  colors?: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  tags?: string[];
  brand?: string;
}

interface Review {
  _id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgHovered, setImgHovered] = useState(false);
  const imgTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState<'description' | 'reviews'>('description');

  const { addItem, items: cartItems } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const router = useRouter();

  // Real-time stock from SSE — falls back to product.stock until product loads
  const { stock: liveStock, connected: stockLive } = useRealtimeStock(
    product?._id ?? '',
    product?.stock ?? 0
  );

  useEffect(() => {
    if (!id) return;
    Promise.all([
      axios.get(`/api/products/${id}`),
      axios.get(`/api/reviews?productId=${id}&limit=10`),
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.product);
      setReviews(rRes.data.reviews || []);
      if (pRes.data.product?.sizes?.length) setSelectedSize(pRes.data.product.sizes[0]);
      if (pRes.data.product?.colors?.length) setSelectedColor(pRes.data.product.colors[0]);
      // Fetch related
      return axios.get(`/api/products?category=${pRes.data.product.category}&limit=6`);
    }).then((rRes) => {
      setRelated((rRes.data.products || []).filter((p: Product) => p._id !== id).slice(0, 5));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-slide main image every 2s, pause on hover
  useEffect(() => {
    if (!product || product.images.length <= 1 || imgHovered) {
      if (imgTimerRef.current) clearInterval(imgTimerRef.current);
      return;
    }
    imgTimerRef.current = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % product.images.length);
    }, 2000);
    return () => { if (imgTimerRef.current) clearInterval(imgTimerRef.current); };
  }, [product, imgHovered]);

  const inCart = product ? cartItems.some((i) => i.productId === product._id) : false;
  const wishlisted = product ? isWishlisted(product._id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) { toast.error('Please select a size'); return; }
    addItem({
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
      stock: liveStock,
    });
    toast.success('Added to cart! 🛍️');
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) { toast.error('Please select a size'); return; }
    addItem({
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
      stock: liveStock,
    });
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
      category: product.category,
    });
    toast.success(wishlisted ? 'Removed from favourites' : 'Saved to favourites ♥');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await axios.post('/api/reviews', { productId: id, ...reviewForm });
      toast.success('Review submitted!');
      const r = await axios.get(`/api/reviews?productId=${id}&limit=10`);
      setReviews(r.data.reviews || []);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to submit';
      toast.error(msg || 'Failed to submit');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
      <div className="space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-3">😔</p>
        <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
        <a href="/products" className="mt-4 inline-block px-6 py-2 bg-rose-400 text-white rounded-full text-sm hover:bg-rose-500">Browse products</a>
      </div>
    </div>
  );

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <a href="/" className="hover:text-rose-400">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-rose-400">Products</a>
        <span>/</span>
        <a href={`/products?category=${product.category}`} className="hover:text-rose-400 capitalize">{product.category}</a>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[150px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
        {/* Images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    imgIdx === i ? 'border-rose-400' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 flex flex-col gap-3">
            <div
              className="aspect-square rounded-3xl overflow-hidden bg-gray-50 relative group"
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => setImgHovered(false)}
            >
              {/* Crossfade image stack */}
              {product.images.map((src, i) => (
                <img
                  key={src + i}
                  src={src}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${i === imgIdx ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}

              {/* Liquid glass prev/next arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => setImgIdx((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full backdrop-blur-md bg-white/20 border border-white/40 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40 hover:scale-110 active:scale-95"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-white drop-shadow-sm" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setImgIdx((i) => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full backdrop-blur-md bg-white/20 border border-white/40 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40 hover:scale-110 active:scale-95"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-white drop-shadow-sm" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                  {product.images.map((_, i) => (
                    <span
                      key={i}
                      className={`rounded-full transition-all duration-300 ${i === imgIdx ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              )}

              {discount > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-rose-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
              {product.isNew && (
                <span className="absolute top-4 right-4 z-10 bg-emerald-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full">New</span>
              )}
            </div>

            {/* Mobile thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex sm:hidden gap-2 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    title={`View image ${i + 1}`}
                    onClick={() => setImgIdx(i)}
                    className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                      imgIdx === i ? 'border-rose-400' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-rose-400 uppercase tracking-widest font-medium mb-2 capitalize">{product.category}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif leading-tight mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <StarSolid key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              ₹{(product.discountPrice || product.price).toLocaleString()}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="text-sm bg-rose-100 text-rose-600 font-semibold px-2 py-0.5 rounded-full">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Color: <span className="font-normal text-gray-500">{selectedColor}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                      selectedColor === color
                        ? 'border-rose-400 bg-rose-50 text-rose-500 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-rose-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Size: <span className="font-normal text-gray-500">{selectedSize}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 rounded-xl text-sm font-medium border transition-all ${
                      selectedSize === size
                        ? 'border-rose-400 bg-rose-400 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-rose-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm font-semibold text-gray-700">Qty:</p>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-600 hover:bg-rose-50 hover:text-rose-400 transition-colors text-lg"
              >−</button>
              <span className="px-4 py-2 font-semibold text-gray-800 min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(liveStock, quantity + 1))}
                className="px-4 py-2 text-gray-600 hover:bg-rose-50 hover:text-rose-400 transition-colors text-lg"
              >+</button>
            </div>
            <span className={`text-sm font-medium flex items-center gap-1.5 ${liveStock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {liveStock > 0 ? (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {liveStock} in stock{stockLive && <span className="text-xs text-gray-400 font-normal">· live</span>}
                </>
              ) : 'Out of Stock'}
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 mb-8">
            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={liveStock === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <BoltIcon className="w-5 h-5" />
              Buy Now
            </button>

            {/* Add to Cart + Wishlist */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={liveStock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                  inCart
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                    : 'bg-rose-400 hover:bg-rose-500 text-white shadow-rose-200'
                }`}
              >
                {inCart ? (
                  <><CheckIcon className="w-5 h-5" />Added to Cart</>
                ) : (
                  <><ShoppingBagIcon className="w-5 h-5" />Add to Cart</>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${
                  wishlisted
                    ? 'border-rose-400 bg-rose-50 text-rose-400'
                    : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-400 hover:text-rose-400'
                }`}
                title={wishlisted ? 'Remove from favourites' : 'Save to favourites'}
              >
                {wishlisted
                  ? <HeartSolid className="w-5 h-5" />
                  : <HeartIcon className="w-5 h-5" />
                }
              </button>
            </div>
          </div>

          {/* USPs */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl">
            <div className="flex flex-col items-center text-center gap-1">
              <TruckIcon className="w-5 h-5 text-rose-400" />
              <span className="text-xs text-gray-600 font-medium">Free Delivery</span>
              <span className="text-xs text-gray-400">Over ₹999</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <ShieldCheckIcon className="w-5 h-5 text-rose-400" />
              <span className="text-xs text-gray-600 font-medium">Authentic</span>
              <span className="text-xs text-gray-400">100% genuine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex gap-1 mb-6 border-b border-gray-100">
          {(['description', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-rose-400 text-rose-400' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'reviews' ? `Reviews (${product.reviewCount})` : 'Description'}
            </button>
          ))}
        </div>

        {tab === 'description' && (
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
            <p>{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-rose-50 text-rose-400 text-xs rounded-full font-medium">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div>
            {/* Review form */}
            <div className="bg-rose-50 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                        <StarIcon className={`w-7 h-7 ${s <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Review title"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 bg-white"
                />
                <textarea
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 bg-white resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview || !user}
                  className="px-6 py-2.5 bg-rose-400 text-white text-sm font-semibold rounded-full hover:bg-rose-500 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : user ? 'Submit Review' : 'Login to Review'}
                </button>
              </form>
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
              ) : reviews.map((r) => (
                <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 font-bold text-sm">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.userName}</p>
                        <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    {r.isVerifiedPurchase && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <StarSolid key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {r.title && <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>}
                  <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
