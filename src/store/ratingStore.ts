import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RatingState, Rating, Review } from '@/types/review';

const useRatingStore = create<RatingState>()(
  persist(
    (set) => ({
      userRating: null,
      userReview: null,
      isLoading: false,
      error: null,

      setUserRating: (rating) => set((state) => ({ 
        ...state,
        userRating: rating 
      })),
      
      setUserReview: (review) => set((state) => ({ 
        ...state,
        userReview: review 
      })),
      
      setLoading: (loading) => set((state) => ({ 
        ...state,
        isLoading: loading 
      })),
      
      setError: (error) => set((state) => ({ 
        ...state,
        error 
      })),

      // Update both rating and review at once
      updateRatingAndReview: (rating: Rating | null, review: Review | null) => 
        set((state) => ({ 
          ...state,
          userRating: rating,
          userReview: review 
        })),

      // Clear rating and review
      clearRatingAndReview: () => 
        set((state) => ({ 
          ...state,
          userRating: null,
          userReview: null 
        })),

      // Reset all state
      reset: () => 
        set((state) => ({ 
          ...state,
          userRating: null, 
          userReview: null, 
          error: null,
          isLoading: false 
        })),

      // Set loading and error states
      setLoadingAndError: (loading: boolean, error: string | null) =>
        set((state) => ({ 
          ...state,
          isLoading: loading,
          error 
        })),
    }),
    {
      name: 'rating-storage',
      partialize: (state) => ({
        userRating: state.userRating,
        userReview: state.userReview,
      }),
    }
  )
);

export default useRatingStore; 