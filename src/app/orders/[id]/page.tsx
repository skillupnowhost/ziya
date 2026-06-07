'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
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
}

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

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-64 bg-gray-100 rounded-2xl animate-pulse" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/orders" className="text-rose-400 text-sm hover:text-rose-500 font-medium">← My Orders</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Order #{id.slice(-8).toUpperCase()}</h1>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ml-auto ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-5 text-sm uppercase tracking-wide">Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-1.5 ${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < currentStep ? 'bg-emerald-400 text-white' : i === currentStep ? 'bg-rose-400 text-white ring-4 ring-rose-100' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className="text-xs capitalize font-medium text-gray-600 text-center w-16 leading-tight">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 -mt-5 ${i < currentStep ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <Link href={`/products/${item.productId}`}>
                  <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-xl" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} className="text-sm font-semibold text-gray-800 hover:text-rose-400 line-clamp-2">
                    {item.name}
                  </Link>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.size && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Size: {item.size}</span>}
                    {item.color && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.color}</span>}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                    <span className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span>
            </div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total</span><span>₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Shipping Address</h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Payment</h3>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600"><span>Method</span><span className="uppercase font-medium">{order.paymentMethod}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold capitalize text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
