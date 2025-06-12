"use client";

import { useEffect, useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trash2, X, Clock, Film, Tv, Search } from "lucide-react";
import Header from "@/components/common/Header";

const ITEMS_PER_PAGE = 24;

export default function HistoryPage() {
  const { history, removeFromWatchHistory, clearWatchHistory } = useHistory();
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading, router]);

  const handleRemoveFromHistory = async (id: number) => {
    try {
      await removeFromWatchHistory(id);
      toast({
        title: "Removed from history",
        description: "Item has been removed from your watch history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from history",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearWatchHistory();
      setCurrentPage(1);
      toast({
        title: "History cleared",
        description: "All items have been removed from your watch history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-main">
        <Header />
        <div className="container mx-auto px-4 py-12">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-12">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 bg-card-custom" />
              <Skeleton className="h-4 w-48 bg-card-custom" />
            </div>
            <Skeleton className="h-10 w-32 bg-card-custom" />
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-24 bg-card-custom rounded-lg" />
            ))}
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {[...Array(24)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg bg-card-custom" />
                <Skeleton className="h-4 w-3/4 bg-card-custom" />
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
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-card">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 gradient-accent rounded-xl">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="section-title">
                    Watch History
                  </h1>
                  <p className="text-sub text-lg">
                    {history.length} {history.length === 1 ? 'item' : 'items'} in your history
                  </p>
                </div>
              </div>
            </div>
            
            {history.length > 0 && (
              <Button
                variant="destructive"
                size="lg"
                onClick={handleClearHistory}
                className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Trash2 size={20} />
                Clear All History
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-accent/10 rounded-full blur-2xl scale-150" />
              <div className="relative p-8 bg-card-custom backdrop-blur-sm rounded-xl border border-custom">
                <div className="flex items-center justify-center space-x-4">
                  <Film className="w-12 h-12 text-accent" />
                  <Search className="w-16 h-16 text-sub" />
                  <Tv className="w-12 h-12 text-accent" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              No Watch History Yet
            </h2>
            <p className="text-sub text-lg text-center max-w-md mb-8">
              Start watching movies and TV shows to build your personalized history and track your viewing journey
            </p>
            
            <Button 
              onClick={() => router.push('/')}
              className="btn-primary px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              Explore Content
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Film className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sub text-sm font-medium">Movies Watched</p>
                    <p className="text-2xl font-bold text-white">
                      {history.filter(item => item.mediaType === 'movie').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <Tv className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sub text-sm font-medium">TV Shows Watched</p>
                    <p className="text-2xl font-bold text-white">
                      {history.filter(item => item.mediaType === 'tv').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sub text-sm font-medium">Total Items</p>
                    <p className="text-2xl font-bold text-white">{history.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <p className="text-sub">
                  Showing {startIndex + 1}-{Math.min(endIndex, history.length)} of {history.length} items
                </p>
                <p className="text-sub">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            )}

            {/* Content Grid - Giữ nguyên như ban đầu */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentItems.map((item) => (
                <div key={item.id} className="group relative">
                  {/* Giữ nguyên MovieCard và TVShowCard như ban đầu */}
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
                        original_name: item.title,
                        overview: "",
                        first_air_date: "",
                        backdrop_path: undefined,
                        genre_ids: [],
                        original_language: "",
                        popularity: 0,
                        vote_count: 0,
                        vote_average: item.vote_average || 0,
                        origin_country: [],
                      }}
                    />
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-lg hover:scale-110"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.id && handleRemoveFromHistory(item.id);
                    }}
                  >
                    <X size={16} />
                  </Button>
                  
                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 bg-main/90 backdrop-blur-sm px-2 py-1 rounded-md">
                      {item.mediaType === 'movie' ? (
                        <Film className="w-3 h-3 text-accent" />
                      ) : (
                        <Tv className="w-3 h-3 text-success" />
                      )}
                      <span className="text-xs text-white capitalize font-medium">
                        {item.mediaType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-card-custom hover:text-accent'}`}
                      />
                    </PaginationItem>
                    
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(1)}
                            className="cursor-pointer hover:bg-card-custom hover:text-accent"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}
                    
                    {/* Pages around current page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      if (page < 1 || page > totalPages) return null;
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className={`cursor-pointer ${
                              currentPage === page 
                                ? 'bg-accent text-white' 
                                : 'hover:bg-card-custom hover:text-accent'
                            }`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(totalPages)}
                            className="cursor-pointer hover:bg-card-custom hover:text-accent"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={`cursor-pointer ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-card-custom hover:text-accent'}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}