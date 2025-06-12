import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
  id?: number;
  mediaType: 'movie' | 'tv';
  movieId?: number;
  tvId?: number;
  title: string;
  posterPath: string;
  watchedAt: string;
  progress?: number; // For tracking watch progress
  vote_average?: number; // Add vote_average property
}

interface HistoryState {
  items: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'watchedAt'>) => void;
  removeFromHistory: (id: number) => void;
  clearHistory: () => void;
  getRecentHistory: (limit?: number) => HistoryItem[];
  setHistory: (items: HistoryItem[]) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToHistory: (item) => {
        // Add new entry
        const newItem: HistoryItem = {
          ...item,
          id: Date.now(),
          watchedAt: new Date().toISOString(),
        };
        set((state) => ({
          items: [newItem, ...state.items],
        }));
      },

      removeFromHistory: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ items: [] });
      },

      getRecentHistory: (limit = 10) => {
        return get().items.slice(0, limit);
      },

      setHistory: (items) => {
        set({ items });
      },
    }),
    {
      name: 'history-storage',
    }
  )
); 