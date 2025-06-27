import { useRecommendations } from '@/hooks/useRecommendations';
import { MovieCard } from './MovieCard';
import { TVShowCard } from './TVShowCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { useEffect, useRef, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface Recommendation {
  movie?: TMDBMovie;
  tvShow?: TMDBTVShow;
  reason: string;
}

export function Recommendations() {
  const { recommendations, isLoading, error, refreshRecommendations } = useRecommendations();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    containScroll: false,
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false,
    inViewThreshold: 0.7
  });
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRecommendations();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi && !isScrolling) {
      setIsScrolling(true);
      emblaApi.scrollPrev();
      
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
      emblaApi.scrollNext();
      
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

    // Auto-scroll functionality like HeroSection
  useEffect(() => {
    if (!emblaApi || !isAutoScrolling || recommendations.length === 0 || isScrolling) {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      return;
    }

    autoScrollInterval.current = setInterval(() => {
      if (!isScrolling) {
        scrollNext();
      }
    }, 2500); // Auto-scroll every 2.5 seconds for smoother effect

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    };
  }, [emblaApi, isAutoScrolling, recommendations.length, scrollNext, isScrolling]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    setIsAutoScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsAutoScrolling(true);
  };

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
              <div className="w-2 h-2 rounded-full bg-cinehub-accent animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 rounded-full bg-cinehub-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-slate-300">Crafting your perfect recommendations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!recommendations.length) {
    return (
      <Card className="bg-card-custom border-custom backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cinehub-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-slate-200">No recommendations yet</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Add some movies and TV shows to your watchlist and rate them to unlock your personalized recommendations!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card-custom border-custom backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cinehub-accent" />
            <CardTitle className="text-slate-200">Recommended for You</CardTitle>
          </div>
          <div>
            <p className="text-sm text-slate-400 mt-1">
              {recommendations.length} personalized picks
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            disabled={isScrolling}
            className="h-8 w-8 hover:bg-cinehub-accent/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className={`h-4 w-4 transition-opacity ${isScrolling ? 'opacity-50' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoScroll}
            className="h-8 w-8 hover:bg-cinehub-accent/10 cursor-pointer"
            title={isAutoScrolling ? "Pause auto-scroll" : "Resume auto-scroll"}
          >
            {isAutoScrolling ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            disabled={isScrolling}
            className="h-8 w-8 hover:bg-cinehub-accent/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Next"
          >
            <ChevronRight className={`h-4 w-4 transition-opacity ${isScrolling ? 'opacity-50' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 hover:bg-cinehub-accent/10 group cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <div 
          className="embla overflow-hidden cursor-pointer"
          ref={emblaRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="embla__container flex gap-4 md:gap-6">
            {recommendations.map(({ movie, tvShow, reason }, index) => (
              <div 
                key={`${movie?.id || tvShow?.id}-${index}`} 
                className="embla__slide w-[150px] md:w-[180px] flex-shrink-0 animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 0.1}s`
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
                        <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Duplicate items for seamless infinite loop */}
            {recommendations.map(({ movie, tvShow, reason }, index) => (
              <div 
                key={`duplicate-1-${movie?.id || tvShow?.id}-${index}`} 
                className="embla__slide w-[150px] md:w-[180px] flex-shrink-0"
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
                        <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Second set of duplicates for even smoother loop */}
            {recommendations.map(({ movie, tvShow, reason }, index) => (
              <div 
                key={`duplicate-2-${movie?.id || tvShow?.id}-${index}`} 
                className="embla__slide w-[150px] md:w-[180px] flex-shrink-0"
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
                        <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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