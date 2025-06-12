"use client"

import { useEffect, useState } from "react";
import { useWatchlistStore } from "@/store/watchlistStore";
import { Film, Tv } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
import { Pagination } from "@/components/ui/pagination";
import { fetchMovieDetails, fetchTVShowDetails } from "@/services/tmdb";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 5;

interface MediaDetails {
  id: number;
  mediaType: 'movie' | 'tv';
  vote_average: number;
}

export function WatchlistPage() {
  const { items, fetchWatchlist, removeFromWatchlist, isLoading } = useWatchlistStore();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [mediaDetails, setMediaDetails] = useState<MediaDetails[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch watchlist and details
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingDetails(true);
        await fetchWatchlist();
        
        // Fetch details for each item
        const details = await Promise.all(
          items.map(async (item) => {
            try {
              if (item.mediaType === 'movie') {
                const movieDetails = await fetchMovieDetails(item.id);
                return {
                  id: item.id,
                  mediaType: 'movie' as const,
                  vote_average: movieDetails.vote_average
                };
              } else {
                const tvDetails = await fetchTVShowDetails(item.id);
                return {
                  id: item.id,
                  mediaType: 'tv' as const,
                  vote_average: tvDetails.vote_average
                };
              }
            } catch (error) {
              console.error(`Error fetching details for ${item.mediaType} ${item.id}:`, error);
              return {
                id: item.id,
                mediaType: item.mediaType,
                vote_average: 0
              };
            }
          })
        );
        setMediaDetails(details);
      } catch (error) {
        console.error('Error loading watchlist:', error);
        toast({
          title: "Error",
          description: "Failed to load watchlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadData();
  }, [fetchWatchlist, items.length]);

  const handleRemove = async (id: number, mediaType: 'movie' | 'tv', title: string) => {
    try {
      await removeFromWatchlist(id, mediaType);
      toast({
        title: "Removed from Watchlist",
        description: `${title} has been removed from your watchlist.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || isLoadingDetails) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
        <div className="space-y-8">
          {/* Movies Section Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film className="h-6 w-6 text-primary" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, index) => (
                <div key={index} className="group relative">
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="relative aspect-[2/3] w-full">
                      <div className="absolute inset-0 bg-[#1B263B]">
                        <Skeleton className="w-full h-full" />
                      </div>
                    </div>
                    <div className="mt-3 px-2">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TV Shows Section Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Tv className="h-6 w-6 text-primary" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, index) => (
                <div key={index} className="group relative">
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="relative aspect-[2/3] w-full">
                      <div className="absolute inset-0 bg-[#1B263B]">
                        <Skeleton className="w-full h-full" />
                      </div>
                    </div>
                    <div className="mt-3 px-2">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold">Your Watchlist is Empty</h2>
        <p className="text-muted-foreground">Add movies and TV shows to your watchlist to see them here.</p>
      </div>
    );
  }

  // Separate movies and TV shows
  const movies = items.filter(item => item.mediaType === 'movie');
  const tvShows = items.filter(item => item.mediaType === 'tv');

  // Calculate pagination for movies
  const totalMoviePages = Math.ceil(movies.length / ITEMS_PER_PAGE);
  const startMovieIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endMovieIndex = startMovieIndex + ITEMS_PER_PAGE;
  const currentMovies = movies.slice(startMovieIndex, endMovieIndex);

  // Calculate pagination for TV shows
  const totalTVPages = Math.ceil(tvShows.length / ITEMS_PER_PAGE);
  const startTVIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endTVIndex = startTVIndex + ITEMS_PER_PAGE;
  const currentTVShows = tvShows.slice(startTVIndex, endTVIndex);

  const getRating = (id: number, mediaType: 'movie' | 'tv') => {
    const details = mediaDetails.find(d => d.id === id && d.mediaType === mediaType);
    return details?.vote_average || 0;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      
      {/* Movies Section */}
      {currentMovies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            Movies ({movies.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {currentMovies.map((item) => (
              <div key={`${item.mediaType}-${item.id}-${item.addedAt}`} className="transform scale-90 hover:scale-95 transition-transform duration-200">
                <MovieCard
                  movie={{
                    id: item.id,
                    title: item.title,
                    poster_path: item.posterPath,
                    vote_average: getRating(item.id, 'movie'),
                    release_date: item.addedAt
                  }}
                />
              </div>
            ))}
          </div>
          {totalMoviePages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalMoviePages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* TV Shows Section */}
      {currentTVShows.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Tv className="h-6 w-6 text-primary" />
            TV Shows ({tvShows.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {currentTVShows.map((item) => (
              <div key={`${item.mediaType}-${item.id}-${item.addedAt}`} className="transform scale-90 hover:scale-95 transition-transform duration-200">
                <TVShowCard
                  show={{
                    id: item.id,
                    name: item.title,
                    original_name: item.title,
                    overview: "",
                    first_air_date: item.addedAt,
                    poster_path: item.posterPath,
                    backdrop_path: undefined,
                    genre_ids: [],
                    original_language: "en",
                    popularity: 0,
                    vote_count: 0,
                    vote_average: getRating(item.id, 'tv'),
                    origin_country: []
                  }}
                />
              </div>
            ))}
          </div>
          {totalTVPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalTVPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 