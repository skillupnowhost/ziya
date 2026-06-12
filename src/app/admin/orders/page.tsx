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
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { COURIER_OPTIONS, getCourierName } from '@/lib/couriers';

interface Order {
  _id: string;
  userId: string;
  items: { name: string; quantity: number; price: number; size?: string }[];
  total: number;
  subtotal: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    name?: string;
    phone?: string;
    street?: string;
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

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        <button type="button" title="Close" onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <p className="text-xs text-gray-400 font-mono mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
          <h2 className="text-lg font-bold text-gray-900">Update Order Status</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
            <span className="text-gray-400 text-xs">→</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[nextStatus]}`}>{nextStatus}</span>
          </div>
        </div>

        {/* Tracking details (shown for shipped/delivered) */}
        {(nextStatus === 'shipped' || nextStatus === 'delivered') && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5 block">
                <TruckIcon className="w-3.5 h-3.5" />
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
          </div>
        )}

        <div className="mb-5">
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
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={handle}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold shadow-sm shadow-rose-200 disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(244,63,94,0.35)' }}
            whileTap={{ scale: 0.97 }}
          >
            {busy ? (
              <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <><CheckIcon className="w-4 h-4" />Confirm</>
            )}
          </motion.button>
        </div>
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        <button type="button" title="Close" onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Confirm Payment</h2>
            <p className="text-xs text-gray-400 font-mono">Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Customer</span>
            <span className="font-medium text-gray-800">{order.shippingAddress?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-800">{order.shippingAddress?.phone || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Mark this order as <span className="font-semibold text-emerald-600">paid</span> and update the status to{' '}
          <span className="font-semibold text-blue-600">confirmed</span>. Stock will be deducted once confirmed.
        </p>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={handle}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-sm shadow-emerald-200 disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}
            whileTap={{ scale: 0.97 }}
          >
            {busy ? (
              <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <><CheckCircleIcon className="w-4 h-4" />Mark as Paid</>
            )}
          </motion.button>
        </div>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Delete Order?</h2>
        <p className="text-sm text-gray-500 mb-1">
          Order <span className="font-mono font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</span>
        </p>
        <p className="text-sm text-gray-400 mb-6">This will permanently remove the order. This action cannot be undone.</p>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
            }}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {busy ? (
              <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <><TrashIcon className="w-4 h-4" />Delete</>
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
  onStatusChange,
  onMarkPaid,
  onDelete,
}: {
  order: Order;
  onStatusChange: (order: Order, next: string) => void;
  onMarkPaid: (order: Order) => void;
  onDelete: (order: Order) => void;
}) {
  const isPendingPayment = order.paymentStatus === 'pending';

  return (
    <motion.div
      layout
      className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 ${
        isPendingPayment ? 'border-amber-200' : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
          <p className="font-semibold text-gray-800 text-sm mt-0.5">{order.shippingAddress?.name}</p>
          {order.shippingAddress?.phone && (
            <a
              href={`https://wa.me/91${order.shippingAddress.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-0.5"
            >
              <PhoneIcon className="w-3 h-3" />
              {order.shippingAddress.phone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {order.paymentStatus}
          </span>
          <button type="button" title="Delete order" onClick={() => onDelete(order)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
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
          {isPendingPayment && (
            <motion.button
              onClick={() => onMarkPaid(order)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-200"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Mark Paid
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

      {order.trackingNumber && (
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <TruckIcon className="w-3.5 h-3.5" />
          <span>{getCourierName(order.courierService)}:</span>
          <span className="font-mono font-semibold">{order.trackingNumber}</span>
        </div>
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
    } catch {
      toast.error('Update failed');
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
    } catch {
      toast.error('Failed to update payment status');
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
    } catch {
      toast.error('Delete failed');
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
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-serif flex-1">Orders</h1>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, ID…"
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all w-full sm:w-64"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-rose-400 text-white shadow-sm shadow-rose-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Pending payment alert */}
        <AnimatePresence>
          {activeTab === 'all' && pendingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 p-4 mb-5 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <ClockIcon className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                <span className="font-bold">{pendingCount} order{pendingCount > 1 ? 's' : ''}</span> pending payment.
                Contact customers via phone or WhatsApp to arrange payment.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('pending_payment')}
                className="ml-auto text-xs font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap"
              >
                View all →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Desktop table ──────────────────────────────────────────── */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      {search ? 'No orders match your search' : 'No orders in this category'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isPendingPayment = order.paymentStatus === 'pending';
                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-gray-50/70 transition-colors group ${
                          isPendingPayment ? 'bg-amber-50/30 hover:bg-amber-50/60' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs">{order.shippingAddress?.name}</p>
                          {order.shippingAddress?.phone && (
                            <a
                              href={`https://wa.me/91${order.shippingAddress.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-0.5"
                            >
                              <PhoneIcon className="w-3 h-3" />
                              {order.shippingAddress.phone}
                            </a>
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
                            {order.items.map((i) => i.name).join(', ')}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {order.items.reduce((s, i) => s + i.quantity, 0)} items
                          </p>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800">
                          ₹{order.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            title="Update order status"
                            onChange={(e) => onStatusChange(order, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'} focus:outline-none`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-white text-gray-800">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          {order.trackingNumber && (
                            <p className="text-[10px] text-indigo-500 mt-0.5 font-mono">
                              🚚 {getCourierName(order.courierService)}: {order.trackingNumber}
                            </p>
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
                            {isPendingPayment && (
                              <motion.button
                                onClick={() => setMarkPaidModal(order)}
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-sm shadow-emerald-100 whitespace-nowrap"
                                title="Mark as Paid"
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.92 }}
                              >
                                <CurrencyRupeeIcon className="w-3 h-3" />
                                Paid
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => setDeleteModal(order)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete order"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.88 }}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => fetchOrders(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                <button type="button" onClick={() => fetchOrders(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile card list ───────────────────────────────────────── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-8 bg-gray-100 rounded" />
              </div>
            ))
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {search ? 'No orders match your search' : 'No orders in this category'}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={onStatusChange}
                onMarkPaid={setMarkPaidModal}
                onDelete={setDeleteModal}
              />
            ))
          )}
        </div>
      </div>

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
