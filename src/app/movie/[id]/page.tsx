"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/services/tmdb";
import { TMDBMovieDetails } from "@/types/tmdb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { TMDBGenre } from "@/types/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import { WatchButton } from "@/components/common/WatchButton";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import components with loading states
const MovieOverview = dynamic(
  () => import("@/components/movie/MovieOverview"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

const MovieCast = dynamic(() => import("@/components/movie/MovieCast"), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const MovieReviews = dynamic(() => import("@/components/movie/MovieReviews"), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const SimilarMovies = dynamic(
  () => import("@/components/movie/SimilarMovies"),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

const MovieMedia = dynamic(() => import("@/components/movie/MovieMedia"), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

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

  if (loading) {
    return <MovieDetailSkeleton />;
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section with Backdrop */}
      <div className="relative min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh] lg:min-h-[75vh] xl:min-h-[80vh] overflow-hidden pt-8 sm:pt-10 md:pt-12">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getImageUrl(
              movie.backdrop_path || null,
              "original"
            )})`,
          }}
        >
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/70 sm:via-slate-950/75 md:via-slate-950/70 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 h-full flex items-end sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 w-full max-w-7xl pb-4 sm:pb-6 md:pb-8">
            {/* Movie Poster */}
            <div className="flex-shrink-0 mx-auto sm:mx-0 mt-2 sm:mt-0">
              <div className="relative w-32 sm:w-44 md:w-52 lg:w-64 xl:w-80 h-48 sm:h-66 md:h-78 lg:h-96 xl:h-[480px] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-[#2e3c51] hover:border-[#4fd1c5] transition-all duration-300">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8 text-center sm:text-left">
              {/* Title */}
              <div className="space-y-1 sm:space-y-2 md:space-y-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-bold leading-tight text-[#e0e6ed] px-2 sm:px-0">
                  {movie.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-[#9aafc3] italic px-2 sm:px-0">
                  {movie.tagline || "No tagline available"}
                </p>
              </div>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start px-2 sm:px-0">
                {movie.genres.slice(0, 3).map((genre: TMDBGenre) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm font-medium bg-[#1b263b] border-[#4fd1c5]/30 text-[#4fd1c5] hover:bg-[#4fd1c5]/10 cursor-pointer transition-all duration-300"
                  >
                    {genre.name.toUpperCase()}
                  </Badge>
                ))}
                {movie.genres.length > 3 && (
                  <Badge
                    variant="outline"
                    className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm font-medium bg-[#1b263b] border-[#4fd1c5]/30 text-[#4fd1c5]"
                  >
                    +{movie.genres.length - 3}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 px-2 sm:px-0">
                <WatchButton
                  mediaType="movie"
                  movieId={movie.id}
                  tvId={null}
                  title={movie.title}
                  posterPath={movie.poster_path || ""}
                  className="bg-[#4fd1c5] hover:bg-[#38b2ac] text-[#0d1b2a] px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                  isUpcoming={new Date(movie.release_date) > new Date()}
                  isDetailView={true}
                />
                <div className="flex gap-2 sm:gap-3 md:gap-4">
                  <Button
                    variant="outline"
                    size="default"
                    className="border-[#2e3c51] text-[#e0e6ed] hover:bg-[#1b263b] hover:border-[#4fd1c5] hover:text-[#4fd1c5] px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 flex-1 sm:flex-none text-sm sm:text-base"
                    onClick={handleShare}
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  <WatchlistButton
                    id={movie.id}
                    mediaType="movie"
                    title={movie.title}
                    posterPath={movie.poster_path || ""}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 pb-12 sm:pb-16 md:pb-20 lg:pb-24 pt-4">
          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-6 sm:mb-8">
              <ScrollArea className="w-full">
                <TabsList
                  className="w-full bg-[#1b263b] border border-[#2e3c51] rounded-lg p-1 
                                   flex flex-nowrap"
                >
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-2 sm:px-3 md:px-4 text-xs sm:text-sm flex-shrink-0"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="cast"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-2 sm:px-3 md:px-4 text-xs sm:text-sm flex-shrink-0"
                  >
                    Cast
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-2 sm:px-3 md:px-4 text-xs sm:text-sm flex-shrink-0"
                  >
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-2 sm:px-3 md:px-4 text-xs sm:text-sm flex-shrink-0"
                  >
                    Media
                  </TabsTrigger>
                  <TabsTrigger
                    value="similar"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-2 sm:px-3 md:px-4 text-xs sm:text-sm flex-shrink-0"
                  >
                    Similar
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" className="mt-2" />
              </ScrollArea>
            </div>

            <div>
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

function MovieDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] xl:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 h-full flex items-end sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 w-full max-w-7xl pb-4 sm:pb-6 md:pb-8">
            <Skeleton className="w-32 sm:w-44 md:w-52 lg:w-64 xl:w-80 h-48 sm:h-66 md:h-78 lg:h-96 xl:h-[480px] rounded-lg sm:rounded-xl lg:rounded-2xl mx-auto sm:mx-0" />
            <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 text-center sm:text-left">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <Skeleton className="h-6 sm:h-8 md:h-10 lg:h-12 w-full sm:w-3/4 mx-auto sm:mx-0" />
                <Skeleton className="h-3 sm:h-4 md:h-6 w-3/4 sm:w-1/2 mx-auto sm:mx-0" />
              </div>
              <div className="flex gap-1 sm:gap-2 justify-center sm:justify-start flex-wrap">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-5 sm:h-6 md:h-8 w-12 sm:w-16 md:w-24"
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <Skeleton className="h-8 sm:h-10 md:h-12 w-full sm:w-32" />
                <div className="flex gap-2 sm:gap-3 md:gap-4">
                  <Skeleton className="h-8 sm:h-10 md:h-12 w-16 sm:w-20 md:w-32 flex-1 sm:flex-none" />
                  <Skeleton className="h-8 sm:h-10 md:h-12 w-16 sm:w-20 md:w-32 flex-1 sm:flex-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 md:pt-8 -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 xl:-mt-24">
        {/* Fixed skeleton for tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto sm:grid sm:grid-cols-5 bg-[#1b263b] border border-[#2e3c51] rounded-lg p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 sm:h-10 min-w-[60px] sm:w-full flex-shrink-0"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 sm:h-32 md:h-40 lg:h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}
