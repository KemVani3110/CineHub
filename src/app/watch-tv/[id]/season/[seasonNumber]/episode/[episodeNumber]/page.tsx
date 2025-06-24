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
  Globe,
  Play,
  ChevronLeft,
  ChevronRight,
  Share2
} from "lucide-react";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { EpisodesList } from "@/components/watch/EpisodesList";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import { EpisodeActions } from "@/components/watch/EpisodeActions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function WatchTVEpisode() {
  const { id, seasonNumber, episodeNumber } = useParams();
  const router = useRouter();
  const [show, setShow] = useState<TMDBTVDetails | null>(null);
  const [season, setSeason] = useState<TMDBSeasonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [showData, seasonData] = await Promise.all([
          fetchTVShowDetails(Number(id)),
          fetchSeasonDetails(Number(id), Number(seasonNumber)),
        ]);
        setShow(showData);
        setSeason(seasonData);
      } catch (error) {
        console.error("Error loading TV show:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, seasonNumber]);

  const handleShare = async () => {
    if (!show || !currentEpisode) return;
    try {
      await navigator.share({
        title: `${show.name} - S${seasonNumber}E${episodeNumber}: ${currentEpisode.name}`,
        text: `Watch ${show.name} - S${seasonNumber}E${episodeNumber}: ${currentEpisode.name} on CineHub!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleSeasonChange = (newSeasonNumber: string) => {
    router.push(`/watch-tv/${id}/season/${newSeasonNumber}/episode/1`);
  };

  const handleEpisodeChange = (direction: "next" | "prev") => {
    if (direction === "next" && nextEpisode) {
      router.push(
        `/watch-tv/${id}/season/${seasonNumber}/episode/${nextEpisode.episode_number}`
      );
    } else if (direction === "prev" && prevEpisode) {
      router.push(
        `/watch-tv/${id}/season/${seasonNumber}/episode/${prevEpisode.episode_number}`
      );
    }
  };

  if (loading) {
    return <WatchTVEpisodeSkeleton />;
  }

  if (!show || !season) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main px-4">
        <Card className="w-full max-w-md bg-card-custom border-custom">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-danger" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-danger mb-2">
              TV Show Not Found
            </h1>
            <p className="text-sub mb-6">
              The TV show you're looking for could not be loaded.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="btn-primary w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentEpisode = season.episodes.find(
    (ep) => ep.episode_number === Number(episodeNumber)
  );

  if (!currentEpisode) {
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
              onClick={() => router.push(`/tv/${id}`)}
              className="btn-primary w-full"
            >
              Back to TV Show
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentEpisodeIndex = season.episodes.findIndex(
    (ep) => ep.episode_number === Number(episodeNumber)
  );

  const nextEpisode = season.episodes[currentEpisodeIndex + 1];
  const prevEpisode = season.episodes[currentEpisodeIndex - 1];

  return (
    <div className={cn(
      "min-h-screen text-foreground transition-all duration-500",
      isTheaterMode ? "bg-black" : "bg-main"
    )}>
      {/* Header with Back Button and Episode Title */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b transition-all duration-500",
        isTheaterMode 
          ? "bg-black/95 border-slate-800/50" 
          : "bg-main/95 border-custom"
      )}>
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
                  {currentEpisode.name}
                </h1>
                
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                    <span className="text-sm font-medium text-foreground">
                      S{seasonNumber}E{episodeNumber}
                    </span>
                  </div>
                  
                  {currentEpisode.air_date && (
                    <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">
                        {new Date(currentEpisode.air_date).getFullYear()}
                      </span>
                    </div>
                  )}
                  
                  {currentEpisode.runtime && (
                    <div className="flex items-center gap-2 bg-foreground/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-foreground/10">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">{currentEpisode.runtime} min</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile info - Below title */}
              <div className="flex sm:hidden items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                  <span className="text-xs font-medium text-foreground">
                    S{seasonNumber}E{episodeNumber}
                  </span>
                </div>
                
                {currentEpisode.air_date && (
                  <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                    <Calendar className="h-2.5 w-2.5 text-accent" />
                    <span className="text-xs font-medium text-foreground">
                      {new Date(currentEpisode.air_date).getFullYear()}
                    </span>
                  </div>
                )}
                
                {currentEpisode.runtime && (
                  <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm px-2 py-0.5 rounded-full border border-foreground/10">
                    <Clock className="h-2.5 w-2.5 text-accent" />
                    <span className="text-xs font-medium text-foreground">{currentEpisode.runtime}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Episode Navigation */}
            <div className="flex gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-accent hover:bg-accent/20 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-8 h-8 sm:w-10 sm:h-10"
                onClick={() => handleEpisodeChange("prev")}
                disabled={!prevEpisode}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-accent hover:bg-accent/20 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-8 h-8 sm:w-10 sm:h-10"
                onClick={() => handleEpisodeChange("next")}
                disabled={!nextEpisode}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        {/* Video Player Section - Horizontal Layout */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-black rounded-lg overflow-hidden shadow-2xl">
              <VideoPlayer
                videoUrl={`/api/stream/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`}
                posterUrl={
                  currentEpisode.still_path
                    ? `https://image.tmdb.org/t/p/original${currentEpisode.still_path}`
                    : show.backdrop_path
                    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
                    : undefined
                }
                title={`${show.name} - S${seasonNumber}E${episodeNumber}: ${currentEpisode.name}`}
                duration={currentEpisode.runtime}
                onTheaterModeChange={setIsTheaterMode}
              />
            </div>
          </div>
        </div>

        {/* Content Section - Dimmed in Theater Mode */}
        <div className={cn(
          "max-w-6xl mx-auto px-4 mt-8 transition-all duration-500",
          isTheaterMode ? "opacity-20 pointer-events-none" : "opacity-100"
        )}>

          {/* Episode Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Episode Info Card */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    {/* Episode Still/Poster */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <div className="relative w-48 h-28 sm:w-64 sm:h-36 rounded-xl overflow-hidden bg-slate-800/50 shadow-lg border border-slate-700/50">
                        {currentEpisode.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${currentEpisode.still_path}`}
                            alt={currentEpisode.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        ) : show.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                            alt={show.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
                            <Play className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* Episode Details */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                          {currentEpisode.name}
                        </h2>
                        <p className="text-cinehub-accent text-base sm:text-lg font-medium">
                          {show.name} • Season {seasonNumber} Episode {episodeNumber}
                        </p>
                      </div>

                      {/* Rating and Info */}
                      <div className="flex flex-wrap items-center gap-4">
                        {currentEpisode.vote_average > 0 && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-cinehub-accent/20 to-cinehub-accent-hover/20 px-4 py-2 rounded-full border border-cinehub-accent/30">
                            <Star className="h-5 w-5 text-cinehub-accent fill-current" />
                            <span className="text-base font-bold text-cinehub-accent">
                              {currentEpisode.vote_average.toFixed(1)}
                            </span>
                            <span className="text-sm text-slate-300">/10</span>
                          </div>
                        )}
                        
                        {show.spoken_languages && show.spoken_languages.length > 0 && (
                          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-full border border-slate-600/50">
                            <Globe className="h-4 w-4 text-slate-300" />
                            <span className="text-sm text-slate-300 font-medium">{show.spoken_languages[0].english_name}</span>
                          </div>
                        )}

                        {currentEpisode.runtime && (
                          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-full border border-slate-600/50">
                            <Clock className="h-4 w-4 text-slate-300" />
                            <span className="text-sm text-slate-300 font-medium">{currentEpisode.runtime} min</span>
                          </div>
                        )}
                      </div>

                      {/* Genres */}
                      {show.genres && show.genres.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {show.genres.slice(0, 4).map((genre) => (
                            <Badge
                              key={genre.id}
                              variant="secondary"
                              className="bg-gradient-to-r from-cinehub-accent/10 to-cinehub-accent-hover/10 text-cinehub-accent border-cinehub-accent/30 hover:bg-cinehub-accent/20 hover:border-cinehub-accent/50 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Overview */}
                      {currentEpisode.overview && (
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                          <h3 className="font-bold text-white mb-3 text-lg">Overview</h3>
                          <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-4 sm:line-clamp-none">
                            {currentEpisode.overview}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full"></div>
                    Episode Actions
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent"></div>
                  </h3>
                  <EpisodeActions
                    showTitle={show.name}
                    episodeTitle={currentEpisode.name}
                    onShare={handleShare}
                    showId={show.id}
                    seasonNumber={Number(seasonNumber)}
                    episodeNumber={Number(episodeNumber)}
                    posterPath={show.poster_path || ""}
                    voteAverage={currentEpisode.vote_average}
                    voteCount={currentEpisode.vote_count}
                    popularity={show.popularity}
                    runtime={currentEpisode.runtime}
                    airDate={currentEpisode.air_date}
                    seasons={show.seasons}
                    onSeasonChange={handleSeasonChange}
                    onEpisodeChange={handleEpisodeChange}
                    hasNextEpisode={!!nextEpisode}
                    hasPreviousEpisode={!!prevEpisode}
                  />
                </CardContent>
              </Card>

              {/* Episodes List Card */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full"></div>
                    Episodes
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent"></div>
                  </h3>
                  <EpisodesList
                    episodes={season.episodes}
                    showId={Number(id)}
                    seasonNumber={Number(seasonNumber)}
                    currentEpisodeNumber={Number(episodeNumber)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Episode Details */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full"></div>
                    Episode Details
                  </h3>
                  <div className="space-y-4">
                    {currentEpisode.air_date && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-cinehub-accent" />
                          Air Date
                        </span>
                        <span className="text-white text-sm font-bold">
                          {new Date(currentEpisode.air_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {currentEpisode.runtime && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-cinehub-accent" />
                          Duration
                        </span>
                        <span className="text-white text-sm font-bold">
                          {currentEpisode.runtime} min
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <span className="text-slate-300 text-sm font-medium">Season</span>
                      <span className="text-white text-sm font-bold">
                        {seasonNumber}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <span className="text-slate-300 text-sm font-medium">Episode</span>
                      <span className="text-white text-sm font-bold">
                        {episodeNumber}
                      </span>
                    </div>

                    {currentEpisode.vote_count > 0 && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium">Votes</span>
                        <span className="text-white text-sm font-bold">
                          {currentEpisode.vote_count.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Show Info */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full"></div>
                    Show Details
                  </h3>
                  <div className="space-y-4">
                    {show.first_air_date && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-cinehub-accent" />
                          First Aired
                        </span>
                        <span className="text-white text-sm font-bold">
                          {new Date(show.first_air_date).getFullYear()}
                        </span>
                      </div>
                    )}
                    
                    {show.number_of_seasons && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium">Seasons</span>
                        <span className="text-white text-sm font-bold">
                          {show.number_of_seasons}
                        </span>
                      </div>
                    )}

                    {show.number_of_episodes && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium">Episodes</span>
                        <span className="text-white text-sm font-bold">
                          {show.number_of_episodes}
                        </span>
                      </div>
                    )}

                    {show.vote_average > 0 && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 text-sm font-medium">Show Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-cinehub-accent fill-current" />
                          <span className="text-white text-sm font-bold">
                            {show.vote_average.toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Networks */}
              {show.networks && show.networks.length > 0 && (
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-sm shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full"></div>
                      Networks
                    </h3>
                    <div className="space-y-3">
                      {show.networks.slice(0, 3).map((network) => (
                        <div 
                          key={network.id} 
                          className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 text-sm text-slate-300 font-medium hover:bg-slate-700/40 transition-colors duration-200"
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

function WatchTVEpisodeSkeleton() {
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
            <div className="flex gap-0.5 sm:gap-1">
              <div className="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
              <div className="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-14 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Video Player Skeleton */}
          <div className="py-4 mb-8">
            <div className="skeleton w-full aspect-[16/9] sm:aspect-[21/9] rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="max-w-6xl mx-auto mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                      <div className="skeleton w-48 h-28 sm:w-64 sm:h-36 rounded-xl mx-auto sm:mx-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 animate-pulse" />
                      <div className="flex-1 space-y-4">
                        <div className="skeleton h-8 w-3/4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        <div className="flex gap-2">
                          <div className="skeleton h-6 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-6 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-6 w-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                        <div className="bg-slate-800/40 rounded-xl p-4">
                          <div className="skeleton h-5 w-20 mb-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-20 w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
                  <CardContent className="p-6 sm:p-8">
                    <div className="skeleton h-5 w-32 mb-4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    <div className="flex gap-4">
                      <div className="skeleton h-10 w-32 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="skeleton h-10 w-24 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="skeleton h-10 w-32 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full" />
                      <div className="skeleton h-6 w-24 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      <div className="flex-1 h-px bg-gradient-to-r from-slate-600 to-transparent" />
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-[100px] w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full" />
                      <div className="skeleton h-5 w-32 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg">
                          <div className="skeleton h-4 w-20 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-4 w-16 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full" />
                      <div className="skeleton h-5 w-28 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg">
                          <div className="skeleton h-4 w-20 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                          <div className="skeleton h-4 w-16 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-cinehub-accent to-cinehub-accent-hover rounded-full" />
                      <div className="skeleton h-5 w-24 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="p-3 bg-slate-800/40 rounded-lg">
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