"use client"

import { useEffect, useState } from "react";
import { useWatchlistStore } from "@/store/watchlistStore";
import { Film, Tv, Trash2, Grid, LayoutGrid, ArrowUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
import { Button } from "@/components/ui/button";
import { fetchMovieDetails, fetchTVShowDetails } from "@/services/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from 'embla-carousel-react';
import BackToTop from "@/components/common/BackToTop";

interface MediaDetails {
  id: number;
  mediaType: 'movie' | 'tv';
  vote_average: number;
}

export function WatchlistPage() {
  const { items, fetchWatchlist, removeFromWatchlist, isLoading } = useWatchlistStore();
  const { toast } = useToast();
  const [mediaDetails, setMediaDetails] = useState<MediaDetails[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [movieEmblaRef] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });
  const [tvEmblaRef] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });

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

  const getRating = (id: number, mediaType: 'movie' | 'tv') => {
    const details = mediaDetails.find(d => d.id === id && d.mediaType === mediaType);
    return details?.vote_average || 0;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode(viewMode === 'grid' ? 'carousel' : 'grid')}
          title={viewMode === 'grid' ? 'Switch to Carousel View' : 'Switch to Grid View'}
          className="hover:bg-[#4fd1c5] hover:text-white hover:border-[#4fd1c5] cursor-pointer transition-colors"
        >
          {viewMode === 'grid' ? <LayoutGrid className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Movies Section */}
      {movies.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            Movies ({movies.length})
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {movies.map((item) => (
                <div key={`${item.mediaType}-${item.id}-${item.addedAt}`} className="transform scale-90 hover:scale-95 transition-transform duration-200">
                  <div className="group relative">
                    <MovieCard
                      movie={{
                        id: item.id,
                        title: item.title,
                        poster_path: item.posterPath,
                        vote_average: getRating(item.id, 'movie'),
                        release_date: item.addedAt
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-lg hover:bg-destructive/90 hover:scale-110"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(item.id, 'movie', item.title);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden" ref={movieEmblaRef}>
                <div className="flex gap-4">
                  {movies.map((item) => (
                    <div key={`${item.mediaType}-${item.id}-${item.addedAt}`} className="flex-[0_0_160px] sm:flex-[0_0_180px] md:flex-[0_0_200px]">
                      <div className="group relative transform scale-90 hover:scale-95 transition-transform duration-200">
                        <MovieCard
                          movie={{
                            id: item.id,
                            title: item.title,
                            poster_path: item.posterPath,
                            vote_average: getRating(item.id, 'movie'),
                            release_date: item.addedAt
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-lg hover:bg-destructive/90 hover:scale-110"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(item.id, 'movie', item.title);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TV Shows Section */}
      {tvShows.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Tv className="h-6 w-6 text-primary" />
            TV Shows ({tvShows.length})
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {tvShows.map((item) => (
                <div key={`${item.mediaType}-${item.id}-${item.addedAt}`} className="transform scale-90 hover:scale-95 transition-transform duration-200">
                  <div className="group relative">
                    <TVShowCard
                      show={{
                        id: item.id,
                        name: item.title,
                        poster_path: item.posterPath,
                        backdrop_path: null,
                        overview: "",
                        first_air_date: item.addedAt,
                        vote_average: getRating(item.id, 'tv'),
                        vote_count: 0,
                        genre_ids: []
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-lg hover:bg-destructive/90 hover:scale-110"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(item.id, 'tv', item.title);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden" ref={tvEmblaRef}>
                <div className="flex gap-4">
                  {tvShows.map((item) => (
                    <div key={`${item.mediaType}-${item.id}-${item.addedAt}`} className="flex-[0_0_160px] sm:flex-[0_0_180px] md:flex-[0_0_200px]">
                      <div className="group relative transform scale-90 hover:scale-95 transition-transform duration-200">
                        <TVShowCard
                          show={{
                            id: item.id,
                            name: item.title,
                            poster_path: item.posterPath,
                            backdrop_path: null,
                            overview: "",
                            first_air_date: item.addedAt,
                            vote_average: getRating(item.id, 'tv'),
                            vote_count: 0,
                            genre_ids: []
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-lg hover:bg-destructive/90 hover:scale-110"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(item.id, 'tv', item.title);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <BackToTop />
    </div>
  );
} 