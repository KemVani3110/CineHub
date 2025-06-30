"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTVShowDetails, fetchSeasonDetails } from "@/services/tmdb";
import { TMDBTVDetails, TMDBSeasonDetails } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Play,
  RefreshCw,
  Globe,
  ArrowRight,
} from "lucide-react";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { EpisodeActions } from "@/components/watch/EpisodeActions";
import { EpisodesList } from "@/components/watch/EpisodesList";
import { cn } from "@/lib/utils";

interface StreamingSource {
  name: string;
  url: string;
  quality: string;
  type: "iframe" | "video";
  embed: boolean;
}

interface StreamingResponse {
  success: boolean;
  sources: StreamingSource[];
  tvShowInfo: any;
  episodeInfo: any;
  streamingInfo: any;
}

export default function WatchTVEpisodePage() {
  const { id, seasonNumber, episodeNumber } = useParams();
  const router = useRouter();
  const [tvShow, setTVShow] = useState<TMDBTVDetails | null>(null);
  const [season, setSeason] = useState<TMDBSeasonDetails | null>(null);
  const [streamingSources, setStreamingSources] = useState<StreamingSource[]>(
    []
  );
  const [episodeInfo, setEpisodeInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    const loadEpisode = async () => {
      try {
        setLoading(true);
        const [tvShowData, seasonData] = await Promise.all([
          fetchTVShowDetails(Number(id)),
          fetchSeasonDetails(Number(id), Number(seasonNumber)),
        ]);
        setTVShow(tvShowData);
        setSeason(seasonData);

        // Load streaming sources
        await loadStreamingSources();
      } catch (error) {
        console.error("Error loading TV show:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEpisode();
  }, [id, seasonNumber, episodeNumber]);

  const loadStreamingSources = async () => {
    try {
      setLoadingStreams(true);
      setStreamError(null);

      const response = await fetch(
        `/api/stream/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`
      );
      const data: StreamingResponse = await response.json();

      if (data.success && data.sources.length > 0) {
        setStreamingSources(data.sources);
        setEpisodeInfo(data.episodeInfo);
      } else {
        setStreamError("No streaming sources available");
      }
    } catch (error) {
      console.error("Error loading streaming sources:", error);
      setStreamError("Failed to load streaming sources");
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleShare = async () => {
    if (!tvShow || !episodeInfo) return;
    try {
      await navigator.share({
        title: `${tvShow.name} - S${seasonNumber}E${episodeNumber}`,
        text: `Watch ${tvShow.name} Season ${seasonNumber} Episode ${episodeNumber} on CineHub!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const retryStreaming = () => {
    loadStreamingSources();
  };

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main px-4">
        <Card className="w-full max-w-md bg-card-custom border-custom">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-danger" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-danger mb-2">
              Episode Not Found
            </h1>
            <p className="text-sub mb-6">
              The episode you're looking for could not be loaded.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="btn-primary w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const episodeTitle = episodeInfo?.name || `Episode ${episodeNumber}`;
  const showTitle = `${tvShow.name} - S${seasonNumber}E${episodeNumber}`;

  return (
    <div
      className={cn(
        "min-h-screen text-foreground transition-all duration-500",
        isTheaterMode ? "bg-black" : "bg-main"
      )}
    >
      {/* Header with Back Button and Episode Title */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b transition-all duration-500",
          isTheaterMode
            ? "bg-black/95 border-slate-800/50"
            : "bg-main/95 border-custom"
        )}
      >
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-accent hover:bg-accent/20 shrink-0 cursor-pointer rounded-full transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-10 sm:h-10"
              onClick={() => router.push(`/tv/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-4">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                  {tvShow.name}
                </h1>

                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                    <span className="text-sm font-medium text-foreground">
                      S{seasonNumber}E{episodeNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">
                      {new Date(tvShow.first_air_date).getFullYear()}
                    </span>
                  </div>

                  {episodeInfo?.runtime && (
                    <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">
                        {episodeInfo.runtime} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Episode title and mobile info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                {episodeInfo?.name && (
                  <p className="text-sm text-foreground/80 font-medium truncate">
                    {episodeInfo.name}
                  </p>
                )}

                <div className="flex sm:hidden items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                    <span className="text-xs font-medium text-foreground">
                      S{seasonNumber}E{episodeNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                    <Calendar className="h-2.5 w-2.5 text-accent" />
                    <span className="text-xs font-medium text-foreground">
                      {new Date(tvShow.first_air_date).getFullYear()}
                    </span>
                  </div>

                  {episodeInfo?.runtime && (
                    <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                      <Clock className="h-2.5 w-2.5 text-accent" />
                      <span className="text-xs font-medium text-foreground">
                        {episodeInfo.runtime}m
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Episode Navigation */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-accent hover:bg-accent/20 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-8 h-8 sm:w-10 sm:h-10"
                onClick={() => {
                  const newEpisode = Number(episodeNumber) - 1;
                  router.push(
                    `/watch-tv/${id}/season/${seasonNumber}/episode/${newEpisode}`
                  );
                }}
                disabled={Number(episodeNumber) <= 1}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-accent hover:bg-accent/20 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-8 h-8 sm:w-10 sm:h-10"
                onClick={() => {
                  const newEpisode = Number(episodeNumber) + 1;
                  router.push(
                    `/watch-tv/${id}/season/${seasonNumber}/episode/${newEpisode}`
                  );
                }}
                disabled={
                  !season || Number(episodeNumber) >= season.episodes.length
                }
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        {/* Video Player Section */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-black rounded-lg overflow-hidden shadow-2xl">
              {streamError ? (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      Streaming Unavailable
                    </h3>
                    <p className="text-sm opacity-75 mb-4">{streamError}</p>
                    <Button
                      onClick={retryStreaming}
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-white/20"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              ) : streamingSources.length > 0 ? (
                <VideoPlayer
                  sources={streamingSources}
                  posterUrl={
                    episodeInfo?.still_path
                      ? `https://image.tmdb.org/t/p/original${episodeInfo.still_path}`
                      : tvShow.backdrop_path
                      ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
                      : undefined
                  }
                  title={showTitle}
                  duration={
                    episodeInfo?.runtime || tvShow.episode_run_time?.[0]
                  }
                  onTheaterModeChange={setIsTheaterMode}
                />
              ) : (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    {loadingStreams ? (
                      <>
                        <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin opacity-50" />
                        <p className="text-lg font-semibold">
                          Loading streaming sources...
                        </p>
                        <p className="text-sm opacity-75">Please wait</p>
                      </>
                    ) : (
                      <>
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">
                          No streaming sources available
                        </p>
                        <p className="text-sm opacity-75">
                          Please try again later
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section - Dimmed in Theater Mode */}
        <div
          className={cn(
            "max-w-6xl mx-auto px-4 mt-8 transition-all duration-500",
            isTheaterMode ? "opacity-20 pointer-events-none" : "opacity-100"
          )}
        >
          {/* Episode Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Episode Info Card */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row gap-8">
                    {/* Episode Still/Poster */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <div className="relative w-56 h-32 sm:w-72 sm:h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 shadow-2xl border border-slate-600/50 group">
                        {episodeInfo?.still_path ? (
                          <div className="relative">
                            <img
                              src={`https://image.tmdb.org/t/p/w500${episodeInfo.still_path}`}
                              alt={episodeInfo.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ) : tvShow.poster_path ? (
                          <div className="relative">
                            <img
                              src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                              alt={tvShow.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
                            <Play className="h-16 w-16 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Episode Details */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                          {episodeInfo?.name || `Episode ${episodeNumber}`}
                        </h2>
                        <p className="text-[#4FD1C5] text-lg font-medium mb-4">
                          {tvShow.name} • Season {seasonNumber} Episode{" "}
                          {episodeNumber}
                        </p>
                      </div>

                      {/* Rating and Info */}
                      <div className="flex flex-wrap items-center gap-4">
                        {episodeInfo?.vote_average &&
                          episodeInfo.vote_average > 0 && (
                            <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-3 rounded-full border border-yellow-400/30">
                              <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              <span className="text-lg font-bold text-yellow-100">
                                {episodeInfo.vote_average.toFixed(1)}
                              </span>
                              <span className="text-sm text-yellow-200/70">
                                /10
                              </span>
                            </div>
                          )}

                        {tvShow.spoken_languages &&
                          tvShow.spoken_languages.length > 0 && (
                            <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-3 rounded-full border border-blue-400/30">
                              <Globe className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-blue-100 font-medium">
                                {tvShow.spoken_languages[0].english_name}
                              </span>
                            </div>
                          )}

                        {episodeInfo?.runtime && (
                          <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-3 rounded-full border border-purple-400/30">
                            <Clock className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-purple-100 font-medium">
                              {episodeInfo.runtime} min
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Genres */}
                      {tvShow.genres && tvShow.genres.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {tvShow.genres.slice(0, 4).map((genre) => (
                            <Badge
                              key={genre.id}
                              variant="secondary"
                              className="bg-gradient-to-r from-[#4FD1C5]/20 to-[#38B2AC]/20 text-[#4FD1C5] border-[#4FD1C5]/40 hover:bg-[#4FD1C5]/30 hover:border-[#4FD1C5]/60 transition-all duration-300 hover:scale-105 px-4 py-2 text-sm font-semibold"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Overview */}
                      {episodeInfo?.overview && (
                        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-2xl p-6 border border-slate-600/50">
                          <h3 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                            Overview
                          </h3>
                          <p className="text-slate-200 text-base leading-relaxed">
                            {episodeInfo.overview}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="font-bold text-white mb-6 text-xl flex items-center gap-3">
                    <div className="w-1 h-7 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                    Episode Actions
                  </h3>
                  <EpisodeActions
                    showTitle={tvShow.name}
                    episodeTitle={
                      episodeInfo?.name || `Episode ${episodeNumber}`
                    }
                    onShare={handleShare}
                    showId={tvShow.id}
                    seasonNumber={Number(seasonNumber)}
                    episodeNumber={Number(episodeNumber)}
                    posterPath={tvShow.poster_path || ""}
                    voteAverage={episodeInfo?.vote_average || 0}
                    voteCount={episodeInfo?.vote_count || 0}
                    popularity={tvShow.popularity}
                    runtime={
                      episodeInfo?.runtime || tvShow.episode_run_time?.[0] || 0
                    }
                    airDate={episodeInfo?.air_date || ""}
                    seasons={tvShow.seasons}
                    onSeasonChange={(newSeason: string) =>
                      router.push(
                        `/watch-tv/${id}/season/${newSeason}/episode/1`
                      )
                    }
                    onEpisodeChange={(direction: "next" | "prev") => {
                      const newEpisode =
                        direction === "next"
                          ? Number(episodeNumber) + 1
                          : Number(episodeNumber) - 1;
                      router.push(
                        `/watch-tv/${id}/season/${seasonNumber}/episode/${newEpisode}`
                      );
                    }}
                    hasNextEpisode={true}
                    hasPreviousEpisode={Number(episodeNumber) > 1}
                  />
                </CardContent>
              </Card>

              {/* Episodes List */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1 h-10 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                    <h3 className="text-3xl font-bold text-white">Episodes</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-600 via-slate-500 to-transparent"></div>
                  </div>
                  <EpisodesList
                    episodes={season?.episodes || []}
                    showId={Number(id)}
                    seasonNumber={Number(seasonNumber)}
                    currentEpisodeNumber={Number(episodeNumber)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Episode Details */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                    Episode Details
                  </h3>
                  <div className="space-y-4">
                    {episodeInfo?.air_date && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-[#4FD1C5]/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#4FD1C5]" />
                          Air Date
                        </span>
                        <span className="text-white text-sm font-bold">
                          {new Date(episodeInfo.air_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {episodeInfo?.runtime && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-purple-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-400" />
                          Duration
                        </span>
                        <span className="text-white text-sm font-bold">
                          {episodeInfo.runtime} min
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-blue-400/30 transition-all duration-200">
                      <span className="text-slate-200 text-sm font-medium">
                        Season
                      </span>
                      <span className="text-white text-sm font-bold">
                        {seasonNumber}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-green-400/30 transition-all duration-200">
                      <span className="text-slate-200 text-sm font-medium">
                        Episode
                      </span>
                      <span className="text-white text-sm font-bold">
                        {episodeNumber}
                      </span>
                    </div>

                    {episodeInfo?.vote_count && episodeInfo.vote_count > 0 && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-yellow-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          Votes
                        </span>
                        <span className="text-white text-sm font-bold">
                          {episodeInfo.vote_count.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Show Details */}
              <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                    Show Details
                  </h3>
                  <div className="space-y-4">
                    {tvShow.first_air_date && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-[#4FD1C5]/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#4FD1C5]" />
                          First Aired
                        </span>
                        <span className="text-white text-sm font-bold">
                          {new Date(tvShow.first_air_date).getFullYear()}
                        </span>
                      </div>
                    )}

                    {tvShow.number_of_seasons && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-blue-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium">
                          Seasons
                        </span>
                        <span className="text-white text-sm font-bold">
                          {tvShow.number_of_seasons}
                        </span>
                      </div>
                    )}

                    {tvShow.number_of_episodes && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-purple-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium">
                          Episodes
                        </span>
                        <span className="text-white text-sm font-bold">
                          {tvShow.number_of_episodes}
                        </span>
                      </div>
                    )}

                    {tvShow.vote_average > 0 && (
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-yellow-400/30 transition-all duration-200">
                        <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          Show Rating
                        </span>
                        <span className="text-white text-sm font-bold">
                          {tvShow.vote_average.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Networks */}
              {tvShow.networks && tvShow.networks.length > 0 && (
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full"></div>
                      Networks
                    </h3>
                    <div className="space-y-3">
                      {tvShow.networks.slice(0, 3).map((network) => (
                        <div
                          key={network.id}
                          className="p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 text-sm text-slate-200 font-medium hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 hover:border-[#4FD1C5]/30 transition-all duration-200 cursor-pointer"
                        >
                          {network.name}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-main">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-main/95 backdrop-blur-md border-b border-custom">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
            <div className="flex-1 space-y-1 sm:space-y-2">
              <div className="skeleton h-4 sm:h-6 w-32 sm:w-48 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
              <div className="flex gap-1 sm:gap-2">
                <div className="skeleton h-3 sm:h-4 w-14 sm:w-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                <div className="skeleton h-3 sm:h-4 w-12 sm:w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                <div className="skeleton h-3 sm:h-4 w-10 sm:w-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
              </div>
            </div>
            <div className="flex gap-1">
              <div className="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
              <div className="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Video Player Skeleton */}
          <div className="py-6 mb-8">
            <div className="skeleton w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 animate-pulse shadow-2xl" />
          </div>

          {/* Content Skeleton */}
          <div className="max-w-6xl mx-auto mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Episode Info Card Skeleton */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50">
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row gap-8">
                      <div className="skeleton w-56 h-32 sm:w-72 sm:h-40 rounded-2xl mx-auto sm:mx-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
                      <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                          <div className="skeleton h-8 sm:h-10 w-3/4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-5 w-1/2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                        <div className="flex gap-4">
                          <div className="skeleton h-8 w-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-8 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-8 w-18 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                        <div className="flex gap-3">
                          <div className="skeleton h-6 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-6 w-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-6 w-14 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                        <div className="bg-slate-800/40 rounded-2xl p-6">
                          <div className="skeleton h-5 w-20 mb-4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-20 w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions Card Skeleton */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50">
                  <CardContent className="p-8">
                    <div className="skeleton h-6 w-32 mb-6 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    <div className="flex gap-4">
                      <div className="skeleton h-10 w-32 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="skeleton h-10 w-24 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="skeleton h-10 w-28 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>

                {/* Episodes List Card Skeleton */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-1 h-10 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full" />
                      <div className="skeleton h-8 w-24 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent" />
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="skeleton h-[120px] w-full rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                {/* Episode Details Skeleton */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full" />
                      <div className="skeleton h-5 w-28 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl"
                        >
                          <div className="skeleton h-4 w-20 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-4 w-16 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Show Details Skeleton */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full" />
                      <div className="skeleton h-5 w-24 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl"
                        >
                          <div className="skeleton h-4 w-20 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-4 w-16 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Networks Skeleton */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#4FD1C5] to-[#38B2AC] rounded-full" />
                      <div className="skeleton h-5 w-20 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="p-4 bg-slate-800/40 rounded-xl">
                          <div className="skeleton h-4 w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
