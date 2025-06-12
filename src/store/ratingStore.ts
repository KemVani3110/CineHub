import { create } from 'zustand';
import { RatingState, Rating, Review } from '@/types/review';

const useRatingStore = create<RatingState>((set) => ({
  userRating: null,
  userReview: null,
  isLoading: false,
  error: null,

  setUserRating: (rating) => set({ userRating: rating }),
  setUserReview: (review) => set({ userReview: review }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ userRating: null, userReview: null, error: null }),
}));

export default useRatingStore; 