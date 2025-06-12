"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMovies,
  fetchTVShows,
  getImageUrl,
  fetchGenres,
  fetchMovieDetails,
  fetchTVShowDetails,
} from "@/services/tmdb";
import { TMDBMovie, TMDBTVShow, TMDBGenre, TMDBMovieDetails, TMDBTVDetails } from "@/types/tmdb";
import { motion} from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";

const MAX_ITEMS = 10;

const HeroSection = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const { data: moviesData } = useQuery({
    queryKey: ["movies", "now_playing"],
    queryFn: () => fetchMovies("now_playing", 1),
  });

  const { data: tvData } = useQuery({
    queryKey: ["tv", "top_rated"],
    queryFn: () => fetchTVShows("top_rated", 1),
  });

  const { data: movieGenres } = useQuery({
    queryKey: ["movieGenres"],
    queryFn: () => fetchGenres("movie"),
  });

  const { data: tvGenres } = useQuery({
    queryKey: ["tvGenres"],
    queryFn: () => fetchGenres("tv"),
  });

  const items =
    activeTab === "movies"
      ? moviesData?.results?.slice(0, MAX_ITEMS)
      : tvData?.results?.slice(0, MAX_ITEMS);

  const currentItem = items?.[currentIndex];

  // Fetch detailed information for the current item
  const { data: currentItemDetails } = useQuery({
    queryKey: [activeTab, currentItem?.id, "details"],
    queryFn: () => 
      activeTab === "movies"
        ? fetchMovieDetails(currentItem?.id as number)
        : fetchTVShowDetails(currentItem?.id as number),
    enabled: !!currentItem?.id,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!items?.length) return;
    const timer = setInterval(() => {
      scrollNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [items?.length, scrollNext]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Coming Soon";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Coming Soon";

      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Coming Soon";
    }
  };

  const getGenreNames = (genreIds: number[]) => {
    const genres = activeTab === "movies" ? movieGenres : tvGenres;
    return (
      genreIds
        ?.slice(0, 2)
        .map((id) => genres?.find((genre: TMDBGenre) => genre.id === id)?.name)
        .filter(Boolean) || []
    );
  };

  if (!currentItem || !items?.length) {
    return (
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden rounded-xl sm:rounded-2xl mb-8 sm:mb-12">
        <div className="absolute inset-0 bg-[#1B263B]">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-main/90 via-bg-main/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-main/70 via-transparent to-bg-main/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-main/60" />

        {/* Navigation Buttons Skeleton */}
        <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 flex gap-2 sm:gap-3 z-20">
          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
        </div>

        {/* Tab Buttons Skeleton */}
        <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 flex gap-2 sm:gap-3 z-20">
          <Skeleton className="w-16 h-8 sm:w-20 sm:h-10 rounded-full" />
          <Skeleton className="w-16 h-8 sm:w-20 sm:h-10 rounded-full" />
        </div>

        {/* Content Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl">
            <Skeleton className="h-8 sm:h-12 w-3/4 mb-3 sm:mb-4" />
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4">
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-full" />
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-full" />
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-full" />
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-full" />
            </div>
            <Skeleton className="h-16 sm:h-20 w-full mb-4 sm:mb-6" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 sm:h-12 w-full sm:w-32 rounded-full" />
              <Skeleton className="h-10 sm:h-12 w-full sm:w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden rounded-xl sm:rounded-2xl mb-8 sm:mb-12 shadow-2xl">
      <div className="embla overflow-hidden h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {items?.map((item: TMDBMovie | TMDBTVShow, index: number) => (
            <div
              key={item.id}
              className="embla__slide flex-[0_0_100%] min-w-0 relative h-full group"
            >
              <Image
                src={getImageUrl(item.backdrop_path || null, "original")}
                alt={
                  activeTab === "movies"
                    ? (item as TMDBMovie).title
                    : (item as TMDBTVShow).name
                }
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-main/90 via-bg-main/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg-main/70 via-transparent to-bg-main/40" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-main/60" />

              {/* Play Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                <Button
                  onClick={() =>
                    router.push(
                      `/${activeTab === "movies" ? "movie" : "tv"}/${
                        item.id
                      }`
                    )
                  }
                  className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cinehub-accent via-cinehub-accent/90 to-cinehub-accent-hover hover:from-cinehub-accent-hover hover:to-cinehub-accent text-bg-main rounded-full transition-all duration-300 hover:scale-110 cursor-pointer shadow-2xl backdrop-blur-sm overflow-hidden group/btn border border-white/10"
                >
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cinehub-accent/0 via-white/30 to-cinehub-accent/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  
                  {/* Play Icon */}
                  <div className="relative flex items-center justify-center">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12" />
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cinehub-accent/30 via-cinehub-accent-hover/20 to-cinehub-accent/30 blur-xl scale-0 group-hover/btn:scale-100 transition-transform duration-300" />

                  {/* Border Glow */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
                </Button>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-end">
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="w-full p-4 sm:p-6 md:p-8"
                >
                  <div className="max-w-3xl">
                    {/* Title */}
                    <motion.div
                      variants={itemVariants}
                      className="mb-2 sm:mb-3"
                    >
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-text-main leading-tight">
                        {activeTab === "movies"
                          ? (item as TMDBMovie).title
                          : (item as TMDBTVShow).name}
                      </h1>
                    </motion.div>

                    {/* Metadata Row */}
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4"
                    >
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-bg-card/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-border">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-warning fill-current" />
                        <span className="text-text-main font-semibold text-xs sm:text-sm lg:text-base">
                          {item.vote_average.toFixed(1)}
                        </span>
                      </div>

                      {/* Release Date */}
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-bg-card/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-border">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-cinehub-accent" />
                        <span className="text-text-main font-medium text-xs sm:text-sm">
                          {formatDate(
                            activeTab === "movies"
                              ? (item as TMDBMovie).release_date
                              : (item as TMDBTVShow).first_air_date
                          )}
                        </span>
                      </div>

                      {/* Runtime */}
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-bg-card/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-border">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-text-sub" />
                        <span className="text-text-main font-medium text-xs sm:text-sm">
                          {activeTab === "movies" 
                            ? `${(currentItemDetails as TMDBMovieDetails)?.runtime || 0} min`
                            : `${(currentItemDetails as TMDBTVDetails)?.episode_run_time?.[0] || 0} min/ep`}
                        </span>
                      </div>

                      {/* Genres */}
                      {getGenreNames(item.genre_ids).map((genre, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-bg-card/30 backdrop-blur-sm border border-border rounded-full text-text-main font-medium text-xs hover:border-cinehub-accent transition-colors duration-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </motion.div>

                    {/* Description Container */}
                    <motion.div
                      variants={itemVariants}
                      className="relative mb-4 sm:mb-6 hidden sm:block"
                    >
                      <div className="text-text-sub text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed h-[120px] md:h-[150px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <p className="min-h-[120px] md:min-h-[150px] flex items-start">
                          {activeTab === "movies"
                            ? (item as TMDBMovie).overview
                            : (item as TMDBTVShow).overview}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 flex gap-2 sm:gap-3 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="bg-bg-card/30 backdrop-blur-sm border border-border hover:border-cinehub-accent text-white hover:text-cinehub-accent p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:shadow-lg hover:bg-bg-card/50 cursor-pointer group"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="bg-bg-card/30 backdrop-blur-sm border border-border hover:border-cinehub-accent text-white hover:text-cinehub-accent p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:shadow-lg hover:bg-bg-card/50 cursor-pointer group"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Button>
      </div>

      {/* Tab Buttons */}
      <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 flex gap-2 sm:gap-3 z-20">
        <Button
          variant={activeTab === "movies" ? "default" : "outline"}
          onClick={() => {
            setActiveTab("movies");
            emblaApi?.scrollTo(0);
          }}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm hover:scale-105 cursor-pointer ${
            activeTab === "movies"
              ? "bg-cinehub-accent text-bg-main hover:bg-cinehub-accent-hover"
              : "bg-bg-card/30 border border-border text-text-main hover:bg-bg-card/50 hover:border-cinehub-accent hover:text-cinehub-accent"
          }`}
        >
          Movies
        </Button>
        <Button
          variant={activeTab === "tv" ? "default" : "outline"}
          onClick={() => {
            setActiveTab("tv");
            emblaApi?.scrollTo(0);
          }}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 backdrop-blur-sm hover:scale-105 cursor-pointer ${
            activeTab === "tv"
              ? "bg-cinehub-accent text-bg-main hover:bg-cinehub-accent-hover"
              : "bg-bg-card/30 border border-border text-text-main hover:bg-bg-card/50 hover:border-cinehub-accent hover:text-cinehub-accent"
          }`}
        >
          TV Shows
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex gap-1.5 md:gap-2 z-20">
        {items?.map((_: TMDBMovie | TMDBTVShow, index: number) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            onClick={() => emblaApi?.scrollTo(index)}
            className={`transition-all duration-300 rounded-full p-0 cursor-pointer hover:scale-110 ${
              index === currentIndex
                ? "w-6 md:w-8 h-1.5 md:h-2 bg-cinehub-accent shadow-lg"
                : "w-1.5 md:w-2 h-1.5 md:h-2 bg-text-sub/60 hover:bg-cinehub-accent/80"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bg-card/30 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover shadow-lg"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          key={currentIndex}
        />
      </div>
    </div>
  );
};

export default HeroSection;
