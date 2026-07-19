'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllOrders } from '@/lib/fetchOrders';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  CubeIcon,
  XCircleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  BanknotesIcon,
  SparklesIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  ClockIcon as ClockSolid,
} from '@heroicons/react/24/solid';

interface Order {
  _id: string;
  items: { name: string; image: string; quantity: number; price: number }[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  paymentMethod: string;
  trackingNumber?: string;
}

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  icon: typeof ClockIcon;
  animate?: boolean;
}> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    icon: ClockIcon,
    animate: true,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    icon: CheckCircleIcon,
  },
  processing: {
    label: 'Processing',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    icon: CubeIcon,
    animate: true,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    icon: TruckIcon,
    animate: true,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    icon: CheckCircleIcon,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
    icon: XCircleIcon,
  },
};

function StatusIcon({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <motion.div
      className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <motion.div
        animate={config.animate ? { rotate: [0, -8, 8, -4, 0] } : {}}
        transition={config.animate ? { duration: 2, repeat: Infinity, repeatDelay: 3 } : {}}
      >
        <Icon className={`w-5 h-5 ${config.color}`} />
      </motion.div>
    </motion.div>
  );
}

function MiniProgress({ status }: { status: string }) {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const current = steps.indexOf(status);
  if (status === 'cancelled') return null;

  return (
    <div className="flex items-center gap-1 mt-2">
      {steps.map((_, i) => (
        <motion.div
          key={i}
          className={`h-1 rounded-full flex-1 ${
            i <= current ? 'bg-rose-400' : 'bg-gray-200'
          }`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      ))}
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.97,
    transition: { duration: 0.3 },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    fetchAllOrders<Order>()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') return !['delivered', 'cancelled'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const counts = {
    all: orders.length,
    active: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const TABS: { key: FilterTab; label: string; icon: typeof ShoppingBagIcon }[] = [
    { key: 'all', label: 'All', icon: ShoppingBagIcon },
    { key: 'active', label: 'Active', icon: SparklesIcon },
    { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
    { key: 'cancelled', label: 'Cancelled', icon: XCircleIcon },
  ];

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((j) => <div key={j} className="w-12 h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((j) => <div key={j} className="h-1 flex-1 bg-gray-100 rounded-full animate-pulse" />)}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-500 text-gray-500 text-sm font-medium transition-all group"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">My Orders</h1>
            <p className="text-xs text-gray-400 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = counts[tab.key];
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                layout
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Orders list */}
      <AnimatePresence mode="wait">
        {filteredOrders.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center"
              animate={{ rotate: [0, -5, 5, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <ShoppingBagIcon className="w-10 h-10 text-rose-300" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              {activeTab === 'all' ? 'Start shopping to see your orders here' : 'Check other tabs to find your orders'}
            </p>
            {activeTab === 'all' && (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-full hover:from-rose-500 hover:to-pink-600 transition-all text-sm shadow-md shadow-rose-200"
              >
                <SparklesIcon className="w-4 h-4" />
                Shop Now
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <motion.div
                  key={order._id}
                  variants={cardVariants}
                  layout
                >
                  <Link href={`/orders/${order._id}`}>
                    <motion.div
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${config.borderColor} border-l-4`}
                      whileHover={{ scale: 1.005 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <div className="p-4 sm:p-5">
                        {/* Top row: Status icon + Order info + Badge */}
                        <div className="flex items-start gap-3 mb-3">
                          <StatusIcon status={order.status} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-mono text-xs text-gray-400">
                                #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <span className="text-gray-200">|</span>
                              <p className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {order.items.map((i) => i.name).join(', ')}
                            </p>
                          </div>

                          <motion.span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0 ${config.bgColor} ${config.color}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            {config.label}
                          </motion.span>
                        </div>

                        {/* Item images row */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 4).map((item, i) => (
                              <motion.img
                                key={i}
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + i * 0.06 }}
                              />
                            ))}
                            {order.items.length > 4 && (
                              <div className="w-10 h-12 bg-gray-100 rounded-lg border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-500">
                                +{order.items.length - 4}
                              </div>
                            )}
                          </div>

                          <div className="ml-auto flex items-center gap-3">
                            {/* Payment method icon */}
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              {order.paymentMethod === 'cod' ? (
                                <BanknotesIcon className="w-3.5 h-3.5" />
                              ) : (
                                <CreditCardIcon className="w-3.5 h-3.5" />
                              )}
                              <span className="uppercase text-[10px] font-medium">{order.paymentMethod}</span>
                            </div>

                            {/* Payment status */}
                            <div className="flex items-center gap-1">
                              {order.paymentStatus === 'paid' ? (
                                <CheckCircleSolid className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <ClockSolid className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span className={`text-[10px] font-bold capitalize ${
                                order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pay Now button for pending Razorpay payments */}
                        {order.paymentStatus === 'pending' && order.paymentMethod === 'razorpay' && order.status !== 'cancelled' && (
                          <motion.div
                            className="mb-3"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                          >
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/payment?orderId=${order._id}`); }}
                              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-rose-200 hover:from-rose-600 hover:to-rose-700 transition-all"
                            >
                              <LockClosedIcon className="w-3.5 h-3.5" />
                              Pay Now · ₹{order.total.toLocaleString()}
                            </button>
                          </motion.div>
                        )}

                        {/* Bottom: Item count + Total + Arrow */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">
                              {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </span>
                            {order.trackingNumber && (
                              <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                                <TruckIcon className="w-3 h-3" />
                                Tracking available
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.span
                              className="text-base font-bold text-gray-900"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              ₹{order.total.toLocaleString()}
                            </motion.span>
                            <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-rose-400 transition-colors" />
                          </div>
                        </div>

                        {/* Mini progress bar */}
                        <MiniProgress status={order.status} />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
