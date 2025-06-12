import { useState, useCallback } from 'react';
import useRatingStore from '@/store/ratingStore';
import { Rating, Review } from '@/types/review';
import { useAuth } from './useAuth';

export const useRating = (movieId?: number, tvId?: number, mediaType: 'movie' | 'tv' = 'movie') => {
  const { user } = useAuth();
  const { setUserRating, setUserReview, setLoading, setError: setStoreError, reset } = useRatingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fetchRating = useCallback(async () => {
    if (!user || (!movieId && !tvId)) return;

    setIsLoading(true);
    setLocalError(null);

    try {
      const params = new URLSearchParams();
      if (movieId) params.append('movieId', movieId.toString());
      if (tvId) params.append('tvId', tvId.toString());
      params.append('mediaType', mediaType);

      const response = await fetch(`/api/ratings?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rating');
      }

      const data = await response.json();
      if (data) {
        setUserRating({
          id: data.id,
          userId: data.user_id,
          movieId: data.movie_id,
          tvId: data.tv_id,
          mediaType: data.media_type,
          rating: data.rating,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });

        if (data.review) {
          setUserReview({
            id: data.review_id,
            userId: data.user_id,
            movieId: data.movie_id,
            tvId: data.tv_id,
            mediaType: data.media_type,
            content: data.review,
            rating: data.rating,
            isEdited: data.is_edited,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          });
        }
      } else {
        reset();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setStoreError(errorMessage);
      setLocalError(errorMessage);
      reset();
    } finally {
      setIsLoading(false);
    }
  }, [user, movieId, tvId, mediaType, setUserRating, setUserReview, reset, setStoreError]);

  const submitRating = useCallback(async (rating: number, review?: string) => {
    if (!user || (!movieId && !tvId)) return;

    setIsLoading(true);
    setLocalError(null);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          tvId,
          mediaType,
          rating,
          review,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      await fetchRating();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setStoreError(errorMessage);
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, movieId, tvId, mediaType, fetchRating, setStoreError]);

  const deleteRating = useCallback(async () => {
    if (!user || (!movieId && !tvId)) return;

    setIsLoading(true);
    setLocalError(null);

    try {
      const params = new URLSearchParams();
      if (movieId) params.append('movieId', movieId.toString());
      if (tvId) params.append('tvId', tvId.toString());
      params.append('mediaType', mediaType);

      const response = await fetch(`/api/ratings?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete rating');
      }

      reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setStoreError(errorMessage);
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, movieId, tvId, mediaType, reset, setStoreError]);

  return {
    isLoading,
    error: localError,
    fetchRating,
    submitRating,
    deleteRating,
  };
}; 