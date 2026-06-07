'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { TrashIcon, MinusIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shippingCost, total } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validating, setValidating] = useState(false);

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    setValidating(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: code }),
      });
      const data = await res.json();

      if (!data.valid) {
        toast.error(data.error || 'Invalid promo code');
        return;
      }

      let discountAmount = 0;
      if (data.type === 'percent') {
        discountAmount = Math.round(subtotal * (data.value / 100));
        toast.success(`${data.value}% discount applied! 🎉`);
      } else if (data.type === 'shipping') {
        discountAmount = shippingCost;
        toast.success('Free shipping applied! 🚚');
      }

      setDiscount(discountAmount);
      setAppliedPromo(code);
    } catch {
      toast.error('Could not validate coupon. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const removePromo = () => { setAppliedPromo(''); setDiscount(0); setPromoCode(''); };

  const finalTotal = total - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products" className="px-8 py-3 bg-rose-400 text-white font-semibold rounded-full hover:bg-rose-500 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-500 font-medium">Clear all</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <Link href={`/products/${item.productId}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-xl"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <Link href={`/products/${item.productId}`} className="text-sm sm:text-base font-semibold text-gray-800 hover:text-rose-400 line-clamp-2">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-gray-400 hover:text-red-400 transition-colors shrink-0 p-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-1 mb-3">
                  {item.size && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Size: {item.size}</span>
                  )}
                  {item.color && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.color}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                      className="p-2 hover:bg-rose-50 text-gray-600 hover:text-rose-400 transition-colors"
                    >
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-gray-800 min-w-[32px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 hover:bg-rose-50 text-gray-600 hover:text-rose-400 transition-colors disabled:opacity-40"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900 text-base">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Promo */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-rose-400" />
              Promo Code
            </h3>
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                <span className="text-sm font-semibold text-emerald-600">{appliedPromo} applied!</span>
                <button onClick={removePromo} className="text-xs text-red-400 hover:text-red-500 font-medium">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300"
                />
                <button
                  onClick={applyPromo}
                  disabled={validating}
                  className="px-4 py-2 bg-rose-400 text-white text-sm font-semibold rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {validating ? '...' : 'Apply'}
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Have a newsletter coupon? Enter it here.</p>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'text-emerald-500 font-medium' : ''}>
                  {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedPromo})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              {subtotal < 999 && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                  Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href={`/checkout?promo=${appliedPromo}&discount=${discount}`}
              className="mt-5 flex items-center justify-center w-full py-3.5 bg-rose-400 text-white font-bold rounded-full hover:bg-rose-500 transition-all hover:scale-[1.02] shadow-md shadow-rose-200 text-sm"
            >
              Proceed to Checkout →
            </Link>

            <Link href="/products" className="mt-3 flex items-center justify-center w-full py-2.5 text-sm text-gray-500 hover:text-rose-400 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
