'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface Order {
  _id: string;
  userId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: { name: string; city: string; state: string };
  notes?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// ── Status change modal ────────────────────────────────────────────────────
function StatusModal({
  order,
  nextStatus,
  onConfirm,
  onClose,
}: {
  order: Order;
  nextStatus: string;
  onConfirm: (notes: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    await onConfirm(notes);
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
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
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

        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            Remarks / Notes <span className="text-gray-400 font-normal">(shown to customer)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`e.g. "Your order has been shipped via BlueDart. Tracking: BD123456"`}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <motion.button
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
        <p className="text-sm text-gray-400 mb-6">This will permanently remove the order from the database. This action cannot be undone.</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            onClick={handle}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-sm shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(239,68,68,0.35)' }}
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

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status modal state
  const [statusModal, setStatusModal] = useState<{ order: Order; nextStatus: string } | null>(null);
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<Order | null>(null);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders?page=${p}&limit=15`);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(p);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const onStatusChange = (order: Order, nextStatus: string) => {
    if (nextStatus === order.status) return;
    setStatusModal({ order, nextStatus });
  };

  const confirmStatusChange = async (notes: string) => {
    if (!statusModal) return;
    const { order, nextStatus } = statusModal;
    try {
      await axios.put(`/api/orders/${order._id}`, { status: nextStatus, notes });
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: nextStatus, notes } : o));
      toast.success('Status updated!');
    } catch { toast.error('Update failed'); }
    finally { setStatusModal(null); }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    const id = deleteModal._id;
    try {
      await axios.delete(`/api/orders/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
      toast.success('Order deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteModal(null); }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif mb-6">Orders</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
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
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No orders yet</td></tr>
                ) : orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs">{order.shippingAddress?.name}</p>
                      <p className="text-gray-400 text-xs">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 text-xs line-clamp-1 max-w-[140px]">{order.items.map(i => i.name).join(', ')}</p>
                      <p className="text-gray-400 text-xs">{order.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">₹{order.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'} focus:outline-none`}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s} className="bg-white text-gray-800">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {order.notes && (
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[120px]" title={order.notes}>📝 {order.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <motion.button
                        onClick={() => setDeleteModal(order)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete order"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.88 }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => fetchOrders(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Previous</button>
                <button onClick={() => fetchOrders(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
