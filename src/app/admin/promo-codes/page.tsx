'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TicketIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PromoCode {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percent' | 'flat' | 'shipping';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  percent: '% Off',
  flat: '₹ Off',
  shipping: 'Free Shipping',
};

const DISCOUNT_TYPE_COLORS: Record<string, string> = {
  percent: 'bg-violet-100 text-violet-700',
  flat: 'bg-amber-100 text-amber-700',
  shipping: 'bg-teal-100 text-teal-700',
};

function formatDiscount(code: PromoCode) {
  if (code.discountType === 'percent') return `${code.discountValue}% Off`;
  if (code.discountType === 'flat') return `₹${code.discountValue} Off`;
  return 'Free Shipping';
}

function isExpired(expiresAt?: string) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent' as 'percent' | 'flat' | 'shipping',
    discountValue: '',
    minOrderValue: '',
    maxUses: '',
    expiresAt: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      setCodes(data.codes || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Copied ${code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error();
      setCodes((prev) => prev.map((c) => c._id === id ? { ...c, isActive: !current } : c));
      toast.success(!current ? 'Promo code activated' : 'Promo code deactivated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCodes((prev) => prev.filter((c) => c._id !== id));
      toast.success('Promo code deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (form.discountType !== 'shipping' && (!form.discountValue || Number(form.discountValue) <= 0)) {
      toast.error('Discount value is required'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          description: form.description.trim() || undefined,
          discountType: form.discountType,
          discountValue: form.discountType === 'shipping' ? 0 : Number(form.discountValue),
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to create'); return; }
      setCodes((prev) => [data.promo, ...prev]);
      toast.success(`Promo code ${data.promo.code} created!`);
      setShowForm(false);
      setForm({ code: '', description: '', discountType: 'percent', discountValue: '', minOrderValue: '', maxUses: '', expiresAt: '' });
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm((f) => ({ ...f, code: `ZIYA${rand}` }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <TicketIcon className="w-6 h-6 text-rose-400" />
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            {codes.length}
          </span>
        </div>
        <motion.button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-400 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-rose-500 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <PlusIcon className="w-4 h-4" />
          Create Promo Code
        </motion.button>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
        <strong>How to share:</strong> Copy any code below and share it on social media, WhatsApp, or email. Customers enter the code at checkout to get the discount automatically.
      </div>

      {/* Codes grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          <TicketIcon className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p>No promo codes yet.</p>
          <p className="mt-1">Click <strong>Create Promo Code</strong> to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {codes.map((c) => {
            const expired = isExpired(c.expiresAt);
            const exhausted = c.maxUses != null && c.usedCount >= c.maxUses;
            const inactive = !c.isActive || expired || exhausted;
            return (
              <motion.div
                key={c._id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.25 }}
                className={`relative bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                  inactive ? 'opacity-60 border-gray-200' : 'border-gray-100 hover:border-rose-200 hover:shadow-md'
                }`}
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4 flex gap-1.5">
                  {expired && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Expired</span>
                  )}
                  {exhausted && !expired && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">Limit Reached</span>
                  )}
                  {!expired && !exhausted && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>

                {/* Discount type chip */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mb-3 ${DISCOUNT_TYPE_COLORS[c.discountType]}`}>
                  {DISCOUNT_TYPE_LABELS[c.discountType]}
                </span>

                {/* Code */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xl font-extrabold text-gray-900 tracking-widest">{c.code}</span>
                  <motion.button
                    type="button"
                    onClick={() => handleCopy(c.code, c._id)}
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-400 transition-colors"
                    title="Copy code"
                    whileTap={{ scale: 0.85 }}
                  >
                    {copiedId === c._id
                      ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                      : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                  </motion.button>
                </div>

                {/* Discount amount */}
                <p className="text-2xl font-bold text-rose-500 mb-1">{formatDiscount(c)}</p>

                {/* Description */}
                {c.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{c.description}</p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
                  {c.minOrderValue != null && <span>Min ₹{c.minOrderValue}</span>}
                  {c.maxUses != null && <span>Used {c.usedCount}/{c.maxUses}</span>}
                  {!c.maxUses && <span>{c.usedCount} uses</span>}
                  {c.expiresAt && (
                    <span className={expired ? 'text-red-400' : ''}>
                      Expires {new Date(c.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <motion.button
                    type="button"
                    onClick={() => handleToggle(c._id, c.isActive)}
                    disabled={togglingId === c._id || expired || exhausted}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                      c.isActive
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5 inline mr-1" />
                    {togglingId === c._id ? '...' : c.isActive ? 'Deactivate' : 'Activate'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleDelete(c._id, c.code)}
                    disabled={deletingId === c._id}
                    className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors disabled:opacity-40"
                    title="Delete"
                    whileTap={{ scale: 0.85 }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Create Promo Code</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Code */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Promo Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                      placeholder="e.g. SUMMER20"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-rose-300 hover:text-rose-400 transition-colors whitespace-nowrap"
                    >
                      Auto Generate
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description (optional)</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Summer sale discount"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>

                {/* Discount type */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Discount Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['percent', 'flat', 'shipping'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, discountType: t, discountValue: t === 'shipping' ? '0' : form.discountValue })}
                        className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                          form.discountType === t
                            ? 'border-rose-400 bg-rose-50 text-rose-600'
                            : 'border-gray-200 text-gray-600 hover:border-rose-200'
                        }`}
                      >
                        {t === 'percent' ? '% Percentage' : t === 'flat' ? '₹ Flat Amount' : '🚚 Free Shipping'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount value */}
                {form.discountType !== 'shipping' && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                      {form.discountType === 'percent' ? 'Discount Percentage (1–100) *' : 'Discount Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      placeholder={form.discountType === 'percent' ? 'e.g. 20' : 'e.g. 200'}
                      min={1}
                      max={form.discountType === 'percent' ? 100 : undefined}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Min order */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={form.minOrderValue}
                      onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                      placeholder="Optional"
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>

                  {/* Max uses */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Max Uses</label>
                    <input
                      type="number"
                      value={form.maxUses}
                      onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                      placeholder="Unlimited"
                      min={1}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>
                </div>

                {/* Expiry date */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Expiry Date (optional)</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-rose-400 text-white rounded-xl text-sm font-bold disabled:opacity-60 hover:bg-rose-500 transition-colors"
                    whileHover={!submitting ? { scale: 1.01 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                  >
                    {submitting ? 'Creating...' : 'Create Code'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
