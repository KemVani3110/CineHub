"use client";

import { TMDBTVDetails, TMDBEpisode } from "@/types/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Play,
  Film,
} from "lucide-react";
import { getImageUrl, fetchSeasonDetails } from "@/services/tmdb";
import { useState, useCallback, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface TVShowSeasonsProps {
  tvShow: TMDBTVDetails;
}

// Image fallback component for episode thumbnails
const EpisodeImageWithFallback = memo(
  ({ src, alt, hasImage }: { src: string; alt: string; hasImage: boolean }) => {
    const [error, setError] = useState(false);

    if (error || !hasImage) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
          <Film className="w-8 h-8 text-slate-400" />
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 25vw"
        className="object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  }
);

EpisodeImageWithFallback.displayName = "EpisodeImageWithFallback";

// Image fallback component for season posters
const SeasonImageWithFallback = memo(
  ({ src, alt, hasImage }: { src: string; alt: string; hasImage: boolean }) => {
    const [error, setError] = useState(false);

    if (error || !hasImage) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
          <Film className="w-12 h-12 text-slate-400" />
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 30vw, 20vw"
        className="object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  }
);

SeasonImageWithFallback.displayName = "SeasonImageWithFallback";

// Memoized Episode Card component for better performance
const EpisodeCard = memo(
  ({
    episode,
    seasonNumber,
    episodeIndex,
    onClick,
  }: {
    episode: TMDBEpisode;
    seasonNumber: number;
    episodeIndex: number;
    onClick: (seasonNumber: number, episodeNumber: number) => void;
  }) => {
    // Check if episode is available (aired)
    const isAvailable =
      !episode.air_date || new Date(episode.air_date) <= new Date();
    const isComingSoon =
      episode.air_date && new Date(episode.air_date) > new Date();

    return (
      <div
        className={`group/episode relative w-full bg-gradient-to-br from-[#1b263b] to-[#2e3c51]/40 rounded-xl border border-[#2e3c51]/30 transition-colors duration-200 overflow-hidden ${
          isAvailable
            ? "hover:border-[#4fd1c5]/40 cursor-pointer"
            : "opacity-60 cursor-not-allowed border-[#2e3c51]/20"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (isAvailable) {
            onClick(seasonNumber, episode.episode_number);
          }
        }}
      >
        {/* Episode Thumbnail */}
        <div className="relative w-full aspect-video rounded-t-xl overflow-hidden">
          <EpisodeImageWithFallback
            src={getImageUrl(episode.still_path || null, "w500")}
            alt={episode.name}
            hasImage={!!episode.still_path}
          />

          {/* Play Button Overlay or Coming Soon */}
          {isComingSoon ? (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center justify-center">
              <div className="bg-gradient-to-r from-[#f4b400] to-[#e6a800] rounded-full px-4 py-2 shadow-lg mb-2 border border-[#f4b400]/30">
                <span className="text-[#0d1b2a] text-xs font-bold">
                  Coming Soon
                </span>
              </div>
              {episode.air_date && (
                <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-xs font-medium">
                    {format(new Date(episode.air_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover/episode:opacity-100 transition-opacity duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] rounded-full flex items-center justify-center shadow-lg">
                <Play
                  className="w-5 h-5 text-[#0d1b2a] ml-0.5"
                  fill="currentColor"
                />
              </div>
            </div>
          )}

          {/* Episode Number Badge */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-[#4fd1c5] font-mono text-xs font-bold">
              {episode.episode_number.toString().padStart(2, "0")}
            </span>
          </div>

          {/* Rating Badge */}
          {episode.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
              <span className="text-white text-xs font-medium">
                {episode.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Episode Info */}
        <div className="p-4 space-y-3 w-full">
          <h5
            className={`font-semibold text-sm line-clamp-2 break-words transition-colors duration-200 ${
              isAvailable
                ? "text-[#e0e6ed] group-hover/episode:text-white"
                : "text-[#9aafc3]"
            }`}
          >
            {episode.name}
          </h5>

          {episode.overview && (
            <p className="text-[#9aafc3] text-xs line-clamp-2 leading-relaxed break-words">
              {episode.overview}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-[#9aafc3] flex-wrap gap-2">
            {episode.air_date && (
              <div className="flex items-center gap-1 min-w-0">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span
                  className={`truncate ${
                    isComingSoon ? "text-[#f4b400] font-medium" : ""
                  }`}
                >
                  {format(new Date(episode.air_date), "MMM d")}
                  {isComingSoon && " (upcoming)"}
                </span>
              </div>
            )}
            {episode.runtime && (
              <div className="flex items-center gap-1 min-w-0">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{episode.runtime}m</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

EpisodeCard.displayName = "EpisodeCard";

// Memoized Season Card component
const SeasonCard = memo(
  ({
    season,
    index,
    isExpanded,
    onToggle,
    seasonDetails,
    isLoading,
    onEpisodeClick,
  }: {
    season: any;
    index: number;
    isExpanded: boolean;
    onToggle: (seasonNumber: number) => void;
    seasonDetails: Map<number, any> | undefined;
    isLoading: boolean;
    onEpisodeClick: (seasonNumber: number, episodeNumber: number) => void;
  }) => (
    <Card className="group w-full bg-gradient-to-br from-[#1b263b] to-[#2e3c51]/20 border-[#2e3c51] hover:border-[#4fd1c5]/50 transition-colors duration-200 hover:shadow-lg hover:shadow-[#4fd1c5]/10 overflow-hidden will-change-auto">
      <CardContent className="p-0 w-full">
        {/* Season Header */}
        <div
          className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 cursor-pointer w-full"
          onClick={() => onToggle(season.season_number)}
        >
          {/* Season Poster */}
          <div className="relative w-24 sm:w-32 h-36 sm:h-48 flex-shrink-0 mx-auto sm:mx-0">
            <div className="relative w-full h-full rounded-xl shadow-lg overflow-hidden">
              <SeasonImageWithFallback
                src={getImageUrl(season.poster_path || null, "w500")}
                alt={season.name}
                hasImage={!!season.poster_path}
              />
            </div>
            {/* Season Number Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] text-[#0d1b2a] text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              S{season.season_number}
            </div>
          </div>

          {/* Season Info */}
          <div className="flex-1 space-y-3 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-[#e0e6ed] group-hover:text-white transition-colors duration-200 min-w-0 truncate">
                {season.name}
              </h3>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge className="bg-[#2e3c51]/50 text-[#9aafc3] border-[#4fd1c5]/20 hover:bg-[#4fd1c5]/20 hover:text-[#4fd1c5] transition-colors duration-200 whitespace-nowrap">
                  {season.episode_count} episodes
                </Badge>
                <div className="p-2 rounded-full bg-[#2e3c51]/50 border border-[#4fd1c5]/20 hover:bg-[#4fd1c5]/20 transition-colors duration-200">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#4fd1c5]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#4fd1c5]" />
                  )}
                </div>
              </div>
            </div>

            {season.overview && (
              <p className="text-[#9aafc3] text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">
                {season.overview}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 text-sm flex-wrap">
              {season.air_date && (
                <div className="flex items-center gap-2 text-[#9aafc3]">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(season.air_date), "yyyy")}</span>
                </div>
              )}
              {season.vote_average > 0 && (
                <div className="flex items-center gap-2 text-[#9aafc3]">
                  <Star
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                  />
                  <span>{season.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div
          className={`border-t border-[#2e3c51]/50 bg-[#0d1b2a]/30 overflow-hidden transition-all duration-300 ease-in-out w-full ${
            isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {isLoading || !seasonDetails?.has(season.season_number) ? (
            <div className="p-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                {Array.from({ length: Math.min(season.episode_count, 8) }).map(
                  (_, i) => (
                    <div key={i} className="space-y-3 animate-pulse w-full">
                      <Skeleton className="w-full aspect-video rounded-xl bg-[#2e3c51]/50" />
                      <Skeleton className="h-4 w-3/4 bg-[#2e3c51]/50" />
                      <Skeleton className="h-3 w-1/2 bg-[#2e3c51]/50" />
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div
              className="p-4 max-h-[600px] overflow-y-auto w-full transform-gpu will-change-scroll scrollbar-thin scrollbar-track-[#1b263b] scrollbar-thumb-[#4fd1c5]/30 hover:scrollbar-thumb-[#4fd1c5]/50"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                {seasonDetails
                  .get(season.season_number)
                  ?.episodes.map(
                    (episode: TMDBEpisode, episodeIndex: number) => (
                      <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        seasonNumber={season.season_number}
                        episodeIndex={0}
                        onClick={onEpisodeClick}
                      />
                    )
                  )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);

SeasonCard.displayName = "SeasonCard";

const TVShowSeasons = ({ tvShow }: TVShowSeasonsProps) => {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set()
  );

  const toggleSeasonExpansion = useCallback((seasonNumber: number) => {
    setExpandedSeasons((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(seasonNumber)) {
        newExpanded.delete(seasonNumber);
      } else {
        newExpanded.add(seasonNumber);
      }
      return newExpanded;
    });
  }, []);

  const handleEpisodeClick = useCallback(
    (seasonNumber: number, episodeNumber: number) => {
      window.location.href = `/watch-tv/${tvShow.id}/season/${seasonNumber}/episode/${episodeNumber}`;
    },
    [tvShow.id]
  );

  const { data: seasonDetails, isLoading } = useQuery({
    queryKey: ["season", tvShow.id, Array.from(expandedSeasons)],
    queryFn: async (): Promise<Map<number, any>> => {
      const seasonDetailsMap = new Map<number, any>();
      for (const seasonNumber of expandedSeasons) {
        try {
          const details = await fetchSeasonDetails(tvShow.id, seasonNumber);
          seasonDetailsMap.set(seasonNumber, details);
        } catch (error) {
          console.error(`Failed to fetch season ${seasonNumber}:`, error);
        }
      }
      return seasonDetailsMap;
    },
    enabled: expandedSeasons.size > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in newer versions)
  });

  if (!tvShow.seasons?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#1b263b] rounded-full flex items-center justify-center">
          <Film className="w-8 h-8 text-[#9aafc3]" />
        </div>
        <p className="text-[#9aafc3] text-lg">No seasons available yet.</p>
      </div>
    );
  }

  const totalEpisodes = tvShow.seasons.reduce(
    (total, season) => total + (season.episode_count || 0),
    0
  );

  return (
    <div className="w-full max-w-none space-y-6 overflow-hidden">
      {/* Season Summary Stats */}
      <div className="bg-gradient-to-br from-[#1b263b] to-[#2e3c51]/30 rounded-xl p-4 sm:p-6 border border-[#2e3c51]/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 bg-[#2e3c51]/50 rounded-full px-4 py-2 border border-[#4fd1c5]/20 min-w-0 shrink-0">
            <div className="w-2 h-2 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] rounded-full"></div>
            <span className="text-sm font-semibold text-[#9aafc3] whitespace-nowrap">
              <span className="text-[#4fd1c5]">{tvShow.seasons.length}</span>{" "}
              Seasons
            </span>
          </div>
          <div className="flex items-center gap-3 bg-[#2e3c51]/50 rounded-full px-4 py-2 border border-[#4fd1c5]/20 min-w-0 shrink-0">
            <div className="w-2 h-2 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] rounded-full"></div>
            <span className="text-sm font-semibold text-[#9aafc3] whitespace-nowrap">
              <span className="text-[#4fd1c5]">{totalEpisodes}</span> Episodes
            </span>
          </div>
        </div>
      </div>

      {/* Seasons List */}
      <div className="space-y-6 w-full">
        {tvShow.seasons.map((season, index) => (
          <SeasonCard
            key={season.id}
            season={season}
            index={index}
            isExpanded={expandedSeasons.has(season.season_number)}
            onToggle={toggleSeasonExpansion}
            seasonDetails={seasonDetails}
            isLoading={isLoading}
            onEpisodeClick={handleEpisodeClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TVShowSeasons;
