'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  remove: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { user, loading } = useAuth();

  // Load wishlist from user-scoped storage; clear when logged out
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`ziya_wishlist_${user.id}`);
      setItems(saved ? JSON.parse(saved) : []);
    } else if (!loading) {
      setItems([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  // Persist only when a user is logged in
  useEffect(() => {
    if (user) {
      localStorage.setItem(`ziya_wishlist_${user.id}`, JSON.stringify(items));
    }
  }, [items, user]);

  const toggle = useCallback((item: WishlistItem) => {
    if (!user) {
      toast.error('Please sign in to save favourites', {
        icon: '🔒',
        duration: 3000,
      });
      setTimeout(() => { window.location.href = '/auth/login'; }, 800);
      return;
    }
    setItems((prev) => {
      const exists = prev.some((i) => i.productId === item.productId);
      return exists ? prev.filter((i) => i.productId !== item.productId) : [...prev, item];
    });
  }, [user]);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const isWishlisted = useCallback((productId: string) => {
    return items.some((i) => i.productId === productId);
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, remove, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
