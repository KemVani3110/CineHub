"use client";

import React, { lazy, Suspense } from "react";
import CompilingOverlay from "@/components/common/CompilingOverlay";
import { Skeleton } from "@/components/ui/skeleton";

// Error boundary for lazy loaded components
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Lazy load error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-4 text-red-500">
            Failed to load component. Please try refreshing the page.
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Common components
export const Header = lazy(() => import("@/components/common/Header"));
export const Footer = lazy(() => import("@/components/common/Footer"));
export const MovieCard = lazy(() =>
  import("@/components/common/MovieCard").then((mod) => ({
    default: mod.MovieCard,
  }))
);
export const TVShowCard = lazy(() =>
  import("@/components/common/TVShowCard").then((mod) => ({
    default: mod.TVShowCard,
  }))
);

// Auth components
export const LoginForm = lazy(() => import("@/components/auth/LoginForm"));
export const RegisterForm = lazy(
  () => import("@/components/auth/RegisterForm")
);
export const SocialLoginButtons = lazy(
  () => import("@/components/auth/SocialLoginButtons")
);

// UI components
export const Dialog = lazy(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog }))
);
export const DropdownMenu = lazy(() =>
  import("@/components/ui/dropdown-menu").then((mod) => ({
    default: mod.DropdownMenu,
  }))
);
export const Sheet = lazy(() =>
  import("@/components/ui/sheet").then((mod) => ({ default: mod.Sheet }))
);
export const Tabs = lazy(() =>
  import("@/components/ui/tabs").then((mod) => ({ default: mod.Tabs }))
);
export const Select = lazy(() =>
  import("@/components/ui/select").then((mod) => ({ default: mod.Select }))
);
export const Form = lazy(() =>
  import("@/components/ui/form").then((mod) => ({ default: mod.Form }))
);
export const ScrollArea = lazy(() =>
  import("@/components/ui/scroll-area").then((mod) => ({
    default: mod.ScrollArea,
  }))
);

// Section components
export const HeroSection = lazy(
  () => import("@/components/sections/HeroSection")
);
export const PopularMovies = lazy(
  () => import("@/components/sections/PopularMovies")
);
export const TopRatedMovies = lazy(
  () => import("@/components/sections/TopRatedMovies")
);
export const NowPlayingMovies = lazy(
  () => import("@/components/sections/NowPlayingMovies")
);
export const UpcomingMovies = lazy(
  () => import("@/components/sections/UpcomingMovies")
);
export const PopularTVShows = lazy(
  () => import("@/components/sections/PopularTVShows")
);
export const TopRatedTVShows = lazy(
  () => import("@/components/sections/TopRatedTVShows")
);
export const OnTheAirTVShows = lazy(
  () => import("@/components/sections/OnTheAirTVShows")
);

// TV Show components
export const TVShowOverview = lazy(
  () => import("@/components/tv/TVShowOverview")
);
export const TVShowCast = lazy(() => import("@/components/tv/TVShowCast"));
export const TVShowSeasons = lazy(
  () => import("@/components/tv/TVShowSeasons")
);
export const TVShowMedia = lazy(() => import("@/components/tv/TVShowMedia"));
export const SimilarTVShows = lazy(
  () => import("@/components/tv/SimilarTVShows")
);
export const TVShowReviews = lazy(
  () => import("@/components/tv/TVShowReviews")
);

// Movie components
export const MovieOverview = lazy(
  () => import("@/components/movie/MovieOverview")
);
export const MovieCast = lazy(() => import("@/components/movie/MovieCast"));
export const MovieMedia = lazy(() => import("@/components/movie/MovieMedia"));
export const SimilarMovies = lazy(
  () => import("@/components/movie/SimilarMovies")
);
export const MovieReviews = lazy(
  () => import("@/components/movie/MovieReviews")
);

// Skeleton components for different content types
const MovieCardSkeleton = () => (
  <div className="w-full space-y-3">
    <Skeleton className="w-full aspect-[2/3] rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const TVShowCardSkeleton = () => (
  <div className="w-full space-y-3">
    <Skeleton className="w-full aspect-[2/3] rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const SectionSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// lazy loading wrapper with skeleton support
export const withLazyLoading = (
  Component: React.ComponentType,
  loadingMessage?: string,
  options?: {
    minLoadingTime?: number;
    showBackdrop?: boolean;
    retryCount?: number;
    skeleton?: React.ComponentType;
  }
) => {
  return function LazyLoadedComponent(props: any) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [showContent, setShowContent] = React.useState(false);
    const [retryCount, setRetryCount] = React.useState(0);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setShowContent(true), 100);
      }, options?.minLoadingTime || 300);

      return () => clearTimeout(timer);
    }, []);

    const handleRetry = () => {
      setRetryCount((prev) => prev + 1);
      setIsLoading(true);
      setShowContent(false);
    };

    if (isLoading && options?.skeleton) {
      return <options.skeleton />;
    }

    return (
      <LazyLoadErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <p className="text-red-500">Failed to load component</p>
            {retryCount < (options?.retryCount || 3) && (
              <button
                onClick={handleRetry}
                className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            )}
          </div>
        }
      >
        <Suspense 
          fallback={
            options?.skeleton ? (
              <options.skeleton />
            ) : (
              <CompilingOverlay message={loadingMessage} />
            )
          }
        >
          {showContent ? <Component {...props} /> : null}
        </Suspense>
      </LazyLoadErrorBoundary>
    );
  };
};

// Export skeleton components
export { MovieCardSkeleton, TVShowCardSkeleton, SectionSkeleton };
