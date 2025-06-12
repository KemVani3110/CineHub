"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTVShowDetails } from "@/services/tmdb";
import { TMDBTVDetails } from "@/types/tmdb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { TMDBGenre } from "@/types/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TVShowOverview,
  TVShowCast,
  TVShowReviews,
  TVShowSeasons,
  TVShowMedia,
  SimilarTVShows,
} from "@/components/lazy";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import { WatchButton } from "@/components/common/WatchButton";
import Image from "next/image";

export default function TVShowDetail() {
  const { id } = useParams();
  const [tvShow, setTVShow] = useState<TMDBTVDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadTVShow = async () => {
      try {
        const data = await fetchTVShowDetails(Number(id));
        setTVShow(data);
      } catch (error) {
        console.error("Error loading TV show:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTVShow();
  }, [id]);

  if (loading) {
    return <TVShowDetailSkeleton />;
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-500">
            Error loading TV show
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
        title: tvShow.name,
        text: `Check out ${tvShow.name} on CineHub!`,
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
              tvShow.backdrop_path || null,
              "original"
            )})`,
          }}
        >
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/60 sm:via-slate-950/70 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 h-full flex items-end sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 w-full max-w-7xl pb-4 sm:pb-6 md:pb-8">
            {/* TV Show Poster */}
            <div className="flex-shrink-0 mx-auto sm:mx-0 mt-2 sm:mt-0">
              <div className="relative w-32 sm:w-44 md:w-52 lg:w-64 xl:w-80 h-48 sm:h-66 md:h-78 lg:h-96 xl:h-[480px] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-[#2e3c51] hover:border-[#4fd1c5] transition-all duration-300">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                  alt={tvShow.name}
                  fill
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* TV Show Info */}
            <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8 text-center sm:text-left">
              {/* Title */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-6xl font-bold leading-tight text-[#e0e6ed] px-2 sm:px-0">
                  {tvShow.name}
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-[#9aafc3] italic px-2 sm:px-0">
                  {tvShow.tagline || "No tagline available"}
                </p>
              </div>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start px-2 sm:px-0">
                {tvShow.genres.slice(0, 3).map((genre: TMDBGenre) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-[#1b263b] border-[#4fd1c5]/30 text-[#4fd1c5] hover:bg-[#4fd1c5]/10 cursor-pointer transition-all duration-300"
                  >
                    {genre.name.toUpperCase()}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-2 sm:px-0">
                <WatchButton
                  mediaType="tv"
                  movieId={null}
                  tvId={tvShow.id}
                  title={tvShow.name}
                  posterPath={tvShow.poster_path || ""}
                  className="bg-[#4fd1c5] hover:bg-[#38b2ac] text-[#0d1b2a] px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:scale-105 w-full sm:w-auto flex items-center justify-center"
                  isUpcoming={
                    tvShow.next_episode_to_air &&
                    tvShow.next_episode_to_air.air_date
                      ? new Date(tvShow.next_episode_to_air.air_date) >
                        new Date()
                      : false
                  }
                  isDetailView={true}
                />
                <div className="flex gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    size="default"
                    className="border-[#2e3c51] text-[#e0e6ed] hover:bg-[#1b263b] hover:border-[#4fd1c5] hover:text-[#4fd1c5] px-4 sm:px-6 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 flex-1 sm:flex-none"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  <WatchlistButton
                    id={tvShow.id}
                    mediaType="tv"
                    title={tvShow.name}
                    posterPath={tvShow.poster_path || ""}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-24 pt-4">
          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-8">
              <ScrollArea className="w-full">
                <TabsList
                  className="w-full bg-[#1b263b] border border-[#2e3c51] rounded-lg p-1 
                                   flex flex-nowrap"
                >
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-3 sm:px-4 text-sm flex-shrink-0"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="cast"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-3 sm:px-4 text-sm flex-shrink-0"
                  >
                    Cast
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-3 sm:px-4 text-sm flex-shrink-0"
                  >
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger
                    value="seasons"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-3 sm:px-4 text-sm flex-shrink-0"
                  >
                    Seasons
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-3 sm:px-4 text-sm flex-shrink-0"
                  >
                    Media
                  </TabsTrigger>
                  <TabsTrigger
                    value="similar"
                    className="data-[state=active]:bg-[#4fd1c5] data-[state=active]:text-[#0d1b2a] 
                             text-[#9aafc3] hover:text-[#e0e6ed] cursor-pointer transition-all duration-300 
                             whitespace-nowrap px-3 sm:px-4 text-sm flex-shrink-0"
                  >
                    Similar
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" className="mt-2" />
              </ScrollArea>
            </div>

            <div>
              <TabsContent value="overview" className="mt-0">
                <TVShowOverview tvShow={tvShow} />
              </TabsContent>

              <TabsContent value="cast" className="mt-0">
                {tvShow.credits && <TVShowCast tvShow={tvShow} />}
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                {tvShow.reviews && <TVShowReviews reviews={tvShow.reviews} />}
              </TabsContent>

              <TabsContent value="seasons" className="mt-0">
                <TVShowSeasons tvShow={tvShow} />
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                {tvShow.videos && (
                  <TVShowMedia
                    videos={tvShow.videos}
                    tvShowTitle={tvShow.name}
                  />
                )}
              </TabsContent>

              <TabsContent value="similar" className="mt-0">
                {tvShow.similar && <SimilarTVShows tvShow={tvShow} />}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function TVShowDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-end sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 lg:gap-12 w-full max-w-7xl pb-6 sm:pb-0">
            <Skeleton className="w-40 sm:w-56 lg:w-80 h-60 sm:h-84 lg:h-[480px] rounded-xl lg:rounded-2xl mx-auto sm:mx-0" />
            <div className="flex-1 space-y-4 sm:space-y-6 text-center sm:text-left">
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-8 sm:h-10 lg:h-12 w-full sm:w-3/4 mx-auto sm:mx-0" />
                <Skeleton className="h-4 sm:h-6 w-3/4 sm:w-1/2 mx-auto sm:mx-0" />
              </div>
              <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 sm:h-8 w-16 sm:w-24" />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Skeleton className="h-10 sm:h-12 w-full sm:w-32" />
                <div className="flex gap-2 sm:gap-4">
                  <Skeleton className="h-10 sm:h-12 w-20 sm:w-32 flex-1 sm:flex-none" />
                  <Skeleton className="h-10 sm:h-12 w-20 sm:w-32 flex-1 sm:flex-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Fixed skeleton for tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto sm:grid sm:grid-cols-6 bg-[#1b263b] border border-[#2e3c51] rounded-lg p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 min-w-[80px] sm:w-full flex-shrink-0"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 sm:h-40 lg:h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}
