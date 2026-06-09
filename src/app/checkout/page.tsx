'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon, LockClosedIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

declare global {
  interface Window {
    Razorpay: (options: Record<string, unknown>) => { open: () => void };
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, subtotal, shippingCost, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [promoInput, setPromoInput] = useState(searchParams.get('promo') || '');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: string; value: number; description?: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const discount = (() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') return Math.round(subtotal * appliedPromo.value / 100);
    if (appliedPromo.type === 'flat') return Math.min(appliedPromo.value, subtotal);
    if (appliedPromo.type === 'shipping') return shippingCost;
    return 0;
  })();
  const promoCode = appliedPromo?.code || '';
  const total = subtotal + shippingCost - discount;
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'cod'>('razorpay');

  useEffect(() => {
    if (!user) router.push('/auth/login?redirect=/checkout');
    if (items.length === 0) router.push('/cart');
  }, [user, items, router]);

  useEffect(() => {
    if (user?.name) setAddress((prev) => ({ ...prev, name: prev.name || user.name }));
  }, [user]);

  // Auto-apply promo code from URL on load
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
        toast.success(`Promo code applied!`);
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

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window.Razorpay !== 'undefined') { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    setLoading(true);
    try {
      const orderRes = await axios.post('/api/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
        shippingAddress: address,
        paymentMethod,
        promoCode,
      });

      const order = orderRes.data.order;

      if (paymentMethod === 'cod') {
        clearCart();
        router.push(`/order-confirmed?orderId=${order._id}`);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); return; }

      const rzpRes = await axios.post('/api/payment/create-order', {
        amount: total,
        orderId: order._id,
      });

      const rzpOrder = rzpRes.data.razorpayOrder;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Ziya',
        description: 'Korean Fashion & More',
        order_id: rzpOrder.id,
        handler: async (response: Record<string, string>) => {
          try {
            await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            router.push(`/order-confirmed?orderId=${order._id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email || '',
        },
        theme: { color: '#fb7185' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window.Razorpay as any)(options);
      rzp.open();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Order failed';
      toast.error(msg || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1
        className="text-3xl font-bold text-gray-900 font-serif mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Checkout
      </motion.h1>

      {/* Steps */}
      <motion.div
        className="flex items-center gap-2 mb-8"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <motion.div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                step > s
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-200'
                  : step === s
                  ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-rose-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
              animate={step === s ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {step > s ? <CheckIcon className="w-4 h-4" /> : s}
            </motion.div>
            <span className={`text-sm font-semibold hidden sm:block ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
              {s === 1 ? 'Shipping' : 'Payment'}
            </span>
            {s < 2 && (
              <motion.div
                className={`w-10 h-0.5 rounded-full ${step > s ? 'bg-gradient-to-r from-emerald-400 to-rose-400' : 'bg-gray-200'}`}
                animate={{ backgroundPosition: step > s ? '0%' : '100%' }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <h2 className="font-bold text-gray-800 mb-5 text-lg">Delivery Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', placeholder: 'Your full name', full: false },
                    { key: 'phone', label: 'Phone Number', placeholder: '10-digit mobile number', full: false },
                    { key: 'street', label: 'Street Address', placeholder: 'House/Flat no., Street, Area', full: true },
                    { key: 'city', label: 'City', placeholder: 'City', full: false },
                    { key: 'state', label: 'State', placeholder: 'State', full: false },
                    { key: 'pincode', label: 'PIN Code', placeholder: '6-digit PIN', full: false },
                  ].map((field, i) => (
                    <motion.div
                      key={field.key}
                      className={field.full ? 'sm:col-span-2' : ''}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{field.label}</label>
                      <input
                        type="text"
                        value={address[field.key as keyof typeof address]}
                        onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Continue to Payment button */}
                <motion.button
                  onClick={() => setStep(2)}
                  className="relative mt-6 w-full py-4 rounded-2xl font-bold text-white text-sm overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)' }}
                  whileHover={{ scale: 1.015, boxShadow: '0 8px 30px rgba(244,63,94,0.4)' }}
                  whileTap={{ scale: 0.975 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  {/* Shimmer sweep */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                    animate={{ translateX: ['−100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    Continue to Payment
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                    </motion.span>
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  {/* Back button */}
                  <motion.button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-rose-400 border border-rose-200 hover:bg-rose-50 transition-colors"
                    whileHover={{ x: -2, boxShadow: '0 2px 10px rgba(244,63,94,0.15)' }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back
                  </motion.button>
                  <h2 className="font-bold text-gray-800 text-lg">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 'razorpay', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                    { value: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: '📱' },
                    { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when delivered', icon: '💵' },
                  ].map((method, i) => (
                    <motion.label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-rose-400 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm shadow-rose-100'
                          : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50/50'
                      }`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      whileHover={{ scale: 1.008 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <input
                        type="radio"
                        value={method.value}
                        title={method.label}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value as typeof paymentMethod)}
                        className="accent-rose-400"
                      />
                      <motion.span
                        className="text-2xl"
                        animate={paymentMethod === method.value ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {method.icon}
                      </motion.span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                        <p className="text-xs text-gray-400">{method.sub}</p>
                      </div>
                      <AnimatePresence>
                        {paymentMethod === method.value && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className="w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center shrink-0"
                          >
                            <CheckIcon className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.label>
                  ))}
                </div>

                {/* Delivery address summary */}
                <motion.div
                  className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivering to</p>
                  <p className="text-sm text-gray-700 font-medium">{address.name} · {address.phone}</p>
                  <p className="text-sm text-gray-500">{address.street}, {address.city}, {address.state} {address.pincode}</p>
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
                  whileHover={!loading ? { scale: 1.015, boxShadow: '0 10px 35px rgba(244,63,94,0.45)' } : {}}
                  whileTap={!loading ? { scale: 0.975 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  {/* Shimmer */}
                  {!loading && (
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4" />
                        Place Order · ₹{total.toLocaleString()}
                      </>
                    )}
                  </span>
                </motion.button>

                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <LockClosedIcon className="w-3 h-3" />
                  Secured by Razorpay · 256-bit SSL
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-fit sticky top-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>

          {/* Promo code input */}
          <div className="mb-4">
            {appliedPromo ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
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
                  title="Remove"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
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
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 line-clamp-2">{item.name}</p>
                  {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                  <p className="text-xs font-bold text-gray-800 mt-0.5">₹{(item.price * item.quantity).toLocaleString()} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-emerald-500 font-medium' : ''}>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span><span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-rose-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
