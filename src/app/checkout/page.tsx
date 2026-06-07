'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: (options: Record<string, unknown>) => { open: () => void };
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, subtotal, shippingCost, clearCart } = useCart();
  const { user } = useAuth();

  const promoCode = searchParams.get('promo') || '';
  const discount = parseInt(searchParams.get('discount') || '0');
  const total = subtotal + shippingCost - discount;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'cod'>('razorpay');

  useEffect(() => {
    if (!user) router.push('/auth/login?redirect=/checkout');
    if (items.length === 0) router.push('/cart');
  }, [user, items, router]);

  useEffect(() => {
    if (user?.name) setAddress((prev) => ({ ...prev, name: prev.name || user.name }));
  }, [user]);

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window.Razorpay !== 'undefined') { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    setLoading(true);
    try {
      // Create order in DB
      const orderRes = await axios.post('/api/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
        shippingAddress: address,
        paymentMethod,
        promoCode,
      });

      const order = orderRes.data.order;

      if (paymentMethod === 'cod') {
        clearCart();
        router.push(`/order-confirmed?orderId=${order._id}`);
        return;
      }

      // Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); return; }

      const rzpRes = await axios.post('/api/payment/create-order', {
        amount: total,
        orderId: order._id,
      });

      const rzpOrder = rzpRes.data.razorpayOrder;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Ziya',
        description: 'Korean Fashion & More',
        order_id: rzpOrder.id,
        handler: async (response: Record<string, string>) => {
          try {
            await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            router.push(`/order-confirmed?orderId=${order._id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email || '',
        },
        theme: { color: '#fb7185' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window.Razorpay as any)(options);
      rzp.open();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Order failed';
      toast.error(msg || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 font-serif mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? 'bg-rose-400 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{s}</div>
            <span className={`text-sm font-medium hidden sm:block ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
              {s === 1 ? 'Shipping' : 'Payment'}
            </span>
            {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-rose-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-5 text-lg">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Your full name', full: false },
                  { key: 'phone', label: 'Phone Number', placeholder: '10-digit mobile number', full: false },
                  { key: 'street', label: 'Street Address', placeholder: 'House/Flat no., Street, Area', full: true },
                  { key: 'city', label: 'City', placeholder: 'City', full: false },
                  { key: 'state', label: 'State', placeholder: 'State', full: false },
                  { key: 'pincode', label: 'PIN Code', placeholder: '6-digit PIN', full: false },
                ].map((field) => (
                  <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">{field.label}</label>
                    <input
                      type="text"
                      value={address[field.key as keyof typeof address]}
                      onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-6 w-full py-3.5 bg-rose-400 text-white font-bold rounded-full hover:bg-rose-500 transition-colors"
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep(1)} className="text-rose-400 text-sm hover:text-rose-500 font-medium">← Back</button>
                <h2 className="font-bold text-gray-800 text-lg">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'razorpay', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                  { value: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: '📱' },
                  { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when delivered', icon: '💵' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === method.value ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value as typeof paymentMethod)}
                      className="accent-rose-400"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                      <p className="text-xs text-gray-400">{method.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Delivery address summary */}
              <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivering to</p>
                <p className="text-sm text-gray-700 font-medium">{address.name} · {address.phone}</p>
                <p className="text-sm text-gray-500">{address.street}, {address.city}, {address.state} {address.pincode}</p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-6 w-full py-3.5 bg-rose-400 text-white font-bold rounded-full hover:bg-rose-500 transition-all hover:scale-[1.01] disabled:opacity-50 shadow-md shadow-rose-200"
              >
                {loading ? 'Placing Order...' : `Place Order · ₹${total.toLocaleString()}`}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-fit sticky top-20">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 line-clamp-2">{item.name}</p>
                  {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                  <p className="text-xs font-bold text-gray-800 mt-0.5">₹{(item.price * item.quantity).toLocaleString()} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-emerald-500' : ''}>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span><span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-rose-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
