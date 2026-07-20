import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Heart, 
  Download, 
  Star, 
  MessageCircle,
  Trophy,
  Zap,
  BookmarkPlus
} from "lucide-react";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MovieActionsProps {
  title: string;
  onShare: () => void;
  id: number;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
}

export function MovieActions({ title, onShare, id, posterPath, voteAverage, voteCount, popularity }: MovieActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRated, setIsRated] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleRate = () => {
    setIsRated(!isRated);
  };

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WatchlistButton
          id={id}
          mediaType="movie"
          title={title}
          posterPath={posterPath}
          className="bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover text-slate-900 border-0 hover:from-cinehub-accent-hover hover:to-cinehub-accent hover:text-slate-900 font-bold shadow-xl hover:shadow-cinehub-accent/30 transition-all duration-300 hover:scale-105 cursor-pointer rounded-xl py-3 px-6"
        />
        
        <Button
          variant="outline"
          className="border-slate-600/40 bg-gradient-to-r from-slate-800/60 to-slate-900/60 text-white hover:from-slate-700/70 hover:to-slate-800/70 hover:border-cinehub-accent/50 hover:text-cinehub-accent backdrop-blur-sm transition-all duration-300 hover:scale-105 font-bold cursor-pointer rounded-xl py-3 px-6 shadow-lg hover:shadow-xl"
          onClick={onShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Movie
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "flex-col h-auto py-4 px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl",
            isLiked ? "text-red-400 border-red-400/40 bg-gradient-to-br from-red-500/20 to-red-600/20 shadow-red-500/20" : "text-slate-300 hover:text-red-400 hover:border-red-400/40"
          )}
        >
          <Heart className={cn("w-6 h-6 mb-2", isLiked && "fill-current")} />
          <span className="text-xs font-semibold">
            {isLiked ? "Liked" : "Like"}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRate}
          className={cn(
            "flex-col h-auto py-4 px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl",
            isRated ? "text-yellow-400 border-yellow-400/40 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 shadow-yellow-500/20" : "text-slate-300 hover:text-yellow-400 hover:border-yellow-400/40"
          )}
        >
          <Star className={cn("w-6 h-6 mb-2", isRated && "fill-current")} />
          <span className="text-xs font-semibold">
            {isRated ? "Rated" : "Rate"}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-4 px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 text-slate-300 hover:from-cinehub-accent/15 hover:to-cinehub-accent-hover/15 hover:text-cinehub-accent hover:border-cinehub-accent/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl hover:shadow-cinehub-accent/20"
        >
          <MessageCircle className="w-6 h-6 mb-2" />
          <span className="text-xs font-semibold">Review</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-4 px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 text-slate-300 hover:from-cinehub-accent/15 hover:to-cinehub-accent-hover/15 hover:text-cinehub-accent hover:border-cinehub-accent/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl hover:shadow-cinehub-accent/20"
        >
          <Download className="w-6 h-6 mb-2" />
          <span className="text-xs font-semibold">Download</span>
        </Button>
      </div>

      {/* Action Stats */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-700/40 backdrop-blur-sm shadow-xl p-3 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-3 sm:mb-6">
          <div className="text-center group cursor-pointer">
            <div className="bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent-hover/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-cinehub-accent/30 group-hover:border-cinehub-accent/50 transition-all duration-300 group-hover:scale-105 shadow-lg min-h-[60px] sm:min-h-[80px] flex flex-col justify-center">
              <div className="text-sm sm:text-2xl font-bold text-cinehub-accent mb-0.5 sm:mb-1 leading-tight">
                {voteAverage.toFixed(1)}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-300 font-medium uppercase tracking-wide leading-tight">
                Rating
              </div>
            </div>
          </div>
          
          <div className="text-center group cursor-pointer">
            <div className="bg-gradient-to-br from-cinehub-accent/16 to-cinehub-accent-hover/16 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-cinehub-accent/25 group-hover:border-cinehub-accent/45 transition-all duration-300 group-hover:scale-105 shadow-lg min-h-[60px] sm:min-h-[80px] flex flex-col justify-center">
              <div className="text-sm sm:text-2xl font-bold text-cinehub-accent mb-0.5 sm:mb-1 leading-tight">
                {voteCount >= 1000 
                  ? `${(voteCount / 1000).toFixed(1)}K` 
                  : voteCount.toLocaleString()
                }
              </div>
              <div className="text-[9px] sm:text-xs text-slate-300 font-medium uppercase tracking-wide leading-tight">
                Votes
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {popularity > 50 && (
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-cinehub-accent/20 to-cinehub-accent-hover/20 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full border border-cinehub-accent/40 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cinehub-accent/25">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-cinehub-accent flex-shrink-0" />
              <span className="text-[9px] sm:text-sm font-bold text-cinehub-accent whitespace-nowrap">
                Trending
              </span>
            </div>
          )}
          {voteAverage >= 7.0 && (
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-cinehub-accent/18 to-cinehub-accent-hover/18 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full border border-cinehub-accent/35 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cinehub-accent/25">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-cinehub-accent flex-shrink-0" />
              <span className="text-[9px] sm:text-sm font-bold text-cinehub-accent whitespace-nowrap">Good Rating</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
