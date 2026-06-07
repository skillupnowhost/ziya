'use client';
import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  StarIcon as StarOutline,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

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
  brand?: string;
}

const CATEGORIES = ['All', 'Dresses', 'Accessories', 'Stationery'];
const SORT_OPTIONS = [
  { label: 'Latest', value: 'createdAt-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating-desc' },
  { label: 'Most Popular', value: 'reviewCount-desc' },
];
const BRANDS = ['Ziya Collection', 'Seoul Minimal', 'K-Fashion Hub', 'Hanbok House', 'Vintage Seoul'];

function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:border-rose-300 hover:text-rose-500 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
      >
        {selected.label}
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-150">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                opt.value === value
                  ? 'bg-rose-50 text-rose-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.label}
              {opt.value === value && <CheckIcon className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Filters {
  priceMin: string;
  priceMax: string;
  rating: number;
  brands: string[];
  trending: boolean;
  isNew: boolean;
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  priceMin: '',
  priceMax: '',
  rating: 0,
  brands: [],
  trending: false,
  isNew: false,
  inStockOnly: false,
};

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-rose-400 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

function SidebarFilters({
  activeCategory,
  filters,
  setFilters,
  onClearAll,
}: {
  activeCategory: string;
  filters: Filters;
  setFilters: (f: Filters) => void;
  onClearAll: () => void;
}) {
  const router = useRouter();

  const hasActiveFilters =
    filters.priceMin || filters.priceMax || filters.rating > 0 ||
    filters.brands.length > 0 || filters.trending || filters.isNew || filters.inStockOnly;

  const toggleBrand = (brand: string) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    setFilters({ ...filters, brands: updated });
  };

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-rose-400" />
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-600 font-semibold hover:underline transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <CollapsibleSection title="Category">
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === 'All' ? '/products' : `/products?category=${cat.toLowerCase()}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-rose-50 text-rose-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeCategory === cat ? 'bg-rose-400' : 'bg-gray-300'}`} />
              {cat}
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₹</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                className="w-full pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                min="0"
              />
            </div>
            <span className="text-gray-400 text-sm flex-shrink-0">—</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₹</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                className="w-full pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Under ₹500', min: '', max: '500' },
              { label: '₹500–₹1000', min: '500', max: '1000' },
              { label: '₹1000–₹3000', min: '1000', max: '3000' },
              { label: 'Above ₹3000', min: '3000', max: '' },
            ].map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => setFilters({ ...filters, priceMin: preset.min, priceMax: preset.max })}
                className={`px-2.5 py-1 text-xs rounded-full border transition-all duration-150 ${
                  filters.priceMin === preset.min && filters.priceMax === preset.max
                    ? 'bg-rose-400 text-white border-rose-400'
                    : 'border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-400'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Rating */}
      <CollapsibleSection title="Customer Rating">
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setFilters({ ...filters, rating: filters.rating === star ? 0 : star })}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                filters.rating === star
                  ? 'bg-amber-50 text-amber-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) =>
                  i < star ? (
                    <StarSolid key={i} className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <StarOutline key={i} className="w-3.5 h-3.5 text-gray-300" />
                  )
                )}
              </span>
              <span className="text-xs">{star}+ Stars</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Brand */}
      <CollapsibleSection title="Brand" defaultOpen={false}>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleBrand(brand)}
                className={`w-4 h-4 rounded flex-shrink-0 border-2 transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  filters.brands.includes(brand)
                    ? 'bg-rose-400 border-rose-400'
                    : 'border-gray-300 group-hover:border-rose-300'
                }`}
              >
                {filters.brands.includes(brand) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggleBrand(brand)}
                className={`text-sm transition-colors cursor-pointer ${filters.brands.includes(brand) ? 'text-rose-500 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
              >
                {brand}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Special */}
      <CollapsibleSection title="Special">
        <div className="space-y-2">
          {[
            { key: 'trending', label: '🔥 Trending', desc: 'Most popular items' },
            { key: 'isNew', label: '✨ New Arrivals', desc: 'Just added' },
            { key: 'inStockOnly', label: '✅ In Stock', desc: 'Available now' },
          ].map(({ key, label, desc }) => {
            const isOn = filters[key as keyof Filters] as boolean;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setFilters({ ...filters, [key]: !isOn })}
                className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                  isOn ? 'bg-rose-50 border border-rose-200' : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  isOn ? 'bg-rose-400 border-rose-400' : 'border-gray-300'
                }`}>
                  {isOn && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isOn ? 'text-rose-600' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>
    </aside>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('createdAt-desc');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  const fetchProducts = useCallback(async (p: number, replace: boolean) => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sort.split('-');
      const params = new URLSearchParams({ page: String(p), limit: '20', sort: sortField, order: sortOrder });
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      if (filters.trending) params.set('trending', 'true');
      if (filters.isNew) params.set('new', 'true');
      if (filters.priceMin) params.set('priceMin', filters.priceMin);
      if (filters.priceMax) params.set('priceMax', filters.priceMax);

      const res = await axios.get(`/api/products?${params}`);
      const data = res.data;
      let fetched: Product[] = data.products || [];

      // Client-side filters (rating, brand, stock)
      if (filters.rating > 0) fetched = fetched.filter((p) => p.rating >= filters.rating);
      if (filters.brands.length > 0) fetched = fetched.filter((p) => p.brand && filters.brands.includes(p.brand));
      if (filters.inStockOnly) fetched = fetched.filter((p) => p.stock > 0);

      if (replace) setProducts(fetched);
      else setProducts((prev) => [...prev, ...fetched]);

      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      if (replace) setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, filters]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(next, false);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeCategory = CATEGORIES.find((c) => c.toLowerCase() === category) || 'All';

  const activeFilterCount = [
    filters.priceMin || filters.priceMax,
    filters.rating > 0,
    filters.brands.length > 0,
    filters.trending,
    filters.isNew,
    filters.inStockOnly,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-rose-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">{search ? `Search: "${search}"` : activeCategory}</span>
          </nav>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">
                {search ? `"${search}"` : activeCategory === 'All' ? 'All Products' : activeCategory}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{total} products found</p>
            </div>
            {/* Sort — visible on desktop in header */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex gap-6 lg:gap-7">
          {/* ── DESKTOP SIDEBAR ── */}
          <div className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
            <div className="liquid-glass rounded-2xl p-5 sticky top-20">
              <SidebarFilters
                activeCategory={activeCategory}
                filters={filters}
                setFilters={setFilters}
                onClearAll={clearAllFilters}
              />
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile toolbar */}
            <div className="lg:hidden flex items-center justify-between gap-3 mb-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="liquid-glass flex items-center gap-2 px-4 py-2 rounded-2xl text-sm text-gray-700 hover:text-rose-500 transition-all"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-rose-400 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <SortDropdown value={sort} onChange={setSort} />
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(filters.priceMin || filters.priceMax) && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-xs rounded-full font-medium border border-rose-100">
                    {filters.priceMin ? `₹${filters.priceMin}` : '₹0'} – {filters.priceMax ? `₹${filters.priceMax}` : '∞'}
                    <button type="button" onClick={() => setFilters({ ...filters, priceMin: '', priceMax: '' })}><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.rating > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-xs rounded-full font-medium border border-amber-100">
                    {filters.rating}+ Stars
                    <button type="button" onClick={() => setFilters({ ...filters, rating: 0 })}><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.trending && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded-full font-medium border border-orange-100">
                    🔥 Trending
                    <button type="button" onClick={() => setFilters({ ...filters, trending: false })}><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.isNew && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium border border-emerald-100">
                    ✨ New Arrivals
                    <button type="button" onClick={() => setFilters({ ...filters, isNew: false })}><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.brands.map((b) => (
                  <span key={b} className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded-full font-medium border border-purple-100">
                    {b}
                    <button type="button" onClick={() => setFilters({ ...filters, brands: filters.brands.filter((x) => x !== b) })}><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3 py-1 text-xs text-gray-400 hover:text-rose-500 rounded-full border border-dashed border-gray-300 hover:border-rose-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product grid */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">🛍️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">
                  Try adjusting your filters or browse a different category
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 border-2 border-rose-300 text-rose-400 font-semibold rounded-full hover:bg-rose-400 hover:text-white transition-all text-sm"
                  >
                    Clear Filters
                  </button>
                  <Link
                    href="/products"
                    className="px-5 py-2.5 bg-rose-400 text-white font-semibold rounded-full hover:bg-rose-500 transition-all text-sm"
                  >
                    Browse All
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Load more */}
            {page < totalPages && !loading && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  className="px-10 py-3 border-2 border-rose-400 text-rose-400 font-semibold rounded-full hover:bg-rose-400 hover:text-white active:scale-95 transition-all"
                >
                  Load More
                </button>
              </div>
            )}

            {loading && products.length > 0 && (
              <div className="flex justify-center py-8 gap-2">
                <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce bounce-delay-1" />
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce bounce-delay-2" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer panel */}
      <div
        className={`liquid-glass fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 lg:hidden shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-rose-400" />
            <span className="font-bold text-gray-900">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-rose-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)] px-5 py-4">
          <SidebarFilters
            activeCategory={activeCategory}
            filters={filters}
            setFilters={setFilters}
            onClearAll={clearAllFilters}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 bg-rose-300 rounded-full animate-bounce" />
          <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-bounce bounce-delay-1" />
          <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce bounce-delay-2" />
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
