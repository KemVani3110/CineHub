import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SearchType = 'all' | 'movie' | 'tv';

interface SearchState {
  query: string;
  type: SearchType;
  searchHistory: string[];
  setQuery: (query: string) => void;
  setType: (type: SearchType) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

const MIN_SEARCH_LENGTH = 2;

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      type: 'all',
      searchHistory: [],
      setQuery: (query) => set({ query }),
      setType: (type) => set({ type }),
      addToHistory: (query) =>
        set((state) => {
          // Only add to history if query meets minimum length
          if (query.length < MIN_SEARCH_LENGTH) return state;
          
          // Remove duplicates and keep only last 10 searches
          const newHistory = [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 10);
          return { searchHistory: newHistory };
        }),
      clearHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'search-storage',
    }
  )
); 