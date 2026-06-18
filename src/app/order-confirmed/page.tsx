'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion, type Variants } from 'framer-motion';
import { EASE_SMOOTH } from '@/lib/easing';

interface Order {
  _id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  items: { name: string; quantity: number; price: number; image?: string }[];
  shippingAddress: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: string;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_SMOOTH },
  },
};

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isPaid = searchParams.get('paid') === '1';
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      axios
        .get(`/api/orders/${orderId}`)
        .then((r) => setOrder(r.data.order))
        .catch(console.error);
    }
  }, [orderId]);

  const paymentDone = isPaid || order?.paymentStatus === 'paid';

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-lg w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ── Checkmark icon ─────────────────────────────────── */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="relative">
            <CheckCircleIcon className="w-24 h-24 text-emerald-400" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-300"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
            />
          </div>
        </motion.div>

        {/* ── Title ──────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mb-2">
            Order {paymentDone ? 'Confirmed' : 'Placed'}!
          </h1>
          <p className="text-gray-500 text-sm">
            Thank you for shopping with Ziya, {order?.shippingAddress?.name?.split(' ')[0] || 'valued customer'}.
          </p>
        </motion.div>

        {/* ── Payment Status Banner ─────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="mb-5 rounded-2xl overflow-hidden border shadow-sm"
          style={{
            borderColor: paymentDone ? '#bbf7d0' : '#fde68a',
          }}
        >
          <div
            className="h-1"
            style={{
              background: paymentDone
                ? 'linear-gradient(to right, #34d399, #10b981, #34d399)'
                : 'linear-gradient(to right, #fbbf24, #f97316, #fbbf24)',
            }}
          />
          <div className={`p-5 ${paymentDone ? 'bg-gradient-to-br from-emerald-50 to-green-50' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentDone ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {paymentDone ? (
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className={`font-bold text-base mb-1 ${paymentDone ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {paymentDone ? 'Payment Successful' : 'Payment Pending'}
                </p>
                <p className={`text-sm leading-relaxed ${paymentDone ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {paymentDone
                    ? 'Your payment has been received. We\'ll start processing your order right away!'
                    : 'Your order is placed. We will contact you shortly to finalize payment details.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Progress steps ────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />, label: 'Order Placed', done: true },
              {
                icon: paymentDone
                  ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  : <ClockIcon className="w-5 h-5 text-amber-400" />,
                label: paymentDone ? 'Payment Done' : 'Payment Pending',
                done: paymentDone,
              },
              { icon: <TruckIcon className="w-5 h-5 text-gray-300" />, label: 'Shipped', done: false },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-emerald-50' : i === 1 ? 'bg-amber-50' : 'bg-gray-50'
                  }`}
                  animate={!step.done && i === 1 ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                >
                  {step.icon}
                </motion.div>
                <p className={`text-xs font-semibold leading-tight ${step.done ? 'text-emerald-600' : i === 1 ? 'text-amber-500' : 'text-gray-300'}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
          <div className="relative -mt-8 mx-12 h-0.5 bg-gray-100 -z-10 pointer-events-none">
            <motion.div
              className="absolute left-0 top-0 h-full bg-emerald-200 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: paymentDone ? '66%' : '33%' }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </div>
        </motion.div>

        {/* ── Order details card ────────────────────────────── */}
        {order && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5"
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Details</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-semibold text-gray-800 text-xs bg-gray-100 px-2 py-0.5 rounded-lg">
                  #{orderId?.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                {paymentDone ? (
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-600 text-xs">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Paid
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-semibold text-amber-600 text-xs">
                    <ClockIcon className="w-3.5 h-3.5" />
                    Pending
                  </span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-700 text-xs">
                  {order.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Manual'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-gray-900">₹{Number(order.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivering to</span>
                <span className="text-gray-700 text-right max-w-[200px] leading-snug">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </span>
              </div>
            </div>

            {order.items?.length > 0 && (
              <div className="px-5 pb-4 border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-400 mb-2 font-medium">{order.items.length} item{order.items.length > 1 ? 's' : ''} ordered</p>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-8 h-9 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Invoice link ──────────────────────────────────── */}
        {paymentDone && orderId && (
          <motion.div variants={itemVariants} className="mb-3">
            <Link
              href={`/invoice/${orderId}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Invoice
            </Link>
          </motion.div>
        )}

        {/* ── Action buttons ────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/orders"
            className="flex-1 py-3.5 text-center border-2 border-rose-400 text-rose-400 font-semibold rounded-full hover:bg-rose-50 transition-colors text-sm"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 py-3.5 text-center bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-full hover:from-rose-500 hover:to-pink-600 transition-all text-sm shadow-sm shadow-rose-200"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-rose-400 text-sm">
        Loading...
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  );
}
