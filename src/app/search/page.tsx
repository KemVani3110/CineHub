"use client";

import { useEffect, useState } from "react";
import { useSearchStore, SearchType } from "@/store/searchStore";
import { useSearch } from "@/hooks/useSearch";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Star,
  Users,
  Flame,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TMDBMovie, TMDBSearchResult, TMDBTVShow } from "@/types/tmdb";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

// Trending searches data
const trendingSearches = [
  "Avatar",
  "Stranger Things",
  "Avengers",
  "Game of Thrones",
  "Spider-Man",
  "The Batman",
  "House of Dragon",
  "Breaking Bad",
  "The Office",
  "Friends",
];

const popularCategories = [
  { name: "Action Movies", icon: Zap, type: "movie", query: "action" },
  { name: "Sci-Fi Series", icon: Sparkles, type: "tv", query: "sci-fi" },
  { name: "Marvel Heroes", icon: Star, type: "all", query: "marvel" },
  { name: "Comedy Shows", icon: Users, type: "tv", query: "comedy" },
];

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

  const handleTrendingSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    if (user) {
      addToHistory(searchTerm);
    }
  };

  const handleCategoryClick = (category: any) => {
    setQuery(category.query);
    setType(category.type);
    if (user) {
      addToHistory(category.query);
    }
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
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/5 via-transparent to-cinehub-accent/5 rounded-3xl"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-cinehub-accent/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-cinehub-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative py-16 px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-cinehub-accent/20 via-cinehub-accent/10 to-cinehub-accent/20 rounded-full blur-2xl w-32 h-32 mx-auto animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-cinehub-accent/20 via-cinehub-accent/10 to-transparent p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center border border-cinehub-accent/30 backdrop-blur-sm">
              <Sparkles className="h-16 w-16 text-cinehub-accent animate-pulse" />
            </div>
          </div>

          {/* Hero Text */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cinehub-accent to-white bg-clip-text text-transparent">
            Discover Amazing Content
          </h2>
          <p className="text-text-sub text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Search through millions of movies, TV shows, and celebrities to find
            your next favorite entertainment
          </p>

          {/* Quick Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {popularCategories.map((category, index) => (
              <Card
                key={category.name}
                className="group bg-gradient-to-br from-bg-card/60 to-bg-card/30 border border-border/50 hover:border-cinehub-accent/50 transition-all duration-300 cursor-pointer hover:scale-105 backdrop-blur-sm"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-cinehub-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-cinehub-accent/30 transition-colors">
                    <category.icon className="h-6 w-6 text-cinehub-accent" />
                  </div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-cinehub-accent transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trending Searches */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-white">
                Trending Searches
              </h3>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {trendingSearches.map((term, index) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="cursor-pointer hover:bg-cinehub-accent/20 hover:text-cinehub-accent transition-all duration-200 px-4 py-2 text-sm font-medium bg-bg-card/50 border border-border/50 hover:border-cinehub-accent/50"
                  onClick={() => handleTrendingSearch(term)}
                >
                  <TrendingUp className="h-3 w-3 mr-2" />
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-cinehub-accent/30 via-cinehub-accent/20 to-cinehub-accent/30 blur-lg animate-ping"></div>
          <div className="relative w-24 h-24 rounded-full border-4 border-transparent bg-gradient-to-r from-cinehub-accent via-cinehub-accent-hover to-cinehub-accent animate-spin">
            <div className="absolute inset-1 rounded-full bg-bg-primary"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-14 h-14 bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cinehub-accent/30">
              <SearchIcon className="h-6 w-6 text-cinehub-accent animate-pulse" />
            </div>
          </div>
        </div>
        <div className="text-center px-4">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-white to-cinehub-accent bg-clip-text text-transparent mb-3">
            Searching the cinema universe...
          </h3>
          <p className="text-text-sub text-lg animate-pulse">
            Finding the perfect content for you
          </p>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <X className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">
          Oops! Something went wrong
        </h3>
        <p className="text-text-sub mb-8 leading-relaxed">
          We couldn't complete your search. Please check your connection and try
          again.
        </p>
        <Button
          variant="outline"
          className="cursor-pointer hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent transition-all duration-300 px-6 py-3"
          onClick={() => window.location.reload()}
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );

  const renderNoResultsState = () => (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-500/30">
          <SearchIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">
          No results found
        </h3>
        <p className="text-text-sub mb-8 leading-relaxed">
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
        <Button
          variant="outline"
          className="cursor-pointer hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent transition-all duration-300"
          onClick={clearSearch}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Explore Categories
        </Button>
      </div>
    </div>
  );

  const renderSearchResults = () => (
    <div className="space-y-8">
      {/* Search Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-bg-card/40 via-bg-card/20 to-transparent p-6 rounded-2xl border border-border/30 backdrop-blur-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-2 flex items-center gap-3">
            <SearchIcon className="h-5 w-5 text-cinehub-accent" />
            Search results for "{query}"
          </h2>
          {data?.total_results && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-cinehub-accent/20 text-cinehub-accent border-cinehub-accent/30"
              >
                {data.total_results.toLocaleString()} results
              </Badge>
              <span className="text-text-sub text-sm">
                • Page {currentPage} of {data.total_pages}
              </span>
            </div>
          )}
        </div>

        {/* Enhanced Sort Controls */}
        <div className="flex items-center gap-3">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-36 h-10 bg-bg-card/80 border border-border/50 text-white cursor-pointer hover:bg-bg-card hover:border-cinehub-accent/50 transition-all duration-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-cinehub-accent" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-bg-card/95 border border-border/50 rounded-lg backdrop-blur-sm">
              <SelectItem value="popularity">
                <div className="flex items-center gap-2">Popularity</div>
              </SelectItem>
              <SelectItem value="rating">
                <div className="flex items-center gap-2">Rating</div>
              </SelectItem>
              <SelectItem value="date">
                <div className="flex items-center gap-2">Date</div>
              </SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="h-10 w-10 cursor-pointer hover:bg-cinehub-accent/20 hover:text-cinehub-accent transition-all duration-200 rounded-lg border border-border/30"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4 text-cinehub-accent" />
            ) : (
              <SortDesc className="h-4 w-4 text-cinehub-accent" />
            )}
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
        {sortedResults.map((item: TMDBSearchResult, index: number) => {
          const cardClass =
            "transform hover:scale-105 transition-all duration-300 hover:z-10 relative";

          if (
            type === "actor" ||
            (type === "all" && item.media_type === "person")
          ) {
            return (
              <div key={item.id} className={cardClass}>
                <ActorCard
                  actor={{
                    id: item.id,
                    name: item.name || "",
                    profile_path: item.profile_path || null,
                    popularity: item.popularity,
                    known_for_department: item.known_for_department,
                  }}
                />
              </div>
            );
          }
          if (
            type === "movie" ||
            (type === "all" && item.media_type === "movie")
          ) {
            return (
              <div key={item.id} className={cardClass}>
                <MovieCard movie={item as TMDBMovie} />
              </div>
            );
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
            return (
              <div key={item.id} className={cardClass}>
                <TVShowCard show={tvShow} />
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Enhanced Pagination */}
      {data?.total_pages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-12 p-6 bg-gradient-to-r from-bg-card/20 via-bg-card/10 to-bg-card/20 rounded-2xl border border-border/20 backdrop-blur-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-10 px-6 cursor-pointer hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <div className="bg-cinehub-accent/20 px-4 py-2 rounded-lg border border-cinehub-accent/30">
              <span className="text-cinehub-accent font-semibold">
                {currentPage}
              </span>
              <span className="text-text-sub mx-1">of</span>
              <span className="text-white font-medium">{data.total_pages}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(data.total_pages, p + 1))
            }
            disabled={currentPage === data.total_pages}
            className="h-10 px-6 cursor-pointer hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg"
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
          {/* Enhanced Search Header */}
          <div className="mb-12 max-w-6xl mx-auto">
            {/* Hero Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-cinehub-accent to-white bg-clip-text text-transparent">
                Find Your Next
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cinehub-accent via-white to-cinehub-accent bg-clip-text text-transparent">
                Favorite Story
              </h1>
              <p className="text-text-sub text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Discover millions of movies, TV shows, and celebrities all in
                one place
              </p>
            </div>

            {/* Enhanced Search Form */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full mb-8">
              <form
                onSubmit={handleSearch}
                className="flex-1 flex items-center relative w-full max-w-3xl"
              >
                <div className="relative w-full group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cinehub-accent/20 via-cinehub-accent/10 to-cinehub-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Input
                    type="text"
                    placeholder="Search movies, TV shows, actors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="relative w-full h-14 pl-14 pr-14 rounded-2xl bg-bg-card/80 border border-border/50 focus:border-cinehub-accent focus:ring-2 focus:ring-cinehub-accent/20 text-white placeholder:text-text-sub shadow-lg backdrop-blur-sm transition-all duration-200 text-lg"
                  />
                  <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cinehub-accent" />
                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-text-sub hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Enhanced Filter Dropdown */}
              <div className="lg:w-[240px] w-full max-w-xs">
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as SearchType)}
                >
                  <SelectTrigger className="w-full h-14 rounded-2xl bg-bg-card/80 border border-border/50 text-white shadow-lg justify-between cursor-pointer hover:bg-bg-card hover:border-cinehub-accent/50 transition-all duration-200 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      {type === "movie" && (
                        <Film className="h-5 w-5 text-cinehub-accent" />
                      )}
                      {type === "tv" && (
                        <Tv className="h-5 w-5 text-cinehub-accent" />
                      )}
                      {type === "actor" && (
                        <User className="h-5 w-5 text-cinehub-accent" />
                      )}
                      {type === "all" && (
                        <Sparkles className="h-5 w-5 text-cinehub-accent" />
                      )}
                      <span className="font-semibold text-lg">
                        {(() => {
                          switch (type) {
                            case "movie":
                              return "Movies";
                            case "tv":
                              return "TV Shows";
                            case "actor":
                              return "People";
                            default:
                              return "All Content";
                          }
                        })()}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-bg-card/95 border border-border/50 rounded-2xl shadow-xl backdrop-blur-sm">
                    <SelectItem value="all">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4" />
                        All Content
                      </div>
                    </SelectItem>
                    <SelectItem value="movie">
                      <div className="flex items-center gap-3">
                        <Film className="h-4 w-4" />
                        Movies
                      </div>
                    </SelectItem>
                    <SelectItem value="tv">
                      <div className="flex items-center gap-3">
                        <Tv className="h-4 w-4" />
                        TV Shows
                      </div>
                    </SelectItem>
                    <SelectItem value="actor">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        People
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enhanced Search History */}
            {!query && searchHistory.length > 0 && user && (
              <div className="bg-gradient-to-r from-bg-card/40 via-bg-card/20 to-bg-card/40 p-6 rounded-2xl border border-border/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cinehub-accent/20 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-cinehub-accent" />
                    </div>
                    <span className="font-semibold text-white">
                      Recent Searches
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-text-sub hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200 rounded-lg px-4 py-2"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {searchHistory.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="cursor-pointer hover:bg-cinehub-accent/20 hover:text-cinehub-accent transition-all duration-200 px-4 py-2 bg-bg-card/50 border border-border/50 hover:border-cinehub-accent/50 rounded-lg group"
                      onClick={() => setQuery(item)}
                    >
                      <SearchIcon className="h-3 w-3 mr-2 opacity-60 group-hover:opacity-100" />
                      {item}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(item);
                        }}
                        className="ml-3 hover:text-white hover:bg-white/20 transition-colors cursor-pointer p-1 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Login Prompt */}
            {!query && !user && (
              <div className="bg-gradient-to-r from-cinehub-accent/10 via-cinehub-accent/5 to-cinehub-accent/10 p-6 rounded-2xl border border-cinehub-accent/20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cinehub-accent/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-cinehub-accent" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      Join CineHub for Better Experience
                    </h3>
                    <p className="text-text-sub">
                      Sign in to save your search history and get personalized
                      recommendations
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="min-h-[600px] w-full overflow-x-hidden">
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
