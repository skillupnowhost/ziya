'use client';
import { usePathname } from 'next/navigation';
import { useNavbar } from '@/context/NavbarContext';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const { searchOpen } = useNavbar();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <main className={`flex-1 transition-all duration-300 ${isAdmin ? '' : searchOpen ? 'pt-32' : 'pt-16'}`}>
      {children}
    </main>
  );
}
