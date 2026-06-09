'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChatBubbleLeftEllipsisIcon, MapPinIcon, CreditCardIcon, CheckIcon } from '@heroicons/react/24/outline';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-700',
};

interface Order {
  _id: string;
  items: { productId: string; name: string; image: string; quantity: number; price: number; size?: string; color?: string }[];
  shippingAddress: { name: string; phone: string; street: string; city: string; state: string; pincode: string; country: string };
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  trackingNumber?: string;
  notes?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0  },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/orders/${id}`)
      .then((r) => setOrder(r.data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="bg-gray-100 rounded-2xl animate-pulse"
          style={{ height: i === 1 ? 64 : 140 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35 }}
        />
      ))}
    </div>
  );

  if (!order) return (
    <motion.div
      className="text-center py-20 text-gray-500"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      Order not found
    </motion.div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-8 flex-wrap"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.35 }}>
          <Link href="/orders" className="flex items-center gap-1 text-rose-400 text-sm hover:text-rose-500 font-medium transition-colors">
            <span>←</span> My Orders
          </Link>
        </motion.div>
        <motion.span variants={fadeUp} transition={{ duration: 0.35 }} className="text-gray-300">/</motion.span>
        <motion.h1 variants={fadeUp} transition={{ duration: 0.35 }} className="text-2xl font-bold text-gray-900">
          Order #{id.slice(-8).toUpperCase()}
        </motion.h1>
        <motion.span
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ml-auto ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {order.status}
        </motion.span>
      </motion.div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-semibold text-gray-700 mb-6 text-sm uppercase tracking-wide">Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-1.5 ${i <= currentStep ? 'opacity-100' : 'opacity-35'}`}>
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < currentStep  ? 'bg-emerald-400 text-white' :
                      i === currentStep ? 'bg-rose-400 text-white ring-4 ring-rose-100' :
                      'bg-gray-200 text-gray-500'
                    }`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: i <= currentStep ? 1 : 0.35 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    {i < currentStep ? <CheckIcon className="w-4 h-4" /> : i + 1}
                  </motion.div>
                  <span className="text-xs capitalize font-medium text-gray-600 text-center w-16 leading-tight">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <motion.div
                    className="flex-1 h-0.5 mx-1 -mt-5 bg-gray-200 relative overflow-hidden rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: i < currentStep ? '100%' : '0%' }}
                      transition={{ delay: 0.35 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Admin notes */}
      {order.notes && (
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Update from Ziya</p>
            <p className="text-sm text-gray-700 leading-relaxed">{order.notes}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <motion.div
          className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-bold text-gray-800 mb-4">Items Ordered</h3>
          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {order.items.map((item, i) => (
              <motion.div
                key={i}
                className="flex gap-4"
                variants={fadeUp}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/products/${item.productId}`}>
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} className="text-sm font-semibold text-gray-800 hover:text-rose-400 line-clamp-2 transition-colors">
                    {item.name}
                  </Link>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.size  && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Size: {item.size}</span>}
                    {item.color && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.color}</span>}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                    <motion.span
                      className="font-bold text-gray-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Totals */}
          <motion.div
            className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.35 }}
          >
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className={order.shippingCost === 0 ? 'text-emerald-500 font-medium' : ''}>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{order.discount}</span></div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <motion.span
                className="text-rose-500"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 22 }}
              >
                ₹{order.total.toLocaleString()}
              </motion.span>
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            variants={fadeUp}
            transition={{ duration: 0.4, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPinIcon className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-gray-800 text-sm">Shipping Address</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            variants={fadeUp}
            transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCardIcon className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-gray-800 text-sm">Payment</h3>
            </div>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Method</span>
                <span className="uppercase font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <motion.span
                  className={`font-semibold capitalize text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.45, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {order.paymentStatus}
                </motion.span>
              </div>
            </div>
          </motion.div>

          <motion.p
            className="text-xs text-gray-400 text-center"
            variants={fadeUp}
            transition={{ duration: 0.35, delay: 0.32 }}
          >
            Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
