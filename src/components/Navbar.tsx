'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNavbar } from '@/context/NavbarContext';
import {
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  ChevronRightIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { useWishlist } from '@/context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Stationery', href: '/products?category=stationery' },
  { label: 'Dresses', href: '/products?category=dresses' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartBounce, setCartBounce] = useState(false);
  const { searchOpen, setSearchOpen } = useNavbar();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout, isAdmin } = useAuth();
  const prevItemCount = useRef(itemCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (itemCount > prevItemCount.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 700);
    }
    prevItemCount.current = itemCount;
  }, [itemCount]);

  useEffect(() => setMobileOpen(false), [pathname, searchParams]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    const url = new URL(href, 'http://x');
    const cat = url.searchParams.get('category');
    if (cat && pathname === '/products') return searchParams.get('category') === cat;
    return pathname === href;
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/96 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/ziya-logo.png"
                alt="Ziya — the Fashion Closet"
                width={180}
                height={68}
                className="h-14 w-auto object-contain logo-filter"
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-semibold tracking-wide transition-colors duration-200 py-1 group ${
                  isActiveLink(link.href) ? 'text-pink-500' : 'text-gray-700 hover:text-pink-500'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-pink-300 rounded-full transition-all duration-300 ${
                  isActiveLink(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Search toggle */}
            <motion.button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                searchOpen ? 'bg-pink-50 text-pink-500' : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'
              }`}
              aria-label="Search"
              whileHover={{ scale: 1.12, rotate: searchOpen ? 0 : 12 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="search"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Wishlist — desktop only; mobile uses bottom nav */}
            <Link href="/profile?tab=favourites" aria-label="Wishlist" className="relative hidden lg:block">
              <motion.div
                className="p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <motion.div
                  animate={wishlistCount > 0 ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <HeartIcon className="w-5 h-5" />
                </motion.div>
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key="wc"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute -top-0.5 -right-0.5 bg-pink-400 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none"
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Cart — desktop only; mobile uses bottom nav */}
            <Link href="/cart" aria-label="Cart" className="relative hidden lg:block">
              <motion.div
                className="p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                animate={cartBounce ? { y: [0, -6, 2, -3, 0] } : {}}
                transition={cartBounce ? { duration: 0.5, ease: 'easeOut' } : { type: 'spring', stiffness: 400, damping: 18 }}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="cc"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute -top-0.5 -right-0.5 bg-pink-300 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* User dropdown — desktop only; mobile uses bottom nav */}
            {user ? (
              <div className="relative group hidden lg:block">
                <motion.button
                  className="flex items-center p-1.5 text-gray-600 hover:text-rose-500 rounded-full transition-colors duration-200"
                  aria-label="Account"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </motion.button>
                <div className="liquid-glass absolute right-0 mt-2 w-52 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1.5 z-50 origin-top-right scale-95 group-hover:scale-100">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors group/item">
                    <UserIcon className="w-4 h-4 transition-transform duration-200 group-hover/item:scale-110" />
                    My Profile
                    <ChevronRightIcon className="w-3 h-3 ml-auto opacity-0 group-hover/item:opacity-100 transition-all duration-200 group-hover/item:translate-x-0.5" />
                  </Link>
                  <Link href="/profile?tab=favourites" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors group/item">
                    <span className="flex items-center gap-2.5">
                      <motion.span whileHover={{ scale: 1.2 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <HeartIcon className="w-4 h-4 text-pink-400" />
                      </motion.span>
                      My Favourites
                    </span>
                    {wishlistCount > 0 && (
                      <span className="bg-pink-300 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors group/item">
                    <ArchiveBoxIcon className="w-4 h-4 transition-transform duration-200 group-hover/item:scale-110" />
                    My Orders
                    <ChevronRightIcon className="w-3 h-3 ml-auto opacity-0 group-hover/item:opacity-100 transition-all duration-200 group-hover/item:translate-x-0.5" />
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-500 font-semibold hover:bg-rose-50 transition-colors group/item">
                      <Cog6ToothIcon className="w-4 h-4 transition-transform duration-300 group-hover/item:rotate-90" />
                      Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-400 transition-colors group/item"
                    >
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4 transition-transform duration-200 group-hover/item:translate-x-0.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" aria-label="Sign in" className="hidden lg:block">
                <motion.div
                  className="p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors duration-200"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <UserIcon className="w-5 h-5" />
                </motion.div>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors duration-200"
              aria-label="Menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="bars"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pb-3 border-t border-gray-100 pt-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <motion.div
                  animate={searchOpen ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                </motion.div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dresses, accessories, stationery..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <motion.button
                type="submit"
                className="px-6 py-2.5 bg-rose-400 text-white text-sm rounded-full hover:bg-rose-500 transition-colors font-semibold shadow-sm shadow-rose-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                Search
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop — clicking outside closes the menu */}
            <motion.div
              key="mobile-backdrop"
              className="fixed inset-0 top-16 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden relative z-50"
          >
            <div className="liquid-glass border-t border-white/30 shadow-xl">
              {/* Nav links */}
              <nav className="px-4 pt-3 pb-2 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActiveLink(link.href)
                          ? 'bg-rose-50 text-rose-500'
                          : 'text-gray-700 hover:bg-pink-50 hover:text-pink-500'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* User section */}
              <motion.div
                className="px-4 pb-4 pt-2 border-t border-gray-100 mt-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.06 + 0.05, duration: 0.28 }}
              >
                {user ? (
                  <div className="space-y-2">
                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-pink-50/60 rounded-2xl">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-200 flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Sign out */}
                    <motion.button
                      type="button"
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition-colors"
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold rounded-xl shadow-sm shadow-rose-200"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
