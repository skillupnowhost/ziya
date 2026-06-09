'use client';
import { usePathname } from 'next/navigation';
import { useNavbar } from '@/context/NavbarContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const { searchOpen } = useNavbar();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <main className={`flex-1 transition-all duration-300 ${isAdmin ? '' : searchOpen ? 'pt-32' : 'pt-16'} ${isAdmin ? '' : 'pb-20 lg:pb-0'}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
