import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

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
  currentUserEmail: string | null;
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => Promise<void>;
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => Promise<void>;
  fetchWatchlist: () => Promise<void>;
  isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;
  resetWatchlist: () => void;
  setCurrentUser: (email: string | null) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      currentUserEmail: null,

      setCurrentUser: (email) => {
        const currentEmail = get().currentUserEmail;
        if (currentEmail !== email) {
          set({ 
            items: [], 
            currentUserEmail: email,
            isLoading: false,
            error: null 
          });
        }
      },

      addToWatchlist: async (item) => {
        try {
          set({ isLoading: true, error: null });
          
          // Map the item properties to match the API expectations
          const apiPayload = {
            movie_id: item.mediaType === 'movie' ? item.id : null,
            tv_id: item.mediaType === 'tv' ? item.id : null,
            media_type: item.mediaType,
            title: item.title,
            poster_path: item.posterPath,
          };

          const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to watchlist');
          }

          const newItem = { ...item, addedAt: new Date().toISOString() };
          set((state) => ({
            items: [...state.items, newItem],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
          throw error; // Re-throw for UI error handling
        }
      },

      removeFromWatchlist: async (id, mediaType) => {
        // Optimistically update the UI
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.mediaType === mediaType)
          ),
        }));

        try {
          const response = await fetch(`/api/watchlist/${mediaType}/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            // If the API call fails, revert the optimistic update
            set((state) => ({
              items: [...state.items, state.items.find(
                (item) => item.id === id && item.mediaType === mediaType
              )!],
              error: 'Failed to remove from watchlist',
            }));
            throw new Error('Failed to remove from watchlist');
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
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
          // Handle new API response format { watchlist: [...] }
          const rawWatchlistItems = data.watchlist || data || [];
          
          // Map the API response to the expected format
          const watchlistItems = rawWatchlistItems
            .filter((item: any) => item.id && item.media_type) // Filter out invalid items
            .map((item: any) => ({
              id: item.id,
              mediaType: item.media_type, // Convert snake_case to camelCase
              title: item.title,
              posterPath: item.poster_path, // Convert snake_case to camelCase
              addedAt: item.added_at || new Date().toISOString(),
            }));
          
          set({ items: watchlistItems, isLoading: false });
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
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Create a hook to handle user changes
export const useWatchlistWithUser = () => {
  const { data: session } = useSession();
  const { fetchWatchlist, setCurrentUser } = useWatchlistStore();

  // Reset and fetch watchlist when user changes
  useEffect(() => {
    const userEmail = session?.user?.email || null;
    setCurrentUser(userEmail);
    
    if (userEmail) {
      fetchWatchlist();
    }
  }, [session?.user?.email, fetchWatchlist, setCurrentUser]);

  return useWatchlistStore();
}; 