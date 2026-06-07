'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew?: boolean;
  isTrending?: boolean;
}

const TABS = ['All', 'Dresses', 'Accessories', 'Stationery'];

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchProducts = useCallback(async (tab: string, p: number, replace: boolean) => {
    setLoading(true);
    setError(false);
    try {
      const cat = tab === 'All' ? '' : `&category=${tab.toLowerCase()}`;
      const res = await axios.get(`/api/products?new=true${cat}&page=${p}&limit=8`);
      const fetched: Product[] = res.data.products || [];
      if (replace) {
        setProducts(fetched);
      } else {
        setProducts((prev) => [...prev, ...fetched]);
      }
      setHasMore(p < res.data.pagination?.pages);
    } catch {
      if (replace) {
        setProducts([]);
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(activeTab, 1, true);
  }, [activeTab, fetchProducts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(activeTab, next, false);
  };

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-rose-400 text-sm tracking-[0.3em] uppercase font-medium mb-1">Just In</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">New Arrivals</h2>
          </div>
          <Link href="/products?new=true" className="text-sm font-medium text-rose-400 hover:text-rose-500">
            View all →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-rose-400 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-200 hover:text-rose-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-gray-500">Failed to load products. Please try again later.</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No new arrivals found in this category.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-10 py-3 border-2 border-rose-400 text-rose-400 font-semibold rounded-full hover:bg-rose-400 hover:text-white transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
