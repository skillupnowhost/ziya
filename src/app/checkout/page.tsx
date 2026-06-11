'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { TagIcon, XMarkIcon, MapPinIcon, PhoneIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const ADDRESS_FIELDS = [
  { key: 'name',    label: 'Full Name',       placeholder: 'Your full name',              full: false, icon: '👤' },
  { key: 'phone',   label: 'Phone Number',    placeholder: '10-digit mobile number',      full: false, icon: '📱' },
  { key: 'street',  label: 'Street Address',  placeholder: 'House/Flat no., Street, Area', full: true,  icon: '🏠' },
  { key: 'city',    label: 'City',            placeholder: 'City',                        full: false, icon: '🏙️' },
  { key: 'state',   label: 'State',           placeholder: 'State',                       full: false, icon: '📍' },
  { key: 'pincode', label: 'PIN Code',        placeholder: '6-digit PIN',                 full: false, icon: '🔢' },
] as const;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, subtotal, shippingCost, clearCart } = useCart();
  const { user } = useAuth();

  const [promoInput, setPromoInput] = useState(searchParams.get('promo') || '');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string; type: string; value: number; description?: string
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);
  const orderPlaced = useRef(false);
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const discount = (() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') return Math.round(subtotal * appliedPromo.value / 100);
    if (appliedPromo.type === 'flat') return Math.min(appliedPromo.value, subtotal);
    if (appliedPromo.type === 'shipping') return shippingCost;
    return 0;
  })();
  const total = subtotal + shippingCost - discount;

  useEffect(() => {
    if (!user) router.push('/auth/login?redirect=/checkout');
    if (items.length === 0 && !orderPlaced.current) router.push('/cart');
  }, [user, items, router]);

  useEffect(() => {
    if (user?.name) setAddress((prev) => ({ ...prev, name: prev.name || user.name }));
  }, [user]);

  useEffect(() => {
    const urlPromo = searchParams.get('promo');
    if (urlPromo && !appliedPromo) applyPromo(urlPromo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPromo = async (code?: string) => {
    const codeToApply = (code || promoInput).trim().toUpperCase();
    if (!codeToApply) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await axios.post('/api/coupons/validate', { couponCode: codeToApply, subtotal });
      const data = res.data;
      if (data.valid) {
        setAppliedPromo({ code: codeToApply, type: data.type, value: data.value, description: data.description });
        toast.success('Promo code applied!');
        setPromoError('');
      } else {
        setPromoError(data.error || 'Invalid code');
        setAppliedPromo(null);
      }
    } catch {
      setPromoError('Failed to validate code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const handlePlaceOrder = async () => {
    const missing = ADDRESS_FIELDS.some((f) => !address[f.key as keyof typeof address]);
    if (missing) {
      toast.error('Please fill in all address fields');
      return;
    }

    setLoading(true);
    try {
      const orderRes = await axios.post('/api/orders', {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
        shippingAddress: address,
        paymentMethod: 'manual',
        promoCode: appliedPromo?.code,
      });

      const order = orderRes.data.order;
      orderPlaced.current = true;
      clearCart();
      router.push(`/order-confirmed?orderId=${order._id}`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Order failed';
      toast.error(msg || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in your shipping address to place your order</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ── Left: Address Form ───────────────────────────────── */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm shadow-rose-200">
                <MapPinIcon className="w-4.5 h-4.5 text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg leading-tight">Shipping Address</h2>
                <p className="text-xs text-gray-400">We&apos;ll deliver your order here</p>
              </div>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADDRESS_FIELDS.map((field, i) => (
                <motion.div
                  key={field.key}
                  className={field.full ? 'sm:col-span-2' : ''}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                >
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    {field.label}
                    <span className="text-rose-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={address[field.key as keyof typeof address]}
                    onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-gray-300"
                  />
                </motion.div>
              ))}
            </div>

            {/* Payment info notice */}
            <motion.div
              className="mt-6 flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.35 }}
            >
              <PhoneIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">How payment works:</span> After placing your order, we will contact you via
                phone or WhatsApp to arrange payment. Your order will be confirmed once payment is received.
              </p>
            </motion.div>

            {/* Place Order button */}
            <motion.button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="relative mt-6 w-full py-4 rounded-2xl font-bold text-white text-sm overflow-hidden disabled:opacity-60"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)'
                  : 'linear-gradient(135deg, #fb7185 0%, #f43f5e 40%, #be123c 100%)',
              }}
              whileHover={!loading ? { scale: 1.012, boxShadow: '0 10px 35px rgba(244,63,94,0.4)' } : {}}
              whileTap={!loading ? { scale: 0.975 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Shimmer */}
              {!loading && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.span
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="w-4 h-4" />
                    Place Order · ₹{total.toLocaleString()}
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Right: Order Summary ─────────────────────────────── */}
        <motion.div
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-fit lg:sticky lg:top-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>

          {/* Promo code */}
          <div className="mb-4">
            <AnimatePresence mode="wait">
              {appliedPromo ? (
                <motion.div
                  key="applied"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                >
                  <TagIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-700 font-mono">{appliedPromo.code}</p>
                    {appliedPromo.description && (
                      <p className="text-xs text-emerald-600 truncate">{appliedPromo.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-500 transition-colors"
                    title="Remove promo"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-1.5"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                      placeholder="Promo / Coupon code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                    <motion.button
                      type="button"
                      onClick={() => applyPromo()}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-3 py-2 bg-rose-400 text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-rose-500 transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </motion.button>
                  </div>
                  {promoError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 px-1"
                    >
                      {promoError}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item list */}
          <div className="space-y-3 max-h-56 overflow-y-auto mb-4 pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 line-clamp-2">{item.name}</p>
                  {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                    ₹{(item.price * item.quantity).toLocaleString()} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-emerald-500 font-medium' : ''}>
                {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment pending badge */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
            <span className="text-lg">💬</span>
            <p className="text-xs text-rose-600 leading-snug">
              Payment via phone/WhatsApp after order is placed
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-rose-400 text-sm">
        Loading checkout...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
