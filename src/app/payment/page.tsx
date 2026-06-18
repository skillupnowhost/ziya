'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  CreditCardIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

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

  const handlePay = async () => {
    if (!order || paying) return;
    setPaying(true);

    try {
      const paymentRes = await axios.post('/api/payment/create-order', {
        amount: order.total,
        currency: 'INR',
        orderId: order._id,
      });

      const razorpayOrderId = paymentRes.data.razorpayOrder.id;

      if (typeof window.Razorpay === 'undefined') {
        toast.error('Payment gateway is loading. Please try again.');
        setPaying(false);
        return;
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
        theme: { color: '#f43f5e' },
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
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Failed to initiate payment. Please try again.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-rose-400 border-t-transparent animate-spin" />
          <p className="text-rose-400 text-sm font-medium">Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'Order not found'}</h2>
          <p className="text-sm text-gray-500 mb-6">We couldn&apos;t find this order. Please try again.</p>
          <a href="/cart" className="px-6 py-2.5 bg-rose-400 text-white rounded-full text-sm font-semibold hover:bg-rose-500">
            Go to Cart
          </a>
        </div>
      </div>
    );
  }

  const addr = order.shippingAddress;
  const addressLine = [addr.doorNumber, addr.streetName].filter(Boolean).join(', ');
  const cityLine = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Payment Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-100/50 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-5 text-center">
            <div className="w-14 h-14 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
              <CreditCardIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Complete Payment</h1>
            <p className="text-white/80 text-sm mt-1">
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>

          {/* Amount Display */}
          <div className="px-6 py-5 text-center border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold text-gray-900">
              ₹{Number(order.total).toLocaleString()}
            </p>
          </div>

          {/* Order Details */}
          <div className="px-6 py-5 space-y-4">
            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Items ({order.items.length})
              </p>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-11 h-13 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <div className="flex gap-2 text-xs text-gray-400">
                        {item.size && <span>Size: {item.size}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700">₹{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={order.shippingCost === 0 ? 'text-emerald-500 font-medium' : 'text-gray-700'}>
                  {order.shippingCost === 0 ? 'FREE' : `₹${Number(order.shippingCost).toLocaleString()}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">
                    Discount {order.promoCode && <span className="text-xs font-mono">({order.promoCode})</span>}
                  </span>
                  <span className="text-emerald-600 font-medium">-₹{Number(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-1">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">₹{Number(order.total).toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivering To</p>
              <p className="text-sm font-semibold text-gray-800">{addr.name}</p>
              {addressLine && <p className="text-sm text-gray-600">{addressLine}</p>}
              {cityLine && <p className="text-sm text-gray-600">{cityLine}</p>}
              {addr.phone && <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone}</p>}
            </div>
          </div>

          {/* Pay Button */}
          <div className="px-6 pb-6">
            <motion.button
              onClick={handlePay}
              disabled={paying}
              className="relative w-full py-4 rounded-2xl font-bold text-white text-base overflow-hidden disabled:opacity-60"
              style={{
                background: paying
                  ? 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)'
                  : 'linear-gradient(135deg, #fb7185 0%, #f43f5e 40%, #be123c 100%)',
              }}
              whileHover={!paying ? { scale: 1.015, boxShadow: '0 12px 40px rgba(244,63,94,0.4)' } : {}}
              whileTap={!paying ? { scale: 0.975 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              {!paying && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {paying ? (
                  <>
                    <motion.span
                      className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-5 h-5" />
                    Pay ₹{Number(order.total).toLocaleString()}
                  </>
                )}
              </span>
            </motion.button>
          </div>

          {/* Security badges */}
          <div className="px-6 pb-5 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium">Razorpay Secured</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <LockClosedIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium">PCI Compliant</span>
            </div>
          </div>

          {/* Payment methods */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">Accepted Payment Methods</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">UPI</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">Cards</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">Net Banking</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">Wallets</span>
            </div>
          </div>
        </div>

        {/* Cancel link */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/orders')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel and return to orders
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 text-rose-400 text-sm">
        Loading payment...
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
