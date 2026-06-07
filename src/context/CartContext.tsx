'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  stock: number;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ziya_cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('ziya_cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((newItem: CartItem) => {
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
  }, []);

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
  const shippingCost = subtotal >= 999 ? 0 : items.length > 0 ? 99 : 0;
  const total = subtotal + shippingCost;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, subtotal, itemCount, shippingCost }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
