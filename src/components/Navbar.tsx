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
} from '@heroicons/react/24/outline';
import { useWishlist } from '@/context/WishlistContext';

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
  const { searchOpen, setSearchOpen } = useNavbar();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

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
    if (cat && pathname === '/products') {
      return searchParams.get('category') === cat;
    }
    return pathname === href;
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/96 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — brightness filter makes faint logos more visible */}
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

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-semibold tracking-wide transition-colors duration-200 py-1 group ${
                  isActiveLink(link.href)
                    ? 'text-rose-500'
                    : 'text-gray-700 hover:text-rose-500'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-rose-400 rounded-full transition-all duration-300 ${
                  isActiveLink(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-all duration-200 ${
                searchOpen
                  ? 'bg-rose-50 text-rose-500 scale-110'
                  : 'text-gray-600 hover:text-rose-500 hover:bg-rose-50'
              }`}
              aria-label="Search"
            >
              {searchOpen
                ? <XMarkIcon className="w-5 h-5" />
                : <MagnifyingGlassIcon className="w-5 h-5" />
              }
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center p-1.5 text-gray-600 hover:text-rose-500 rounded-full transition-all duration-200"
                  aria-label="Account"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </button>
                <div className="liquid-glass absolute right-0 mt-2 w-52 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1.5 z-50 origin-top-right scale-95 group-hover:scale-100">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    👤 My Profile
                  </Link>
                  <Link href="/profile?tab=favourites" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    <span className="flex items-center gap-2.5">
                      <HeartIcon className="w-4 h-4 text-rose-400" />
                      My Favourites
                    </span>
                    {wishlistCount > 0 && (
                      <span className="bg-rose-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    📦 My Orders
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-500 font-semibold hover:bg-rose-50 transition-colors">
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-400 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="p-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200" aria-label="Sign in">
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200"
              aria-label="Menu"
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar — expands inside header, pushes page content down */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pb-3 border-t border-gray-100 pt-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dresses, accessories, stationery..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-400 text-white text-sm rounded-full hover:bg-rose-500 active:scale-95 transition-all font-semibold shadow-sm shadow-rose-200"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile menu — animated slide-down */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="liquid-glass border-t border-white/30 shadow-xl">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
            <Image
              src="/ziya-logo.png"
              alt="Ziya"
              width={90}
              height={34}
              className="h-8 w-auto object-contain logo-filter"
            />
            <span className="text-xs text-gray-400 italic">the Fashion Closet</span>
          </div>
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? 'bg-rose-50 text-rose-500'
                    : 'text-gray-700 hover:bg-rose-50 hover:text-rose-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
