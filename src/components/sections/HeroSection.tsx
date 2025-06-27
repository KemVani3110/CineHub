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
  fetchTrendingMovies,
  fetchTrendingTVShows,
  getImageUrl,
  fetchGenres,
  fetchMovieDetails,
  fetchTVShowDetails,
} from "@/services/tmdb";
import {
  TMDBMovie,
  TMDBTVShow,
  TMDBGenre,
  TMDBMovieDetails,
  TMDBTVDetails,
} from "@/types/tmdb";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";

const MAX_ITEMS = 10;

// Available movie categories for random selection
const MOVIE_CATEGORIES = [
  { key: "popular", label: "Popular", fetchFn: fetchMovies },
  { key: "top_rated", label: "Top Rated", fetchFn: fetchMovies },
  { key: "now_playing", label: "Now Playing", fetchFn: fetchMovies },
  { key: "upcoming", label: "Upcoming", fetchFn: fetchMovies },
  { key: "trending", label: "Trending", fetchFn: fetchTrendingMovies },
] as const;

// Available TV show categories for random selection
const TV_CATEGORIES = [
  { key: "popular", label: "Popular", fetchFn: fetchTVShows },
  { key: "top_rated", label: "Top Rated", fetchFn: fetchTVShows },
  { key: "on_the_air", label: "On The Air", fetchFn: fetchTVShows },
  { key: "trending", label: "Trending", fetchFn: fetchTrendingTVShows },
] as const;

const HeroSection = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // Random select a movie category on component mount
  const [selectedMovieCategory, setSelectedMovieCategory] = useState(() => {
    const randomIndex = Math.floor(Math.random() * MOVIE_CATEGORIES.length);
    return MOVIE_CATEGORIES[randomIndex];
  });

  // Random select a TV category on component mount
  const [selectedTVCategory, setSelectedTVCategory] = useState(() => {
    const randomIndex = Math.floor(Math.random() * TV_CATEGORIES.length);
    return TV_CATEGORIES[randomIndex];
  });

  // Function to randomly select a new movie category
  const randomizeMovieCategory = () => {
    const randomIndex = Math.floor(Math.random() * MOVIE_CATEGORIES.length);
    setSelectedMovieCategory(MOVIE_CATEGORIES[randomIndex]);
  };

  // Function to randomly select a new TV category
  const randomizeTVCategory = () => {
    const randomIndex = Math.floor(Math.random() * TV_CATEGORIES.length);
    setSelectedTVCategory(TV_CATEGORIES[randomIndex]);
  };

  const { data: moviesData } = useQuery({
    queryKey: ["movies", selectedMovieCategory.key],
    queryFn: () => {
      if (selectedMovieCategory.key === "trending") {
        return fetchTrendingMovies(1);
      } else {
        return fetchMovies(selectedMovieCategory.key as any, 1);
      }
    },
  });

  const { data: tvData } = useQuery({
    queryKey: ["tv", selectedTVCategory.key],
    queryFn: () => {
      if (selectedTVCategory.key === "trending") {
        return fetchTrendingTVShows(1);
      } else {
        return fetchTVShows(selectedTVCategory.key as any, 1);
      }
    },
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
        <div className="skeleton w-full h-full bg-gradient-to-br from-bg-card via-border to-bg-card animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-main/90 via-bg-main/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-main/70 via-transparent to-bg-main/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-main/60" />

        {/* Navigation Buttons Skeleton */}
        <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 flex gap-2 sm:gap-3 z-20">
          <div className="skeleton w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-bg-card via-border to-bg-card" />
          <div className="skeleton w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-bg-card via-border to-bg-card" />
        </div>

        {/* Tab Buttons Skeleton */}
        <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 flex gap-2 sm:gap-3 z-20">
          <div className="skeleton w-16 h-8 sm:w-20 sm:h-10 rounded-full bg-gradient-to-r from-bg-card to-border" />
          <div className="skeleton w-16 h-8 sm:w-20 sm:h-10 rounded-full bg-gradient-to-r from-bg-card to-border" />
        </div>

        {/* Content Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl space-y-4 animate-pulse">
            <div className="skeleton h-8 sm:h-12 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="skeleton h-6 sm:h-8 w-16 sm:w-20 rounded-full bg-gradient-to-r from-bg-card to-border" />
              <div className="skeleton h-6 sm:h-8 w-20 sm:w-24 rounded-full bg-gradient-to-r from-bg-card to-border" />
              <div className="skeleton h-6 sm:h-8 w-20 sm:w-24 rounded-full bg-gradient-to-r from-bg-card to-border" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="skeleton h-6 sm:h-8 w-16 sm:w-20 rounded-full bg-gradient-to-r from-bg-card to-border" />
              <div className="skeleton h-6 sm:h-8 w-20 sm:w-24 rounded-full bg-gradient-to-r from-bg-card to-border" />
            </div>
            <div className="skeleton h-16 sm:h-20 w-full rounded-lg bg-gradient-to-r from-bg-card to-border" />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="skeleton h-10 sm:h-12 w-full sm:w-32 rounded-full bg-gradient-to-r from-bg-card to-border" />
              <div className="skeleton h-10 sm:h-12 w-full sm:w-32 rounded-full bg-gradient-to-r from-bg-card to-border" />
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
              {/* Background Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-main/95 via-bg-main/70 to-bg-main/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg-main/80 via-bg-main/30 to-bg-main/50" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-cinehub-accent/10" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-bg-main/60" />

              {/* Play Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                {/* Outer Ring - Subtle Breathing */}
                <div className="absolute inset-0 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-cinehub-accent/10 via-slate-400/10 to-cinehub-accent/15 animate-pulse -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />

                <Button
                  onClick={() =>
                    router.push(
                      `/${activeTab === "movies" ? "movie" : "tv"}/${item.id}`
                    )
                  }
                  className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-700 via-cinehub-accent to-slate-800 hover:from-cinehub-accent hover:via-slate-600 hover:to-cinehub-accent-hover text-white rounded-full transition-all duration-400 hover:scale-110 cursor-pointer shadow-xl backdrop-blur-sm overflow-hidden group/btn border border-slate-300/20 hover:border-cinehub-accent/50"
                >
                  {/* Dual Color Inner Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/30 via-slate-600/20 to-cinehub-accent-hover/30 rounded-full transition-opacity duration-400 group-hover/btn:opacity-80" />

                  {/* Refined Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-800 rounded-full" />

                  {/* Play Icon - Cleaner Animation */}
                  <div className="relative flex items-center justify-center">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-all duration-400 group-hover/btn:scale-115 group-hover/btn:translate-x-0.5 drop-shadow-md" />
                  </div>

                  {/* Dual Color Glow */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cinehub-accent/30 via-slate-400/20 to-cinehub-accent-hover/30 blur-lg scale-0 group-hover/btn:scale-125 transition-all duration-400" />

                  {/* Subtle Inner Light */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cinehub-accent/15 via-slate-300/10 to-cinehub-accent/20 scale-0 group-hover/btn:scale-100 transition-all duration-300" />

                  {/* Clean Border Effect */}
                  <div className="absolute inset-0 rounded-full border border-cinehub-accent/30 scale-100 group-hover/btn:scale-110 opacity-0 group-hover/btn:opacity-100 transition-all duration-400" />
                </Button>

                {/* Minimal Floating Dots */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <div
                    className="absolute w-0.5 h-0.5 bg-cinehub-accent rounded-full animate-ping"
                    style={{ top: "25%", left: "75%", animationDelay: "0s" }}
                  />
                  <div
                    className="absolute w-0.5 h-0.5 bg-slate-300 rounded-full animate-ping"
                    style={{ top: "75%", left: "25%", animationDelay: "0.7s" }}
                  />
                </div>
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
                      className="mb-3 sm:mb-4"
                    >
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight drop-shadow-lg bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text text-transparent">
                        {activeTab === "movies"
                          ? (item as TMDBMovie).title
                          : (item as TMDBTVShow).name}
                      </h1>
                      {/* Subtitle Shadow Effect */}
                      <div className="absolute -z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-cinehub-accent/20 blur-sm translate-x-1 translate-y-1">
                        {activeTab === "movies"
                          ? (item as TMDBMovie).title
                          : (item as TMDBTVShow).name}
                      </div>
                    </motion.div>

                    {/* Metadata Row */}
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4"
                    >
                      {/*  Rating */}
                      <motion.div
                        className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-warning/20 via-warning/10 to-warning/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-warning/30 hover:border-warning/50 transition-all duration-300 hover:scale-105 cursor-default group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-warning fill-current group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-white font-semibold text-xs sm:text-sm lg:text-base">
                          {item.vote_average.toFixed(1)}
                        </span>
                      </motion.div>

                      {/*  Release Date */}
                      <motion.div
                        className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-cinehub-accent/20 via-cinehub-accent/10 to-cinehub-accent/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-cinehub-accent/30 hover:border-cinehub-accent/50 transition-all duration-300 hover:scale-105 cursor-default group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-cinehub-accent group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {formatDate(
                            activeTab === "movies"
                              ? (item as TMDBMovie).release_date
                              : (item as TMDBTVShow).first_air_date
                          )}
                        </span>
                      </motion.div>

                      {/*  Runtime */}
                      <motion.div
                        className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-slate-600/20 via-slate-500/10 to-slate-600/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-400/30 hover:border-slate-300/50 transition-all duration-300 hover:scale-105 cursor-default group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {activeTab === "movies"
                            ? `${
                                (currentItemDetails as TMDBMovieDetails)
                                  ?.runtime || 0
                              } min`
                            : (() => {
                                const tvDetails =
                                  currentItemDetails as TMDBTVDetails;
                                const episodeRuntime =
                                  tvDetails?.episode_run_time;

                                if (!tvDetails) {
                                  return "...";
                                }

                                if (
                                  episodeRuntime &&
                                  episodeRuntime.length > 0 &&
                                  episodeRuntime[0] > 0
                                ) {
                                  return `${episodeRuntime[0]} min/ep`;
                                }

                                if (
                                  tvDetails.last_episode_to_air?.runtime &&
                                  tvDetails.last_episode_to_air.runtime > 0
                                ) {
                                  return `${tvDetails.last_episode_to_air.runtime} min/ep`;
                                }

                                const genres = tvDetails.genres || [];
                                const isAnimation = genres.some((g) =>
                                  g.name.toLowerCase().includes("animation")
                                );
                                const isComedy = genres.some((g) =>
                                  g.name.toLowerCase().includes("comedy")
                                );
                                const isDrama = genres.some((g) =>
                                  g.name.toLowerCase().includes("drama")
                                );

                                if (isAnimation) return "~25 min/ep";
                                if (isComedy) return "~30 min/ep";
                                if (isDrama) return "~45 min/ep";

                                return "~40 min/ep";
                              })()}
                        </span>
                      </motion.div>

                      {/*  Genres */}
                      {getGenreNames(item.genre_ids).map((genre, index) => (
                        <motion.span
                          key={index}
                          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-bg-card/40 via-bg-card/20 to-bg-card/40 backdrop-blur-sm border border-border hover:border-cinehub-accent rounded-full text-white font-medium text-xs hover:scale-105 transition-all duration-300 cursor-default"
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(var(--cinehub-accent), 0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {genre}
                        </motion.span>
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

      {/*  Navigation Buttons */}
      <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 flex gap-2 sm:gap-3 z-20">
        <motion.button
          onClick={scrollPrev}
          className="relative bg-gradient-to-br from-bg-card/40 via-bg-card/30 to-bg-card/40 backdrop-blur-md border border-border/50 hover:border-cinehub-accent/60 text-white hover:text-cinehub-accent p-2 sm:p-2.5 rounded-full transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/0 to-cinehub-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <ChevronLeft className="relative w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:drop-shadow-lg" />

          {/* Ripple effect */}
          <div className="absolute inset-0 bg-cinehub-accent/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 opacity-50" />
        </motion.button>

        <motion.button
          onClick={scrollNext}
          className="relative bg-gradient-to-br from-bg-card/40 via-bg-card/30 to-bg-card/40 backdrop-blur-md border border-border/50 hover:border-cinehub-accent/60 text-white hover:text-cinehub-accent p-2 sm:p-2.5 rounded-full transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/0 to-cinehub-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <ChevronRight className="relative w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:drop-shadow-lg" />

          {/* Ripple effect */}
          <div className="absolute inset-0 bg-cinehub-accent/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 opacity-50" />
        </motion.button>

        {/* Random Category Button - Show for both tabs */}
        <motion.button
          onClick={() => {
            if (activeTab === "movies") {
              randomizeMovieCategory();
            } else {
              randomizeTVCategory();
            }
          }}
          className="relative bg-gradient-to-br from-bg-card/40 via-bg-card/30 to-bg-card/40 backdrop-blur-md border border-border/50 hover:border-cinehub-accent/60 text-white hover:text-cinehub-accent p-2 sm:p-2.5 rounded-full transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={`Random ${
            activeTab === "movies" ? "Movie" : "TV Show"
          } Category`}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/0 to-cinehub-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <svg
            className="relative w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 group-hover:rotate-180 group-hover:drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>

          {/* Ripple effect */}
          <div className="absolute inset-0 bg-cinehub-accent/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 opacity-50" />
        </motion.button>
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

      {/*  Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex gap-2 md:gap-3 z-20">
        {items?.map((_: TMDBMovie | TMDBTVShow, index: number) => (
          <motion.button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`relative rounded-full cursor-pointer transition-all duration-500 ${
              index === currentIndex
                ? "w-8 md:w-10 h-2 md:h-2.5"
                : "w-2 md:w-2.5 h-2 md:h-2.5"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Background */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-cinehub-accent via-cinehub-accent-hover to-cinehub-accent"
                  : "bg-gradient-to-r from-slate-500/60 to-slate-400/60 hover:from-cinehub-accent/80 hover:to-cinehub-accent-hover/80"
              }`}
            />

            {/* Glow Effect */}
            {index === currentIndex && (
              <motion.div
                className="absolute inset-0 rounded-full bg-cinehub-accent/50 blur-sm"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Inner Light */}
            <div
              className={`absolute inset-0.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-white/30 to-transparent"
                  : "bg-transparent hover:bg-white/20"
              }`}
            />
          </motion.button>
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
