"use client";

import { useEffect, useState } from "react";
import { useSearchStore, SearchType } from "@/store/searchStore";
import { useSearch } from "@/hooks/useSearch";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
import { ActorCard } from "@/components/common/ActorCard";
import {
  Search as SearchIcon,
  Clock,
  X,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Film,
  Tv,
  User,
  Filter,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TMDBMovie, TMDBTV, TMDBSearchResult, TMDBTVShow } from "@/types/tmdb";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Image from "next/image";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    query,
    type,
    setQuery,
    setType,
    searchHistory,
    addToHistory,
    clearHistory,
  } = useSearchStore();
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError } = useSearch(currentPage);
  const { user } = useAuth();

  // Clear search results when leaving the page
  useEffect(() => {
    return () => {
      setQuery("");
      setCurrentPage(1);
    };
  }, [setQuery]);

  // Sort state
  const [sortBy, setSortBy] = useState<
    "popularity" | "rating" | "date" | "title"
  >("popularity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Initialize from URL params
  useEffect(() => {
    const urlQuery = searchParams.get("query");
    const urlType = searchParams.get("type") as SearchType;
    const urlPage = searchParams.get("page");

    if (urlQuery) setQuery(urlQuery);
    if (urlType && ["all", "movie", "tv", "actor"].includes(urlType))
      setType(urlType);
    if (urlPage) setCurrentPage(parseInt(urlPage));
  }, [searchParams, setQuery, setType]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (type !== "all") params.set("type", type);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.push(`/search${newUrl}`, { scroll: false });
  }, [query, type, currentPage, router]);

  useEffect(() => {
    // Reset page when search changes
    setCurrentPage(1);
  }, [query, type]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && user) {
      addToHistory(query.trim());
    }
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setQuery("");
    setCurrentPage(1);
  };

  const removeFromHistory = (itemToRemove: string) => {
    const newHistory = searchHistory.filter((item) => item !== itemToRemove);
    clearHistory();
    newHistory.forEach((item) => addToHistory(item));
  };

  // Sort and filter results
  const sortedResults =
    data?.results?.slice().sort((a: TMDBSearchResult, b: TMDBSearchResult) => {
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    }) || [];

  function getSortValue(item: TMDBSearchResult, sortBy: string) {
    switch (sortBy) {
      case "popularity":
        return item.popularity;
      case "rating":
        return item.vote_average || 0;
      case "date":
        return item.release_date || item.first_air_date || "";
      case "title":
        return item.title || item.name || "";
      default:
        return 0;
    }
  }

  const renderEmptyState = () => (
    <div className="flex items-center justify-center py-8 sm:py-10">
      <div className="text-center max-w-lg mx-auto px-4 sm:px-6">
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-cinehub-accent/20 rounded-full blur-2xl animate-pulse w-24 h-24 sm:w-32 sm:h-32 mx-auto"></div>
          <div className="relative bg-gradient-to-br from-cinehub-accent/20 via-cinehub-accent/10 to-transparent p-6 sm:p-8 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto flex items-center justify-center border border-cinehub-accent/20">
            <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-cinehub-accent animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 gradient-text">
          Discover Amazing Content
        </h2>
        <p className="text-text-sub text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto">
          Search through thousands of movies, TV shows, and actors to find your
          next favorite entertainment
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
          <div className="flex items-center gap-2 bg-bg-card/50 px-3 sm:px-4 py-2 rounded-full border border-cinehub-accent/20">
            <Film className="h-4 w-4 text-cinehub-accent" />
            <span className="text-white font-medium">Movies</span>
          </div>
          <div className="flex items-center gap-2 bg-bg-card/50 px-3 sm:px-4 py-2 rounded-full border border-cinehub-accent/20">
            <Tv className="h-4 w-4 text-cinehub-accent" />
            <span className="text-white font-medium">TV Shows</span>
          </div>
          <div className="flex items-center gap-2 bg-bg-card/50 px-3 sm:px-4 py-2 rounded-full border border-cinehub-accent/20">
            <User className="h-4 w-4 text-cinehub-accent" />
            <span className="text-white font-medium">Actors</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="min-h-[400px] sm:min-h-[500px] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8">
        <div className="relative">
          <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cinehub-accent/30 blur-lg animate-ping"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-cinehub-accent/20 border-t-cinehub-accent animate-spin shadow-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cinehub-accent/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-cinehub-accent/20">
              <Image
                src="/logo.png"
                alt="CineHub Logo"
                width={32}
                height={32}
                className="animate-pulse rounded-full"
              />
            </div>
          </div>
        </div>
        <div className="text-center px-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3">
            Searching the cinema universe...
          </h3>
          <p className="text-text-sub text-sm sm:text-base lg:text-lg animate-pulse">
            Finding the best content for you
          </p>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-12 sm:py-16">
      <div className="text-center max-w-md px-4 sm:px-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-danger/30">
          <X className="h-8 w-8 sm:h-10 sm:w-10 text-danger" />
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-4">
          Oops! Something went wrong
        </h3>
        <p className="text-text-sub mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          We couldn't complete your search. Please check your connection and try
          again.
        </p>
        <Button
          variant="outline"
          className="cursor-pointer hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent transition-all duration-300"
          onClick={() => window.location.reload()}
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );

  const renderNoResultsState = () => (
    <div className="flex items-center justify-center py-12 sm:py-16">
      <div className="text-center max-w-md px-4 sm:px-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-bg-card/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-border">
          <SearchIcon className="h-8 w-8 sm:h-10 sm:w-10 text-text-sub" />
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-4">
          No results found
        </h3>
        <p className="text-text-sub mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          We couldn't find any{" "}
          {type === "movie"
            ? "movies"
            : type === "tv"
            ? "TV shows"
            : type === "actor"
            ? "actors"
            : "content"}{" "}
          matching "{query}". Try adjusting your search or browse our
          categories.
        </p>
      </div>
    </div>
  );

  const renderSearchResults = () => (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
            Search results for "{query}"
          </h2>
          {data?.total_results && (
            <p className="text-text-sub text-sm">
              {data.total_results} results found
            </p>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-28 sm:w-32 h-9 bg-bg-card/70 border border-border text-white text-xs sm:text-sm cursor-pointer hover:bg-bg-card/90 hover:border-cinehub-accent/50 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-bg-card/90 border border-border">
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="h-9 w-9 cursor-pointer hover:bg-cinehub-accent/20 hover:text-cinehub-accent transition-all duration-200"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 w-full overflow-x-hidden">
        {sortedResults.map((item: TMDBSearchResult) => {
          if (
            type === "actor" ||
            (type === "all" && item.media_type === "person")
          ) {
            return (
              <ActorCard
                key={item.id}
                actor={{
                  id: item.id,
                  name: item.name || "",
                  profile_path: item.profile_path || null,
                  popularity: item.popularity,
                  known_for_department: item.known_for_department,
                }}
              />
            );
          }
          if (
            type === "movie" ||
            (type === "all" && item.media_type === "movie")
          ) {
            return <MovieCard key={item.id} movie={item as TMDBMovie} />;
          }
          if (type === "tv" || (type === "all" && item.media_type === "tv")) {
            const tvShow: TMDBTVShow = {
              id: item.id,
              name: item.name || "",
              poster_path: item.poster_path || null,
              backdrop_path: item.backdrop_path || null,
              overview: item.overview || "",
              first_air_date: item.first_air_date || "",
              vote_average: item.vote_average || 0,
              vote_count: item.vote_count || 0,
              genre_ids: item.genre_ids || [],
              next_episode_to_air: undefined,
            };
            return <TVShowCard key={item.id} show={tvShow} />;
          }
          return null;
        })}
      </div>

      {/* Pagination */}
      {data?.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9 cursor-pointer hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-text-sub text-sm">
              Page {currentPage} of {data.total_pages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(data.total_pages, p + 1))
            }
            disabled={currentPage === data.total_pages}
            className="h-9 cursor-pointer hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-x-hidden">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Search Header */}
          <div className="mb-8 max-w-6xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold mb-6 pb-1 bg-gradient-to-r from-white via-cinehub-accent to-white bg-clip-text text-transparent">
              Find your favourite movies, TV shows, people and more
            </h1>
            {/* Search Form */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
              <form
                onSubmit={handleSearch}
                className="flex-1 flex items-center relative w-full max-w-2xl"
              >
                <Input
                  type="text"
                  placeholder="Search movies, TV shows, actors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-full bg-bg-card/70 border border-border focus:border-cinehub-accent focus:ring-1 focus:ring-cinehub-accent text-white placeholder:text-text-sub shadow-md"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-sub" />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-sub hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </form>

              {/* Filter Dropdown */}
              <div className="w-full lg:w-[220px]">
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as SearchType)}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl bg-bg-card/70 border border-border text-white shadow-md justify-between cursor-pointer hover:bg-bg-card/90 hover:border-cinehub-accent/50 transition-all duration-200">
                    <span className="font-semibold">
                      {(() => {
                        switch (type) {
                          case "movie":
                            return "Movie";
                          case "tv":
                            return "TV Show";
                          case "actor":
                            return "People";
                          default:
                            return "All";
                        }
                      })()}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-bg-card/90 border border-border rounded-xl shadow-lg text-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="tv">TV Show</SelectItem>
                    <SelectItem value="actor">People</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search History */}
            {!query && searchHistory.length > 0 && user && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-text-sub">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Recent Searches</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-text-sub hover:text-white hover:bg-white/10 text-sm cursor-pointer transition-all duration-200 rounded-lg px-3 py-1"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="cursor-pointer hover:bg-cinehub-accent/20 transition-colors"
                      onClick={() => setQuery(item)}
                    >
                      {item}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(item);
                        }}
                        className="ml-2 hover:text-white hover:bg-white/20 transition-colors cursor-pointer p-1 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Show login prompt when not logged in and no search history */}
            {!query && !user && (
              <div className="mt-6 p-4 bg-bg-card/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cinehub-accent/20 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-cinehub-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text-sub">
                      <span className="text-white font-medium">Sign in</span> to save your search history and get personalized recommendations
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="min-h-[400px] w-full overflow-x-hidden">
            {!query && renderEmptyState()}
            {query && isLoading && renderLoadingState()}
            {query && isError && renderErrorState()}
            {query &&
              !isLoading &&
              !isError &&
              !data?.results?.length &&
              renderNoResultsState()}
            {query &&
              !isLoading &&
              !isError &&
              data?.results?.length > 0 &&
              renderSearchResults()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
