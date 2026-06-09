'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, ShoppingBagIcon as BagSolid, UserIcon as UserSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

const tabs = [
  {
    label: 'Favourites',
    href: '/profile?tab=favourites',
    match: (p: string, q: string) => p === '/profile' && q.includes('favourites'),
    Icon: HeartIcon,
    ActiveIcon: HeartSolid,
    activeColor: 'text-pink-500',
  },
  {
    label: 'Cart',
    href: '/cart',
    match: (p: string) => p === '/cart',
    Icon: ShoppingBagIcon,
    ActiveIcon: BagSolid,
    activeColor: 'text-rose-500',
  },
  {
    label: 'Profile',
    href: '/profile',
    match: (p: string, q: string) => p === '/profile' && !q.includes('favourites'),
    Icon: UserIcon,
    ActiveIcon: UserSolid,
    activeColor: 'text-rose-500',
    loginHref: '/auth/login',
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();

  if (pathname.startsWith('/admin')) return null;

  const badges: Record<string, number> = {
    '/cart': itemCount,
    '/profile?tab=favourites': wishlistCount,
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Frosted glass bar */}
      <div className="relative bg-white/90 backdrop-blur-xl border-t border-gray-100/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const href = tab.label === 'Profile' && !user ? (tab.loginHref ?? tab.href) : tab.href;
            const isActive = tab.match(pathname, search);
            const badge = badges[tab.href] ?? 0;
            const IconComponent = isActive ? tab.ActiveIcon : tab.Icon;

            return (
              <Link
                key={tab.href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative group"
                aria-label={tab.label}
              >
                {/* Active indicator pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full bg-gradient-to-r from-pink-400 to-rose-400"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon + badge */}
                <motion.div
                  className="relative"
                  whileTap={{ scale: 0.8 }}
                  animate={isActive ? { y: -1 } : { y: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <IconComponent
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isActive ? tab.activeColor : 'text-gray-400 group-active:text-gray-600'
                    }`}
                  />
                  <AnimatePresence>
                    {badge > 0 && (
                      <motion.span
                        key={`badge-${tab.href}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-pink-400 to-rose-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm shadow-rose-200"
                      >
                        {badge > 9 ? '9+' : badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? tab.activeColor : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS safe area spacer */}
        <div className="h-safe-bottom bg-white/90" />
      </div>
    </nav>
  );
}
