import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  addedAt: string;
}

interface WatchlistStore {
  items: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => Promise<void>;
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => Promise<void>;
  fetchWatchlist: () => Promise<void>;
  isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;
  resetWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addToWatchlist: async (item) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          });

          if (!response.ok) {
            throw new Error('Failed to add to watchlist');
          }

          const newItem = { ...item, addedAt: new Date().toISOString() };
          set((state) => ({
            items: [...state.items, newItem],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      removeFromWatchlist: async (id, mediaType) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/watchlist/${mediaType}/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to remove from watchlist');
          }

          set((state) => ({
            items: state.items.filter(
              (item) => !(item.id === id && item.mediaType === mediaType)
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      fetchWatchlist: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/watchlist');
          
          if (!response.ok) {
            throw new Error('Failed to fetch watchlist');
          }

          const data = await response.json();
          set({ items: data, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      isInWatchlist: (id, mediaType) => {
        return get().items.some(
          (item) => item.id === id && item.mediaType === mediaType
        );
      },

      resetWatchlist: () => {
        set({ items: [], isLoading: false, error: null });
      },
    }),
    {
      name: 'watchlist-storage',
    }
  )
); 