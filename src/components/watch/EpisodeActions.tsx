import { Button } from "@/components/ui/button";
import {
  Share2,
  Heart,
  Download,
  Star,
  MessageCircle,
  Trophy,
  Zap,
  Calendar,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface EpisodeActionsProps {
  showTitle: string;
  episodeTitle: string;
  onShare: () => void;
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  popularity?: number;
  runtime?: number;
  airDate?: string;
  seasons: Array<{
    season_number: number;
    name?: string;
    episode_count?: number;
  }>;
  onSeasonChange: (seasonNumber: string) => void;
  onEpisodeChange: (direction: "next" | "prev") => void;
  hasNextEpisode: boolean;
  hasPreviousEpisode: boolean;
}

export function EpisodeActions({
  showTitle,
  episodeTitle,
  onShare,
  showId,
  seasonNumber,
  episodeNumber,
  posterPath,
  voteAverage,
  voteCount,
  popularity = 0,
  runtime,
  airDate,
  seasons,
  onSeasonChange,
  onEpisodeChange,
  hasNextEpisode,
  hasPreviousEpisode,
}: EpisodeActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRated, setIsRated] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleRate = () => {
    setIsRated(!isRated);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Primary Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <WatchlistButton
          id={showId}
          mediaType="tv"
          title={showTitle}
          posterPath={posterPath}
          className="w-full bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover text-slate-900 border-0 hover:from-cinehub-accent-hover hover:to-cinehub-accent hover:text-slate-900 font-bold shadow-xl hover:shadow-cinehub-accent/30 transition-all duration-300 hover:scale-105 cursor-pointer rounded-xl py-3 px-4 sm:px-6 text-sm sm:text-base"
        />

        <Button
          variant="outline"
          className="w-full border-slate-600/40 bg-gradient-to-r from-slate-800/60 to-slate-900/60 text-white hover:from-slate-700/70 hover:to-slate-800/70 hover:border-cinehub-accent/50 hover:text-cinehub-accent backdrop-blur-sm transition-all duration-300 hover:scale-105 font-bold cursor-pointer rounded-xl py-3 px-4 sm:px-6 text-sm sm:text-base"
          onClick={onShare}
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Share Episode
        </Button>
      </div>

      {/* Episode Navigation - Mobile First Design */}
      <div className="space-y-3 sm:space-y-0">
        {/* Season Selector - Full width on mobile */}
        <div className="w-full sm:hidden">
          <Select
            value={seasonNumber.toString()}
            onValueChange={onSeasonChange}
          >
            <SelectTrigger className="w-full h-12 px-4 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 text-slate-300 hover:from-purple-500/20 hover:to-purple-600/20 hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl hover:shadow-purple-500/20 data-[state=open]:scale-105 data-[state=open]:border-purple-400/50">
              <div className="flex items-center justify-center gap-2 w-full">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Season {seasonNumber}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 min-w-[200px]">
              {seasons.map((s) => (
                <SelectItem
                  key={s.season_number}
                  value={s.season_number.toString()}
                  className="text-slate-300 hover:bg-cinehub-accent/20 cursor-pointer transition-colors duration-200 focus:bg-cinehub-accent/20 focus:text-cinehub-accent"
                >
                  Season {s.season_number}{" "}
                  {s.episode_count && `(${s.episode_count} eps)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Previous/Next Buttons - Side by side on all screens */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <Button
            variant="ghost"
            onClick={() => onEpisodeChange("prev")}
            disabled={!hasPreviousEpisode}
            className={cn(
              "flex items-center justify-center gap-2 h-12 px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl",
              !hasPreviousEpisode
                ? "opacity-50 cursor-not-allowed hover:scale-100"
                : "text-slate-300 hover:text-blue-400 hover:border-blue-400/40 hover:shadow-blue-500/20"
            )}
          >
            <SkipBack className="w-4 h-4" />
            <span className="text-xs font-semibold">Previous</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => onEpisodeChange("next")}
            disabled={!hasNextEpisode}
            className={cn(
              "flex items-center justify-center gap-2 h-12 px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl",
              !hasNextEpisode
                ? "opacity-50 cursor-not-allowed hover:scale-100"
                : "text-slate-300 hover:text-blue-400 hover:border-blue-400/40 hover:shadow-blue-500/20"
            )}
          >
            <span className="text-xs font-semibold">Next</span>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-8 sm:items-center">
          {/* Previous Button - Left Column */}
          <div className="flex justify-start">
            <Button
              variant="ghost"
              onClick={() => onEpisodeChange("prev")}
              disabled={!hasPreviousEpisode}
              className={cn(
                "flex items-center gap-3 h-14 px-8 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl min-w-[140px]",
                !hasPreviousEpisode
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : "text-slate-300 hover:text-blue-400 hover:border-blue-400/40 hover:shadow-blue-500/20"
              )}
            >
              <SkipBack className="w-5 h-5" />
              <span className="text-sm font-semibold">Previous</span>
            </Button>
          </div>

          {/* Season Selector - Center Column */}
          <div className="flex justify-center">
            <Select
              value={seasonNumber.toString()}
              onValueChange={onSeasonChange}
            >
              <SelectTrigger className="w-full max-w-[280px] h-14 px-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 text-slate-300 hover:from-purple-500/20 hover:to-purple-600/20 hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl hover:shadow-purple-500/20 data-[state=open]:scale-105 data-[state=open]:border-purple-400/50">
                <div className="flex items-center justify-center gap-3 w-full">
                  <Calendar className="w-5 h-5" />
                  <span className="text-base font-semibold">
                    Season {seasonNumber}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 min-w-[280px]">
                {seasons.map((s) => (
                  <SelectItem
                    key={s.season_number}
                    value={s.season_number.toString()}
                    className="text-slate-300 hover:bg-cinehub-accent/20 cursor-pointer transition-colors duration-200 focus:bg-cinehub-accent/20 focus:text-cinehub-accent"
                  >
                    Season {s.season_number}{" "}
                    {s.episode_count && `(${s.episode_count} eps)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Next Button - Right Column */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => onEpisodeChange("next")}
              disabled={!hasNextEpisode}
              className={cn(
                "flex items-center gap-3 h-14 px-8 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl min-w-[140px]",
                !hasNextEpisode
                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                  : "text-slate-300 hover:text-blue-400 hover:border-blue-400/40 hover:shadow-blue-500/20"
              )}
            >
              <span className="text-sm font-semibold">Next</span>
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "flex-col h-auto py-3 sm:py-4 px-2 sm:px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl",
            isLiked
              ? "text-red-400 border-red-400/40 bg-gradient-to-br from-red-500/20 to-red-600/20 shadow-red-500/20"
              : "text-slate-300 hover:text-red-400 hover:border-red-400/40"
          )}
        >
          <Heart
            className={cn(
              "w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2",
              isLiked && "fill-current"
            )}
          />
          <span className="text-[10px] sm:text-xs font-semibold">
            {isLiked ? "Liked" : "Like"}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRate}
          className={cn(
            "flex-col h-auto py-3 sm:py-4 px-2 sm:px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl",
            isRated
              ? "text-yellow-400 border-yellow-400/40 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 shadow-yellow-500/20"
              : "text-slate-300 hover:text-yellow-400 hover:border-yellow-400/40"
          )}
        >
          <Star
            className={cn(
              "w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2",
              isRated && "fill-current"
            )}
          />
          <span className="text-[10px] sm:text-xs font-semibold">
            {isRated ? "Rated" : "Rate"}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-3 sm:py-4 px-2 sm:px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 text-slate-300 hover:from-blue-500/20 hover:to-blue-600/20 hover:text-blue-400 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          <span className="text-[10px] sm:text-xs font-semibold">Review</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-3 sm:py-4 px-2 sm:px-3 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 text-slate-300 hover:from-green-500/20 hover:to-green-600/20 hover:text-green-400 hover:border-green-400/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl hover:shadow-green-500/20"
        >
          <Download className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          <span className="text-[10px] sm:text-xs font-semibold">Download</span>
        </Button>
      </div>

      {/* Episode Stats */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-700/40 backdrop-blur-sm shadow-xl p-3 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-3 sm:mb-6">
          <div className="text-center group cursor-pointer">
            <div className="bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent-hover/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-cinehub-accent/30 group-hover:border-cinehub-accent/50 transition-all duration-300 group-hover:scale-105 shadow-lg min-h-[50px] sm:min-h-[80px] flex flex-col justify-center">
              <div className="text-base sm:text-2xl font-bold text-cinehub-accent mb-0.5 sm:mb-1 leading-tight">
                {voteAverage > 0 ? voteAverage.toFixed(1) : "N/A"}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-medium uppercase tracking-wide leading-tight">
                Rating
              </div>
            </div>
          </div>

          <div className="text-center group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-500/30 group-hover:border-blue-500/50 transition-all duration-300 group-hover:scale-105 shadow-lg min-h-[50px] sm:min-h-[80px] flex flex-col justify-center">
              <div className="text-base sm:text-2xl font-bold text-blue-400 mb-0.5 sm:mb-1 leading-tight">
                {voteCount >= 1000
                  ? `${(voteCount / 1000).toFixed(1)}K`
                  : voteCount > 0
                  ? voteCount.toLocaleString()
                  : "0"}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-medium uppercase tracking-wide leading-tight">
                Votes
              </div>
            </div>
          </div>
        </div>

        {/* Episode Info Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          {runtime && (
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-2 sm:p-3 border border-purple-500/30 group-hover:border-purple-500/50 transition-all duration-300 group-hover:scale-105 shadow-lg min-h-[40px] sm:min-h-[60px] flex flex-col justify-center">
                <div className="text-sm sm:text-lg font-bold text-purple-400 mb-0.5 leading-tight">
                  {runtime}m
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-300 font-medium uppercase tracking-wide leading-tight">
                  Runtime
                </div>
              </div>
            </div>
          )}

          {airDate && (
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg p-2 sm:p-3 border border-emerald-500/30 group-hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-105 shadow-lg min-h-[40px] sm:min-h-[60px] flex flex-col justify-center">
                <div className="text-sm sm:text-lg font-bold text-emerald-400 mb-0.5 leading-tight">
                  {new Date(airDate).getFullYear()}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-300 font-medium uppercase tracking-wide leading-tight">
                  Aired
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
          {popularity > 50 && (
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-cinehub-accent/20 to-cinehub-accent-hover/20 px-2 sm:px-4 py-1 sm:py-2.5 rounded-full border border-cinehub-accent/40 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cinehub-accent/25">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-cinehub-accent flex-shrink-0" />
              <span className="text-[10px] sm:text-sm font-bold text-cinehub-accent whitespace-nowrap">
                Trending
              </span>
            </div>
          )}
          {voteAverage >= 7.0 && (
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500/20 to-green-600/20 px-2 sm:px-4 py-1 sm:py-2.5 rounded-full border border-green-500/40 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
              <span className="text-[10px] sm:text-sm font-bold text-green-400 whitespace-nowrap">
                Good Rating
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
