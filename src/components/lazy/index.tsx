"use client";

import React, { lazy, Suspense } from "react";
import Loading from "@/components/common/Loading";
import TabContentSkeleton from "@/components/common/TabContentSkeleton";

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
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-main mb-2">
              Component Load Error
            </h3>
            <p className="text-text-sub mb-4 max-w-md">
              Failed to load this component. This might be due to a network
              issue or a temporary error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cinehub-accent text-white rounded-lg hover:bg-cinehub-accent/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Wrapper for tab components with lightweight skeleton
const withTabLoading = (Component: React.ComponentType<any>) => {
  return function TabLoadedComponent(props: any) {
    return (
      <LazyLoadErrorBoundary>
        <Suspense fallback={<TabContentSkeleton />}>
          <Component {...props} />
        </Suspense>
      </LazyLoadErrorBoundary>
    );
  };
};

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
export const InternalMovieCard = lazy(() =>
  import("@/components/movie/InternalMovieCard").then((mod) => ({
    default: mod.InternalMovieCard,
  }))
);

// Watch components
export const WatchlistPage = lazy(() =>
  import("@/components/watch/WatchlistPage").then((mod) => ({
    default: mod.WatchlistPage,
  }))
);
export const VideoPlayer = lazy(() =>
  import("@/components/common/VideoPlayer").then((mod) => ({
    default: mod.VideoPlayer,
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
export const HotTVShows = lazy(
  () => import("@/components/sections/HotTVShows")
);

// TV Show components with custom loading
const BaseTVShowOverview = lazy(() => import("@/components/tv/TVShowOverview"));
const BaseTVShowCast = lazy(() => import("@/components/tv/TVShowCast"));
const BaseTVShowSeasons = lazy(() => import("@/components/tv/TVShowSeasons"));
const BaseTVShowMedia = lazy(() => import("@/components/tv/TVShowMedia"));
const BaseSimilarTVShows = lazy(() => import("@/components/tv/SimilarTVShows"));
const BaseTVShowReviews = lazy(() => import("@/components/tv/TVShowReviews"));

// Movie components with custom loading
const BaseMovieOverview = lazy(
  () => import("@/components/movie/MovieOverview")
);
const BaseMovieCast = lazy(() => import("@/components/movie/MovieCast"));
const BaseMovieMedia = lazy(() => import("@/components/movie/MovieMedia"));
const BaseSimilarMovies = lazy(
  () => import("@/components/movie/SimilarMovies")
);
const BaseMovieReviews = lazy(() => import("@/components/movie/MovieReviews"));

// Export wrapped components for tabs
export const TVShowOverview = withTabLoading(BaseTVShowOverview);
export const TVShowCast = withTabLoading(BaseTVShowCast);
export const TVShowSeasons = withTabLoading(BaseTVShowSeasons);
export const TVShowMedia = withTabLoading(BaseTVShowMedia);
export const SimilarTVShows = withTabLoading(BaseSimilarTVShows);
export const TVShowReviews = withTabLoading(BaseTVShowReviews);

export const MovieOverview = withTabLoading(BaseMovieOverview);
export const MovieCast = withTabLoading(BaseMovieCast);
export const MovieMedia = withTabLoading(BaseMovieMedia);
export const SimilarMovies = withTabLoading(BaseSimilarMovies);
export const MovieReviews = withTabLoading(BaseMovieReviews);

// Actor components
export const ActorDetail = lazy(() => import("@/components/actor/ActorDetail"));
export const ActorCard = lazy(() =>
  import("@/components/common/ActorCard").then((mod) => ({
    default: mod.ActorCard,
  }))
);

// Profile components
export const Settings = lazy(() => import("@/components/profile/Settings"));

// Admin components
export const AdminSidebar = lazy(
  () => import("@/components/admin/AdminSidebar")
);
export const UserManagement = lazy(() =>
  import("@/components/admin/UserManagement").then((mod) => ({
    default: mod.UserManagement,
  }))
);

// Skeleton components for different content types
const MovieCardSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="skeleton aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card" />
    <div className="space-y-3">
      <div className="skeleton h-5 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
      <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-bg-card to-border" />
      <div className="skeleton h-3 w-2/3 rounded-lg bg-gradient-to-r from-bg-card to-border" />
    </div>
  </div>
);

const TVShowCardSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="skeleton aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card" />
    <div className="space-y-3">
      <div className="skeleton h-5 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
      <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-bg-card to-border" />
      <div className="skeleton h-3 w-2/3 rounded-lg bg-gradient-to-r from-bg-card to-border" />
    </div>
  </div>
);

const ActorCardSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="skeleton aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card" />
    <div className="space-y-3">
      <div className="skeleton h-5 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
      <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-bg-card to-border" />
      <div className="skeleton h-3 w-2/3 rounded-lg bg-gradient-to-r from-bg-card to-border" />
    </div>
  </div>
);

const SectionSkeleton = () => (
  <div className="space-y-6">
    <div className="skeleton h-8 w-48 rounded-lg bg-gradient-to-r from-bg-card to-border animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
              <Loading message={loadingMessage} showBackdrop={false} />
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
export {
  MovieCardSkeleton,
  TVShowCardSkeleton,
  ActorCardSkeleton,
  SectionSkeleton,
  TabContentSkeleton,
};
