'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChatBubbleLeftEllipsisIcon, MapPinIcon, CreditCardIcon, CheckIcon, PencilSquareIcon, XMarkIcon, TruckIcon, ArrowTopRightOnSquareIcon, ChevronLeftIcon, DocumentArrowDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { getCourierTrackUrl, getCourierName } from '@/lib/couriers';
import { downloadInvoicePDF } from '@/lib/generateInvoicePDF';

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
  courierService?: string;
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
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    axios.get(`/api/orders/${id}`)
      .then((r) => setOrder(r.data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = order
    ? order.paymentStatus !== 'paid' && !['shipped', 'delivered', 'cancelled'].includes(order.status)
    : false;

  function openEdit() {
    if (!order) return;
    setAddressForm({
      name:    order.shippingAddress.name    ?? '',
      phone:   order.shippingAddress.phone   ?? '',
      street:  order.shippingAddress.street  ?? '',
      city:    order.shippingAddress.city    ?? '',
      state:   order.shippingAddress.state   ?? '',
      pincode: order.shippingAddress.pincode ?? '',
    });
    setSaveError('');
    setEditingAddress(true);
  }

  async function saveAddress() {
    if (!order) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await axios.patch(`/api/orders/${id}`, { shippingAddress: addressForm });
      setOrder(res.data.order);
      setEditingAddress(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSaveError(msg || 'Failed to update address. Please try again.');
    } finally {
      setSaving(false);
    }
  }

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
      <motion.div className="mb-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {/* Back button row */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-500 text-gray-500 text-sm font-medium transition-all group"
        >
          <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          My Orders
        </Link>

        {/* Order title + status */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 mb-0.5 font-mono">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Order #{id.slice(-8).toUpperCase()}
            </h1>
          </div>
          <motion.span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize flex-shrink-0 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {order.status}
          </motion.span>
        </div>
      </motion.div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-1 ${i <= currentStep ? 'opacity-100' : 'opacity-35'}`}>
                  <motion.div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                      i < currentStep  ? 'bg-emerald-400 text-white' :
                      i === currentStep ? 'bg-rose-400 text-white ring-2 sm:ring-4 ring-rose-100' :
                      'bg-gray-200 text-gray-500'
                    }`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: i <= currentStep ? 1 : 0.35 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    {i < currentStep ? <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : i + 1}
                  </motion.div>
                  <span className="text-[9px] sm:text-xs capitalize font-medium text-gray-600 text-center w-10 sm:w-16 leading-tight">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <motion.div
                    className="flex-1 h-0.5 mx-0.5 sm:mx-1 -mt-4 sm:-mt-5 bg-gray-200 relative overflow-hidden rounded-full"
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
              {canEdit && (
                <button
                  type="button"
                  onClick={openEdit}
                  className="ml-auto flex items-center gap-1 text-xs text-rose-400 hover:text-rose-500 font-medium transition-colors"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
            </div>
            {canEdit && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 leading-snug">
                You can update your address until payment is confirmed.
              </p>
            )}
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
              {order.trackingNumber && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Courier</span>
                    <span className="font-medium text-gray-800 text-xs">{getCourierName(order.courierService)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Tracking #</span>
                    <span className="font-mono font-medium text-indigo-600 break-all text-right max-w-[130px] text-xs">{order.trackingNumber}</span>
                  </div>
                  {getCourierTrackUrl(order.courierService, order.trackingNumber) && (
                    <a
                      href={getCourierTrackUrl(order.courierService, order.trackingNumber)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 hover:from-indigo-600 hover:to-violet-600 transition-all"
                    >
                      <TruckIcon className="w-3.5 h-3.5" />
                      Track Your Order
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Invoice Download */}
          <motion.div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            variants={fadeUp}
            transition={{ duration: 0.4, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-3">
              <DocumentArrowDownIcon className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-gray-800 text-sm">Invoice</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Download or print your order invoice</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => downloadInvoicePDF(order)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-rose-200 hover:from-rose-500 hover:to-pink-600 transition-all"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  const win = window.open(`/api/orders/${id}/invoice`, '_blank');
                  if (win) win.focus();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                View in Browser
              </button>
            </div>
          </motion.div>

          {/* Shipment Info */}
          {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && (
            <motion.div
              className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 shadow-sm p-5"
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TruckIcon className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-gray-800 text-sm">Shipment Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Status</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {order.status === 'delivered' ? 'Delivered' : 'In Transit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Courier</span>
                  <span className="font-medium text-gray-800 text-xs">{getCourierName(order.courierService)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Tracking #</span>
                  <span className="font-mono font-medium text-indigo-600 text-xs">{order.trackingNumber}</span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.p
            className="text-xs text-gray-400 text-center"
            variants={fadeUp}
            transition={{ duration: 0.35, delay: 0.38 }}
          >
            Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </motion.p>
        </motion.div>
      </div>

      {/* Edit address modal */}
      {editingAddress && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingAddress(false); }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Update Shipping Address</h2>
              <button type="button" title="Close" onClick={() => setEditingAddress(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {([
                { key: 'name',    label: 'Full Name',    placeholder: 'Recipient name' },
                { key: 'phone',   label: 'Phone Number', placeholder: '10-digit mobile number' },
                { key: 'street',  label: 'Street / Area',placeholder: 'House no, street, locality' },
                { key: 'city',    label: 'City',         placeholder: 'City' },
                { key: 'state',   label: 'State',        placeholder: 'State' },
                { key: 'pincode', label: 'Pincode',      placeholder: '6-digit pincode' },
              ] as { key: keyof typeof addressForm; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={addressForm[key]}
                    onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
                  />
                </div>
              ))}
            </div>

            {saveError && (
              <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setEditingAddress(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAddress}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-rose-400 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {saving ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
