import { create } from 'zustand';
import { User } from '@/types/user';
import { authService } from '@/services/auth/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasCheckedAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook', token: string) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  hasCheckedAuth: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({
        user: response.user,
        isLoading: false,
        hasCheckedAuth: true
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({
        user: response.user,
        isLoading: false,
        hasCheckedAuth: true
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({
        user: null,
        isLoading: false,
        hasCheckedAuth: false // Reset auth check when logout
      });

      // Clear all persisted data from other stores
      localStorage.removeItem('favorites-storage');
      localStorage.removeItem('watchlist-storage');
      localStorage.removeItem('rating-storage');
      localStorage.removeItem('history-storage');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false
      });
      throw error;
    }
  },

  socialLogin: async (provider, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.socialLogin({
        provider,
        token,
        user: {
          email: '',
          name: '',
          providerId: provider
        }
      });
      set({
        user: response.user,
        isLoading: false,
        hasCheckedAuth: true
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Social login failed',
        isLoading: false
      });
      throw error;
    }
  },

  getCurrentUser: async () => {
    const { isLoading, hasCheckedAuth } = useAuthStore.getState();

    // Don't fetch if already loading or already checked
    if (isLoading || hasCheckedAuth) return;

    set({ isLoading: true, error: null });
    try {
      const currentUser = await authService.getCurrentUser();
      set({
        user: currentUser,
        isLoading: false,
        hasCheckedAuth: true
      });
    } catch (error) {
      set({
        user: null,
        error: null, // Don't set error for auth failures
        isLoading: false,
        hasCheckedAuth: true
      });
    }
  },

  clearError: () => set({ error: null }),
}));