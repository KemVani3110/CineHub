import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetails } from '@/services/tmdb';

export const useMovieDetails = (movieId: number) => {
  return useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovieDetails(movieId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}; 