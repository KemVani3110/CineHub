"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/services/tmdb";
import { TMDBMovieDetails } from "@/types/tmdb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Star, Clock, Calendar } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { TMDBGenre } from "@/types/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import { WatchButton } from "@/components/common/WatchButton";
import Image from "next/image";

import {
  MovieOverview,
  MovieCast,
  MovieReviews,
  SimilarMovies,
  MovieMedia,
} from "@/components/lazy";
import MovieRating from "@/components/movie/MovieRating";
import DetailSkeleton from "@/components/common/DetailSkeleton";

export default function MovieDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const data = await fetchMovieDetails(Number(id));
        setMovie(data);
      } catch (error) {
        console.error("Error loading movie:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const handleTabChange = (value: string): void => {
    setActiveTab(value);
  };

  if (loading) {
    return <DetailSkeleton type="movie" />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-500">
            Error loading movie
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: movie.title,
        text: `Check out ${movie.title} on CineHub!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatReleaseDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section with Backdrop */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url(${getImageUrl(
              movie.backdrop_path || null,
              "original"
            )})`,
          }}
        >
          {/* Multi-layer gradient overlays for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/70" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-7xl py-20">
            {/* Movie Poster */}
            <div className="lg:col-span-4 xl:col-span-3 flex justify-center lg:justify-start order-1 lg:order-1">
              <div className="relative group w-full max-w-sm mx-auto lg:mx-0 lg:sticky lg:top-8 lg:self-start transition-all duration-300">
                {/* Gradient border effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                {/* Poster container with explicit aspect ratio and sticky behavior */}
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800 transform transition-transform duration-300 hover:scale-[1.02]">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                      unoptimized={false}
                    />
                  ) : (
                    // Fallback for missing poster
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎬</div>
                        <div className="text-sm">No Poster</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Movie Information */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8 text-center lg:text-left order-2 lg:order-2 lg:min-h-[calc(100vh-4rem)]">
              {/* Title and Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white tracking-tight">
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 italic font-light">
                      "{movie.tagline}"
                    </p>
                  )}
                </div>

                {/* Movie Meta Info */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 md:gap-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#4fd1c5]" />
                    <span className="text-base sm:text-lg font-medium">
                      {formatReleaseDate(movie.release_date)}
                    </span>
                  </div>
                  {movie.runtime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#4fd1c5]" />
                      <span className="text-base sm:text-lg font-medium">
                        {formatRuntime(movie.runtime)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#4fd1c5] fill-current" />
                    <span className="text-base sm:text-lg font-medium">
                      {movie.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Genre Tags  styling */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                {movie.genres.slice(0, 4).map((genre: TMDBGenre) => (
                  <Badge
                    key={genre.id}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-slate-800/80 border border-[#4fd1c5]/30 text-[#4fd1c5] hover:bg-[#4fd1c5]/10 hover:border-[#4fd1c5]/60 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                  >
                    {genre.name.toUpperCase()}
                  </Badge>
                ))}
                {movie.genres.length > 4 && (
                  <Badge className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-slate-800/80 border border-slate-600 text-slate-300">
                    +{movie.genres.length - 4} more
                  </Badge>
                )}
              </div>

              {/* Rating Section */}
              <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
                <MovieRating
                  movieId={movie.id}
                  tmdbRating={movie.vote_average}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 md:gap-7">
                <WatchButton
                  mediaType="movie"
                  movieId={movie.id}
                  tvId={null}
                  title={movie.title}
                  posterPath={movie.poster_path || ""}
                  className="flex items-center justify-center w-full sm:w-[210px] h-14 rounded-full font-bold text-base px-6 transition-all duration-300 bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] hover:from-[#38b2ac] hover:to-[#319795] text-slate-900 shadow-none border-none cursor-pointer"
                  isUpcoming={new Date(movie.release_date) > new Date()}
                  isDetailView={true}
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center w-full sm:w-[210px] h-14 rounded-full font-semibold text-base px-6 border-2 border-slate-600 text-white hover:bg-slate-800 hover:border-[#4fd1c5] hover:text-[#4fd1c5] transition-all duration-300 shadow-none bg-slate-900/40 cursor-pointer"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  <span>Share</span>
                </Button>
                <WatchlistButton
                  id={movie.id}
                  mediaType="movie"
                  title={movie.title}
                  posterPath={movie.poster_path || ""}
                  className="flex items-center justify-center w-full sm:w-[210px] h-14 rounded-full font-semibold text-base px-6 border-2 border-slate-600 text-white hover:bg-slate-800 hover:border-[#4fd1c5] hover:text-[#4fd1c5] transition-all duration-300 shadow-none bg-slate-900/40 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section  */}
      <div className="relative z-10 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-16">
          {/* Tabs Section  */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="mb-8">
              <ScrollArea className="w-full">
                <TabsList className="w-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2 flex flex-nowrap shadow-2xl">
                  {[
                    { value: "overview", label: "Overview" },
                    { value: "cast", label: "Cast & Crew" },
                    { value: "reviews", label: "Reviews" },
                    { value: "media", label: "Photos & Videos" },
                    { value: "similar", label: "Similar Movies" },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4fd1c5] data-[state=active]:to-[#38b2ac] data-[state=active]:text-slate-900 text-slate-300 hover:text-white cursor-pointer transition-all duration-300 whitespace-nowrap px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl flex-shrink-0 data-[state=active]:shadow-lg"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" className="mt-4" />
              </ScrollArea>
            </div>

            {/* Tab Content */}
            <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-4 sm:p-6 md:p-8">
              <TabsContent value="overview" className="mt-0">
                <MovieOverview movie={movie} />
              </TabsContent>

              <TabsContent value="cast" className="mt-0">
                <MovieCast
                  credits={movie.credits || null}
                  isLoading={loading}
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <MovieReviews
                  reviews={
                    movie.reviews || {
                      page: 1,
                      results: [],
                      total_pages: 0,
                      total_results: 0,
                    }
                  }
                  movieId={movie.id}
                />
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <MovieMedia
                  videos={movie.videos || { results: [] }}
                  movieTitle={movie.title}
                />
              </TabsContent>

              <TabsContent value="similar" className="mt-0">
                <SimilarMovies movies={movie.similar || []} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
