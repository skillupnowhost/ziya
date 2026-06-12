'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Transition, type Variants, type TargetAndTransition } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import {
  ClockIcon, CheckBadgeIcon, CubeIcon,
  TruckIcon, HomeIcon, ChevronDownIcon,
  ShoppingBagIcon, ArrowRightIcon, XCircleIcon,
  ArrowTopRightOnSquareIcon, SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { getCourierTrackUrl, getCourierName } from '@/lib/couriers';

const spring: Transition = { type: 'spring', stiffness: 340, damping: 28 };
const ease: Transition   = { duration: 0.48, ease: 'easeOut' };
const slideUp: Variants  = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } };
const scaleIn: Variants  = { hidden: { opacity: 0, scale: 0.82 }, show: { opacity: 1, scale: 1 } };
const stagger = (s = 0.1, d = 0.05): Variants => ({
  hidden: {}, show: { transition: { staggerChildren: s, delayChildren: d } },
});

const STAGES: Array<{
  id: string; num: string; label: string; sub: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string; glow: string; ring: string;
  bg: string; border: string; bgCard: string; borderCard: string;
  iconAnim: { animate: TargetAndTransition; transition: Transition };
}> = [
  {
    id: 'pending',    num: '01', label: 'Pending',    sub: 'Awaiting confirmation',
    Icon: ClockIcon,
    color: '#d97706', glow: 'rgba(217,119,6,0.3)',   ring: 'rgba(217,119,6,0.22)',
    bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)',
    bgCard: '#fffbeb', borderCard: '#fde68a',
    iconAnim: { animate: { rotate: [0,14,0,-14,0] },                   transition: { duration:3,   repeat:Infinity, ease:'easeInOut' as const, repeatDelay:2   } },
  },
  {
    id: 'confirmed',  num: '02', label: 'Confirmed',  sub: 'Order verified',
    Icon: CheckBadgeIcon,
    color: '#0284c7', glow: 'rgba(2,132,199,0.3)',   ring: 'rgba(2,132,199,0.22)',
    bg: 'rgba(2,132,199,0.08)',  border: 'rgba(2,132,199,0.2)',
    bgCard: '#f0f9ff', borderCard: '#bae6fd',
    iconAnim: { animate: { scale: [1,1.22,1,1.10,1] },                  transition: { duration:2.5, repeat:Infinity, ease:'easeInOut' as const, repeatDelay:1   } },
  },
  {
    id: 'processing', num: '03', label: 'Processing', sub: 'Being prepared',
    Icon: CubeIcon,
    color: '#7c3aed', glow: 'rgba(124,58,237,0.3)',  ring: 'rgba(124,58,237,0.22)',
    bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)',
    bgCard: '#f5f3ff', borderCard: '#ddd6fe',
    iconAnim: { animate: { rotate: [0,90,180,270,360] },                 transition: { duration:4,   repeat:Infinity, ease:'linear' as const                   } },
  },
  {
    id: 'shipped',    num: '04', label: 'Shipped',    sub: 'Out for delivery',
    Icon: TruckIcon,
    color: '#059669', glow: 'rgba(5,150,105,0.3)',   ring: 'rgba(5,150,105,0.22)',
    bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.2)',
    bgCard: '#ecfdf5', borderCard: '#a7f3d0',
    iconAnim: { animate: { x:[0,6,0,-4,0], rotate:[0,2,0,-2,0] },        transition: { duration:2,   repeat:Infinity, ease:'easeInOut' as const               } },
  },
  {
    id: 'delivered',  num: '05', label: 'Delivered',  sub: 'Order received!',
    Icon: HomeIcon,
    color: '#b45309', glow: 'rgba(180,83,9,0.3)',    ring: 'rgba(180,83,9,0.22)',
    bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.2)',
    bgCard: '#fffbeb', borderCard: '#fde68a',
    iconAnim: { animate: { y:[0,-7,0,-4,0], scale:[1,1.08,1] },           transition: { duration:2.5, repeat:Infinity, ease:'easeInOut' as const, repeatDelay:1 } },
  },
];

interface Order {
  _id: string;
  items: { name: string; image: string; quantity: number; price: number }[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  paymentMethod: string;
  trackingNumber?: string;
  courierService?: string;
}

function getStageIndex(status: string) {
  return STAGES.findIndex(s => s.id === status);
}

/* ── Progress Tracker ── */
function ProgressTracker({ status, doAnimate = true }: { status: string; doAnimate?: boolean }) {
  const activeIdx   = getStageIndex(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="w-full">
      {/* Desktop horizontal */}
      <div className="hidden sm:flex items-start w-full">
        {STAGES.map((stage, i) => {
          const past   = i < activeIdx && !isCancelled;
          const active = i === activeIdx && !isCancelled;
          const future = i > activeIdx || isCancelled;
          return (
            <div key={stage.id} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  {active && doAnimate && (
                    <>
                      <motion.div className="absolute inset-0 rounded-full"
                        style={{ background: stage.ring }}
                        animate={{ scale: [1, 1.65, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} />
                      <motion.div className="absolute inset-0 rounded-full"
                        style={{ background: stage.ring }}
                        animate={{ scale: [1, 1.38, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.55 }} />
                    </>
                  )}
                  <motion.div
                    className="relative w-12 h-12 rounded-2xl flex items-center justify-center z-10"
                    style={{
                      background: past || active
                        ? `linear-gradient(145deg,${stage.color},${stage.color}bb)`
                        : '#f8fafc',
                      boxShadow: active ? `0 0 20px ${stage.glow}, 0 0 40px ${stage.glow}40` : 'none',
                      border: future ? '1.5px solid #e2e8f0' : 'none',
                    }}
                    initial={doAnimate ? { scale: 0.65, opacity: 0 } : false}
                    animate={doAnimate ? { scale: 1, opacity: 1 } : undefined}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 400, damping: 22 }}>
                    {past || active ? (
                      <motion.div {...(doAnimate ? stage.iconAnim : {})}>
                        <stage.Icon className="w-6 h-6 text-white" />
                      </motion.div>
                    ) : (
                      <stage.Icon className="w-5 h-5 text-slate-300" />
                    )}
                    <motion.span
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center"
                      style={{
                        background: past || active ? stage.color : '#e2e8f0',
                        color:      past || active ? '#fff'       : '#94a3b8',
                      }}
                      initial={doAnimate ? { scale: 0 } : false}
                      animate={doAnimate ? { scale: 1 } : undefined}
                      transition={{ delay: i * 0.1 + 0.2, type: 'spring', stiffness: 500 }}>
                      {i + 1}
                    </motion.span>
                  </motion.div>
                </div>
                <div className="text-center mt-2 w-20">
                  <p className="text-[11px] font-black leading-tight"
                    style={{ color: past || active ? stage.color : '#cbd5e1' }}>
                    {stage.label}
                  </p>
                  <p className="text-[9px] mt-0.5 text-slate-400">{stage.sub}</p>
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="flex-1 h-1.5 mt-6 mx-1 rounded-full overflow-hidden bg-slate-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg,${STAGES[i].color},${STAGES[i + 1].color})` }}
                    initial={doAnimate ? { width: '0%' } : false}
                    animate={doAnimate
                      ? { width: i < activeIdx && !isCancelled ? '100%' : i === activeIdx && !isCancelled ? '52%' : '0%' }
                      : undefined}
                    transition={{ delay: i * 0.14 + 0.38, duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical */}
      <div className="flex sm:hidden flex-col">
        {STAGES.map((stage, i) => {
          const past   = i < activeIdx && !isCancelled;
          const active = i === activeIdx && !isCancelled;
          return (
            <div key={stage.id} className="flex items-stretch gap-4">
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
                  style={{
                    background: past || active ? `linear-gradient(145deg,${stage.color},${stage.color}bb)` : '#f8fafc',
                    boxShadow:  active ? `0 0 16px ${stage.glow}` : 'none',
                    border:     !past && !active ? '1.5px solid #e2e8f0' : 'none',
                  }}
                  initial={doAnimate ? { scale: 0.65 } : false}
                  animate={doAnimate ? { scale: 1 } : undefined}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 22 }}>
                  {past || active
                    ? <motion.div {...(doAnimate ? stage.iconAnim : {})}><stage.Icon className="w-5 h-5 text-white" /></motion.div>
                    : <stage.Icon className="w-4 h-4 text-slate-300" />}
                  {active && doAnimate && (
                    <motion.div className="absolute inset-0 rounded-xl"
                      style={{ background: stage.ring }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }} />
                  )}
                </motion.div>
                {i < STAGES.length - 1 && (
                  <div className="w-px flex-1 my-1 min-h-[24px] rounded-full overflow-hidden bg-slate-100">
                    <motion.div className="w-full rounded-full" style={{ background: stage.color }}
                      initial={doAnimate ? { height: '0%' } : false}
                      animate={doAnimate ? { height: i < activeIdx && !isCancelled ? '100%' : '0%' } : undefined}
                      transition={{ delay: i * 0.12 + 0.3, duration: 0.55, ease: 'easeOut' }} />
                  </div>
                )}
              </div>
              <div className="pb-5 pt-1.5 flex-1">
                <p className="text-sm font-black" style={{ color: past || active ? stage.color : '#cbd5e1' }}>
                  {stage.num} · {stage.label}
                </p>
                <p className="text-xs mt-0.5 text-slate-400">{stage.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <motion.div
          className="mt-5 flex items-center gap-2.5 rounded-2xl px-5 py-3 bg-red-50 border border-red-200"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
          <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-bold text-red-700">This order has been cancelled.</p>
        </motion.div>
      )}
    </div>
  );
}

/* ── Order Card ── */
function OrderTrackCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const activeStage = STAGES.find(s => s.id === order.status);
  const stageIdx    = getStageIndex(order.status);
  const progress    = order.status === 'cancelled' ? 0 : Math.round(((stageIdx + 1) / STAGES.length) * 100);

  return (
    <motion.div
      className="overflow-hidden rounded-3xl bg-white"
      style={{
        border:     `1.5px solid ${activeStage ? activeStage.borderCard : '#f1f5f9'}`,
        boxShadow:  activeStage ? `0 4px 20px ${activeStage.glow}20` : '0 2px 10px rgba(0,0,0,0.04)',
      }}
      layout whileHover={{ scale: 1.005, y: -2 }} transition={spring}>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex gap-1.5 flex-shrink-0">
            {order.items.slice(0, 2).map((item, i) => (
              <motion.img key={i} src={item.image} alt={item.name}
                className="w-10 h-12 object-cover rounded-xl shadow-sm border border-slate-100"
                whileHover={{ scale: 1.08 }} />
            ))}
            {order.items.length > 2 && (
              <div className="w-10 h-12 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100">
                +{order.items.length - 2}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400 mb-0.5">
              Order #{order._id.slice(-8).toUpperCase()} ·{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="font-bold text-slate-900 text-sm truncate">
              {order.items.map(i => i.name).join(', ').slice(0, 50)}
              {order.items.map(i => i.name).join(', ').length > 50 ? '…' : ''}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {activeStage && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full"
                  style={{ background: activeStage.bg, color: activeStage.color, border: `1px solid ${activeStage.border}` }}>
                  <activeStage.Icon className="w-3 h-3" />
                  {activeStage.label}
                </span>
              )}
              {order.status === 'cancelled' && (
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                  Cancelled
                </span>
              )}
              <span className="text-sm font-black text-slate-400">₹{order.total.toLocaleString()}</span>
            </div>
            {order.status !== 'cancelled' && (
              <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-slate-100" style={{ maxWidth: '180px' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: activeStage ? `linear-gradient(90deg,${activeStage.color}88,${activeStage.color})` : '#e2e8f0' }}
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }} />
              </div>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          className="flex-shrink-0 mt-1 text-slate-300">
          <ChevronDownIcon className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="overflow-hidden">
            <div className="px-5 pb-6 pt-2 border-t border-slate-50">
              <div className="py-5">
                <ProgressTracker status={order.status} doAnimate />
              </div>
              {order.trackingNumber && (
                <motion.div
                  className="mt-4 rounded-2xl px-4 py-4 space-y-3 bg-sky-50 border border-sky-200"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-sky-600">
                        {getCourierName(order.courierService)}
                      </p>
                      <p className="font-mono font-black text-sm text-sky-800">{order.trackingNumber}</p>
                    </div>
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                      <TruckIcon className="w-5 h-5 text-sky-400" />
                    </motion.div>
                  </div>
                  {getCourierTrackUrl(order.courierService, order.trackingNumber) && (
                    <a href={getCourierTrackUrl(order.courierService, order.trackingNumber)!}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black text-white transition-opacity hover:opacity-85"
                      style={{ background: 'linear-gradient(135deg,#0284c7,#38bdf8)' }}>
                      Track on Courier Site <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </motion.div>
              )}
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={spring} className="mt-4">
                <Link href={`/orders/${order._id}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                  View Full Details <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Page ── */
export default function TrackOrderPage() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios.get('/api/orders')
      .then(r => setOrders(r.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 page-enter">

      {/* ══ HERO ══ */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-[0.10]"
            style={{ background: 'radial-gradient(circle,#6366f1,transparent 70%)' }}
            animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-3xl opacity-[0.07]"
            style={{ background: 'radial-gradient(circle,#10b981,transparent 70%)' }}
            animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-7"
            initial={{ opacity: 0, scale: 0.82, y: -14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}>
            <motion.div animate={{ x: [0, 6, 0, -3, 0], rotate: [0, 2, 0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <TruckIcon className="w-4 h-4 text-indigo-500" />
            </motion.div>
            <span className="text-indigo-600 text-xs font-bold tracking-[0.18em] uppercase">Track Order</span>
          </motion.div>

          <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-4"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.1 }}>
            Where is{' '}
            <motion.span
              className="block mt-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent"
              style={{ backgroundSize: '300% auto' }}
              animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              my order?
            </motion.span>
          </motion.h1>

          <motion.p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.2 }}>
            Live status for all your orders — from confirmation to your doorstep, every stage tracked.
          </motion.p>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* ══ MY ORDERS ══ */}
        <motion.section
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={ease}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-rose-50 border border-rose-100"
                animate={{ rotate: [0, -8, 8, -4, 4, 0] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}>
                <ShoppingBagIcon className="w-5 h-5 text-rose-500" />
              </motion.div>
              <div>
                <h2 className="text-xl font-black text-slate-900">My Orders</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {user ? `${orders.length} order${orders.length !== 1 ? 's' : ''} found` : 'Sign in to see your orders'}
                </p>
              </div>
            </div>
            {user && (
              <motion.div whileHover={{ x: 3 }}>
                <Link href="/orders" className="flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors">
                  All Orders <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>

          {!user ? (
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-white border border-indigo-100 shadow-sm text-center p-12 sm:p-16"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-[0.08]"
                  style={{ background: 'radial-gradient(circle,#6366f1,transparent 70%)' }}
                  animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 8, repeat: Infinity }} />
              </div>
              <div className="relative">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5"
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <UserCircleIcon className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <h3 className="text-slate-900 font-black text-2xl mb-3">Sign in to track your orders</h3>
                <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
                  Log in to your Ziya account for real-time tracking on all your orders.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={spring}>
                    <Link href="/auth/login"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white"
                      style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)' }}>
                      Log In
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={spring}>
                    <Link href="/auth/register"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors">
                      Create Account
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-28 rounded-3xl animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              className="rounded-3xl p-16 text-center bg-white border border-slate-100 shadow-sm"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.div
                className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <ShoppingBagIcon className="w-8 h-8 text-rose-400" />
              </motion.div>
              <h3 className="text-slate-900 font-black text-xl mb-2">No orders yet</h3>
              <p className="text-sm text-slate-400 mb-6">Start shopping to see your orders tracked here.</p>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} transition={spring}>
                <Link href="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)' }}>
                  Shop Now <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div className="space-y-4" variants={stagger(0.08, 0.04)} initial="hidden" animate="show">
              {orders.map(order => (
                <motion.div key={order._id} variants={slideUp} transition={ease}>
                  <OrderTrackCard order={order} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* ══ STAGE LEGEND ══ */}
        <motion.section
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={ease}>
          <div className="flex items-center gap-3 mb-6">
            <motion.div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0"
              animate={{ rotate: [0, 180, 360] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
              <SparklesIcon className="w-5 h-5 text-slate-500" />
            </motion.div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Order Status Guide</h2>
              <p className="text-xs text-slate-400 mt-0.5">Understanding each stage of your order</p>
            </div>
          </div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
            variants={stagger(0.06, 0.06)} initial="hidden" whileInView="show"
            viewport={{ once: true }}>
            {STAGES.map(stage => (
              <motion.div key={stage.id} variants={scaleIn} transition={spring}
                className="relative rounded-2xl p-5 overflow-hidden group bg-white"
                style={{ border: `1.5px solid ${stage.borderCard}`, boxShadow: `0 2px 12px ${stage.glow}15` }}
                whileHover={{ scale: 1.03, y: -3 }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 20% 30%,${stage.glow} 0%,transparent 65%)` }} />
                <div className="relative flex items-center gap-3 mb-2.5">
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: `linear-gradient(145deg,${stage.color},${stage.color}bb)` }}
                    animate={stage.iconAnim.animate}
                    transition={stage.iconAnim.transition}>
                    <stage.Icon className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${stage.color}99` }}>{stage.num}</p>
                    <p className="font-black text-slate-900 text-sm">{stage.label}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{stage.sub}</p>
              </motion.div>
            ))}

            {/* Cancelled card */}
            <motion.div variants={scaleIn} transition={spring}
              className="relative rounded-2xl p-5 overflow-hidden bg-white"
              style={{ border: '1.5px solid #fecaca', boxShadow: '0 2px 12px rgba(239,68,68,0.06)' }}
              whileHover={{ scale: 1.03, y: -3 }}>
              <div className="flex items-center gap-3 mb-2.5">
                <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500 text-white flex-shrink-0"
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <XCircleIcon className="w-5 h-5" />
                </motion.div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-300">06</p>
                  <p className="font-black text-slate-900 text-sm">Cancelled</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Order was cancelled before processing began.</p>
            </motion.div>
          </motion.div>
        </motion.section>

      </div>
    </div>
  );
}
