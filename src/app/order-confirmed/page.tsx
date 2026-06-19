'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { TruckIcon, ShieldCheckIcon, MapPinIcon, CreditCardIcon, TagIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { motion, type Variants } from 'framer-motion';
import { EASE_SMOOTH } from '@/lib/easing';

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
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  cgst: number;
  sgst: number;
  gst: number;
  promoCode?: string;
  items: OrderItem[];
  shippingAddress: {
    name?: string;
    phone?: string;
    doorNumber?: string;
    streetName?: string;
    landmark?: string;
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
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_SMOOTH },
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
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const orderTime = order?.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const addr = order?.shippingAddress;
  const addressLine = [addr?.doorNumber, addr?.streetName || addr?.street].filter(Boolean).join(', ');
  const cityLine = [addr?.city, addr?.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-[90vh] px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ── Hero: Checkmark + Title ──────────────────────────── */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          variants={itemVariants}
        >
          <motion.div
            className="flex justify-center mb-5"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircleIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-300"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
              />
            </div>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-serif mb-2">
            Order {paymentDone ? 'Confirmed' : 'Placed'}!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            Thank you for shopping with Ziya
            {addr?.name ? `, ${addr.name.split(' ')[0]}` : ''}.
            {paymentDone
              ? ' Your order is being prepared.'
              : ' We\'ll process your order once payment is confirmed.'}
          </p>
        </motion.div>

        {/* ── Payment Status Banner (full width) ──────────────── */}
        <motion.div
          variants={itemVariants}
          className="mb-6 sm:mb-8 rounded-2xl overflow-hidden border shadow-sm"
          style={{ borderColor: paymentDone ? '#bbf7d0' : '#fde68a' }}
        >
          <div
            className="h-1"
            style={{
              background: paymentDone
                ? 'linear-gradient(to right, #34d399, #10b981, #34d399)'
                : 'linear-gradient(to right, #fbbf24, #f97316, #fbbf24)',
            }}
          />
          <div className={`p-4 sm:p-5 ${paymentDone ? 'bg-gradient-to-br from-emerald-50 to-green-50' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
            <div className="flex items-start gap-3 max-w-3xl mx-auto">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentDone ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {paymentDone ? (
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-bold text-base mb-0.5 ${paymentDone ? 'text-emerald-800' : 'text-amber-800'}`}>
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

        {/* ── Progress Steps (full width) ─────────────────────── */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className="max-w-lg mx-auto">
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
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                      step.done ? 'bg-emerald-50' : i === 1 ? 'bg-amber-50' : 'bg-gray-50'
                    }`}
                    animate={!step.done && i === 1 ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  >
                    {step.icon}
                  </motion.div>
                  <p className={`text-xs sm:text-sm font-semibold leading-tight ${step.done ? 'text-emerald-600' : i === 1 ? 'text-amber-500' : 'text-gray-300'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="relative -mt-8 sm:-mt-9 mx-12 h-0.5 bg-gray-100 -z-10 pointer-events-none">
              <motion.div
                className="absolute left-0 top-0 h-full bg-emerald-200 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: paymentDone ? '66%' : '33%' }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Main Content: 2-col on desktop, stacked on mobile ── */}
        {order && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 mb-6 sm:mb-8"
          >
            {/* ── Left Column: Order Info + Delivery ─────────── */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">
              {/* Order Info Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <CreditCardIcon className="w-4 h-4 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Info</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono font-semibold text-gray-800 text-xs bg-gray-100 px-2.5 py-1 rounded-lg">
                      #{orderId?.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-700 text-xs">{orderDate}</span>
                  </div>
                  {orderTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium text-gray-700 text-xs">{orderTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment</span>
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
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium text-gray-700 text-xs">
                      {order.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Manual'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivering To</p>
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold text-gray-900 mb-1">{addr?.name}</p>
                  {addr?.phone && (
                    <p className="text-xs text-gray-500 mb-2">{addr.phone}</p>
                  )}
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {addressLine && <p>{addressLine}</p>}
                    {addr?.landmark && <p className="text-gray-400 italic text-xs">Near: {addr.landmark}</p>}
                    {cityLine && <p>{cityLine}</p>}
                    {addr?.pincode && <p className="text-gray-500">PIN: {addr.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Items + Price Breakdown ────── */}
            <div className="lg:col-span-3 space-y-5 sm:space-y-6">
              {/* Items Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBagIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items Ordered</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} · {order.items.reduce((s, i) => s + i.quantity, 0)} unit{order.items.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                        <div className="flex gap-2 mt-1">
                          {item.size && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Size: {item.size}</span>
                          )}
                          {item.color && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.color}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">₹{item.price.toLocaleString()} each</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Breakdown</p>
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-700 font-medium">₹{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  {(order.gst > 0) && (
                    <>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>CGST</span>
                        <span>₹{Number(order.cgst).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>SGST</span>
                        <span>₹{Number(order.sgst).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">GST</span>
                        <span className="text-gray-700 font-medium">₹{Number(order.gst).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className={order.shippingCost === 0 ? 'text-emerald-500 font-semibold text-sm' : 'text-gray-700 font-medium'}>
                      {order.shippingCost === 0 ? 'FREE' : `₹${Number(order.shippingCost).toLocaleString()}`}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 flex items-center gap-1">
                        Discount
                        {order.promoCode && (
                          <span className="text-xs font-mono bg-emerald-50 px-1.5 py-0.5 rounded">{order.promoCode}</span>
                        )}
                      </span>
                      <span className="text-emerald-600 font-semibold">-₹{Number(order.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-3 mt-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-bold text-gray-900">Total Paid</span>
                      <span className="text-xl sm:text-2xl font-black text-gray-900">₹{Number(order.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Invoice + Action buttons (full width) ───────────── */}
        <motion.div variants={itemVariants} className="space-y-3">
          {paymentDone && orderId && (
            <Link
              href={`/invoice/${orderId}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Invoice
            </Link>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/orders"
              className="py-3.5 sm:py-4 text-center border-2 border-rose-400 text-rose-400 font-semibold rounded-2xl hover:bg-rose-50 transition-colors text-sm"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="py-3.5 sm:py-4 text-center bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl hover:from-rose-500 hover:to-pink-600 transition-all text-sm shadow-sm shadow-rose-200"
            >
              Continue Shopping
            </Link>
          </div>
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
