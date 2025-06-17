import { useRecommendations } from '@/hooks/useRecommendations';
import { MovieCard } from './MovieCard';
import { TVShowCard } from './TVShowCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { useEffect, useRef, useState } from 'react';

interface Recommendation {
  movie?: TMDBMovie;
  tvShow?: TMDBTVShow;
  reason: string;
}

export function Recommendations() {
  const { recommendations, isLoading, error, refreshRecommendations } = useRecommendations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const isHovering = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRecommendations();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    if (!scrollRef.current || recommendations.length === 0) return;

    const scrollContainer = scrollRef.current;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    let scrollPosition = 0;
    const scrollSpeed = 1; // pixels per frame

    const animate = () => {
      if (!isHovering.current) {
        scrollPosition += scrollSpeed;
        
        // If we've scrolled to the end, reset to the beginning
        if (scrollPosition >= scrollWidth - clientWidth) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Pause scrolling when hovering
    const handleMouseEnter = () => {
      isHovering.current = true;
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [recommendations]);

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
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 hover:bg-cinehub-accent/10 group"
          >
            <RefreshCw className={`h-4 w-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <ScrollArea className="w-full">
          <div 
            ref={scrollRef}
            className="flex gap-4 pb-4 md:gap-6 overflow-x-auto scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
          >
            {recommendations.map(({ movie, tvShow, reason }, index) => (
              <div 
                key={movie?.id || tvShow?.id} 
                className="w-[150px] md:w-[180px] flex-shrink-0 animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="space-y-2">
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
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        :global(.animate-fadeInUp) {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}