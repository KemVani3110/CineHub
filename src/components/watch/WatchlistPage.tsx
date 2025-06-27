"use client"

import { useEffect, useState } from "react";
import { useWatchlistStore } from "@/store/watchlistStore";
import { Film, Tv, Trash2, Grid, LayoutGrid, ArrowUp, Sparkles, Heart } from "lucide-react";
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
    loop: false,
    skipSnaps: false,
    dragFree: true,
  });
  const [tvEmblaRef] = useEmblaCarousel({
    align: 'start',
    loop: false,
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
        const safeItemsForEffect = Array.isArray(items) ? items : [];
        const details = await Promise.all(
          safeItemsForEffect.map(async (item) => {
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
              <div className="h-12 w-64 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl animate-pulse" />
            </div>
            <div className="h-6 w-96 mx-auto bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg animate-pulse" />
          </div>

          <div className="space-y-16">
            {/* Movies Section Skeleton */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
                <div className="h-8 w-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {Array(12).fill(0).map((_, index) => (
                  <div key={index} className="group space-y-4 animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative">
                      <div className="aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-muted/10 animate-pulse" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-5 w-3/4 bg-gradient-to-r from-muted/20 to-muted/40 rounded-lg animate-pulse" />
                      <div className="h-4 w-1/2 bg-gradient-to-r from-muted/15 to-muted/30 rounded-lg animate-pulse" />
                      <div className="h-3 w-2/3 bg-gradient-to-r from-muted/10 to-muted/20 rounded-lg animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TV Shows Section Skeleton */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 animate-pulse" />
                <div className="h-8 w-40 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {Array(12).fill(0).map((_, index) => (
                  <div key={index} className="group space-y-4 animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative">
                      <div className="aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-muted/10 animate-pulse" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-5 w-3/4 bg-gradient-to-r from-muted/20 to-muted/40 rounded-lg animate-pulse" />
                      <div className="h-4 w-1/2 bg-gradient-to-r from-muted/15 to-muted/30 rounded-lg animate-pulse" />
                      <div className="h-3 w-2/3 bg-gradient-to-r from-muted/10 to-muted/20 rounded-lg animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure items is an array
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-8 px-4">
          {/* Empty State Icon */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/10 via-accent/10 to-muted/20 flex items-center justify-center">
              <Heart className="w-16 h-16 text-muted-foreground/50" />
            </div>
          </div>
          
          {/* Empty State Content */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Your Watchlist Awaits
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Discover amazing movies and TV shows, then add them to your personal collection for later viewing.
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => window.location.href = '/explore'}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Exploring
          </Button>
        </div>
      </div>
    );
  }

  // Separate movies and TV shows
  const movies = safeItems.filter(item => item.mediaType === 'movie');
  const tvShows = safeItems.filter(item => item.mediaType === 'tv');

  const getRating = (id: number, mediaType: 'movie' | 'tv') => {
    const details = mediaDetails.find(d => d.id === id && d.mediaType === mediaType);
    return details?.vote_average || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/*  Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              My Watchlist
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Your curated collection of {safeItems.length} amazing {safeItems.length === 1 ? 'title' : 'titles'} waiting to be discovered
          </p>
          
          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-1.5 shadow-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-6 py-2.5 transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid View
              </Button>
              <Button
                variant={viewMode === 'carousel' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('carousel')}
                className={`rounded-lg px-6 py-2.5 transition-all duration-300 ${
                  viewMode === 'carousel' 
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Carousel View
              </Button>
            </div>
          </div>
        </div>
        
        {/* Movies Section */}
        {movies.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Movies
              </h2>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{movies.length}</span>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {movies.map((item, index) => (
                  <div 
                    key={`${item.mediaType}-${item.id}-${item.addedAt}`} 
                    className="group transform transition-all duration-500 hover:scale-105 hover:z-10"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      <MovieCard
                        movie={{
                          id: item.id,
                          title: item.title,
                          poster_path: item.posterPath,
                          vote_average: getRating(item.id, 'movie'),
                          release_date: item.addedAt
                        }}
                      />
                      {/* Remove Button */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 w-9 h-9 rounded-full bg-red-500/90 hover:bg-red-500 backdrop-blur-sm shadow-lg transform hover:scale-110"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.id, 'movie', item.title);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-hidden rounded-xl" ref={movieEmblaRef}>
                  <div className="flex gap-6">
                    {movies.map((item, index) => (
                      <div 
                        key={`${item.mediaType}-${item.id}-${item.addedAt}`} 
                        className="flex-[0_0_180px] sm:flex-[0_0_200px] md:flex-[0_0_220px]"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 w-9 h-9 rounded-full bg-red-500/90 hover:bg-red-500 backdrop-blur-sm shadow-lg transform hover:scale-110"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemove(item.id, 'movie', item.title);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
                TV Shows
              </h2>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/10 to-teal-600/10 border border-green-500/20">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{tvShows.length}</span>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {tvShows.map((item, index) => (
                  <div 
                    key={`${item.mediaType}-${item.id}-${item.addedAt}`} 
                    className="group transform transition-all duration-500 hover:scale-105 hover:z-10"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
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
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 w-9 h-9 rounded-full bg-red-500/90 hover:bg-red-500 backdrop-blur-sm shadow-lg transform hover:scale-110"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.id, 'tv', item.title);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-hidden rounded-xl" ref={tvEmblaRef}>
                  <div className="flex gap-6">
                    {tvShows.map((item, index) => (
                      <div 
                        key={`${item.mediaType}-${item.id}-${item.addedAt}`} 
                        className="flex-[0_0_180px] sm:flex-[0_0_200px] md:flex-[0_0_220px]"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 w-9 h-9 rounded-full bg-red-500/90 hover:bg-red-500 backdrop-blur-sm shadow-lg transform hover:scale-110"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemove(item.id, 'tv', item.title);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
    </div>
  );
} 