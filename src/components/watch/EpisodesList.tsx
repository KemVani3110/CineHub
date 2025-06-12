"use client";

import { TMDBEpisode } from "@/types/tmdb";
import { format } from "date-fns";
import { Calendar, Clock, Star, Play, Grid, List } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EpisodesListProps {
  episodes: TMDBEpisode[];
  showId: number;
  seasonNumber: number;
  currentEpisodeNumber?: number;
}

export function EpisodesList({
  episodes,
  showId,
  seasonNumber,
  currentEpisodeNumber,
}: EpisodesListProps) {
  const router = useRouter();
  type ViewMode = "detailed" | "compact";
  const [viewMode, setViewMode] = useState<ViewMode>("detailed");

  const handleEpisodeClick = (episodeNumber: number) => {
    router.push(
      `/watch-tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`
    );
  };

  // Detailed View (Original)
  if (viewMode === "detailed") {
    return (
      <div className="space-y-4">
        {/* View Toggle */}
        <div className="flex justify-end">
          <div className="flex gap-1 bg-card-custom border border-custom rounded-lg p-1">
            <Button
              variant={
                viewMode === ("detailed" as ViewMode) ? "default" : "ghost"
              }
              size="sm"
              onClick={() => setViewMode("detailed")}
              className="px-3 py-1.5 text-xs cursor-pointer"
            >
              <List className="w-3 h-3 mr-1" />
              Detailed
            </Button>
            <Button
              variant={
                viewMode === ("compact" as ViewMode) ? "default" : "ghost"
              }
              size="sm"
              onClick={() => setViewMode("compact")}
              className="px-3 py-1.5 text-xs cursor-pointer"
            >
              <Grid className="w-3 h-3 mr-1" />
              Compact
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className={`flex gap-4 p-4 bg-card-custom rounded-lg border border-custom hover:bg-accent/5 hover:border-accent/20 transition-all duration-300 group cursor-pointer ${
                currentEpisodeNumber === episode.episode_number
                  ? "ring-2 ring-accent bg-accent/5 border-accent/20"
                  : ""
              }`}
              onClick={() => handleEpisodeClick(episode.episode_number)}
            >
              {/* Episode Thumbnail */}
              <div className="relative w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {episode.still_path ? (
                  <img
                    src={getImageUrl(episode.still_path, "w500")}
                    alt={episode.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Play className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play
                      className="w-5 h-5 text-white ml-0.5"
                      fill="currentColor"
                    />
                  </div>
                </div>

                {/* Episode Number Badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {episode.episode_number}
                </div>
              </div>

              {/* Episode Info */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title and Rating */}
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 group-hover:text-accent transition-colors">
                    {episode.name}
                  </h5>
                  {episode.vote_average > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0 bg-accent/20 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-accent fill-current" />
                      <span className="text-accent text-xs font-medium">
                        {episode.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Air Date and Runtime */}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-sub">
                  {episode.air_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(episode.air_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  {episode.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{episode.runtime} min</span>
                    </div>
                  )}
                </div>

                {/* Overview */}
                {episode.overview && (
                  <p className="text-xs sm:text-sm text-sub line-clamp-2 leading-relaxed">
                    {episode.overview}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Compact Grid View
  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex gap-1 bg-card-custom border border-custom rounded-lg p-1">
          <Button
            variant={
              viewMode === ("detailed" as ViewMode) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setViewMode("detailed")}
            className="px-3 py-1.5 text-xs cursor-pointer"
          >
            <List className="w-3 h-3 mr-1" />
            Detailed
          </Button>
          <Button
            variant={viewMode === ("compact" as ViewMode) ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("compact")}
            className="px-3 py-1.5 text-xs cursor-pointer"
          >
            <Grid className="w-3 h-3 mr-1" />
            Compact
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {episodes.map((episode) => (
          <div
            key={episode.id}
            className={`bg-card-custom rounded-lg border border-custom hover:bg-accent/5 hover:border-accent/20 transition-all duration-300 group cursor-pointer overflow-hidden ${
              currentEpisodeNumber === episode.episode_number
                ? "ring-2 ring-accent bg-accent/5 border-accent/20"
                : ""
            }`}
            onClick={() => handleEpisodeClick(episode.episode_number)}
          >
            {/* Episode Thumbnail */}
            <div className="relative aspect-video w-full bg-muted">
              {episode.still_path ? (
                <img
                  src={getImageUrl(episode.still_path, "w500")}
                  alt={episode.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Play
                    className="w-4 h-4 text-white ml-0.5"
                    fill="currentColor"
                  />
                </div>
              </div>

              {/* Episode Number Badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                {episode.episode_number}
              </div>
            </div>

            {/* Episode Info */}
            <div className="p-4 space-y-2">
              {/* Title */}
              <h5 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                {episode.name}
              </h5>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-sub">
                {episode.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{episode.runtime}m</span>
                  </div>
                )}

                {episode.air_date && (
                  <span className="text-xs">
                    {format(new Date(episode.air_date), "MMM d")}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
