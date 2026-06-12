'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { TrashIcon, MinusIcon, PlusIcon, TagIcon, ArrowRightIcon, ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shippingCost, total } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ productId: string; size?: string } | null>(null);

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
      <motion.div
        className="min-h-[70vh] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          >🛍️</motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-full shadow-md shadow-rose-200 hover:shadow-rose-300 transition-shadow"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
    <motion.div
      className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Cart</h1>

        <motion.button
          onClick={() => setShowClearDialog(true)}
          className="text-sm text-red-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1.5"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
        >
          <XCircleIcon className="w-4 h-4" />
          Clear all
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart items */}
        <motion.div
          className="md:col-span-2 space-y-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        >
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.size}`}
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
                exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
                layout
                className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/products/${item.productId}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/products/${item.productId}`} className="text-sm sm:text-base font-semibold text-gray-800 hover:text-rose-400 line-clamp-2 transition-colors">
                      {item.name}
                    </Link>
                    {/* Remove button */}
                    <motion.button
                      onClick={() => setRemoveTarget({ productId: item.productId, size: item.size })}
                      className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      whileTap={{ scale: 0.85 }}
                      title="Remove item"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
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
                    {/* Quantity controls */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden">
                      <motion.button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                        className="p-2 hover:bg-rose-50 text-gray-500 hover:text-rose-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.85 }}
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.span
                        key={item.quantity}
                        className="px-3 text-sm font-bold text-gray-800 min-w-[32px] text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      >
                        {item.quantity}
                      </motion.span>
                      <motion.button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-rose-50 text-gray-500 hover:text-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        whileHover={item.quantity < item.stock ? { scale: 1.1 } : {}}
                        whileTap={item.quantity < item.stock ? { scale: 0.85 } : {}}
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                    <motion.span
                      className="font-bold text-gray-900 text-base"
                      key={item.price * item.quantity}
                      initial={{ scale: 0.9, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Order summary sidebar */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Promo */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-rose-400" />
              Promo Code
            </h3>
            <AnimatePresence mode="wait">
              {appliedPromo ? (
                <motion.div
                  key="applied"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm font-semibold text-emerald-600">{appliedPromo} applied! 🎉</span>
                  <motion.button
                    onClick={removePromo}
                    className="text-xs text-red-400 hover:text-red-500 font-semibold transition-colors"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Remove
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                  <motion.button
                    onClick={applyPromo}
                    disabled={validating || !promoCode.trim()}
                    className="relative px-4 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold rounded-xl shadow-sm shadow-rose-200 disabled:opacity-60 overflow-hidden"
                    whileHover={!validating ? { scale: 1.05, boxShadow: '0 4px 16px rgba(244,63,94,0.35)' } : {}}
                    whileTap={!validating ? { scale: 0.95 } : {}}
                  >
                    {validating ? (
                      <motion.span
                        className="block w-4 h-4 border-2 border-white/40 border-t-white rounded-full mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : 'Apply'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
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
                <span className={shippingCost === 0 ? 'text-emerald-500 font-semibold' : ''}>
                  {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>
              {discount > 0 && (
                <motion.div
                  className="flex justify-between text-emerald-600 font-medium"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <span>Discount ({appliedPromo})</span>
                  <span>-₹{discount}</span>
                </motion.div>
              )}
              {subtotal < 999 && (
                <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <motion.span
                  key={finalTotal}
                  initial={{ scale: 0.9, color: '#f43f5e' }}
                  animate={{ scale: 1, color: '#111827' }}
                  transition={{ duration: 0.4 }}
                >
                  ₹{finalTotal.toLocaleString()}
                </motion.span>
              </div>
            </div>

            {/* Proceed to Checkout */}
            <motion.div className="mt-5" whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}>
              <Link
                href={`/checkout?promo=${appliedPromo}&discount=${discount}`}
                className="relative flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-sm overflow-hidden shadow-md shadow-rose-200 hover:shadow-rose-300 transition-shadow"
                style={{ background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)' }}
              >
                {/* Shimmer */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
                />
                <span className="relative flex items-center gap-2">
                  Proceed to Checkout
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.span>
                </span>
              </Link>
            </motion.div>

            {/* Continue Shopping */}
            <motion.div className="mt-3" whileHover={{ x: -2 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Link
                href="/products"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-sm text-gray-500 hover:text-rose-400 transition-colors font-medium"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>

    {/* Remove single item confirmation */}
    <ConfirmDialog
      open={removeTarget !== null}
      type="danger"
      title="Remove item?"
      message="This item will be removed from your cart. You can always add it back."
      confirmLabel="Remove"
      cancelLabel="Keep it"
      onConfirm={() => { if (removeTarget) { removeItem(removeTarget.productId, removeTarget.size); } setRemoveTarget(null); }}
      onCancel={() => setRemoveTarget(null)}
    />

    {/* Clear all confirmation */}
    <ConfirmDialog
      open={showClearDialog}
      type="warning"
      title="Clear entire cart?"
      message="All items will be removed. This cannot be undone."
      confirmLabel="Clear Cart"
      cancelLabel="Cancel"
      onConfirm={() => { clearCart(); setShowClearDialog(false); }}
      onCancel={() => setShowClearDialog(false)}
    />
    </>
  );
}
