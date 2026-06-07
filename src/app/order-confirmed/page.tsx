'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (orderId) {
      axios.get(`/api/orders/${orderId}`)
        .then((r) => setOrder(r.data.order))
        .catch(console.error);
    }
  }, [orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircleIcon className="w-20 h-20 text-emerald-400 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">Thank you for shopping with Ziya. We&apos;ll send you a confirmation email shortly.</p>

        {order && (
          <div className="bg-rose-50 rounded-2xl p-5 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-medium text-gray-800 text-xs">{orderId?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-emerald-600 capitalize">{String(order.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">₹{Number(order.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium text-gray-700 uppercase text-xs">{String(order.paymentMethod)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            🚚 Your order will be delivered in <strong>3-5 business days</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 py-3 border-2 border-rose-400 text-rose-400 font-semibold rounded-full hover:bg-rose-50 transition-colors text-sm"
            >
              Track Order
            </Link>
            <Link
              href="/products"
              className="flex-1 py-3 bg-rose-400 text-white font-semibold rounded-full hover:bg-rose-500 transition-colors text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-rose-400">Loading...</div>}>
      <OrderConfirmedContent />
    </Suspense>
  );
}
