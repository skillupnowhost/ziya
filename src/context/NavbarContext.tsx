'use client';
import { createContext, useContext, useState } from 'react';

interface NavbarContextValue {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const NavbarContext = createContext<NavbarContextValue>({
  searchOpen: false,
  setSearchOpen: () => {},
});

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <NavbarContext.Provider value={{ searchOpen, setSearchOpen }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  return useContext(NavbarContext);
}
