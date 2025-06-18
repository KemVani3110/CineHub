import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TMDBMovie, TMDBTV, TMDBTVShow } from '@/types/tmdb';
import { fetchMovieDetails, fetchTVShowDetails } from '@/services/tmdb';
import { useWatchlistWithUser } from '@/store/watchlistStore';
import useRatingStore from '@/store/ratingStore';

interface Recommendation {
  movie?: TMDBMovie;
  tvShow?: TMDBTVShow;
  reason: string;
}

interface WatchlistItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  addedAt: string;
}

export function useRecommendations() {
  const { data: session } = useSession();
  const { items: watchlistItems } = useWatchlistWithUser();
  const { userRating } = useRatingStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear recommendations when user changes
  useEffect(() => {
    setRecommendations([]);
    setError(null);
  }, [session?.user?.email]);

  // Load recommendations when watchlist changes
  useEffect(() => {
    if (session?.user && watchlistItems.length > 0) {
      fetchRecommendations();
    }
  }, [session?.user, watchlistItems]);

  const fetchRecommendations = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError(null);


      // Sort watchlist items by addedAt date (newest first)
      const sortedWatchlistItems = [...watchlistItems].sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );

      // Take the 10 most recent items
      const recentWatchlistItems = sortedWatchlistItems.slice(0, 10);

      // Get similar content for each recent watchlist item
      const similarContentPromises = recentWatchlistItems.map(async (item: WatchlistItem) => {
        try {
          if (item.mediaType === 'movie') {
            const movieDetails = await fetchMovieDetails(item.id);
            const similarMovies = movieDetails.similar?.slice(0, 10) || [];
            return similarMovies.map((movie: TMDBMovie) => ({
              movie,
              reason: `Similar to ${item.title} you recently added`
            }));
          } else {
            const tvDetails = await fetchTVShowDetails(item.id);
            const similarTVShows = tvDetails.similar?.slice(0, 10) || [];
            return similarTVShows.map((tvShow: TMDBTV) => ({
              tvShow: {
                ...tvShow,
                poster_path: tvShow.poster_path || null,
                backdrop_path: tvShow.backdrop_path || null
              } as TMDBTVShow,
              reason: `Similar to ${item.title} you recently added`
            }));
          }
        } catch (error) {
          console.error(`Error fetching similar content for ${item.title}:`, error);
          return [];
        }
      });

      const similarContentResults = await Promise.all(similarContentPromises);
      
      // Flatten and deduplicate recommendations
      const allRecommendations = similarContentResults.flat();
      // Separate movies and TV shows
      const movies = allRecommendations.filter(rec => rec.movie);
      const tvShows = allRecommendations.filter(rec => rec.tvShow);

      // Deduplicate movies and TV shows separately
      const uniqueMovies = movies.filter(
        (rec, index, self) => 
          index === self.findIndex(r => r.movie?.id === rec.movie?.id)
      );

      const uniqueTVShows = tvShows.filter(
        (rec, index, self) => 
          index === self.findIndex(r => r.tvShow?.id === rec.tvShow?.id)
      );

      // Take top 5 from each category
      const topMovies = uniqueMovies
        .sort((a, b) => (b.movie?.vote_average || 0) - (a.movie?.vote_average || 0))
        .slice(0, 5);

      const topTVShows = uniqueTVShows
        .sort((a, b) => (b.tvShow?.vote_average || 0) - (a.tvShow?.vote_average || 0))
        .slice(0, 5);

      // Combine and shuffle the recommendations
      const combinedRecommendations = [...topMovies, ...topTVShows]
        .sort(() => Math.random() - 0.5);
     
      setRecommendations(combinedRecommendations);
    } catch (error) {
      console.error('Error in fetchRecommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    refreshRecommendations: fetchRecommendations
  };
}