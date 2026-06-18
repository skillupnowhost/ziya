'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  productId?: string;
}

interface Order {
  _id: string;
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId?: string;
  razorpayOrderId?: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  promoCode?: string;
  trackingNumber?: string;
  courierService?: string;
  notes?: string;
  items: OrderItem[];
  shippingAddress: {
    name?: string;
    phone?: string;
    doorNumber?: string;
    streetName?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  createdAt: string;
  updatedAt?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',    color: 'text-amber-600 bg-amber-50 border-amber-200' },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-600 bg-blue-50 border-blue-200' },
  processing: { label: 'Processing', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  shipped:    { label: 'Shipped',    color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  delivered:  { label: 'Delivered',  color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-600 bg-red-50 border-red-200' },
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Pending',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  paid:     { label: 'Paid',     color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  failed:   { label: 'Failed',   color: 'text-red-600 bg-red-50 border-red-200' },
  refunded: { label: 'Refunded', color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

function InvoiceContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    axios
      .get(`/api/orders/${orderId}`)
      .then((r) => setOrder(r.data.order))
      .catch(() => setError('Invoice not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
          <p className="text-rose-400 text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">📄</p>
          <h2 className="text-xl font-semibold text-gray-700">{error || 'Invoice not found'}</h2>
          <a href="/orders" className="mt-4 inline-block px-6 py-2 bg-rose-400 text-white rounded-full text-sm hover:bg-rose-500">
            View Orders
          </a>
        </div>
      </div>
    );
  }

  const invoiceNumber = `INV-${order._id.slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const paidDate = order.updatedAt && order.paymentStatus === 'paid'
    ? new Date(order.updatedAt)
    : null;

  const addr = order.shippingAddress;
  const addressLine = [addr.doorNumber, addr.streetName].filter(Boolean).join(', ');
  const landmarkLine = addr.landmark ? `Near: ${addr.landmark}` : '';
  const cityLine = [addr.city, addr.state].filter(Boolean).join(', ');

  const totalItems = order.items.length;
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const orderStatus = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const paymentStatus = PAYMENT_STATUS_LABELS[order.paymentStatus] || PAYMENT_STATUS_LABELS.pending;

  const paymentMethodLabel =
    order.paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' :
    order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' :
    'Manual Payment';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Action buttons - hidden in print */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-rose-400 text-white rounded-xl text-sm font-semibold hover:bg-rose-500 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <motion.div
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Header ────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 sm:px-8 py-6 print:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-wide">INVOICE</h1>
              <p className="text-white/80 text-sm font-mono mt-1">{invoiceNumber}</p>
            </div>
            <div className="sm:text-right">
              <h2 className="text-xl font-bold text-white">Ziyakart</h2>
              <p className="text-white/70 text-xs mt-1">Online Fashion Store</p>
              <p className="text-white/60 text-xs">www.ziyakart.com</p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6">

          {/* ── Status Badges ───────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${orderStatus.color}`}>
              Order: {orderStatus.label}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${paymentStatus.color}`}>
              Payment: {paymentStatus.label}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50">
              {paymentMethodLabel}
            </span>
          </div>

          {/* ── Bill To + Invoice Info (2-col) ──────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Bill To */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3">Bill To / Ship To</p>
              <p className="text-sm font-bold text-gray-900">{addr.name || order.userName || user?.name}</p>
              {(addr.phone || order.userPhone) && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="text-gray-400 text-xs mr-1">Phone:</span>
                  {addr.phone || order.userPhone}
                </p>
              )}
              {(order.userEmail || user?.email) && (
                <p className="text-sm text-gray-600">
                  <span className="text-gray-400 text-xs mr-1">Email:</span>
                  {order.userEmail || user?.email}
                </p>
              )}
              <div className="border-t border-gray-200 mt-2 pt-2">
                {addressLine && <p className="text-sm text-gray-600">{addressLine}</p>}
                {landmarkLine && <p className="text-sm text-gray-500 italic">{landmarkLine}</p>}
                {cityLine && <p className="text-sm text-gray-600">{cityLine}</p>}
                {addr.pincode && <p className="text-sm text-gray-600">PIN: {addr.pincode}</p>}
                <p className="text-sm text-gray-600">{addr.country || 'India'}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3">Invoice Details</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Invoice No.</span>
                  <span className="font-bold font-mono text-gray-800">{invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Date</span>
                  <span className="font-medium text-gray-800">{formattedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Time</span>
                  <span className="font-medium text-gray-800">{formattedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs font-medium text-gray-800 bg-gray-200 px-2 py-0.5 rounded-md">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Full Reference</span>
                  <span className="font-mono text-[10px] font-medium text-gray-500 break-all text-right max-w-[180px]">
                    {order._id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Currency</span>
                  <span className="font-medium text-gray-800">INR (₹)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Payment Details (full width) ────────────────── */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 mb-6 border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-4">Payment Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Payment Method */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Payment Method</p>
                <p className="text-sm font-bold text-gray-800">{paymentMethodLabel}</p>
              </div>

              {/* Payment Status */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-400' :
                    order.paymentStatus === 'failed' ? 'bg-red-400' :
                    order.paymentStatus === 'refunded' ? 'bg-gray-400' :
                    'bg-amber-400'
                  }`} />
                  <p className={`text-sm font-bold ${
                    order.paymentStatus === 'paid' ? 'text-emerald-600' :
                    order.paymentStatus === 'failed' ? 'text-red-600' :
                    order.paymentStatus === 'refunded' ? 'text-gray-600' :
                    'text-amber-600'
                  }`}>
                    {paymentStatus.label}
                  </p>
                </div>
              </div>

              {/* Amount Paid */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Amount {order.paymentStatus === 'paid' ? 'Paid' : 'Due'}</p>
                <p className="text-sm font-bold text-gray-800">₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              {/* Payment ID */}
              {order.paymentId && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Payment / Transaction ID</p>
                  <p className="text-xs font-mono font-semibold text-gray-800 break-all">{order.paymentId}</p>
                </div>
              )}

              {/* Razorpay Order ID */}
              {order.razorpayOrderId && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Razorpay Order ID</p>
                  <p className="text-xs font-mono font-semibold text-gray-800 break-all">{order.razorpayOrderId}</p>
                </div>
              )}

              {/* Payment Date */}
              {paidDate && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Payment Date & Time</p>
                  <p className="text-sm font-bold text-gray-800">
                    {paidDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' '}
                    <span className="text-gray-500 font-medium">
                      {paidDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </p>
                </div>
              )}

              {/* Promo Code applied */}
              {order.promoCode && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Promo Code Applied</p>
                  <p className="text-sm font-bold font-mono text-emerald-600">{order.promoCode}</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Saved ₹{Number(order.discount).toLocaleString()}</p>
                </div>
              )}

              {/* COD info */}
              {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && (
                <div className="bg-white rounded-lg p-3 border border-amber-200 bg-amber-50/50">
                  <p className="text-[10px] text-amber-500 uppercase tracking-wider font-semibold mb-1">COD Note</p>
                  <p className="text-xs font-medium text-amber-700">Amount to be collected on delivery</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Tracking & Shipping (if available) ──────────── */}
          {(order.trackingNumber || order.courierService) && (
            <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.12em] mb-3">Shipping & Tracking</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.courierService && (
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold">Courier Service</p>
                    <p className="text-sm font-bold text-indigo-800">{order.courierService}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold">Tracking Number</p>
                    <p className="text-sm font-mono font-bold text-indigo-800">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Order Items ─────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em]">Order Items</p>
              <p className="text-xs text-gray-400">
                {totalItems} item{totalItems > 1 ? 's' : ''} · {totalQuantity} unit{totalQuantity > 1 ? 's' : ''}
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">#</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Item Description</th>
                    <th className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Size / Color</th>
                    <th className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Qty</th>
                    <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Unit Price</th>
                    <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-lg print:w-8 print:h-10" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            {item.productId && (
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {item.productId.slice(-6).toUpperCase()}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          {item.size && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{item.size}</span>}
                          {item.color && <span className="text-xs text-gray-500">{item.color}</span>}
                          {!item.size && !item.color && <span className="text-xs text-gray-300">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                    <div className="flex gap-2 mt-0.5">
                      {item.size && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Size: {item.size}</span>}
                      {item.color && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.color}</span>}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {item.quantity} × ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Price Breakdown ──────────────────────────────── */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({totalQuantity} items)</span>
                  <span className="text-gray-700 font-medium">₹{Number(order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping & Handling</span>
                  <span className={order.shippingCost === 0 ? 'text-emerald-500 font-semibold' : 'text-gray-700 font-medium'}>
                    {order.shippingCost === 0 ? 'FREE' : `₹${Number(order.shippingCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">
                      Discount
                      {order.promoCode && (
                        <span className="text-xs font-mono ml-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {order.promoCode}
                        </span>
                      )}
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      -₹{Number(order.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-300 pt-3 mt-1">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <span className="text-xl font-black text-gray-900">
                      ₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-right text-[10px] text-gray-400 mt-0.5">
                    ({amountInWords(Number(order.total))} only)
                  </p>
                </div>
                {order.paymentStatus === 'paid' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-2 text-center">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">✓ PAID IN FULL</p>
                  </div>
                )}
                {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 text-center">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">₹ COLLECT ON DELIVERY</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Notes ───────────────────────────────────────── */}
          {order.notes && (
            <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.12em] mb-1">Order Notes</p>
              <p className="text-sm text-amber-800">{order.notes}</p>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="bg-gray-50 px-6 sm:px-8 py-5 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">From</p>
              <p className="text-xs font-semibold text-gray-600">Ziyakart</p>
              <p className="text-xs text-gray-400">Online Fashion Store</p>
            </div>
            <div className="sm:text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
              <p className="text-xs text-gray-500">support@ziyakart.com</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Generated</p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at{' '}
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-4 pt-3 text-center">
            <p className="text-[10px] text-gray-400">
              This is a computer-generated invoice. No signature is required.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, header, footer, .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  );
}

function amountInWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const whole = Math.floor(amount);
  const paise = Math.round((amount - whole) * 100);

  if (whole === 0) return 'Zero Rupees';

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  let result = 'Rupees ' + convert(whole);
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result;
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-rose-400 text-sm">
        Loading invoice...
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
