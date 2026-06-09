'use client';
import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon as StarOutline,
  FunnelIcon,
  CheckIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

/* ─── constants ─── */
const LIMIT = 15;

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

const CATEGORIES = ['All', 'Accessories', 'Stationery', 'Dresses'];

const CATEGORY_CONFIG: Record<string, { emoji: string; gradient: string; activeGradient: string; activeText: string; glowColor: string }> = {
  All:         { emoji: '🛍️', gradient: 'from-pink-50 to-rose-50',    activeGradient: 'from-pink-400 to-rose-500',   activeText: 'text-rose-600',  glowColor: 'shadow-rose-200'   },
  Accessories: { emoji: '✨', gradient: 'from-amber-50 to-yellow-50', activeGradient: 'from-amber-400 to-orange-400', activeText: 'text-amber-700', glowColor: 'shadow-amber-200'  },
  Stationery:  { emoji: '📝', gradient: 'from-sky-50 to-indigo-50',   activeGradient: 'from-sky-400 to-indigo-500',  activeText: 'text-sky-700',   glowColor: 'shadow-sky-200'    },
  Dresses:     { emoji: '👗', gradient: 'from-pink-50 to-purple-50',  activeGradient: 'from-pink-400 to-purple-500', activeText: 'text-pink-700',  glowColor: 'shadow-pink-200'   },
};
const SORT_OPTIONS = [
  { label: 'Latest',            value: 'createdAt-desc' },
  { label: 'Price: Low to High', value: 'price-asc'     },
  { label: 'Price: High to Low', value: 'price-desc'    },
  { label: 'Top Rated',         value: 'rating-desc'    },
  { label: 'Most Popular',      value: 'reviewCount-desc'},
];
const CATEGORY_META: Record<string,{gradient:string;textColor:string;emoji:string;desc:string}> = {
  All:         { gradient:'from-pink-100 via-rose-100 to-fuchsia-100',  textColor:'text-rose-700', emoji:'🛍️', desc:'Explore our curated Korean fashion collection' },
  Dresses:     { gradient:'from-rose-100 via-pink-100 to-rose-200',     textColor:'text-rose-700', emoji:'👗', desc:'Elegant dresses for every occasion' },
  Accessories: { gradient:'from-amber-50  via-pink-50  to-rose-100',    textColor:'text-rose-700', emoji:'✨', desc:'Complete your look with premium accessories' },
  Stationery:  { gradient:'from-sky-50    via-blue-50   to-violet-100', textColor:'text-blue-800', emoji:'📝', desc:'Beautiful Korean stationery & lifestyle goods' },
};

/* ─── animation variants ─── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  show:    { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -12 },
};

const gridVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
  exit:   { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1    },
  exit:   { opacity: 0, y: -8, scale: 0.97 },
};

const listVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
  exit:   { opacity: 0 },
};

const listCardVariants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0   },
  exit:   { opacity: 0, x: 12  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show:   { opacity: 1, scale: 1   },
  exit:   { opacity: 0, scale: 0.8 },
};

/* ─── SortDropdown ─── */
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
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-200 rounded-xl text-sm text-gray-700 font-medium hover:border-pink-300 hover:text-pink-500 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-100 whitespace-nowrap"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {selected.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDownIcon className="w-4 h-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            exit={{    opacity: 0, scale: 0.95, y: -8   }}
            transition={{ duration: 0.18, ease: [0.22,1,0.36,1] }}
            className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-30 origin-top-right"
          >
            {SORT_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                  opt.value === value ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-gray-700 hover:bg-pink-50/50'
                }`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0   }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                whileHover={{ x: 3 }}
              >
                {opt.label}
                {opt.value === value && (
                  <motion.span layoutId="sort-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckIcon className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  </motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── interfaces ─── */
interface Filters {
  priceMin: string; priceMax: string; rating: number;
  trending: boolean; isNew: boolean; inStockOnly: boolean;
}
const DEFAULT_FILTERS: Filters = {
  priceMin:'', priceMax:'', rating:0, trending:false, isNew:false, inStockOnly:false,
};

/* ─── CollapsibleSection ─── */
function CollapsibleSection({ title, children, defaultOpen = true }: { title:string; children:React.ReactNode; defaultOpen?:boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3 group">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink-400 transition-colors" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="section-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── SidebarFilters ─── */
function SidebarFilters({ activeCategory, filters, setFilters, onClearAll, hideHeader = false }:{
  activeCategory:string; filters:Filters; setFilters:(f:Filters)=>void; onClearAll:()=>void; hideHeader?:boolean;
}) {
  const hasActiveFilters = filters.priceMin || filters.priceMax || filters.rating > 0 ||
    filters.trending || filters.isNew || filters.inStockOnly;

  return (
    <aside className="w-full">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 0.5, delay: 0.3 }}>
              <FunnelIcon className="w-4 h-4 text-pink-400" />
            </motion.span>
            <h2 className="text-sm font-bold text-gray-900">Filters</h2>
          </div>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                type="button"
                onClick={onClearAll}
                className="text-xs text-pink-400 hover:text-pink-600 font-semibold hover:underline transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      <CollapsibleSection title="Category">
        {/* Clear All inline when header is hidden (mobile drawer) */}
        {hideHeader && hasActiveFilters && (
          <div className="flex justify-end -mt-2 mb-3">
            <motion.button type="button" onClick={onClearAll}
              className="text-xs text-pink-400 hover:text-pink-600 font-semibold transition-colors"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >Clear All</motion.button>
          </div>
        )}

        {/* Professional linear category list */}
        <div className="relative space-y-1">
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat;
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={cat === 'All' ? '/products' : `/products?category=${cat.toLowerCase()}`}
                  className="block"
                >
                  <motion.div
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden cursor-pointer transition-colors duration-200 ${
                      isActive ? 'bg-gray-50' : 'hover:bg-gray-50/60'
                    }`}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  >
                    {/* Animated left accent bar */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="cat-accent-bar"
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b ${cfg.activeGradient}`}
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          exit={{ scaleY: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Emoji icon pill */}
                    <motion.div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-br ${cfg.activeGradient} shadow-sm ${cfg.glowColor}`
                          : `bg-gradient-to-br ${cfg.gradient}`
                      }`}
                      animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="leading-none">{cfg.emoji}</span>
                    </motion.div>

                    {/* Label */}
                    <span className={`flex-1 text-sm font-semibold transition-colors duration-200 ${
                      isActive ? cfg.activeText : 'text-gray-600'
                    }`}>
                      {cat}
                    </span>

                    {/* Active check mark */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0, opacity: 0, rotate: 45 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className={`w-4 h-4 rounded-full bg-gradient-to-br ${cfg.activeGradient} flex items-center justify-center flex-shrink-0`}
                        >
                          <CheckIcon className="w-2.5 h-2.5 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Price Range">
        <div className="space-y-3">
          {/* Min / Max stacked — each input gets full width so numbers never clip */}
          <div className="flex flex-col gap-2">
            {/* Min */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pl-1">Min</span>
              <div className="relative w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 text-base font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all bg-white text-gray-800 placeholder-gray-300"
                  min="0"
                />
              </div>
            </div>
            {/* Max */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pl-1">Max</span>
              <div className="relative w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none">₹</span>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 text-base font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all bg-white text-gray-800 placeholder-gray-300"
                  min="0"
                />
              </div>
            </div>

            {/* Live range display */}
            {(filters.priceMin || filters.priceMax) && (
              <motion.p
                className="text-[11px] text-center text-pink-500 font-semibold bg-pink-50 rounded-lg py-1"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                ₹{filters.priceMin || '0'} &nbsp;–&nbsp; ₹{filters.priceMax || '∞'}
              </motion.p>
            )}
          </div>

          {/* Preset quick-select chips */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Under ₹500',   min: '',     max: '500'  },
              { label: '₹500–₹1K',    min: '500',  max: '1000' },
              { label: '₹1K–₹3K',     min: '1000', max: '3000' },
              { label: 'Above ₹3K',   min: '3000', max: ''     },
            ].map((preset) => {
              const isSelected = filters.priceMin === preset.min && filters.priceMax === preset.max;
              return (
                <motion.button
                  type="button"
                  key={preset.label}
                  onClick={() => setFilters({ ...filters, priceMin: preset.min, priceMax: preset.max })}
                  className={`px-2 py-2 text-[11px] rounded-xl border transition-all duration-150 font-semibold truncate ${
                    isSelected
                      ? 'bg-pink-400 text-white border-pink-400 shadow-sm shadow-pink-200'
                      : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 bg-white'
                  }`}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.93 }}
                  animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {preset.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Customer Rating">
        <div className="space-y-1">
          {[4,3,2,1].map((star) => (
            <motion.button type="button" key={star}
              onClick={() => setFilters({ ...filters, rating: filters.rating === star ? 0 : star })}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                filters.rating === star ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-gray-600 hover:bg-pink-50/50'
              }`}
              whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
            >
              <span className="flex items-center gap-0.5">
                {Array.from({length:5}).map((_,i) =>
                  i < star
                    ? <motion.span key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: i*0.04 }}><StarSolid className="w-3 h-3 text-amber-400" /></motion.span>
                    : <StarOutline key={i} className="w-3 h-3 text-gray-300" />
                )}
              </span>
              <span className="text-xs">{star}+ Stars</span>
            </motion.button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Special">
        <div className="space-y-1.5">
          {[
            { key:'trending', label:'🔥 Trending',    desc:'Most popular items' },
            { key:'isNew',    label:'✨ New Arrivals', desc:'Just added'         },
            { key:'inStockOnly', label:'✅ In Stock',  desc:'Available now'      },
          ].map(({ key, label, desc }) => {
            const isOn = filters[key as keyof Filters] as boolean;
            return (
              <motion.button type="button" key={key}
                onClick={() => setFilters({ ...filters, [key]: !isOn })}
                className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                  isOn ? 'bg-pink-50 border border-pink-200' : 'hover:bg-pink-50/40 border border-transparent'
                }`}
                whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
              >
                <motion.div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isOn ? 'bg-pink-300 border-pink-300' : 'border-pink-200'}`}
                  animate={{ scale: isOn ? [1,1.2,1] : 1 }} transition={{ duration: 0.25 }}>
                  <AnimatePresence>
                    {isOn && <motion.div key="dot" className="w-1.5 h-1.5 bg-white rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />}
                  </AnimatePresence>
                </motion.div>
                <div>
                  <p className={`text-sm font-medium ${isOn ? 'text-pink-600' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CollapsibleSection>
    </aside>
  );
}

/* ─── Pagination ─── */
function Pagination({ page, totalPages, onPage }: { page:number; totalPages:number; onPage:(p:number)=>void }) {
  if (totalPages <= 1) return null;

  const pages: (number|'…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page-1); i <= Math.min(totalPages-1, page+1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <motion.div
      className="flex items-center justify-center gap-1.5 mt-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Prev */}
      <motion.button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-pink-200 bg-white text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        whileHover={page > 1 ? { scale: 1.04, x: -2 } : {}}
        whileTap={page > 1 ? { scale: 0.96 } : {}}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </motion.button>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm select-none">…</span>
        ) : (
          <motion.button
            key={p}
            type="button"
            onClick={() => onPage(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold border transition-all shadow-sm ${
              p === page
                ? 'bg-pink-300 text-white border-pink-300 shadow-pink-200'
                : 'bg-white border-pink-100 text-gray-600 hover:border-pink-300 hover:text-pink-500'
            }`}
            whileHover={p !== page ? { scale: 1.1 } : {}}
            whileTap={{ scale: 0.92 }}
            animate={p === page ? { scale: [0.9, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {p}
          </motion.button>
        )
      )}

      {/* Next */}
      <motion.button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-pink-200 bg-white text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        whileHover={page < totalPages ? { scale: 1.04, x: 2 } : {}}
        whileTap={page < totalPages ? { scale: 0.96 } : {}}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRightIcon className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

/* ─── ProductsContent ─── */
function ProductsContent() {
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  const [products,   setProducts  ] = useState<Product[]>([]);
  const [loading,    setLoading   ] = useState(true);
  const [page,       setPage      ] = useState(1);
  const [total,      setTotal     ] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sort,       setSort      ] = useState('createdAt-desc');
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [filters,    setFilters   ] = useState<Filters>(DEFAULT_FILTERS);
  const [viewMode,   setViewMode  ] = useState<'grid'|'list'>('grid');
  const topRef = useRef<HTMLDivElement>(null);

  const category = searchParams.get('category') || 'all';
  const search   = searchParams.get('search')   || '';

  const fetchProducts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sort.split('-');
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT), sort: sortField, order: sortOrder });
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      if (filters.trending) params.set('trending', 'true');
      if (filters.isNew)    params.set('new', 'true');
      if (filters.priceMin) params.set('priceMin', filters.priceMin);
      if (filters.priceMax) params.set('priceMax', filters.priceMax);

      const res  = await axios.get(`/api/products?${params}`);
      const data = res.data;
      let fetched: Product[] = data.products || [];

      if (filters.rating > 0)  fetched = fetched.filter((p) => p.rating >= filters.rating);
      if (filters.inStockOnly) fetched = fetched.filter((p) => p.stock > 0);

      setProducts(fetched);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, filters]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts]);

  const goToPage = (p: number) => {
    setPage(p);
    fetchProducts(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearAllFilters = () => setFilters(DEFAULT_FILTERS);
  const activeCategory  = CATEGORIES.find((c) => c.toLowerCase() === category) || 'All';
  const meta            = CATEGORY_META[activeCategory] || CATEGORY_META['All'];

  const activeFilterCount = [
    filters.priceMin || filters.priceMax, filters.rating > 0,
    filters.trending, filters.isNew, filters.inStockOnly,
  ].filter(Boolean).length;

  /* active-chip list for AnimatePresence */
  type Chip = { id: string; label: string; clear: () => void };
  const chips: Chip[] = [];
  if (filters.priceMin || filters.priceMax) chips.push({ id:'price', label:`₹${filters.priceMin||'0'} – ₹${filters.priceMax||'∞'}`, clear:() => setFilters({...filters,priceMin:'',priceMax:''}) });
  if (filters.rating > 0)  chips.push({ id:'rating',   label:`${filters.rating}+ Stars`, clear:() => setFilters({...filters,rating:0})         });
  if (filters.trending)    chips.push({ id:'trending',  label:'🔥 Trending',             clear:() => setFilters({...filters,trending:false})    });
  if (filters.isNew)       chips.push({ id:'new',       label:'✨ New Arrivals',          clear:() => setFilters({...filters,isNew:false})       });
  if (filters.inStockOnly) chips.push({ id:'stock',     label:'✅ In Stock',             clear:() => setFilters({...filters,inStockOnly:false}) });

  const gridKey = `${page}-${sort}-${category}-${search}-${JSON.stringify(filters)}`;

  return (
    <div className="min-h-screen bg-pink-50/30" ref={topRef}>

      {/* ── HERO BANNER ── */}
      <motion.div
        className={`relative bg-gradient-to-r ${meta.gradient} overflow-hidden`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      >
        <div className="absolute inset-0 opacity-20 category-hero-dots" />
        <div className="relative w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-10 sm:py-14">
          <motion.nav
            className={`flex items-center gap-1.5 text-xs mb-3 ${meta.textColor} opacity-70`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 0.7, x: 0  }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Link href="/" className="hover:opacity-100 transition-opacity">Home</Link>
            <span>/</span>
            <span className="font-semibold opacity-100">{search ? `Search: "${search}"` : activeCategory}</span>
          </motion.nav>

          <div className="grid grid-cols-[1fr_auto] items-start gap-3 sm:gap-4">
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.45 }}>
              <div className="flex items-center gap-3 mb-1">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0,-8,8,-4,4,0] }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                >{meta.emoji}</motion.span>
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${meta.textColor}`}>
                  {search ? `"${search}"` : activeCategory === 'All' ? 'All Products' : activeCategory}
                </h1>
              </div>
              <p className={`text-sm sm:text-base mt-1 ml-[3.25rem] ${meta.textColor} opacity-70`}>{meta.desc}</p>
            </motion.div>

            <motion.div
              className="bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-2xl px-2.5 py-1 sm:px-5 sm:py-3 border border-white/70 text-right shadow-sm shrink-0"
              initial={{ opacity:0, scale:0.85 }}
              animate={{ opacity:1, scale:1    }}
              transition={{ delay:0.25, type:'spring', stiffness:300, damping:22 }}
            >
              <p className={`text-[9px] sm:text-xs uppercase tracking-wide font-medium ${meta.textColor} opacity-60`}>Products</p>
              <motion.p
                className={`text-sm sm:text-2xl font-bold leading-tight ${meta.textColor}`}
                key={total}
                initial={{ opacity:0, y:-8 }}
                animate={{ opacity:1, y:0  }}
                transition={{ duration:0.3 }}
              >
                {loading && products.length === 0 ? '—' : total}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── MAIN LAYOUT ── */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-6">
        <div className="flex gap-6 xl:gap-8 items-start">

          {/* ── DESKTOP SIDEBAR ── */}
          <motion.div
            className="hidden md:block w-48 lg:w-52 xl:w-56 2xl:w-64 flex-shrink-0"
            initial={{ opacity:0, x:-28 }}
            animate={{ opacity:1, x:0   }}
            transition={{ duration:0.5, delay:0.18, ease:[0.22,1,0.36,1] }}
          >
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 sticky top-20">
              <SidebarFilters activeCategory={activeCategory} filters={filters} setFilters={setFilters} onClearAll={clearAllFilters} />
            </div>
          </motion.div>

          {/* ── PRODUCT AREA ── */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0  }}
            transition={{ duration:0.45, delay:0.22, ease:[0.22,1,0.36,1] }}
          >
            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <motion.button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-pink-200 rounded-xl text-sm text-gray-700 hover:text-pink-500 hover:border-pink-300 transition-all shadow-sm"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                >
                  <motion.span animate={activeFilterCount > 0 ? { rotate: [-10,10,-5,5,0] } : {}} transition={{ duration: 0.4 }}>
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  </motion.span>
                  Filters
                  <AnimatePresence>
                    {activeFilterCount > 0 && (
                      <motion.span
                        key="count"
                        className="bg-pink-300 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                        initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                        transition={{ type:'spring', stiffness:500, damping:22 }}
                      >{activeFilterCount}</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Result count desktop */}
                <motion.p
                  className="hidden md:block text-sm text-gray-500"
                  key={total}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}
                >
                  <span className="font-semibold text-gray-800">{total}</span> products
                  {search && <span> for <em>&ldquo;{search}&rdquo;</em></span>}
                </motion.p>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* View mode toggle */}
                <div className="hidden sm:flex items-center bg-white border border-pink-100 rounded-xl overflow-hidden shadow-sm">
                  {(['grid','list'] as const).map((mode) => {
                    const Icon = mode === 'grid' ? Squares2X2Icon : ListBulletIcon;
                    return (
                      <motion.button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        className={`p-2 transition-colors relative ${viewMode === mode ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
                        title={`${mode} view`}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.88 }}
                      >
                        {viewMode === mode && (
                          <motion.span
                            layoutId="view-pill"
                            className="absolute inset-0 bg-pink-50 rounded-none"
                          />
                        )}
                        <Icon className="w-4 h-4 relative z-10" />
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:block text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                  <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
                </div>
              </div>
            </div>

            {/* ── Active filter chips ── */}
            <AnimatePresence>
              {chips.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-2 mb-4"
                  initial={{ opacity:0, height:0 }}
                  animate={{ opacity:1, height:'auto' }}
                  exit={{    opacity:0, height:0 }}
                  transition={{ duration:0.25 }}
                >
                  <AnimatePresence mode="popLayout">
                    {chips.map((chip) => (
                      <motion.span
                        key={chip.id}
                        variants={chipVariants}
                        initial="hidden" animate="show" exit="exit"
                        layout
                        className="flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-600 text-xs rounded-full font-medium border border-pink-100"
                      >
                        {chip.label}
                        <motion.button
                          type="button"
                          onClick={chip.clear}
                          whileHover={{ scale: 1.3, rotate: 90 }}
                          whileTap={{ scale: 0.8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </motion.button>
                      </motion.span>
                    ))}
                    <motion.button
                      key="clear-all"
                      type="button"
                      onClick={clearAllFilters}
                      className="px-3 py-1 text-xs text-gray-400 hover:text-pink-500 rounded-full border border-dashed border-pink-200 hover:border-pink-300 transition-colors"
                      variants={chipVariants}
                      initial="hidden" animate="show" exit="exit"
                      layout
                      whileHover={{ scale: 1.05 }}
                    >
                      Clear all
                    </motion.button>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Products / Skeleton / Empty ── */}
            <AnimatePresence mode="wait">
              {loading ? (
                /* ── Skeleton ── */
                <motion.div
                  key="skeleton"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  transition={{ duration:0.2 }}
                  className={viewMode === 'list'
                    ? 'space-y-3'
                    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5'
                  }
                >
                  {Array.from({ length: LIMIT }).map((_, i) => (
                    viewMode === 'list' ? (
                      <motion.div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm flex gap-4 p-3 border border-pink-50"
                        initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03, duration:0.3 }}>
                        <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-50 animate-pulse rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 bg-pink-50 rounded-full animate-pulse w-3/4" />
                          <div className="h-3 bg-pink-50 rounded-full animate-pulse w-1/2" />
                          <div className="h-3 bg-pink-50 rounded-full animate-pulse w-1/4 mt-4" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-50"
                        initial={{ opacity:0, y:12, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay: i*0.03, duration:0.3 }}>
                        <div className="aspect-[3/4] bg-gradient-to-b from-pink-50 to-rose-50 animate-pulse" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 bg-pink-50 rounded-full animate-pulse w-3/4" />
                          <div className="h-3 bg-pink-50 rounded-full animate-pulse w-1/2" />
                        </div>
                      </motion.div>
                    )
                  ))}
                </motion.div>

              ) : products.length === 0 ? (
                /* ── Empty state ── */
                <motion.div
                  key="empty"
                  className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-pink-100"
                  initial={{ opacity:0, scale:0.96 }}
                  animate={{ opacity:1, scale:1    }}
                  exit={{    opacity:0, scale:0.96 }}
                  transition={{ duration:0.3 }}
                >
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ y: [0,-8,0], rotate: [-3,3,-3,0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >🛍️</motion.div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                  <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">Try adjusting your filters or browse a different category</p>
                  <div className="flex gap-3">
                    <motion.button type="button" onClick={clearAllFilters}
                      className="px-5 py-2.5 border-2 border-pink-200 text-pink-500 font-semibold rounded-full hover:bg-pink-300 hover:text-white transition-all text-sm"
                      whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}>
                      Clear Filters
                    </motion.button>
                    <motion.div whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}>
                      <Link href="/products" className="inline-block px-5 py-2.5 bg-pink-300 text-white font-semibold rounded-full hover:bg-pink-400 transition-all text-sm">
                        Browse All
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>

              ) : viewMode === 'list' ? (
                /* ── List view ── */
                <motion.div
                  key={`list-${gridKey}`}
                  className="space-y-3"
                  variants={listVariants}
                  initial="hidden" animate="show" exit="exit"
                  transition={{ staggerChildren: 0.045, duration: 0.2 }}
                >
                  {products.map((product) => (
                    <motion.div key={product._id} variants={listCardVariants}>
                      <Link href={`/products/${product._id}`} className="group block">
                        <div className="bg-white rounded-2xl border border-pink-50 shadow-sm hover:shadow-md hover:border-pink-100 hover:-translate-y-0.5 transition-all duration-200 flex gap-4 p-3 sm:p-4">
                          <div className="relative w-28 sm:w-36 aspect-square flex-shrink-0 rounded-xl overflow-hidden bg-pink-50">
                            <img src={product.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {product.isTrending && (
                              <span className="absolute top-1.5 left-1.5 bg-pink-300 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Trending</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">{product.category}</p>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                            <div className="flex items-center gap-1 mt-1.5">
                              {[1,2,3,4,5].map((s) => (
                                <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-base font-bold text-gray-900">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                              {product.discountPrice && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                                  <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-full">
                                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                                  </span>
                                </>
                              )}
                            </div>
                            {product.stock === 0 && <p className="text-xs text-red-400 font-medium mt-1">Out of stock</p>}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

              ) : (
                /* ── Grid view ── */
                <motion.div
                  key={`grid-${gridKey}`}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5"
                  variants={gridVariants}
                  initial="hidden" animate="show" exit="exit"
                  transition={{ staggerChildren: 0.05, duration: 0.2 }}
                >
                  {products.map((product) => (
                    <motion.div key={product._id} variants={cardVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Pagination ── */}
            {!loading && products.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
            )}

            {/* ── Page info ── */}
            {!loading && totalPages > 1 && (
              <motion.p
                className="text-center text-xs text-gray-400 mt-3"
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
              >
                Page {page} of {totalPages} · {total} products
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.25 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 md:hidden shadow-2xl"
              initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'spring', stiffness:320, damping:32 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <motion.span animate={{ rotate:[-15,15,-8,8,0] }} transition={{ delay:0.15, duration:0.5 }}>
                    <FunnelIcon className="w-4 h-4 text-pink-400" />
                  </motion.span>
                  <span className="font-bold text-gray-900">Filters</span>
                  <AnimatePresence>
                    {activeFilterCount > 0 && (
                      <motion.span
                        key="badge"
                        className="bg-pink-300 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                        transition={{ type:'spring', stiffness:500, damping:22 }}
                      >{activeFilterCount}</motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button type="button" onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-full hover:bg-pink-50 text-gray-500 transition-colors"
                  whileHover={{ scale:1.15, rotate:90 }} whileTap={{ scale:0.88 }} transition={{ duration:0.18 }}>
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)] px-5 py-4">
                <SidebarFilters activeCategory={activeCategory} filters={filters} setFilters={setFilters} onClearAll={clearAllFilters} hideHeader={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-pink-50/30">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="flex gap-2"
            animate={{ opacity:[0.4,1,0.4] }}
            transition={{ duration:1.4, repeat:Infinity }}
          >
            {[0,1,2].map((i) => (
              <motion.div key={i} className="w-3 h-3 bg-pink-300 rounded-full"
                animate={{ y:[0,-10,0] }}
                transition={{ duration:0.7, repeat:Infinity, delay: i*0.14 }}
              />
            ))}
          </motion.div>
          <p className="text-sm text-pink-400 font-medium">Loading products…</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
