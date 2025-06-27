"use client";

import { useEffect, useState, useMemo } from "react";
import { useHistory } from "@/hooks/useHistory";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/ui/pagination";
import {
  Trash2,
  Clock,
  Film,
  Tv,
  Search,
  Grid,
  LayoutGrid,
  Calendar,
  Play,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/common/Header";
import useEmblaCarousel from "embla-carousel-react";

const ITEMS_PER_PAGE = 20;

export default function HistoryPage() {
  const { history, removeFromWatchHistory, clearWatchHistory } = useHistory();
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");

  // Pagination logic
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  const emblaOptions = useMemo(() => ({
    align: "start" as const,
    loop: false,
    skipSnaps: false,
    dragFree: true,
    containScroll: 'trimSnaps' as const,
    duration: 25,
  }), [currentItems.length]);

  const [emblaRef] = useEmblaCarousel(emblaOptions);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading, router]);

  const handleRemove = async (id: number) => {
    try {
      await removeFromWatchHistory(id);
      toast({
        title: "Success",
        description: "Removed from watch history",
      });
    } catch (error) {
      console.error("Error removing from history:", error);
      toast({
        title: "Error",
        description: "Failed to remove from history",
        variant: "destructive",
      });
    }
  };

  const handleClear = async () => {
    try {
      await clearWatchHistory();
      toast({
        title: "Success",
        description: "Watch history cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-main">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-3">
              <Skeleton className="h-8 w-48 bg-card-custom" />
              <Skeleton className="h-4 w-32 bg-card-custom" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 bg-card-custom rounded-lg" />
              <Skeleton className="h-10 w-32 bg-card-custom rounded-lg" />
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-20 bg-card-custom rounded-xl" />
            ))}
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(18)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg bg-card-custom" />
                <Skeleton className="h-3 w-full bg-card-custom rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main">
      <Header />
      
      {/* Hero Section - Compact */}
      <div className="border-b border-custom/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl border border-accent/20">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  Watch History
                </h1>
                <p className="text-sub text-sm">
                  {history.length} {history.length === 1 ? "item" : "items"} watched
                </p>
              </div>
            </div>
            
            {history.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "carousel" : "grid")}
                  className="h-9 px-3 border-accent/40 bg-accent/5 text-accent hover:bg-accent hover:text-white hover:border-accent hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                >
                  {viewMode === "grid" ? (
                    <LayoutGrid className="h-4 w-4" />
                  ) : (
                    <Grid className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClear}
                  className="h-9 px-4 bg-red-500/5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl scale-150" />
              <div className="relative p-6 bg-card-custom/30 backdrop-blur-sm rounded-2xl border border-custom/30">
                <div className="flex items-center justify-center space-x-6">
                  <Film className="w-8 h-8 text-accent/60" />
                  <Search className="w-10 h-10 text-sub/60" />
                  <Tv className="w-8 h-8 text-accent/60" />
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-3 text-center">
              No Watch History Yet
            </h2>
            <p className="text-sub text-center max-w-md mb-8 leading-relaxed">
              Start exploring movies and TV shows to build your personalized viewing history
            </p>
            
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/25"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Watching
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Compact Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card-custom/40 backdrop-blur-sm border border-custom/30 rounded-xl p-4 hover:border-accent/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Film className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-sub font-medium">Movies</p>
                    <p className="text-lg font-bold text-white">
                      {history.filter((item) => item.mediaType === "movie").length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card-custom/40 backdrop-blur-sm border border-custom/30 rounded-xl p-4 hover:border-success/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Tv className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-sub font-medium">TV Shows</p>
                    <p className="text-lg font-bold text-white">
                      {history.filter((item) => item.mediaType === "tv").length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card-custom/40 backdrop-blur-sm border border-custom/30 rounded-xl p-4 hover:border-warning/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-sub font-medium">Total</p>
                    <p className="text-lg font-bold text-white">{history.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card-custom/40 backdrop-blur-sm border border-custom/30 rounded-xl p-4 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-sub font-medium">This Page</p>
                    <p className="text-lg font-bold text-white">{currentItems.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Info - Compact */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-sub">
                  {startIndex + 1}-{Math.min(endIndex, history.length)} of {history.length}
                </span>
                <span className="text-sub">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}

            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {currentItems.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="space-y-3">
                      <div className="relative overflow-hidden rounded-lg hover:scale-[1.02] transition-transform duration-200">
                        {item.mediaType === "movie" ? (
                          <MovieCard
                            movie={{
                              id: item.movieId!,
                              title: item.title,
                              poster_path: item.posterPath,
                              vote_average: item.vote_average || 0,
                            }}
                          />
                        ) : (
                          <TVShowCard
                            show={{
                              id: item.tvId!,
                              name: item.title,
                              poster_path: item.posterPath,
                              backdrop_path: null,
                              overview: "",
                              first_air_date: "",
                              vote_average: item.vote_average || 0,
                              vote_count: 0,
                              genre_ids: [],
                            }}
                          />
                        )}
                        
                        {/* Remove Button - Better positioned */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/80 backdrop-blur-sm hover:bg-red-500 hover:scale-110 border-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (item.id) {
                              handleRemove(item.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      
                      {/* Compact Date Display */}
                      <div className="px-2.5 py-1.5 bg-card-custom/60 backdrop-blur-sm border border-custom/20 rounded-lg hover:border-accent/30 transition-colors duration-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-accent flex-shrink-0" />
                          <span className="text-xs text-sub truncate">
                            {new Date(item.watchedAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-6 pb-4 ml-2 mr-2">
                    {currentItems.map((item) => (
                      <div key={item.id} className="flex-[0_0_180px] sm:flex-[0_0_200px] min-w-0">
                        <div className="group relative">
                          <div className="space-y-3">
                            <div className="relative overflow-hidden rounded-lg hover:scale-[1.02] transition-transform duration-200">
                              {item.mediaType === "movie" ? (
                                <MovieCard
                                  movie={{
                                    id: item.movieId!,
                                    title: item.title,
                                    poster_path: item.posterPath,
                                    vote_average: item.vote_average || 0,
                                  }}
                                />
                              ) : (
                                <TVShowCard
                                  show={{
                                    id: item.tvId!,
                                    name: item.title,
                                    poster_path: item.posterPath,
                                    backdrop_path: null,
                                    overview: "",
                                    first_air_date: "",
                                    vote_average: item.vote_average || 0,
                                    vote_count: 0,
                                    genre_ids: [],
                                  }}
                                />
                              )}
                              
                              {/* Remove Button */}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/80 backdrop-blur-sm hover:bg-red-500 hover:scale-110 border-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (item.id) {
                                    handleRemove(item.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            
                            {/* Compact Date Display */}
                            <div className="px-2.5 py-1.5 bg-card-custom/60 backdrop-blur-sm border border-custom/20 rounded-lg hover:border-accent/30 transition-colors duration-200">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-accent flex-shrink-0" />
                                <span className="text-xs text-sub truncate">
                                  {new Date(item.watchedAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
