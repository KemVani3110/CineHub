import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export type MediaType = 'movie' | 'tv';
export type SortBy = 'popularity' | 'rating' | 'date' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface ExploreFilters {
  genres: number[];
  year: number | null;
  runtime: {
    min: number | null;
    max: number | null;
  };
  releaseDate: {
    from: string | null;
    to: string | null;
  };
  sortBy: SortBy;
  sortOrder: SortOrder;
  rating: number;
}

interface ExploreStore {
  activeTab: MediaType;
  filters: ExploreFilters;
  movieFilters: ExploreFilters;
  tvFilters: ExploreFilters;
  setActiveTab: (tab: MediaType) => void;
  setFilters: (filters: Partial<ExploreFilters>) => void;
  resetFilters: () => void;
  clearFilters: () => void;
}

const defaultFilters: ExploreFilters = {
  genres: [],
  year: null,
  runtime: {
    min: null,
    max: null,
  },
  releaseDate: {
    from: null,
    to: null,
  },
  sortBy: 'popularity',
  sortOrder: 'desc',
  rating: 0,
};

export const useExploreStore = create<ExploreStore>()(
  persist(
    (set, get) => ({
      activeTab: 'movie',
      filters: defaultFilters,
      movieFilters: defaultFilters,
      tvFilters: defaultFilters,
      setActiveTab: (tab) => {
        const currentTab = get().activeTab;
        const currentFilters = get().filters;
        
        // Save current filters before switching tabs
        if (currentTab === 'movie') {
          set({ movieFilters: currentFilters });
        } else {
          set({ tvFilters: currentFilters });
        }

        // Load filters for the new tab
        const newFilters = tab === 'movie' ? get().movieFilters : get().tvFilters;
        set({ 
          activeTab: tab,
          filters: newFilters
        });
      },
      setFilters: (newFilters) =>
        set((state) => {
          const updatedFilters = { ...state.filters, ...newFilters };
          // Update the specific tab's filters
          if (state.activeTab === 'movie') {
            return {
              filters: updatedFilters,
              movieFilters: updatedFilters
            };
          } else {
            return {
              filters: updatedFilters,
              tvFilters: updatedFilters
            };
          }
        }),
      resetFilters: () => {
        const defaultState = {
          ...defaultFilters,
          sortBy: get().filters.sortBy,
          sortOrder: get().filters.sortOrder
        };
        set((state) => ({
          filters: defaultState,
          [state.activeTab === 'movie' ? 'movieFilters' : 'tvFilters']: defaultState
        }));
      },
      clearFilters: () => {
        const defaultState = {
          ...defaultFilters,
          sortBy: get().filters.sortBy,
          sortOrder: get().filters.sortOrder
        };
        set((state) => ({
          filters: defaultState,
          [state.activeTab === 'movie' ? 'movieFilters' : 'tvFilters']: defaultState
        }));
      },
    }),
    {
      name: 'explore-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        movieFilters: state.movieFilters,
        tvFilters: state.tvFilters,
      }),
    }
  )
); 