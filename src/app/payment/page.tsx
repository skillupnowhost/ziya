'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  CreditCardIcon,
} from '@heroicons/react/24/solid';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  cgst: number;
  sgst: number;
  gst: number;
  promoCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  shippingAddress: {
    name?: string;
    phone?: string;
    doorNumber?: string;
    streetName?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: string;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/payment');
      return;
    }
    if (!orderId) {
      router.push('/cart');
      return;
    }
    axios
      .get(`/api/orders/${orderId}`)
      .then((r) => {
        const o = r.data.order;
        if (o.paymentStatus === 'paid') {
          router.push(`/order-confirmed?orderId=${orderId}&paid=1`);
          return;
        }
        setOrder(o);
      })
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [orderId, user, router]);

  const waitForRazorpay = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window.Razorpay !== 'undefined') {
        resolve();
        return;
      }
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof window.Razorpay !== 'undefined') {
          clearInterval(interval);
          resolve();
        } else if (attempts > 20) {
          clearInterval(interval);
          reject(new Error('Payment gateway failed to load. Please refresh the page.'));
        }
      }, 250);
    });
  }, []);

  const handlePay = async () => {
    if (!order || paying) return;
    setPaying(true);

    try {
      await waitForRazorpay();

      const paymentRes = await axios.post('/api/payment/create-order', {
        amount: order.total,
        currency: 'INR',
        orderId: order._id,
      });

      if (paymentRes.data.error) {
        throw new Error(paymentRes.data.error);
      }

      const razorpayOrderId = paymentRes.data.razorpayOrder?.id;
      if (!razorpayOrderId) {
        throw new Error('Invalid response from payment server');
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(order.total * 100),
        currency: 'INR',
        name: 'Ziyakart',
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        image: '/ziya-logo.png',
        order_id: razorpayOrderId,
        prefill: {
          name: order.shippingAddress?.name || user?.name,
          email: user?.email,
          contact: order.shippingAddress?.phone,
        },
        theme: { color: '#e11d48' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            if (verifyRes.data.order) {
              router.push(`/order-confirmed?orderId=${order._id}&paid=1`);
            }
          } catch {
            toast.error('Payment verification failed. Contact support if amount was deducted.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setShowCancelModal(true);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : err instanceof Error
            ? err.message
            : 'Failed to initiate payment. Please try again.';
      toast.error(message);
      setPaying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-[3px] border-rose-100" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-rose-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading your order...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Order not found'}</h2>
          <p className="text-sm text-gray-500 mb-8">We couldn&apos;t locate this order. It may have been removed or the link is invalid.</p>
          <a
            href="/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Return to Cart
          </a>
        </motion.div>
      </div>
    );
  }

  const addr = order.shippingAddress;
  const addressLine = [addr.doorNumber, addr.streetName].filter(Boolean).join(', ');
  const cityLine = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
  const orderNumber = order._id.slice(-8).toUpperCase();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Orders</span>
          </button>
          <div className="flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Secure Checkout</span>
          </div>
          <span className="text-xs text-gray-400 font-mono">#{orderNumber}</span>
        </div>
      </div>

      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">

          {/* ── LEFT COLUMN: Order Summary ── */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">

            {/* Order Items Card */}
            <motion.div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={() => setItemsExpanded(!itemsExpanded)}
                className="w-full flex items-center justify-between px-5 py-4 sm:px-6 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TruckIcon className="w-[18px] h-[18px] text-rose-500" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Order Items
                    </h2>
                    <p className="text-xs text-gray-400">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                {itemsExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {itemsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="divide-y divide-gray-50">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-20 sm:w-[72px] sm:h-[90px] object-cover rounded-xl bg-gray-100 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-20 sm:w-[72px] sm:h-[90px] bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CreditCardIcon className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                                {item.name}
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                {item.size && (
                                  <span className="text-xs text-gray-400">Size: {item.size}</span>
                                )}
                                {item.color && (
                                  <span className="text-xs text-gray-400">Color: {item.color}</span>
                                )}
                                <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center">
                              <p className="text-sm font-semibold text-gray-900">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Price Breakdown Card */}
            <motion.div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Price Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                  <span className="text-gray-800 font-medium">
                    ₹{Number(order.subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
                {order.gst > 0 && (
                  <>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>CGST</span>
                      <span>₹{Number(order.cgst).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>SGST</span>
                      <span>₹{Number(order.sgst).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">GST</span>
                      <span className="text-gray-800 font-medium">
                        ₹{Number(order.gst).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={order.shippingCost === 0 ? 'text-emerald-600 font-medium' : 'text-gray-800 font-medium'}>
                    {order.shippingCost === 0 ? 'FREE' : `₹${Number(order.shippingCost).toLocaleString('en-IN')}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1.5">
                      <TagIcon className="w-3.5 h-3.5" />
                      Discount
                      {order.promoCode && (
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md uppercase">
                          {order.promoCode}
                        </span>
                      )}
                    </span>
                    <span className="text-emerald-600 font-medium">
                      -₹{Number(order.discount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delivery Address Card */}
            <motion.div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-[18px] h-[18px] text-blue-500" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Delivery Address</h2>
              </div>
              <div className="pl-12 space-y-1">
                <p className="text-sm font-semibold text-gray-900">{addr.name}</p>
                {addressLine && <p className="text-sm text-gray-600 leading-relaxed">{addressLine}</p>}
                {cityLine && <p className="text-sm text-gray-600">{cityLine}</p>}
                {addr.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-2">
                    <PhoneIcon className="w-3.5 h-3.5" />
                    {addr.phone}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: Payment Card ── */}
          <div className="lg:col-span-2 mt-6 lg:mt-0">
            <motion.div
              className="lg:sticky lg:top-24"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Payment header */}
                <div className="bg-gradient-to-br from-rose-600 to-pink-600 px-6 py-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
                  <div className="relative">
                    <div className="w-12 h-12 mx-auto bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 ring-1 ring-white/20">
                      <LockClosedIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-rose-100 text-xs font-medium uppercase tracking-widest mb-1">
                      Amount to Pay
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {/* Quick summary on desktop */}
                  <div className="hidden lg:block">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                      </div>
                      {order.gst > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>GST</span>
                          <span>₹{Number(order.gst).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {order.shippingCost > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>Shipping</span>
                          <span>₹{Number(order.shippingCost).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-100 my-3" />
                  </div>

                  {/* Pay Button */}
                  <motion.button
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full py-4 rounded-xl font-bold text-white text-base bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 disabled:from-rose-300 disabled:to-rose-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50 relative overflow-hidden"
                    whileTap={!paying ? { scale: 0.98 } : {}}
                  >
                    {!paying && (
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-2.5">
                      {paying ? (
                        <>
                          <motion.span
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="w-5 h-5" />
                          Pay ₹{Number(order.total).toLocaleString('en-IN')}
                        </>
                      )}
                    </span>
                  </motion.button>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center gap-4 sm:gap-5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] text-gray-400 font-medium">256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] text-gray-400 font-medium">Razorpay</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LockClosedIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] text-gray-400 font-medium">PCI DSS</span>
                    </div>
                  </div>

                  {/* Accepted Payment Methods */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-[11px] text-gray-400 text-center mb-3 uppercase tracking-wider font-medium">
                      Accepted Methods
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((method) => (
                        <span
                          key={method}
                          className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-semibold text-gray-500"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancel link */}
              <div className="text-center mt-4">
                <button
                  onClick={() => router.push('/orders')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel and return to orders
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── MOBILE FIXED BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 safe-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{Number(order.total).toLocaleString('en-IN')}
            </p>
          </div>
          <motion.button
            onClick={handlePay}
            disabled={paying}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-rose-600 to-rose-500 disabled:from-rose-300 disabled:to-rose-300 disabled:cursor-not-allowed shadow-lg shadow-rose-200/50 flex items-center gap-2 flex-shrink-0"
            whileTap={!paying ? { scale: 0.97 } : {}}
          >
            {paying ? (
              <>
                <motion.span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Processing...
              </>
            ) : (
              <>
                <LockClosedIcon className="w-4 h-4" />
                Pay Now
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Bottom spacer for mobile fixed bar */}
      <div className="lg:hidden h-20" />

      {/* Payment Cancelled Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(false); }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Cancelled</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Your order is saved. Would you like to retry payment or continue shopping?
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => { setShowCancelModal(false); handlePay(); }}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-sm shadow-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  <LockClosedIcon className="w-4 h-4" />
                  Retry Payment
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/orders')}
                  className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  View My Orders
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBagIcon className="w-3.5 h-3.5" />
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-[3px] border-rose-100" />
              <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-rose-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Loading payment...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
