import { useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useRatingStore from '@/store/ratingStore';
import { Rating } from '@/types/review';

interface RatingResponse {
  id: number;
  user_id: number;
  movie_id: number | null;
  tv_id: number | null;
  media_type: 'movie' | 'tv';
  rating: number;
  created_at: Date;
  updated_at: Date;
  review: string | null;
  review_id: number | null;
}

export function useRating(movieId?: number, tvId?: number, mediaType: 'movie' | 'tv' = 'movie') {
  const { data: session } = useSession();
  const { 
    setUserRating, 
    setUserReview, 
    setLoadingAndError,
    clearRatingAndReview,
    userRating,
    userReview
  } = useRatingStore();

  const fetchRating = useCallback(async () => {
    if (!session?.user) {
      clearRatingAndReview();
      return;
    }

    try {
      setLoadingAndError(true, null);
      const response = await fetch(
        `/api/ratings?${mediaType}Id=${mediaType === 'movie' ? movieId : tvId}&mediaType=${mediaType}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch rating');
      }

      const data: RatingResponse | null = await response.json();
      
      if (data) {
        const rating: Rating = {
          id: data.id.toString(),
          userId: data.user_id.toString(),
          movieId: data.movie_id || undefined,
          tvId: data.tv_id || undefined,
          mediaType: data.media_type,
          rating: data.rating,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setUserRating(rating);

        if (data.review) {
          const review = {
            id: data.review_id!.toString(),
            userId: data.user_id.toString(),
            movieId: data.movie_id || undefined,
            tvId: data.tv_id || undefined,
            mediaType: data.media_type,
            content: data.review,
            rating: data.rating,
            isEdited: false,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          };
          setUserReview(review);
        } else {
          setUserReview(null);
        }
      } else {
        clearRatingAndReview();
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
      setLoadingAndError(false, error instanceof Error ? error.message : 'Failed to fetch rating');
      clearRatingAndReview();
    } finally {
      setLoadingAndError(false, null);
    }
  }, [session?.user, movieId, tvId, mediaType, setUserRating, setUserReview, setLoadingAndError, clearRatingAndReview]);

  const submitRating = useCallback(async (rating: number, review?: string) => {
    if (!session?.user) {
      throw new Error('You must be logged in to submit a rating');
    }

    try {
      setLoadingAndError(true, null);
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
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit rating');
      }

      const data: RatingResponse = await response.json();
      
      const ratingData: Rating = {
        id: data.id.toString(),
        userId: data.user_id.toString(),
        movieId: data.movie_id || undefined,
        tvId: data.tv_id || undefined,
        mediaType: data.media_type,
        rating: data.rating,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setUserRating(ratingData);

      if (data.review) {
        setUserReview({
          id: data.review_id!.toString(),
          userId: data.user_id.toString(),
          movieId: data.movie_id || undefined,
          tvId: data.tv_id || undefined,
          mediaType: data.media_type,
          content: data.review,
          rating: data.rating,
          isEdited: false,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
      } else {
        setUserReview(null);
      }

      return ratingData;
    } catch (error) {
      console.error('Error submitting rating:', error);
      setLoadingAndError(false, error instanceof Error ? error.message : 'Failed to submit rating');
      throw error;
    } finally {
      setLoadingAndError(false, null);
    }
  }, [session?.user, movieId, tvId, mediaType, setUserRating, setUserReview, setLoadingAndError]);

  const deleteRating = useCallback(async () => {
    if (!session?.user) {
      throw new Error('You must be logged in to delete a rating');
    }

    try {
      setLoadingAndError(true, null);
      const response = await fetch(
        `/api/ratings?${mediaType}Id=${mediaType === 'movie' ? movieId : tvId}&mediaType=${mediaType}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete rating');
      }

      clearRatingAndReview();
    } catch (error) {
      console.error('Error deleting rating:', error);
      setLoadingAndError(false, error instanceof Error ? error.message : 'Failed to delete rating');
      throw error;
    } finally {
      setLoadingAndError(false, null);
    }
  }, [session?.user, movieId, tvId, mediaType, setLoadingAndError, clearRatingAndReview]);

  // Fetch rating when component mounts or when dependencies change
  useEffect(() => {
    if (session?.user) {
      fetchRating();
    } else {
      clearRatingAndReview();
    }
  }, [session?.user, fetchRating, clearRatingAndReview]);

  return {
    fetchRating,
    submitRating,
    deleteRating,
    isLoading: false,
    userRating,
    userReview
  };
} 