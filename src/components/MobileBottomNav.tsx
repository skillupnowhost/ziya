'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { HomeIcon, HeartIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, HeartIcon as HeartSolid, ShoppingBagIcon as BagSolid, UserIcon as UserSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

/* ── per-icon active animations ── */
const spring: Transition = { type: 'spring', stiffness: 480, damping: 28 };

const ICON_ANIMS: Record<string, { animate: TargetAndTransition; transition: Transition }> = {
  Home: {
    // house gently floats up-down like hovering
    animate: { y: [0, -5, 0, -3, 0] },
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 },
  },
  Favourites: {
    // heartbeat — two quick pumps then rest
    animate: { scale: [1, 1.35, 1, 1.18, 1] },
    transition: { duration: 1.0, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.8 },
  },
  Cart: {
    // bag sways like something was tossed in
    animate: { rotate: [0, -10, 10, -5, 5, 0], y: [0, -2, 0] },
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.2 },
  },
  Profile: {
    // user icon pops up and settles
    animate: { scale: [1, 1.18, 0.96, 1.06, 1], y: [0, -4, 0] },
    transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 },
  },
};

const tabs = [
  {
    label: 'Home',
    href: '/',
    match: (p: string) => p === '/',
    Icon: HomeIcon,
    ActiveIcon: HomeSolid,
    activeColor: 'text-rose-500',
    activeBg: 'rgba(244,63,94,0.10)',
    activeGlow: 'rgba(244,63,94,0.25)',
  },
  {
    label: 'Favourites',
    href: '/profile?tab=favourites',
    match: (p: string, q: string) => p === '/profile' && q.includes('favourites'),
    Icon: HeartIcon,
    ActiveIcon: HeartSolid,
    activeColor: 'text-pink-500',
    activeBg: 'rgba(236,72,153,0.10)',
    activeGlow: 'rgba(236,72,153,0.25)',
  },
  {
    label: 'Cart',
    href: '/cart',
    match: (p: string) => p === '/cart',
    Icon: ShoppingBagIcon,
    ActiveIcon: BagSolid,
    activeColor: 'text-rose-500',
    activeBg: 'rgba(244,63,94,0.10)',
    activeGlow: 'rgba(244,63,94,0.25)',
  },
  {
    label: 'Profile',
    href: '/profile',
    match: (p: string, q: string) => p === '/profile' && !q.includes('favourites'),
    Icon: UserIcon,
    ActiveIcon: UserSolid,
    activeColor: 'text-rose-500',
    activeBg: 'rgba(244,63,94,0.10)',
    activeGlow: 'rgba(244,63,94,0.25)',
    loginHref: '/auth/login',
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
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
      <div className="relative bg-white/92 backdrop-blur-2xl border-t border-gray-100/80 shadow-[0_-8px_32px_rgba(0,0,0,0.09)]">
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const href = tab.label === 'Profile' && !user ? (tab.loginHref ?? tab.href) : tab.href;
            const isActive = tab.match(pathname, search);
            const badge = badges[tab.href] ?? 0;
            const IconComponent = isActive ? tab.ActiveIcon : tab.Icon;
            const iconAnim = ICON_ANIMS[tab.label];

            return (
              <Link
                key={tab.href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative group"
                aria-label={tab.label}
              >
                {/* active top bar */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-bar"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                      style={{ background: 'linear-gradient(90deg,#f43f5e,#ec4899)' }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={spring}
                    />
                  )}
                </AnimatePresence>

                {/* active background blob */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute inset-x-1.5 top-1 bottom-1 rounded-2xl"
                      style={{ background: tab.activeBg }}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={spring}
                    />
                  )}
                </AnimatePresence>

                {/* icon + badge */}
                <motion.div
                  className="relative z-10"
                  whileTap={{ scale: 0.72 }}
                  animate={isActive ? { y: -1 } : { y: 0 }}
                  transition={spring}
                >
                  {/* unique animation when active */}
                  {isActive ? (
                    <motion.div
                      animate={iconAnim.animate}
                      transition={iconAnim.transition}
                    >
                      {/* glow ring on active */}
                      <motion.div
                        className="absolute inset-0 rounded-full blur-md -z-10"
                        style={{ background: tab.activeGlow }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <IconComponent className={`w-6 h-6 ${tab.activeColor}`} />
                    </motion.div>
                  ) : (
                    <IconComponent className="w-6 h-6 text-gray-400 group-active:text-gray-600 transition-colors duration-150" />
                  )}

                  {/* badge */}
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

                {/* label */}
                <motion.span
                  className={`text-[10px] font-semibold relative z-10 transition-colors duration-200 ${isActive ? tab.activeColor : 'text-gray-400'}`}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  transition={spring}
                >
                  {tab.label}
                </motion.span>
              </Link>
            );
          })}
        </div>

        <div className="h-safe-bottom bg-white/92" />
      </div>
    </nav>
  );
}
