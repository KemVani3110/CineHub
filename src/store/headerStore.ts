import { create } from 'zustand';

interface HeaderState {
  isMobileMenuOpen: boolean;
  isSidebarOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  closeMobileMenu: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  isMobileMenuOpen: false,
  isSidebarOpen: false,
  setIsMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
})); 