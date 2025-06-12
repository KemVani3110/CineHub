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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TVShowSeasonsProps {
  tvShow: TMDBTVDetails;
}

const TVShowSeasons = ({ tvShow }: TVShowSeasonsProps) => {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set()
  );

  const toggleSeasonExpansion = (seasonNumber: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
    }
    setExpandedSeasons(newExpanded);
  };

  const handleEpisodeClick = (seasonNumber: number, episodeNumber: number) => {
    window.location.href = `/watch-tv/${tvShow.id}/season/${seasonNumber}/episode/${episodeNumber}`;
  };

  const { data: seasonDetails, isLoading } = useQuery({
    queryKey: ["season", tvShow.id, Array.from(expandedSeasons)],
    queryFn: async () => {
      const seasonDetailsMap = new Map();
      for (const seasonNumber of expandedSeasons) {
        const details = await fetchSeasonDetails(tvShow.id, seasonNumber);
        seasonDetailsMap.set(seasonNumber, details);
      }
      return seasonDetailsMap;
    },
    enabled: expandedSeasons.size > 0,
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
    <div className="space-y-8">
      {/* Season Summary Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1b263b] via-[#1b263b] to-[#2e3c51]/30 rounded-2xl p-6 border border-[#2e3c51]/50 backdrop-blur-sm animate-fadeInUp">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4fd1c5]/5 via-transparent to-[#4fd1c5]/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4fd1c5]/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-[#9aafc3] mb-4 sm:mb-0">
            <div className="flex items-center gap-3 bg-[#2e3c51]/50 rounded-full px-4 py-2 backdrop-blur-sm border border-[#4fd1c5]/20">
              <div className="w-2 h-2 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] rounded-full animate-pulse"></div>
              <span className="font-semibold text-sm">
                <span className="text-[#4fd1c5]">{tvShow.seasons.length}</span>{" "}
                Seasons
              </span>
            </div>
            <div className="flex items-center gap-3 bg-[#2e3c51]/50 rounded-full px-4 py-2 backdrop-blur-sm border border-[#4fd1c5]/20">
              <div className="w-2 h-2 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] rounded-full animate-pulse"></div>
              <span className="font-semibold text-sm">
                <span className="text-[#4fd1c5]">{totalEpisodes}</span> Episodes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seasons List */}
      <div className="space-y-8">
        {tvShow.seasons.map((season, index) => (
          <div
            key={season.id}
            className="animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card className="group relative bg-gradient-to-br from-[#1b263b] via-[#1b263b] to-[#2e3c51]/20 border-[#2e3c51] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-[#4fd1c5]/20 hover:border-[#4fd1c5]/50 hover:transform hover:scale-[1.02] backdrop-blur-sm">
              <CardContent className="p-0 relative z-10">
                {/* Season Header */}
                <div
                  className="flex flex-col lg:flex-row gap-6 p-8 cursor-pointer relative overflow-hidden"
                  onClick={() => toggleSeasonExpansion(season.season_number)}
                >
                  {/* Ripple effect on click */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4fd1c5]/10 via-[#4fd1c5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Season Poster */}
                  <div className="relative w-full lg:w-36 h-52 lg:h-64 flex-shrink-0 mx-auto lg:mx-0 group-hover:scale-105 transition-all duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4fd1c5]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                    <img
                      src={getImageUrl(season.poster_path || null, "w500")}
                      alt={season.name}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl group-hover:shadow-[#4fd1c5]/30 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl"></div>

                    {/* Floating badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] text-[#0d1b2a] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      S{season.season_number}
                    </div>
                  </div>

                  {/* Season Info */}
                  <div className="flex-1 space-y-5 min-w-0 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#e0e6ed] to-[#9aafc3] bg-clip-text text-transparent group-hover:from-white group-hover:to-[#4fd1c5] transition-all duration-500">
                          {season.name}
                        </h3>
                        <div className="h-1 w-12 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] rounded-full opacity-0 group-hover:opacity-100 group-hover:w-20 transition-all duration-500"></div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-[#2e3c51] to-[#1b263b] text-[#9aafc3] px-5 py-2 text-sm font-semibold rounded-full border border-[#4fd1c5]/20 group-hover:from-[#4fd1c5]/20 group-hover:to-[#36c7b8]/20 group-hover:text-[#4fd1c5] group-hover:border-[#4fd1c5]/50 transition-all duration-500 backdrop-blur-sm"
                        >
                          {season.episode_count} episodes
                        </Badge>
                        <div className="p-3 rounded-full bg-gradient-to-r from-[#2e3c51] to-[#1b263b] border border-[#4fd1c5]/20 group-hover:from-[#4fd1c5]/20 group-hover:to-[#36c7b8]/20 group-hover:border-[#4fd1c5]/50 transition-all duration-500 backdrop-blur-sm">
                          {expandedSeasons.has(season.season_number) ? (
                            <ChevronUp className="w-5 h-5 text-[#4fd1c5] group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#4fd1c5] group-hover:scale-110 transition-transform duration-300" />
                          )}
                        </div>
                      </div>
                    </div>

                    {season.overview && (
                      <p className="text-[#9aafc3] text-base lg:text-lg leading-relaxed line-clamp-3 group-hover:text-[#b8c5d1] transition-colors duration-500">
                        {season.overview}
                      </p>
                    )}

                    <div className="flex items-center gap-8 text-sm">
                      {season.air_date && (
                        <div className="flex items-center gap-3 group-hover:text-[#4fd1c5] transition-colors duration-500">
                          <div className="p-2 bg-[#2e3c51]/50 rounded-full group-hover:bg-[#4fd1c5]/20 transition-colors duration-300">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="font-semibold">
                            {format(new Date(season.air_date), "yyyy")}
                          </span>
                        </div>
                      )}
                      {season.vote_average > 0 && (
                        <div className="flex items-center gap-3 group-hover:text-yellow-400 transition-colors duration-500">
                          <div className="p-2 bg-[#2e3c51]/50 rounded-full group-hover:bg-yellow-500/20 transition-colors duration-300">
                            <Star
                              className="w-4 h-4 text-yellow-500 group-hover:text-yellow-400"
                              fill="currentColor"
                            />
                          </div>
                          <span className="font-semibold">
                            {season.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Episodes List */}
                <div
                  className={`border-t border-[#2e3c51]/50 bg-gradient-to-b from-[#0d1b2a]/30 to-[#0d1b2a]/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedSeasons.has(season.season_number)
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {isLoading || !seasonDetails?.has(season.season_number) ? (
                    <div className="p-8 space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex gap-5 p-4 bg-[#1b263b]/50 rounded-xl backdrop-blur-sm"
                        >
                          <Skeleton className="w-36 h-24 rounded-xl" />
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="w-full">
                      <div className="p-8">
                        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                          {seasonDetails
                            .get(season.season_number)
                            ?.episodes.map(
                              (episode: TMDBEpisode, episodeIndex: number) => (
                                <div
                                  key={episode.id}
                                  className="group/episode relative flex gap-5 p-5 bg-gradient-to-br from-[#1b263b] via-[#1b263b] to-[#2e3c51]/20 rounded-2xl hover:from-[#2e3c51]/50 hover:to-[#1b263b] transition-all duration-500 cursor-pointer border border-[#2e3c51]/30 hover:border-[#4fd1c5]/40 hover:shadow-xl hover:shadow-[#4fd1c5]/10 backdrop-blur-sm hover:scale-105 animate-fadeIn"
                                  style={{ animationDelay: `${episodeIndex * 50}ms` }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEpisodeClick(
                                      season.season_number,
                                      episode.episode_number
                                    );
                                  }}
                                >
                                  {/* Episode Thumbnail */}
                                  <div className="relative w-32 lg:w-36 h-20 lg:h-24 flex-shrink-0 rounded-xl overflow-hidden group-hover/episode:scale-105 transition-transform duration-500">
                                    <img
                                      src={getImageUrl(
                                        episode.still_path || null,
                                        "w500"
                                      )}
                                      alt={episode.name}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover/episode:scale-110"
                                    />
                                    {/* Play Button */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent flex items-center justify-center">
                                      <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-r from-[#4fd1c5] to-[#36c7b8] rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover/episode:opacity-100 transform scale-0 group-hover/episode:scale-100 transition-all duration-500">
                                          <Play
                                            className="w-5 h-5 text-[#0d1b2a] ml-0.5"
                                            fill="currentColor"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Episode Info */}
                                  <div className="flex-1 min-w-0 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <h5 className="font-bold text-[#e0e6ed] text-sm lg:text-base line-clamp-2 group-hover/episode:text-white group-hover/episode:text-shadow transition-all duration-300">
                                        <span className="text-[#4fd1c5] font-mono">
                                          {episode.episode_number
                                            .toString()
                                            .padStart(2, "0")}
                                        </span>
                                        . {episode.name}
                                      </h5>
                                      {episode.vote_average > 0 && (
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#2e3c51] to-[#1b263b] rounded-full px-3 py-1 border border-[#4fd1c5]/20 backdrop-blur-sm">
                                          <Star
                                            className="w-3 h-3 text-yellow-500"
                                            fill="currentColor"
                                          />
                                          <span className="text-[#9aafc3] text-xs font-bold">
                                            {episode.vote_average.toFixed(1)}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-[#9aafc3]">
                                      {episode.air_date && (
                                        <div className="flex items-center gap-2 bg-[#2e3c51]/30 rounded-full px-2 py-1">
                                          <Calendar className="w-3 h-3" />
                                          <span className="font-medium">
                                            {format(
                                              new Date(episode.air_date),
                                              "MMM d, yyyy"
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {episode.runtime && (
                                        <div className="flex items-center gap-2 bg-[#2e3c51]/30 rounded-full px-2 py-1">
                                          <Clock className="w-3 h-3" />
                                          <span className="font-medium">
                                            {episode.runtime} min
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {episode.overview && (
                                      <p className="text-[#9aafc3] text-xs lg:text-sm line-clamp-2 leading-relaxed group-hover/episode:text-[#b8c5d1] transition-colors duration-300">
                                        {episode.overview}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                      <ScrollBar orientation="horizontal" className="mt-2" />
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVShowSeasons;