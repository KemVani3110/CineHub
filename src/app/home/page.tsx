/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Tv,
  Film,
  Star,
  PlayCircle,
  Sparkles,
  Flame,
  Trophy,
  Clock3,
} from "lucide-react";
import {
  Header,
  Footer,
  HeroSection,
  PopularMovies,
  TopRatedMovies,
  NowPlayingMovies,
  UpcomingMovies,
  PopularTVShows,
  TopRatedTVShows,
  OnTheAirTVShows,
  withLazyLoading,
  MovieCard,
} from "@/components/lazy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BackToTop from "@/components/common/BackToTop";
import Loading from "@/components/common/Loading";
import Link from "next/link";

// Wrap components with lazy loading
const LazyHeader = withLazyLoading(Header, "Loading header...");
const LazyFooter = withLazyLoading(Footer, "Loading footer...");
const LazyHeroSection = withLazyLoading(HeroSection, "Loading hero section...");
const LazyPopularMovies = withLazyLoading(
  PopularMovies,
  "Loading popular movies..."
);
const LazyTopRatedMovies = withLazyLoading(
  TopRatedMovies,
  "Loading top rated movies..."
);
const LazyNowPlayingMovies = withLazyLoading(
  NowPlayingMovies,
  "Loading now playing movies..."
);
const LazyUpcomingMovies = withLazyLoading(
  UpcomingMovies,
  "Loading upcoming movies..."
);
const LazyPopularTVShows = withLazyLoading(
  PopularTVShows,
  "Loading popular TV shows..."
);
const LazyTopRatedTVShows = withLazyLoading(
  TopRatedTVShows,
  "Loading top rated TV shows..."
);
const LazyOnTheAirTVShows = withLazyLoading(
  OnTheAirTVShows,
  "Loading on the air TV shows..."
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const SectionTitle = ({
  children,
  icon: Icon,
  subtitle,
  gradient = false,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  subtitle?: string;
  gradient?: boolean;
}) => (
  <div className="mb-8 group">
    <div className="flex items-center gap-4 mb-3">
      <div className="relative flex-shrink-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4FD1C5] to-[#63B3ED] shadow-lg shadow-[#4FD1C5]/20 group-hover:shadow-[#4FD1C5]/30 transition-all duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-[#4FD1C5] to-[#63B3ED] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
      </div>
      <div className="flex-1 min-w-0">
        <h2
          className={`text-2xl sm:text-3xl md:text-4.5xl font-bold tracking-tight leading-tight ${
            gradient
              ? "bg-gradient-to-r from-[#4FD1C5] via-[#63B3ED] to-[#4FD1C5] bg-clip-text text-transparent"
              : "text-white"
          } group-hover:text-[#4FD1C5] transition-colors duration-300`}
        >
          {children}
        </h2>
        {subtitle && (
          <p className="text-[#9aafc3] text-xs sm:text-sm mt-1 font-medium tracking-wide">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="relative">
      <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-[#4FD1C5] to-[#63B3ED] rounded-full group-hover:w-28 sm:group-hover:w-32 transition-all duration-500" />
      <div className="absolute top-0 left-0 h-1 w-8 sm:w-12 bg-gradient-to-r from-white/50 to-transparent rounded-full animate-pulse" />
    </div>
  </div>
);

const ToggleButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: string;
}) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] min-w-[140px] ${
      active
        ? "bg-gradient-to-br from-[#4FD1C5] to-[#38B2AC] text-white shadow-xl shadow-[#4FD1C5]/25"
        : "bg-[#1B263B]/80 text-gray-300 hover:bg-[#2D3748]/80 hover:text-white border border-[#2D3748]/50 hover:border-[#4FD1C5]/30 backdrop-blur-sm"
    }`}
  >
    {/* Icon container */}
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
        active
          ? "bg-white/20 text-white"
          : "bg-[#4FD1C5]/10 text-[#4FD1C5] group-hover:bg-[#4FD1C5]/20"
      }`}
    >
      <Icon className="w-5 h-5" />
    </div>

    {/* Text content */}
    <div className="text-left flex-1">
      <div
        className={`font-semibold text-base leading-tight ${
          active ? "text-white" : "text-gray-200 group-hover:text-white"
        }`}
      >
        {label}
      </div>
      {count && (
        <div
          className={`text-xs leading-tight mt-0.5 ${
            active ? "text-white/80" : "text-gray-400 group-hover:text-gray-300"
          }`}
        >
          {count}
        </div>
      )}
    </div>

    {/* Active indicator */}
    {active && (
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4FD1C5]/10 to-[#38B2AC]/10 pointer-events-none" />
    )}
  </button>
);

// Update MovieCard usage to include prefetching
const MovieCardWithPrefetch = ({ movie }: { movie: any }) => {
  return (
    <Link
      href={`/movie/${movie.id}`}
      prefetch={true}
      className="block transform transition-all duration-300 hover:scale-105"
    >
      <MovieCard movie={movie} />
    </Link>
  );
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"movies" | "tv">("movies");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "#0D1B2A", color: "#E0E6ED" }}
      >
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#4FD1C5]/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-[#63B3ED]/5 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-[#4FD1C5]/3 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <LazyHeader
          onSidebarChange={(open: boolean) => setIsSidebarOpen(open)}
        />

        {/*Mobile Sidebar */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            <div
              className="fixed left-0 top-0 h-full w-80 p-6 shadow-2xl"
              style={{ backgroundColor: "#1B263B" }}
            >
              <div className="space-y-6">
                <div className="border-b border-[#2D3748] pb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4FD1C5] to-[#63B3ED] bg-clip-text text-transparent">
                    CineHub Menu
                  </h2>
                  <p className="text-[#9aafc3] text-sm mt-1">
                    Explore movies & TV shows
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main
          className={`relative z-10 transition-all duration-300 ${
            isSidebarOpen ? "ml-70" : ""
          }`}
        >
          <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <LazyHeroSection />

            {/* Section Toggle */}
            <div className="flex flex-col sm:flex-row gap-6 mb-16 justify-center items-center">
              <div className="flex gap-4">
                <ToggleButton
                  active={activeSection === "movies"}
                  onClick={() => setActiveSection("movies")}
                  icon={Film}
                  label="Movies"
                  count="Latest blockbusters"
                />
                <ToggleButton
                  active={activeSection === "tv"}
                  onClick={() => setActiveSection("tv")}
                  icon={Tv}
                  label="TV Shows"
                  count="Trending series"
                />
              </div>

              {/* Section indicator */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1B263B]/50 rounded-full border border-[#2D3748]">
                <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-pulse" />
                <span className="text-sm text-[#9aafc3] font-medium">
                  {activeSection === "movies"
                    ? "Movie Collection"
                    : "TV Series Collection"}
                </span>
              </div>
            </div>

            {/* Movies Section */}
            {activeSection === "movies" && (
              <div className="space-y-16">
                <section className="relative">
                  <SectionTitle
                    icon={Flame}
                    subtitle="Discover what everyone's watching right now"
                    gradient
                  >
                    Trending Movies
                  </SectionTitle>
                  <React.Suspense
                    fallback={<Loading message="Loading trending movies..." />}
                  >
                    <LazyPopularMovies />
                  </React.Suspense>
                </section>

                <section className="relative">
                  <SectionTitle
                    icon={Trophy}
                    subtitle="Critically acclaimed and audience favorites"
                  >
                    Top Rated Movies
                  </SectionTitle>
                  <React.Suspense
                    fallback={<Loading message="Loading top rated movies..." />}
                  >
                    <LazyTopRatedMovies />
                  </React.Suspense>
                </section>

                <section className="relative">
                  <SectionTitle
                    icon={PlayCircle}
                    subtitle="Currently playing in theaters"
                  >
                    Now Playing
                  </SectionTitle>
                  <React.Suspense
                    fallback={
                      <Loading message="Loading now playing movies..." />
                    }
                  >
                    <LazyNowPlayingMovies />
                  </React.Suspense>
                </section>

                <section className="relative">
                  <SectionTitle
                    icon={Clock3}
                    subtitle="Coming soon to theaters"
                  >
                    Upcoming Releases
                  </SectionTitle>
                  <React.Suspense
                    fallback={<Loading message="Loading upcoming movies..." />}
                  >
                    <LazyUpcomingMovies />
                  </React.Suspense>
                </section>
              </div>
            )}

            {/* TV Shows Section */}
            {activeSection === "tv" && (
              <div className="space-y-16">
                <section className="relative">
                  <SectionTitle
                    icon={Sparkles}
                    subtitle="Discover what everyone's watching right now"
                    gradient
                  >
                    Trending TV Shows
                  </SectionTitle>
                  <React.Suspense
                    fallback={
                      <Loading message="Loading trending TV shows..." />
                    }
                  >
                    <LazyPopularTVShows />
                  </React.Suspense>
                </section>

                <section className="relative">
                  <SectionTitle
                    icon={Star}
                    subtitle="Critically acclaimed and audience favorites"
                  >
                    Top Rated TV Shows
                  </SectionTitle>
                  <React.Suspense
                    fallback={
                      <Loading message="Loading top rated TV shows..." />
                    }
                  >
                    <LazyTopRatedTVShows />
                  </React.Suspense>
                </section>

                <section className="relative">
                  <SectionTitle icon={Star} subtitle="Currently airing on TV">
                    On The Air TV Shows
                  </SectionTitle>
                  <React.Suspense
                    fallback={
                      <Loading message="Loading on the air TV shows..." />
                    }
                  >
                    <LazyOnTheAirTVShows />
                  </React.Suspense>
                </section>
              </div>
            )}
          </div>
        </main>

        <LazyFooter isSidebarOpen={isSidebarOpen} />
        <BackToTop />
      </div>
    </QueryClientProvider>
  );
}
