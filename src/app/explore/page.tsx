"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useExploreStore } from '@/store/exploreStore';
import { useExplore } from '@/hooks/useExplore';
import { MovieCard } from '@/components/common/MovieCard';
import { TVShowCard } from '@/components/common/TVShowCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Film, Tv, X } from 'lucide-react';
import { TMDBMovie, TMDBTVShow} from '@/types/tmdb';
import Header from '@/components/common/Header';
import BackToTop from '@/components/common/BackToTop';
import { ExploreFilters } from '@/components/common/ExploreFilters';

export default function ExplorePage() {
  const { activeTab, filters, setActiveTab, setFilters, resetFilters, clearFilters } = useExploreStore();
  const { data, genres, isLoading, loadMore, hasMore, isFetchingMore, refetch } = useExplore();
  const [movieLoadingMore, setMovieLoadingMore] = useState(false);
  const [tvLoadingMore, setTVLoadingMore] = useState(false);
  const movieObserverTarget = useRef<HTMLDivElement>(null);
  const tvObserverTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'movie' | 'tv');
    // Reset scroll position to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset loading states
    setMovieLoadingMore(false);
    setTVLoadingMore(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.year) count++;
    if (filters.runtime.min) count++;
    if (filters.releaseDate.from || filters.releaseDate.to) count++;
    return count;
  };

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore) return;

    if (activeTab === 'movie' && !movieLoadingMore) {
      setMovieLoadingMore(true);
      try {
        await loadMore();
      } finally {
        setMovieLoadingMore(false);
      }
    } else if (activeTab === 'tv' && !tvLoadingMore) {
      setTVLoadingMore(true);
      try {
        await loadMore();
      } finally {
        setTVLoadingMore(false);
      }
    }
  }, [activeTab, loadMore, movieLoadingMore, tvLoadingMore, hasMore, isFetchingMore]);

  // Handle infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentObserverTarget = activeTab === 'movie' ? movieObserverTarget.current : tvObserverTarget.current;
    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      observer.disconnect();
    };
  }, [activeTab, hasMore, isFetchingMore, handleLoadMore]);

  // Reset loading state when filters change
  useEffect(() => {
    setMovieLoadingMore(false);
    setTVLoadingMore(false);
    // Reset scroll position to top when filters change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Filters</h1>
                <div className="flex items-center gap-2">
                  {getActiveFiltersCount() > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear ({getActiveFiltersCount()})
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <ExploreFilters genres={genres || []} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full max-w-md mx-auto mb-8">
                <TabsTrigger 
                  value="movie" 
                  className="flex-1 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Movies
                </TabsTrigger>
                <TabsTrigger 
                  value="tv" 
                  className="flex-1 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Tv className="w-4 h-4 mr-2" />
                  TV Shows
                </TabsTrigger>
              </TabsList>

              <TabsContent value="movie" className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {data.map((item) => item && (
                        <div key={item.id} className="transform scale-95 hover:scale-100 transition-transform duration-200">
                          <MovieCard
                            movie={{
                              id: item.id,
                              title: (item as TMDBMovie).title,
                              name: (item as TMDBTVShow).name,
                              poster_path: item.poster_path || undefined,
                              vote_average: item.vote_average,
                              release_date: (item as TMDBMovie).release_date,
                              first_air_date: (item as TMDBTVShow).first_air_date,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Loading indicator */}
                    <div ref={movieObserverTarget} className="h-20 flex items-center justify-center">
                      {(movieLoadingMore || isFetchingMore) && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-muted-foreground">Loading more...</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="tv" className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {data.map((item) => item && (
                        <div key={item.id} className="transform scale-95 hover:scale-100 transition-transform duration-200">
                          <TVShowCard
                            show={{
                              id: item.id,
                              name: (item as TMDBTVShow).name,
                              poster_path: item.poster_path || null,
                              backdrop_path: item.backdrop_path || null,
                              overview: item.overview,
                              first_air_date: (item as TMDBTVShow).first_air_date,
                              vote_average: item.vote_average,
                              vote_count: item.vote_count,
                              genre_ids: item.genre_ids,
                              next_episode_to_air: (item as TMDBTVShow).next_episode_to_air
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Loading indicator */}
                    <div ref={tvObserverTarget} className="h-20 flex items-center justify-center">
                      {(tvLoadingMore || isFetchingMore) && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-muted-foreground">Loading more...</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  );
} 