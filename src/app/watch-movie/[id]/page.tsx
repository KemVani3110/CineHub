"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/services/tmdb";
import { TMDBMovieDetails } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Globe,
  Play,
  RefreshCw,
} from "lucide-react";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { MovieActions } from "@/components/watch/MovieActions";
import { SimilarMovies } from "@/components/watch/SimilarMovies";
import { cn } from "@/lib/utils";

interface StreamingSource {
  name: string;
  url: string;
  quality: string;
  type: "iframe" | "video";
  embed: boolean;
}

interface StreamingResponse {
  success: boolean;
  sources: StreamingSource[];
  mediaInfo: any;
  streamingInfo: any;
}

export default function WatchMoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [streamingSources, setStreamingSources] = useState<StreamingSource[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const data = await fetchMovieDetails(Number(id));
        setMovie(data);

        // Load streaming sources
        await loadStreamingSources();
      } catch (error) {
        console.error("Error loading movie:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const loadStreamingSources = async () => {
    try {
      setLoadingStreams(true);
      setStreamError(null);

      const response = await fetch(`/api/stream/movie/${id}`);
      const data: StreamingResponse = await response.json();

      if (data.success && data.sources.length > 0) {
        setStreamingSources(data.sources);
      } else {
        setStreamError("No streaming sources available");
      }
    } catch (error) {
      console.error("Error loading streaming sources:", error);
      setStreamError("Failed to load streaming sources");
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleShare = async () => {
    if (!movie) return;
    try {
      await navigator.share({
        title: movie.title,
        text: `Watch ${movie.title} on CineHub!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const retryStreaming = () => {
    loadStreamingSources();
  };

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main px-4">
        <Card className="w-full max-w-md bg-card-custom border-custom">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-danger" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-danger mb-2">
              Movie Not Found
            </h1>
            <p className="text-sub mb-6">
              The movie you're looking for could not be loaded.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="btn-primary w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen text-foreground transition-all duration-500",
        isTheaterMode ? "bg-black" : "bg-main"
      )}
    >
      {/* Header with Back Button and Movie Title */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b transition-all duration-500",
          isTheaterMode
            ? "bg-black/95 border-slate-800/50"
            : "bg-main/95 border-custom"
        )}
      >
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-accent hover:bg-accent/20 shrink-0 cursor-pointer rounded-full transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-10 sm:h-10"
              onClick={() => router.push(`/movie/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-4">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                  {movie.title}
                </h1>

                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  </div>

                  {movie.runtime && (
                    <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">
                        {movie.runtime} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile info - Below title */}
              <div className="flex sm:hidden items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                  <Calendar className="h-2.5 w-2.5 text-accent" />
                  <span className="text-xs font-medium text-foreground">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                    <Clock className="h-2.5 w-2.5 text-accent" />
                    <span className="text-xs font-medium text-foreground">
                      {movie.runtime}m
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        {/* Video Player Section - Horizontal Layout */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
              {streamError ? (
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/80 to-black/90 flex items-center justify-center">
                  <div className="text-center text-white p-8 max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <Play className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-red-100">
                      Streaming Unavailable
                    </h3>
                    <p className="text-sm text-red-200/80 mb-6 leading-relaxed">
                      {streamError}
                    </p>
                    <Button
                      onClick={retryStreaming}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/50 hover:border-red-400 transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Loading
                    </Button>
                  </div>
                </div>
              ) : streamingSources.length > 0 ? (
                <VideoPlayer
                  sources={streamingSources}
                  posterUrl={
                    movie.backdrop_path
                      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                      : undefined
                  }
                  title={movie.title}
                  duration={movie.runtime}
                  onTheaterModeChange={setIsTheaterMode}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black/60 to-black/90 flex items-center justify-center">
                  <div className="text-center text-white">
                    {loadingStreams ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-blue-100">
                            Loading streaming sources...
                          </p>
                          <p className="text-sm text-blue-200/70">
                            Please wait while we prepare your content
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gray-500/20 flex items-center justify-center border border-gray-500/30">
                          <Play className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-100">
                            No streaming sources available
                          </p>
                          <p className="text-sm text-gray-300/70">
                            Please try again later or contact support
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section - Dimmed in Theater Mode */}
        <div
          className={cn(
            "max-w-6xl mx-auto px-4 mt-8 transition-all duration-500",
            isTheaterMode ? "opacity-20 pointer-events-none" : "opacity-100"
          )}
        >
          {/* Movie Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Movie Info Card  */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row gap-8">
                    {/* Poster  */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <div className="relative w-40 h-60 sm:w-48 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 shadow-2xl border border-slate-600/50 group">
                        {movie.poster_path ? (
                          <div className="relative">
                            <img
                              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
                            <Play className="h-16 w-16 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Movie Details  */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                          {movie.title}
                        </h2>
                        {movie.tagline && (
                          <p className="text-[#4FD1C5] italic text-lg font-medium mb-4">
                            "{movie.tagline}"
                          </p>
                        )}
                      </div>

                      {/* Rating and Info  */}
                      <div className="flex flex-wrap items-center gap-4">
                        {movie.vote_average > 0 && (
                          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-3 rounded-full border border-yellow-400/30">
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <span className="text-lg font-bold text-yellow-100">
                              {movie.vote_average.toFixed(1)}
                            </span>
                            <span className="text-sm text-yellow-200/70">
                              /10
                            </span>
                          </div>
                        )}

                        {movie.spoken_languages &&
                          movie.spoken_languages.length > 0 && (
                            <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-3 rounded-full border border-blue-400/30">
                              <Globe className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-blue-100 font-medium">
                                {movie.spoken_languages[0].english_name}
                              </span>
                            </div>
                          )}

                        {movie.runtime && (
                          <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-3 rounded-full border border-purple-400/30">
                            <Clock className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-purple-100 font-medium">
                              {movie.runtime} min
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Genres  */}
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {movie.genres.slice(0, 4).map((genre) => (
                            <Badge
                              key={genre.id}
                              variant="secondary"
                              className="bg-gradient-to-r from-[#4FD1C5]/20 to-[#38B2AC]/20 text-[#4FD1C5] border-[#4FD1C5]/40 hover:bg-[#4FD1C5]/30 hover:border-[#4FD1C5]/60 transition-all duration-300 hover:scale-105 px-4 py-2 text-sm font-semibold"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Overview  */}
                      {movie.overview && (
                        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-2xl p-6 border border-slate-600/50">
                          <h3 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                            Overview
                          </h3>
                          <p className="text-slate-200 text-base leading-relaxed">
                            {movie.overview}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card  */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="font-bold text-white mb-6 text-xl flex items-center gap-3">
                    <div className="w-1 h-7 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                    Movie Actions
                  </h3>
                  <MovieActions
                    title={movie.title}
                    onShare={handleShare}
                    id={movie.id}
                    posterPath={movie.poster_path || ""}
                    voteAverage={movie.vote_average}
                    voteCount={movie.vote_count}
                    popularity={movie.popularity}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar  */}
            <div className="space-y-8">
              {/* Movie Stats  */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                    Movie Details
                  </h3>
                  <div className="space-y-4">
                    {movie.release_date && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-[#4FD1C5]/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#4FD1C5]" />
                          Release Date
                        </span>
                        <span className="text-white text-sm font-bold">
                          {new Date(movie.release_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {movie.runtime && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-purple-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-400" />
                          Duration
                        </span>
                        <span className="text-white text-sm font-bold">
                          {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}
                          m
                        </span>
                      </div>
                    )}

                    {movie.budget > 0 && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-green-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <div className="h-4 w-4 text-green-400">💰</div>
                          Budget
                        </span>
                        <span className="text-white text-sm font-bold">
                          ${(movie.budget / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}

                    {movie.revenue > 0 && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-yellow-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <div className="h-4 w-4 text-yellow-400">💵</div>
                          Revenue
                        </span>
                        <span className="text-white text-sm font-bold">
                          ${(movie.revenue / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}

                    {movie.vote_count > 0 && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-blue-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-blue-400" />
                          Votes
                        </span>
                        <span className="text-white text-sm font-bold">
                          {movie.vote_count.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Production Companies  */}
              {movie.production_companies &&
                movie.production_companies.length > 0 && (
                  <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                        Production
                      </h3>
                      <div className="space-y-3">
                        {movie.production_companies
                          .slice(0, 3)
                          .map((company) => (
                            <div
                              key={company.id}
                              className="p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 text-sm text-slate-200 font-medium hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 hover:border-[#4FD1C5]/30 transition-all duration-200 cursor-pointer"
                            >
                              {company.name}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>

          {/* Similar Movies Section  */}
          {movie.similar && movie.similar.length > 0 && (
            <div className="mt-12">
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1 h-10 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                    <h3 className="text-3xl font-bold text-white">
                      You might also like
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-600 via-slate-500 to-transparent"></div>
                  </div>
                  <SimilarMovies movies={movie.similar} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-main">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-main/95 backdrop-blur-md border-b border-custom">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
            <div className="flex-1 space-y-1 sm:space-y-2">
              <div className="skeleton h-4 sm:h-6 w-32 sm:w-48 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
              <div className="flex gap-1 sm:gap-2">
                <div className="skeleton h-3 sm:h-4 w-14 sm:w-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                <div className="skeleton h-3 sm:h-4 w-12 sm:w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Video Player Skeleton */}
          <div className="mb-6 sm:mb-8">
            <div className="skeleton w-full aspect-[16/9] sm:aspect-[21/9] rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="skeleton w-24 h-36 sm:w-32 sm:h-48 rounded-lg mx-auto sm:mx-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
                    <div className="flex-1 space-y-4">
                      <div className="skeleton h-8 w-3/4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="skeleton h-6 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        <div className="skeleton h-6 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        <div className="skeleton h-6 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      </div>
                      <div className="skeleton h-20 w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    <div className="skeleton h-10 w-24 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    <div className="skeleton h-10 w-24 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    <div className="skeleton h-10 w-24 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <div className="skeleton h-32 w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <div className="skeleton h-6 w-24 mb-4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="skeleton h-4 w-20 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        <div className="skeleton h-4 w-16 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
