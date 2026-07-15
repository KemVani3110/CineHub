import { useRecommendations } from "@/hooks/useRecommendations";
import { MovieCard } from "./MovieCard";
import { TVShowCard } from "./TVShowCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface Recommendation {
  movie?: TMDBMovie;
  tvShow?: TMDBTVShow;
  reason: string;
}

const RECOMMENDATION_REFRESH_MS = 10 * 60 * 1000;
const CAROUSEL_PAGE_SIZE = 5;

export function Recommendations() {
  const { recommendations, isLoading, error, mode, refreshRecommendations } =
    useRecommendations();
  const shouldUseCarousel = recommendations.length >= 10;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false,
    inViewThreshold: 0.7,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRecommendations({ randomize: true });
    emblaApi?.scrollTo(0);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi && !isScrolling) {
      setIsScrolling(true);
      const snaps = emblaApi.scrollSnapList();
      const selectedSnap = emblaApi.selectedScrollSnap();

      if (emblaApi.canScrollPrev()) {
        emblaApi.scrollTo(Math.max(selectedSnap - CAROUSEL_PAGE_SIZE, 0));
      } else {
        emblaApi.scrollTo(Math.max(snaps.length - 1, 0));
      }

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to enable next scroll
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 600); // 600ms debounce
    }
  }, [emblaApi, isScrolling]);

  const scrollNext = useCallback(() => {
    if (emblaApi && !isScrolling) {
      setIsScrolling(true);
      const snaps = emblaApi.scrollSnapList();
      const selectedSnap = emblaApi.selectedScrollSnap();

      if (emblaApi.canScrollNext()) {
        emblaApi.scrollTo(
          Math.min(selectedSnap + CAROUSEL_PAGE_SIZE, snaps.length - 1)
        );
      } else {
        emblaApi.scrollTo(0);
      }

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to enable next scroll
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 600); // 600ms debounce
    }
  }, [emblaApi, isScrolling]);

  useEffect(() => {
    if (!recommendations.length) return;

    const refreshInterval = setInterval(() => {
      refreshRecommendations();
    }, RECOMMENDATION_REFRESH_MS);

    return () => clearInterval(refreshInterval);
  }, [recommendations.length, refreshRecommendations]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <Card className="bg-card-custom border-custom backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <p>Error loading recommendations: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card-custom border-custom backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cinehub-accent animate-bounce" />
              <div
                className="w-2 h-2 rounded-full bg-cinehub-accent animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-cinehub-accent animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <p className="text-slate-300">
              Crafting your perfect recommendations...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    const emptyCopy = {
      guest: {
        title: "Sign in for personal picks",
        description:
          "Log in so CineHub can recommend movies and shows from your watchlist and recent history.",
      },
      empty: {
        title: "No personal signals yet",
        description:
          "Add titles to your watchlist or watch something first, then CineHub can build better picks for you.",
      },
      fallback: {
        title: "Popular picks are warming up",
        description:
          "CineHub could not build personal picks yet, so try refreshing for trending titles.",
      },
      personalized: {
        title: "No recommendations yet",
        description:
          "Add more movies and TV shows to your watchlist to unlock stronger recommendations.",
      },
    }[mode];

    return (
      <Card className="bg-card-custom border-custom backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cinehub-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-slate-200">
                {emptyCopy.title}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {emptyCopy.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card-custom border-custom backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 gap-3 md:gap-0">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full">
          <div className="flex items-center gap-2">
            <CardTitle className="text-slate-200 text-base md:text-lg whitespace-normal break-words">
              Recommended for You
            </CardTitle>
          </div>
          <p className="text-sm text-slate-400 mt-1 md:mt-0 md:ml-2">
            {mode === "fallback"
              ? `${recommendations.length} trending picks`
              : `${recommendations.length} personalized picks`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {shouldUseCarousel && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollPrev}
                disabled={isScrolling}
                className="h-8 w-8 hover:bg-cinehub-accent/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Previous"
              >
                <ChevronLeft
                  className={`h-4 w-4 transition-opacity ${
                    isScrolling ? "opacity-50" : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollNext}
                disabled={isScrolling}
                className="h-8 w-8 hover:bg-cinehub-accent/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Next"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-opacity ${
                    isScrolling ? "opacity-50" : ""
                  }`}
                />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 hover:bg-cinehub-accent/10 group cursor-pointer"
            title="Randomize recommendations"
          >
            <RefreshCw
              className={`h-4 w-4 transition-transform duration-500 ${
                isRefreshing ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {shouldUseCarousel ? (
          <div
            className="embla overflow-hidden cursor-pointer"
            ref={emblaRef}
          >
            <div className="embla__container flex gap-4 md:gap-6">
              {recommendations.map(({ movie, tvShow, reason }, index) => (
                <div
                  key={`${movie?.id || tvShow?.id}-${index}`}
                  className="embla__slide w-[150px] md:w-[180px] flex-shrink-0 animate-fadeInUp"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="space-y-2 h-full">
                    {movie ? (
                      <MovieCard movie={movie} />
                    ) : tvShow ? (
                      <TVShowCard show={tvShow} />
                    ) : null}

                    <div className="space-y-1">
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-2 border border-slate-700/30">
                        <div className="flex items-start gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-cinehub-accent mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {recommendations.map(({ movie, tvShow, reason }, index) => (
              <div
                key={`${movie?.id || tvShow?.id}-${index}`}
                className="animate-fadeInUp"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="space-y-2 h-full">
                  {movie ? (
                    <MovieCard movie={movie} />
                  ) : tvShow ? (
                    <TVShowCard show={tvShow} />
                  ) : null}

                  <div className="space-y-1">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-2 border border-slate-700/30">
                      <div className="flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-cinehub-accent mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-fadeInUp) {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .embla {
          overflow: hidden;
        }

        .embla__container {
          display: flex;
        }

        .embla__slide {
          flex: 0 0 auto;
          min-width: 0;
        }
      `}</style>
    </Card>
  );
}
