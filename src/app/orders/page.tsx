'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Order {
  _id: string;
  items: { name: string; image: string; quantity: number; price: number }[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  paymentMethod: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    axios.get('/api/orders')
      .then((r) => setOrders(r.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-3xl font-bold text-gray-900 font-serif mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link href="/products" className="px-6 py-3 bg-rose-400 text-white font-semibold rounded-full hover:bg-rose-500 transition-colors text-sm">
            Shop Now
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
        >
          {orders.map((order) => (
            <motion.div
              key={order._id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
            >
            <Link href={`/orders/${order._id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg" />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400 uppercase">{order.paymentMethod}</p>
                    <p className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.length > 1 ? 's' : ''} ·{' '}
                  {order.items.map(i => i.name).join(', ').slice(0, 60)}
                  {order.items.map(i => i.name).join(', ').length > 60 ? '...' : ''}
                </p>
              </div>
            </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
