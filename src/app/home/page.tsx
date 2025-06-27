"use client";

import React, { useState, useEffect } from "react";
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
  HotTVShows,
  withLazyLoading,
  MovieCard,
} from "@/components/lazy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BackToTop from "@/components/common/BackToTop";
import Loading from "@/components/common/Loading";
import Link from "next/link";
import { Recommendations } from "@/components/common/Recommendations";

// Wrap components with lazy loading
const LazyHeader = withLazyLoading(Header, "Loading header...");
const LazyFooter = withLazyLoading(Footer, "Loading footer...");
const LazyHeroSection = withLazyLoading(HeroSection, "Loading hero section...");
const LazyRecommendations = withLazyLoading(
  Recommendations,
  "Loading recommendations..."
);
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
const LazyHotTVShows = withLazyLoading(
  HotTVShows,
  "Loading hot TV shows..."
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Parallax Background Component
const ParallaxBackground = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">

      {/* Animated floating orbs */}
      <div
        className="absolute top-20 left-10 w-32 h-32 bg-[#4FD1C5]/8 rounded-full blur-3xl animate-pulse"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      <div
        className="absolute top-40 right-20 w-24 h-24 bg-[#63B3ED]/8 rounded-full blur-2xl animate-pulse delay-1000"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      />
      <div
        className="absolute bottom-20 left-1/4 w-40 h-40 bg-[#4FD1C5]/5 rounded-full blur-3xl animate-pulse delay-2000"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-28 h-28 bg-[#38B2AC]/6 rounded-full blur-2xl animate-pulse delay-3000"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#4FD1C5]/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              transform: `translateY(${
                scrollY * (0.05 + Math.random() * 0.1)
              }px)`,
            }}
          />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #4FD1C5 1px, transparent 0)`,
          backgroundSize: "50px 50px",
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      />
    </div>
  );
};

// Section Divider
const SectionDivider = () => (
  <div className="relative my-20 flex items-center justify-center">
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-transparent via-[#4FD1C5]/30 to-transparent" />
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[#0D1B2A] px-6 py-2 rounded-full border border-[#4FD1C5]/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-[#63B3ED] rounded-full animate-pulse delay-300" />
              <div className="w-1.5 h-1.5 bg-[#4FD1C5] rounded-full animate-pulse delay-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
  <div className="mb-12 group">
    <div className="flex items-center gap-6 md:gap-8 mb-4">
      <div className="relative flex-shrink-0">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4FD1C5] to-[#63B3ED] shadow-lg shadow-[#4FD1C5]/20 group-hover:shadow-[#4FD1C5]/40 transition-all duration-500 group-hover:scale-110">
          <Icon className="w-7 h-7 text-white drop-shadow-sm" />
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-[#4FD1C5] to-[#63B3ED] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
        {/* Floating ring effect */}
        <div className="absolute -inset-4 border border-[#4FD1C5]/10 rounded-2xl animate-pulse"></div>
      </div>
      <div className="flex-1 min-w-0">
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight ${
            gradient
              ? "bg-gradient-to-r from-[#4FD1C5] via-[#63B3ED] to-[#4FD1C5] bg-clip-text text-transparent"
              : "text-white drop-shadow-sm group-hover:text-[#4FD1C5]"
          } transition-all duration-500`}
        >
          {children}
        </h2>
        {subtitle && (
          <p className="text-[#9aafc3] text-sm sm:text-base mt-2 font-medium tracking-wide opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="relative">
      <div className="h-1.5 w-24 sm:w-32 bg-gradient-to-r from-[#4FD1C5] via-[#63B3ED] to-[#4FD1C5] rounded-full group-hover:w-36 sm:group-hover:w-40 transition-all duration-700 shadow-lg shadow-[#4FD1C5]/30" />
      <div className="absolute top-0 left-0 h-1.5 w-12 sm:w-16 bg-gradient-to-r from-white/60 to-transparent rounded-full animate-pulse" />
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#4FD1C5]/20 to-[#63B3ED]/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
    className={`group relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 rounded-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] min-w-[140px] sm:min-w-[160px] flex-1 sm:flex-initial overflow-hidden ${
      active
        ? "bg-gradient-to-br from-[#4FD1C5] to-[#38B2AC] text-white shadow-2xl shadow-[#4FD1C5]/30"
        : "bg-[#1B263B]/90 text-gray-300 hover:bg-[#2D3748]/90 hover:text-white border border-[#2D3748]/50 hover:border-[#4FD1C5]/40 backdrop-blur-md"
    }`}
  >
    {/* Animated background */}
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-[#4FD1C5]/10 to-[#38B2AC]/10 animate-pulse" />
    )}

    {/* Icon container */}
    <div
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 ${
        active
          ? "bg-white/20 text-white shadow-lg"
          : "bg-[#4FD1C5]/15 text-[#4FD1C5] group-hover:bg-[#4FD1C5]/25 group-hover:scale-110"
      }`}
    >
      <Icon className="w-5 h-5 drop-shadow-sm" />
    </div>

    {/* Text content */}
    <div className="text-left flex-1 relative z-10 min-w-0">
      <div
        className={`font-bold text-base sm:text-lg leading-tight truncate ${
          active
            ? "text-white drop-shadow-sm"
            : "text-gray-200 group-hover:text-white"
        }`}
      >
        {label}
      </div>
      {count && (
        <div
          className={`text-xs sm:text-sm leading-tight mt-1 truncate ${
            active ? "text-white/90" : "text-gray-400 group-hover:text-gray-300"
          }`}
        >
          {count}
        </div>
      )}
    </div>

    {/* Hover glow effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-[#4FD1C5]/0 via-[#4FD1C5]/20 to-[#4FD1C5]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

    {/* Active shimmer effect */}
    {active && (
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
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
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY < 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="min-h-screen relative overflow-x-hidden"
        style={{ backgroundColor: "#0D1B2A", color: "#E0E6ED" }}
      >
        {/* Parallax Background */}
        <ParallaxBackground />

        <LazyHeader
          onSidebarChange={(open: boolean) => setIsSidebarOpen(open)}
        />
        {/*Mobile Sidebar */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            <div
              className="fixed left-0 top-0 h-full w-80 p-6 shadow-2xl border-r border-[#2D3748]/50"
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

            <SectionDivider />

            {/* Recommendations Section */}
            <section className="mb-20">
              <SectionTitle
                icon={Star}
                subtitle="Personalized recommendations based on your watchlist and ratings"
              >
                Recommended for You
              </SectionTitle>
              <React.Suspense
                fallback={<Loading message="Loading recommendations..." />}
              >
                <LazyRecommendations />
              </React.Suspense>
            </section>

            <SectionDivider />

            {/* Enhanced Section Toggle - Mobile Responsive */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mb-20 justify-center items-center px-2">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 w-full max-w-md lg:max-w-none">
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
            </div>

            {/* Movies Section */}
            {activeSection === "movies" && (
              <div className="space-y-20">
                <section className="relative">
                  <SectionTitle
                    icon={Flame}
                    subtitle="Discover what everyone's watching right now"
                  >
                    Trending Movies
                  </SectionTitle>
                  <React.Suspense
                    fallback={<Loading message="Loading trending movies..." />}
                  >
                    <LazyPopularMovies />
                  </React.Suspense>
                </section>

                <SectionDivider />

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

                <SectionDivider />

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

                <SectionDivider />

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
              <div className="space-y-20">
                <section className="relative">
                  <SectionTitle
                    icon={Sparkles}
                    subtitle="Discover what everyone's watching right now"
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

                <SectionDivider />

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

                <SectionDivider />

                <section className="relative">
                  <SectionTitle
                    icon={Flame}
                    subtitle="What's trending right now"
                  >
                    Hot TV Shows
                  </SectionTitle>
                  <React.Suspense
                    fallback={<Loading message="Loading hot TV shows..." />}
                  >
                    <LazyHotTVShows />
                  </React.Suspense>
                </section>

                <SectionDivider />

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
