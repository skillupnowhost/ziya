'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  stock: number;
  gstEnabled?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  itemCount: number;
  shippingCost: number;
  cgst: number;
  sgst: number;
  gst: number;
  shippingState: string;
  setShippingState: (state: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isTamilNadu(state: string): boolean {
  const normalized = state.trim().toLowerCase().replace(/\s+/g, '');
  return normalized === 'tamilnadu' || normalized === 'tn';
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingState, setShippingState] = useState('');
  const { user, loading } = useAuth();

  // Load cart from user-scoped storage; clear when logged out
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`ziya_cart_${user.id}`);
      setItems(saved ? JSON.parse(saved) : []);
    } else if (!loading) {
      setItems([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  // Persist only when a user is logged in
  useEffect(() => {
    if (user) {
      localStorage.setItem(`ziya_cart_${user.id}`, JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = useCallback((newItem: CartItem) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart', {
        icon: '🔒',
        duration: 3000,
      });
      setTimeout(() => { window.location.href = '/auth/login'; }, 800);
      return;
    }
    if (newItem.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    setItems((prev) => {
      const key = `${newItem.productId}-${newItem.size || ''}`;
      const existing = prev.find((i) => `${i.productId}-${i.size || ''}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.productId}-${i.size || ''}` === key
            ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, [user]);

  const removeItem = useCallback((productId: string, size?: string) => {
    const key = `${productId}-${size || ''}`;
    setItems((prev) => prev.filter((i) => `${i.productId}-${i.size || ''}` !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, size?: string) => {
    const key = `${productId}-${size || ''}`;
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => `${i.productId}-${i.size || ''}` !== key));
    } else {
      setItems((prev) =>
        prev.map((i) => (`${i.productId}-${i.size || ''}` === key ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Tiered GST: 5% for items priced below ₹1000, 12% for ₹1000+
  const { totalCgst, totalSgst } = items.reduce((acc, i) => {
    if (i.gstEnabled === false) return acc;
    const gstRate = i.price < 1000 ? 5 : 12;
    const lineTotal = i.price * i.quantity;
    acc.totalCgst += Math.ceil(lineTotal * (gstRate / 2) / 100);
    acc.totalSgst += Math.ceil(lineTotal * (gstRate / 2) / 100);
    return acc;
  }, { totalCgst: 0, totalSgst: 0 });
  const cgst = totalCgst;
  const sgst = totalSgst;
  const gst = cgst + sgst;
  const shippingCost = subtotal >= 999 ? 0 : items.length > 0 ? (isTamilNadu(shippingState) ? 79 : 99) : 0;
  const total = subtotal + gst + shippingCost;
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, subtotal, itemCount, shippingCost, cgst, sgst, gst, shippingState, setShippingState }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
