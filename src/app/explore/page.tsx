"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useExploreStore } from "@/store/exploreStore";
import { useExplore } from "@/hooks/useExplore";
import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Film, SlidersHorizontal, Tv, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import Header from "@/components/common/Header";
import BackToTop from "@/components/common/BackToTop";
import { ExploreFilters } from "@/components/common/ExploreFilters";

export default function ExplorePage() {
  const { activeTab, filters, setActiveTab, resetFilters, clearFilters } =
    useExploreStore();
  const { data, genres, isLoading, loadMore, hasMore, isFetchingMore } =
    useExplore();
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "movie" | "tv");
    // Reset scroll position to top when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Reset loading state
    setLoadingMore(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.originalLanguage) count++;
    if (filters.year) count++;
    if (filters.runtime.min && filters.runtime.min > 0) count++;
    if (filters.releaseDate.from || filters.releaseDate.to) count++;
    if (filters.sortBy !== "popularity" || filters.sortOrder !== "desc")
      count++;
    return count;
  };

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || loadingMore) return;

    setLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setLoadingMore(false);
    }
  }, [loadMore, hasMore, isFetchingMore, loadingMore]);

  // Handle infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isFetchingMore &&
          !loadingMore
        ) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isFetchingMore, loadingMore, handleLoadMore]);

  // Reset loading state when filters change
  useEffect(() => {
    setLoadingMore(false);
    // Reset scroll position to top when filters change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card animate-pulse" />
              <div className="space-y-2">
                <div className="skeleton h-5 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
                <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-bg-card to-border" />
                <div className="skeleton h-3 w-2/3 rounded-lg bg-gradient-to-r from-bg-card to-border" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data.map(
            (item) =>
              item && (
                <div
                  key={`${activeTab}-${item.id}`}
                  className="transition-transform duration-200 hover:-translate-y-1"
                >
                  {activeTab === "movie" ? (
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
                  ) : (
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
                        next_episode_to_air: (item as TMDBTVShow)
                          .next_episode_to_air,
                      }}
                    />
                  )}
                </div>
              )
          )}
        </div>
        {/* Loading indicator */}
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          {(loadingMore || isFetchingMore) && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading more...
              </span>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />

      <div className="container mx-auto px-3 py-5 sm:px-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
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
              <ExploreFilters genres={genres || []} className="lg:max-h-[calc(100vh-11rem)]" />
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="mb-6 space-y-4 lg:mb-8">
                <div className="flex items-center gap-3 lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        className="min-h-11 flex-1 justify-center gap-2 rounded-xl border-slate-700/70 bg-slate-900/70 text-slate-100 hover:border-primary/50 hover:bg-primary/10"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-slate-950">
                            {getActiveFiltersCount()}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="bottom"
                      className="h-[88vh] rounded-t-3xl border-slate-700 bg-slate-950 p-0"
                    >
                      <SheetHeader className="border-b border-slate-800 px-4 py-4 text-left">
                        <SheetTitle className="flex items-center gap-2 text-white">
                          <SlidersHorizontal className="h-5 w-5 text-primary" />
                          Explore Filters
                        </SheetTitle>
                      </SheetHeader>
                      <div className="h-[calc(88vh-65px)] overflow-hidden">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
                          <p className="text-sm text-slate-400">
                            Refine movies and TV shows
                          </p>
                          <div className="flex items-center gap-2">
                            {getActiveFiltersCount() > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="h-10 gap-1 rounded-lg border-red-500/30 bg-red-500/5 text-red-300 hover:bg-red-500/10"
                              >
                                <X className="h-3.5 w-3.5" />
                                Clear
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resetFilters}
                              className="h-10 rounded-lg"
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                        <ExploreFilters
                          genres={genres || []}
                          className="h-full min-h-0 rounded-none border-0 bg-transparent shadow-none"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                  {getActiveFiltersCount() > 0 && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="min-h-11 rounded-xl px-3 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <TabsList className="mx-auto grid h-14 w-full max-w-md grid-cols-2 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1.5">
                  <TabsTrigger
                    value="movie"
                    className="min-h-11 gap-2 rounded-xl text-sm font-semibold"
                  >
                    <Film className="w-4 h-4" />
                    Movies
                  </TabsTrigger>
                  <TabsTrigger
                    value="tv"
                    className="min-h-11 gap-2 rounded-xl text-sm font-semibold"
                  >
                    <Tv className="w-4 h-4" />
                    TV Shows
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="movie" className="mt-0">
                {renderContent()}
              </TabsContent>

              <TabsContent value="tv" className="mt-0">
                {renderContent()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
