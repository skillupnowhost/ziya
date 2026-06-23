'use client';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  TruckIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { COURIER_OPTIONS, getCourierName } from '@/lib/couriers';
import { downloadInvoicePDF } from '@/lib/generateInvoicePDF';

interface Order {
  _id: string;
  userId: string;
  items: { name: string; quantity: number; price: number; size?: string; color?: string }[];
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  cgst: number;
  sgst: number;
  gst: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    name?: string;
    phone?: string;
    street?: string;
    doorNumber?: string;
    streetName?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  trackingNumber?: string;
  courierService?: string;
  notes?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-700',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  pending:    'bg-amber-500',
  confirmed:  'bg-blue-500',
  processing: 'bg-purple-500',
  shipped:    'bg-indigo-500',
  delivered:  'bg-emerald-500',
  cancelled:  'bg-red-500',
};

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  }),
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
};

const shimmerVariants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' as const },
  },
};

const iconFloat = {
  animate: {
    y: [0, -2, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

const pulseRing = {
  animate: {
    scale: [1, 1.4, 1],
    opacity: [0.6, 0, 0.6],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

function ShimmerCell() {
  return (
    <td className="px-4 py-3">
      <motion.div
        className="h-4 rounded-lg"
        style={{
          background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
          backgroundSize: '200% 100%',
        }}
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />
    </td>
  );
}

// ── Status / notes update modal ────────────────────────────────────────────
function StatusModal({
  order,
  nextStatus,
  onConfirm,
  onClose,
}: {
  order: Order;
  nextStatus: string;
  onConfirm: (notes: string, trackingNumber: string, courierService: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const [courier, setCourier] = useState(order.courierService || '');
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    await onConfirm(notes, tracking, courier);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30, rotateX: 4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <motion.button
          type="button"
          title="Close"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <XMarkIcon className="w-5 h-5" />
        </motion.button>

        <div className="mb-5 relative">
          <motion.p
            className="text-xs text-gray-400 font-mono mb-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            Order #{order._id.slice(-8).toUpperCase()}
          </motion.p>
          <motion.h2
            className="text-lg font-bold text-gray-900"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Update Order Status
          </motion.h2>
          <motion.div
            className="flex items-center gap-2 mt-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
            <motion.span
              className="text-gray-400 text-xs"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
            <motion.span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[nextStatus]}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.35 }}
            >
              {nextStatus}
            </motion.span>
          </motion.div>
        </div>

        {(nextStatus === 'shipped' || nextStatus === 'delivered') && (
          <motion.div
            className="mb-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5 block">
                <motion.span {...iconFloat}>
                  <TruckIcon className="w-3.5 h-3.5" />
                </motion.span>
                Courier Service
              </label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                title="Select courier service"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all bg-white"
              >
                <option value="">— Select courier —</option>
                {COURIER_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Tracking Number
              </label>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="e.g. ET123456789IN"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>
          </motion.div>
        )}

        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Remarks / Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              nextStatus === 'shipped'
                ? 'e.g. "Shipped via BlueDart. Estimated delivery in 3-4 days."'
                : `e.g. "Your order status has been updated to ${nextStatus}."`
            }
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
          />
        </motion.div>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
            whileTap={{ scale: 0.97 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="button"
            onClick={handle}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-lg shadow-rose-200/50 disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(244,63,94,0.4)' }}
            whileTap={{ scale: 0.96 }}
          >
            {busy ? (
              <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <>
                <motion.span whileHover={{ rotate: 15 }} transition={{ type: 'spring' }}>
                  <CheckIcon className="w-4 h-4" />
                </motion.span>
                Confirm
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Mark as Paid modal ─────────────────────────────────────────────────────
function MarkPaidModal({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30, rotateX: 4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <motion.button
          type="button"
          title="Close"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors z-10"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <XMarkIcon className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-3 mb-4 relative">
          <motion.div
            className="relative w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-200"
              variants={pulseRing}
              animate="animate"
            />
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CheckCircleIcon className="w-6 h-6 text-emerald-500 relative z-10" />
            </motion.span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-gray-900">Confirm Payment</h2>
            <p className="text-xs text-gray-400 font-mono">Order #{order._id.slice(-8).toUpperCase()}</p>
          </motion.div>
        </div>

        <motion.div
          className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 mb-5 space-y-1.5 text-sm border border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {[
            { label: 'Customer', value: order.shippingAddress?.name, bold: false },
            { label: 'Phone', value: order.shippingAddress?.phone || '—', bold: false },
            { label: 'Amount', value: `₹${order.total.toLocaleString()}`, bold: true },
          ].map((row, i) => (
            <motion.div
              key={row.label}
              className="flex justify-between"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <span className="text-gray-500">{row.label}</span>
              <span className={row.bold ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}>{row.value}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-sm text-gray-500 mb-5 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Mark this order as <span className="font-semibold text-emerald-600">paid</span> and update the status to{' '}
          <span className="font-semibold text-blue-600">confirmed</span>. Stock will be deducted once confirmed.
        </motion.p>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="button"
            onClick={handle}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-200/50 disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(16,185,129,0.4)' }}
            whileTap={{ scale: 0.96 }}
          >
            {busy ? (
              <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </motion.span>
                Mark as Paid
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const isConfirmed = order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered';
  const [step, setStep] = useState<1 | 2>(1);

  const handleDelete = async () => {
    if (isConfirmed && step === 1) {
      setStep(2);
      return;
    }
    setBusy(true);
    await onConfirm();
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 2 ? 0.7 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 8 }}
        animate={step === 2
          ? { scale: 1, opacity: 1, y: 0, rotateX: 0, x: [0, -6, 6, -4, 4, 0] }
          : { scale: 1, opacity: 1, y: 0, rotateX: 0 }
        }
        exit={{ scale: 0.85, opacity: 0, y: 30, rotateX: 4 }}
        transition={step === 2
          ? { x: { duration: 0.5, ease: 'easeInOut' }, default: { type: 'spring', stiffness: 350, damping: 25 } }
          : { type: 'spring', stiffness: 350, damping: 25 }
        }
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: step === 2
              ? 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)'
              : 'linear-gradient(135deg, rgba(239,68,68,0.04), transparent)',
          }}
          transition={{ duration: 0.4 }}
        />

        <motion.div
          className={`relative w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${step === 2 ? 'bg-red-200' : 'bg-red-100'}`}
          animate={step === 2 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {step === 2 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-300"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          <motion.span
            animate={step === 2 ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ExclamationTriangleIcon className={`w-8 h-8 ${step === 2 ? 'text-red-600' : 'text-red-500'}`} />
          </motion.span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {step === 2 ? 'Are you absolutely sure?' : 'Delete Order?'}
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Order <span className="font-mono font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</span>
            </p>
            {step === 2 ? (
              <p className="text-sm text-red-500 font-medium mb-6">
                This order is <span className="font-bold uppercase">{order.status}</span>. Deleting it is irreversible and may affect customer records.
              </p>
            ) : (
              <p className="text-sm text-gray-400 mb-6">This will permanently remove the order. This action cannot be undone.</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 relative">
          <motion.button
            type="button"
            onClick={step === 2 ? () => setStep(1) : onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {step === 2 ? 'Go Back' : 'Cancel'}
          </motion.button>
          <motion.button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 ${
              step === 2
                ? 'bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-300/50'
                : 'bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-200/50'
            }`}
            whileHover={{ scale: 1.03, boxShadow: step === 2 ? '0 8px 25px rgba(220,38,38,0.5)' : '0 8px 25px rgba(244,63,94,0.4)' }}
            whileTap={{ scale: 0.96 }}
          >
            {busy ? (
              <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : step === 2 ? (
              <>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  <TrashIcon className="w-4 h-4" />
                </motion.span>
                Yes, Delete Forever
              </>
            ) : (
              <>
                <TrashIcon className="w-4 h-4" />
                Delete
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Mobile order card ──────────────────────────────────────────────────────
function OrderCard({
  order,
  index,
  onStatusChange,
  onMarkPaid,
  onDelete,
}: {
  order: Order;
  index: number;
  onStatusChange: (order: Order, next: string) => void;
  onMarkPaid: (order: Order) => void;
  onDelete: (order: Order) => void;
}) {
  const isPendingPayment = order.paymentStatus === 'pending';

  return (
    <motion.div
      layout
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 transition-colors ${
        isPendingPayment ? 'border-amber-200' : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
          <p className="font-semibold text-gray-800 text-sm mt-0.5">{order.shippingAddress?.name}</p>
          {order.shippingAddress?.phone && (
            <motion.a
              href={`https://wa.me/91${order.shippingAddress.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-0.5"
              whileHover={{ x: 2 }}
            >
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}>
                <PhoneIcon className="w-3 h-3" />
              </motion.span>
              {order.shippingAddress.phone}
            </motion.a>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <motion.span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15, delay: index * 0.06 + 0.2 }}
          >
            {order.paymentStatus}
          </motion.span>
          <motion.button
            type="button"
            title="Delete order"
            onClick={() => onDelete(order)}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.15, rotate: -10 }}
            whileTap={{ scale: 0.85 }}
          >
            <TrashIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-gray-500 leading-relaxed">
        {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(', ')}
      </p>

      {/* Items */}
      <p className="text-xs text-gray-600 line-clamp-2">
        {order.items.map((i) => `${i.name}${i.size ? ` (${i.size})` : ''} ×${i.quantity}`).join(', ')}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
        <div>
          <p className="font-bold text-gray-900 text-sm">₹{order.total.toLocaleString()}</p>
          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isPendingPayment && (
              <motion.button
                onClick={() => onMarkPaid(order)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-200"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.06, boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }}
                whileTap={{ scale: 0.93 }}
              >
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Mark Paid
              </motion.button>
            )}
          </AnimatePresence>
          {!order.trackingNumber && order.status !== 'cancelled' && order.status !== 'delivered' && (
            <motion.button
              onClick={() => onStatusChange(order, 'shipped')}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-200"
              whileHover={{ scale: 1.06, boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: 0.93 }}
              title="Create shipment"
            >
              <motion.span {...iconFloat}>
                <TruckIcon className="w-3.5 h-3.5" />
              </motion.span>
              Ship
            </motion.button>
          )}
          <select
            value={order.status}
            title="Update order status"
            onChange={(e) => onStatusChange(order, e.target.value)}
            className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'} focus:outline-none`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-white text-gray-800">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick actions: Invoice */}
      <div className="flex gap-2">
        <motion.button
          type="button"
          onClick={() => downloadInvoicePDF(order)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          <motion.span whileHover={{ y: [0, -3, 0] }} transition={{ duration: 0.4 }}>
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
          </motion.span>
          Download PDF
        </motion.button>
        <motion.button
          type="button"
          onClick={() => window.open(`/api/orders/${order._id}/invoice`, '_blank')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-500 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          <EyeIcon className="w-3.5 h-3.5" />
          View Invoice
        </motion.button>
      </div>

      {order.trackingNumber && (
        <motion.div
          className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span {...iconFloat}>
            <TruckIcon className="w-3.5 h-3.5" />
          </motion.span>
          <span>{getCourierName(order.courierService)}:</span>
          <span className="font-mono font-semibold">{order.trackingNumber}</span>
        </motion.div>
      )}

      {order.notes && (
        <p className="text-xs text-gray-400 italic line-clamp-2">📝 {order.notes}</p>
      )}
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'pending_payment' | 'processing' | 'shipped';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const [statusModal, setStatusModal] = useState<{ order: Order; nextStatus: string } | null>(null);
  const [markPaidModal, setMarkPaidModal] = useState<Order | null>(null);
  const [deleteModal, setDeleteModal] = useState<Order | null>(null);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders?page=${p}&limit=50`);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(p);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const pendingCount = useMemo(() => orders.filter((o) => o.paymentStatus === 'pending').length, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeTab === 'pending_payment') result = result.filter((o) => o.paymentStatus === 'pending');
    else if (activeTab === 'processing') result = result.filter((o) => o.status === 'processing');
    else if (activeTab === 'shipped') result = result.filter((o) => o.status === 'shipped');

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o._id.toLowerCase().includes(q) ||
        o.shippingAddress?.name?.toLowerCase().includes(q) ||
        o.shippingAddress?.phone?.includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, activeTab, search]);

  const onStatusChange = (order: Order, nextStatus: string) => {
    if (nextStatus === order.status) return;
    setStatusModal({ order, nextStatus });
  };

  const confirmStatusChange = async (notes: string, trackingNumber: string, courierService: string) => {
    if (!statusModal) return;
    const { order, nextStatus } = statusModal;
    try {
      const update: Record<string, string> = { status: nextStatus, notes };
      if (trackingNumber)  update.trackingNumber  = trackingNumber;
      if (courierService)  update.courierService  = courierService;
      await axios.put(`/api/orders/${order._id}`, update);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? { ...o, status: nextStatus, notes, trackingNumber: trackingNumber || o.trackingNumber, courierService: courierService || o.courierService }
            : o
        )
      );
      toast.success('Status updated');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Update failed';
      toast.error(msg);
    } finally {
      setStatusModal(null);
    }
  };

  const confirmMarkPaid = async () => {
    if (!markPaidModal) return;
    const id = markPaidModal._id;
    try {
      await axios.put(`/api/orders/${id}`, { paymentStatus: 'paid', status: 'confirmed' });
      setOrders((prev) =>
        prev.map((o) => o._id === id ? { ...o, paymentStatus: 'paid', status: 'confirmed' } : o)
      );
      toast.success('Order marked as paid!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update payment status';
      toast.error(msg);
    } finally {
      setMarkPaidModal(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    const id = deleteModal._id;
    try {
      await axios.delete(`/api/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      toast.success('Order deleted');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Delete failed';
      toast.error(msg);
    } finally {
      setDeleteModal(null);
    }
  };

  const TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending_payment', label: 'Pending Payment', count: pendingCount },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <motion.h1
            className="text-2xl font-bold text-gray-900 font-serif flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            Orders
          </motion.h1>

          {/* Search */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <motion.span
              animate={searchFocused ? { scale: 1.1, color: '#f43f5e' } : { scale: 1, color: '#9ca3af' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </motion.span>
            <motion.input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, phone, ID…"
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all w-full sm:w-64"
              animate={searchFocused ? { width: 288 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </motion.div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {TABS.map((tab, i) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab.key && (
                <motion.div
                  className="absolute inset-0 bg-rose-400 rounded-xl shadow-md shadow-rose-200"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <motion.span
                  className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.15 }}
                >
                  {tab.count}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Pending payment alert */}
        <AnimatePresence>
          {activeTab === 'all' && pendingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -16, scaleY: 0.8 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -16, scaleY: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex items-center gap-3 p-4 mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl overflow-hidden relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-100/30 to-amber-100/0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.span
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                <ClockIcon className="w-5 h-5 text-amber-500 shrink-0 relative z-10" />
              </motion.span>
              <p className="text-sm text-amber-700 relative z-10">
                <span className="font-bold">{pendingCount} order{pendingCount > 1 ? 's' : ''}</span> pending payment.
                Contact customers via phone or WhatsApp to arrange payment.
              </p>
              <motion.button
                type="button"
                onClick={() => setActiveTab('pending_payment')}
                className="ml-auto text-xs font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap relative z-10"
                whileHover={{ x: 3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View all →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Desktop table ──────────────────────────────────────────── */}
        <motion.div
          className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 250, damping: 22 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-gray-100">
                <tr>
                  {['Order ID', 'Customer', 'Address', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h, i) => (
                    <motion.th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.03 }}
                    >
                      {h}
                    </motion.th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {Array.from({ length: 9 }).map((_, j) => (
                        <ShimmerCell key={j} />
                      ))}
                    </motion.tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="text-3xl mb-2"
                        >
                          📦
                        </motion.div>
                        <p className="text-gray-400 text-sm">
                          {search ? 'No orders match your search' : 'No orders in this category'}
                        </p>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order, i) => {
                      const isPendingPayment = order.paymentStatus === 'pending';
                      return (
                        <motion.tr
                          key={order._id}
                          custom={i}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className={`group cursor-default transition-colors ${
                            isPendingPayment
                              ? 'bg-amber-50/30 hover:bg-amber-50/60'
                              : 'hover:bg-gray-50/70'
                          }`}
                          whileHover={{
                            backgroundColor: isPendingPayment ? 'rgba(251,191,36,0.12)' : 'rgba(249,250,251,0.8)',
                          }}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 text-xs">{order.shippingAddress?.name}</p>
                            {order.shippingAddress?.phone && (
                              <motion.a
                                href={`https://wa.me/91${order.shippingAddress.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-0.5"
                                whileHover={{ x: 2 }}
                              >
                                <motion.span
                                  animate={{ rotate: [0, 15, -15, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                                >
                                  <PhoneIcon className="w-3 h-3" />
                                </motion.span>
                                {order.shippingAddress.phone}
                              </motion.a>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[160px]">
                            <p className="text-xs text-gray-600 leading-tight">
                              {order.shippingAddress?.street && (
                                <span className="block truncate">{order.shippingAddress.street}</span>
                              )}
                              <span className="text-gray-400">
                                {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(', ')}
                              </span>
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-600 text-xs line-clamp-1 max-w-[140px]">
                              {order.items.map((it) => it.name).join(', ')}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {order.items.reduce((s, it) => s + it.quantity, 0)} items
                            </p>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800">
                            ₹{order.total.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <motion.span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              {order.paymentStatus === 'pending' && (
                                <motion.span
                                  className="w-1.5 h-1.5 rounded-full bg-amber-500"
                                  animate={{ opacity: [1, 0.3, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                              )}
                              {order.paymentStatus}
                            </motion.span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <motion.span
                                className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[order.status] || 'bg-gray-400'}`}
                                animate={
                                  order.status === 'processing'
                                    ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
                                    : order.status === 'shipped'
                                    ? { x: [0, 3, 0] }
                                    : {}
                                }
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                              />
                              <select
                                value={order.status}
                                title="Update order status"
                                onChange={(e) => onStatusChange(order, e.target.value)}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'} focus:outline-none transition-colors`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s} className="bg-white text-gray-800">
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {order.trackingNumber && (
                              <motion.p
                                className="text-[10px] text-indigo-500 mt-0.5 font-mono flex items-center gap-0.5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.span {...iconFloat}>🚚</motion.span>
                                {getCourierName(order.courierService)}: {order.trackingNumber}
                              </motion.p>
                            )}
                            {order.notes && (
                              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[120px]" title={order.notes}>
                                📝 {order.notes}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <AnimatePresence>
                                {isPendingPayment && (
                                  <motion.button
                                    onClick={() => setMarkPaidModal(order)}
                                    className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-sm shadow-emerald-100 whitespace-nowrap"
                                    title="Mark as Paid"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1.08, boxShadow: '0 4px 15px rgba(16,185,129,0.35)', y: -1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <motion.span
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                                    >
                                      <CurrencyRupeeIcon className="w-3 h-3" />
                                    </motion.span>
                                    Paid
                                  </motion.button>
                                )}
                              </AnimatePresence>
                              {!order.trackingNumber && order.status !== 'cancelled' && order.status !== 'delivered' && (
                                <motion.button
                                  onClick={() => onStatusChange(order, 'shipped')}
                                  className="flex items-center gap-1 px-2 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-lg shadow-sm shadow-indigo-100 whitespace-nowrap"
                                  title="Create Shipment"
                                  whileHover={{ scale: 1.08, boxShadow: '0 4px 15px rgba(99,102,241,0.35)', y: -1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <motion.span
                                    animate={{ x: [0, 2, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                  >
                                    <TruckIcon className="w-3 h-3" />
                                  </motion.span>
                                  Ship
                                </motion.button>
                              )}
                              <motion.button
                                onClick={() => downloadInvoicePDF(order)}
                                className="flex items-center gap-1 px-2 py-1 text-rose-500 bg-rose-50 hover:bg-rose-100 text-[10px] font-bold rounded-lg whitespace-nowrap"
                                title="Download Invoice PDF"
                                whileHover={{ scale: 1.08, y: -1, boxShadow: '0 4px 12px rgba(244,63,94,0.2)' }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <motion.span whileHover={{ y: [0, -3, 0] }} transition={{ duration: 0.4 }}>
                                  <ArrowDownTrayIcon className="w-3 h-3" />
                                </motion.span>
                                PDF
                              </motion.button>
                              <motion.button
                                onClick={() => window.open(`/api/orders/${order._id}/invoice`, '_blank')}
                                className="flex items-center gap-1 px-2 py-1 text-violet-500 bg-violet-50 hover:bg-violet-100 text-[10px] font-bold rounded-lg whitespace-nowrap"
                                title="View Invoice"
                                whileHover={{ scale: 1.08, y: -1, boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <motion.span whileHover={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 500 }}>
                                  <EyeIcon className="w-3 h-3" />
                                </motion.span>
                                Invoice
                              </motion.button>
                              <motion.button
                                onClick={() => setDeleteModal(order)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete order"
                                whileHover={{ scale: 1.15, rotate: -12, color: '#ef4444' }}
                                whileTap={{ scale: 0.85, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <motion.div
              className="flex items-center justify-between px-4 py-3 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => fetchOrders(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  whileHover={{ x: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeftIcon className="w-3 h-3" />
                  Previous
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => fetchOrders(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  whileHover={{ x: 2, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next
                  <ChevronRightIcon className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Mobile card list ───────────────────────────────────────── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {[33, 66, 100, 50].map((w, j) => (
                  <motion.div
                    key={j}
                    className="h-4 rounded-lg"
                    style={{
                      width: `${w}%`,
                      background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                      backgroundSize: '200% 100%',
                    }}
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                  />
                ))}
              </motion.div>
            ))
          ) : filteredOrders.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl mb-3"
              >
                📦
              </motion.div>
              <p className="text-gray-400 text-sm">
                {search ? 'No orders match your search' : 'No orders in this category'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, i) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  index={i}
                  onStatusChange={onStatusChange}
                  onMarkPaid={setMarkPaidModal}
                  onDelete={setDeleteModal}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {statusModal && (
          <StatusModal
            key="status-modal"
            order={statusModal.order}
            nextStatus={statusModal.nextStatus}
            onConfirm={confirmStatusChange}
            onClose={() => setStatusModal(null)}
          />
        )}
        {markPaidModal && (
          <MarkPaidModal
            key="mark-paid-modal"
            order={markPaidModal}
            onConfirm={confirmMarkPaid}
            onClose={() => setMarkPaidModal(null)}
          />
        )}
        {deleteModal && (
          <DeleteModal
            key="delete-modal"
            order={deleteModal}
            onConfirm={confirmDelete}
            onClose={() => setDeleteModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
