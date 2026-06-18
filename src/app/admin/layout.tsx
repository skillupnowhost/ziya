'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CubeIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { label: 'Products', href: '/admin/products', icon: CubeIcon },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  { label: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { label: 'Promo Codes', href: '/admin/promo-codes', icon: TagIcon },
  { label: 'Coupon Logs', href: '/admin/coupon-logs', icon: ClipboardDocumentListIcon },
  { label: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

function getInitials(name?: string) {
  if (!name) return 'A';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/auth/login');
  }, [user, loading, isAdmin, router]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  if (loading || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
        <p className="text-rose-400 text-sm font-medium">Loading admin panel…</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1a1a2e] text-white fixed top-0 bottom-0 z-40">
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center mb-3">
            <Image
              src="/ziya-logo.png"
              alt="Ziya"
              width={100}
              height={38}
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="text-xs text-white/40 uppercase tracking-widest">Admin Panel</p>
          <p className="text-white font-semibold mt-0.5 text-sm truncate">{user?.name}</p>
          <p className="text-white/50 text-xs truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-rose-400 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            ← Back to Store
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-rose-400 hover:bg-rose-400/10 transition-colors w-full"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1a1a2e] h-14 flex items-center px-4 gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Image
            src="/ziya-logo.png"
            alt="Ziya"
            width={60}
            height={24}
            className="h-6 w-auto object-contain brightness-0 invert flex-shrink-0"
          />
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase border-l border-white/20 pl-2 flex-shrink-0">
            Admin
          </span>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{getInitials(user?.name)}</span>
        </div>
      </header>

      {/* ── MOBILE DRAWER BACKDROP ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#1a1a2e] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-white/10">
          <Image
            src="/ziya-logo.png"
            alt="Ziya"
            width={80}
            height={30}
            className="h-8 w-auto object-contain brightness-0 invert"
          />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{getInitials(user?.name)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <p className="text-white/30 text-[10px] uppercase tracking-widest mt-3 font-medium">Admin Panel</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-rose-400 text-white shadow-sm shadow-rose-400/30'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="px-3 pb-6 pt-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
            Back to Store
          </Link>
          <button
            type="button"
            onClick={() => { logout(); setDrawerOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-rose-400 hover:bg-rose-400/10 transition-colors w-full"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-w-0 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
