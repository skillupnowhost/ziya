'use client';
import { useEffect } from 'react';
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
} from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { label: 'Products', href: '/admin/products', icon: CubeIcon },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  { label: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { label: 'Coupon Logs', href: '/admin/coupon-logs', icon: TagIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/auth/login');
  }, [user, loading, isAdmin, router]);

  if (loading || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-rose-400 text-sm">Loading admin panel...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
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

      {/* Mobile top nav for admin */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1a1a2e] px-4 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  active ? 'bg-rose-400 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-12 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
