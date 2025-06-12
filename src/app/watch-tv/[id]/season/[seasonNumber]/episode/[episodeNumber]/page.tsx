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
import { Comments } from "@/components/watch/Comments";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WatchTVEpisode() {
  const { id, seasonNumber, episodeNumber } = useParams();
  const router = useRouter();
  const [show, setShow] = useState<TMDBTVDetails | null>(null);
  const [season, setSeason] = useState<TMDBSeasonDetails | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-main text-foreground">
      {/* Header with Back Button and Episode Title */}
      <div className="sticky top-0 z-50 bg-main/95 backdrop-blur-md border-b border-custom shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-accent hover:bg-accent/10 shrink-0 cursor-pointer transition-all duration-200"
              onClick={() => router.push(`/tv/${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                {currentEpisode.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-sub">
                <span className="font-medium">{show.name}</span>
                <span>•</span>
                <span>S{seasonNumber}E{episodeNumber}</span>
                {currentEpisode.air_date && (
                  <>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(currentEpisode.air_date).getFullYear()}</span>
                  </>
                )}
                {currentEpisode.runtime && (
                  <>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{currentEpisode.runtime} min</span>
                  </>
                )}
              </div>
            </div>
            {/* Episode Navigation */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-accent hover:bg-accent/10 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleEpisodeChange("prev")}
                disabled={!prevEpisode}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-accent hover:bg-accent/10 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleEpisodeChange("next")}
                disabled={!nextEpisode}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-5 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Video Player Section */}
          <div className="mb-6 sm:mb-8">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <VideoPlayer
                videoUrl={`/api/stream/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`}
                posterUrl={
                  currentEpisode.still_path
                    ? `https://image.tmdb.org/t/p/original${currentEpisode.still_path}`
                    : undefined
                }
                title={`${show.name} - S${seasonNumber}E${episodeNumber}: ${currentEpisode.name}`}
                duration={currentEpisode.runtime}
              />
            </div>
          </div>

          {/* Episode Details Section */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">
              {/* Episode Info Card */}
              <Card className="bg-card-custom border-custom shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Episode Still/Poster */}
                    <div className="shrink-0 mx-auto lg:mx-0">
                      <div className="relative w-full max-w-xs lg:w-64 aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
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
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                            <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Episode Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-tight">
                          {currentEpisode.name}
                        </h2>
                        <p className="text-accent text-base sm:text-lg font-medium">
                          {show.name} • Season {seasonNumber} Episode {episodeNumber}
                        </p>
                      </div>

                      {/* Rating and Info */}
                      <div className="flex flex-wrap items-center gap-3">
                        {currentEpisode.vote_average > 0 && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-accent/20 to-accent/10 px-3 py-1.5 rounded-full border border-accent/30">
                            <Star className="h-4 w-4 text-accent fill-current" />
                            <span className="text-sm font-semibold text-accent">
                              {currentEpisode.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        {show.spoken_languages && show.spoken_languages.length > 0 && (
                          <div className="flex items-center gap-2 text-sub text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                            <Globe className="h-4 w-4" />
                            <span>{show.spoken_languages[0].english_name}</span>
                          </div>
                        )}

                        {currentEpisode.runtime && (
                          <div className="flex items-center gap-2 text-sub text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span>{currentEpisode.runtime} minutes</span>
                          </div>
                        )}
                      </div>

                      {/* Genres */}
                      {show.genres && show.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {show.genres.slice(0, 5).map((genre) => (
                            <Badge
                              key={genre.id}
                              variant="secondary"
                              className="bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors duration-200 cursor-default"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Overview */}
                      {currentEpisode.overview && (
                        <div className="pt-2">
                          <h3 className="font-semibold text-foreground mb-3 text-lg">Overview</h3>
                          <p className="text-sub text-base leading-relaxed">
                            {currentEpisode.overview}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="bg-card-custom border-custom shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="outline"
                      size="default"
                      className="border-custom text-foreground hover:bg-accent/10 hover:border-accent hover:text-accent px-6 py-2.5 cursor-pointer transition-all duration-300 font-medium"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Episode
                    </Button>
                    <WatchlistButton
                      id={show.id}
                      mediaType="tv"
                      title={show.name}
                      posterPath={show.poster_path || ""}
                    />
                    <Select
                      value={(seasonNumber as string).toString()}
                      onValueChange={handleSeasonChange}
                    >
                      <SelectTrigger className="w-[140px] bg-card-custom border-custom cursor-pointer hover:border-accent transition-colors duration-200">
                        <SelectValue placeholder="Season" />
                      </SelectTrigger>
                      <SelectContent className="bg-card-custom border-custom">
                        {show.seasons.map((s) => (
                          <SelectItem
                            key={s.season_number}
                            value={s.season_number.toString()}
                            className="text-foreground hover:bg-accent/10 cursor-pointer transition-colors duration-200"
                          >
                            Season {s.season_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Episodes List Card */}
              <Card className="bg-card-custom border-custom shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Play className="h-5 w-5 text-accent" />
                    Episodes
                  </h3>
                  <EpisodesList
                    episodes={season.episodes}
                    showId={Number(id)}
                    seasonNumber={Number(seasonNumber)}
                    currentEpisodeNumber={Number(episodeNumber)}
                  />
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="bg-card-custom border-custom shadow-lg">
                <CardContent className="p-6">
                  <Comments
                    mediaId={currentEpisode.id}
                    mediaType="tv"
                    mediaTitle={`${show.name} - S${seasonNumber}E${episodeNumber}: ${currentEpisode.name}`}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Episode Details */}
              <Card className="bg-card-custom border-custom shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-6 text-lg">Episode Details</h3>
                  <div className="space-y-4">
                    {currentEpisode.air_date && (
                      <div className="flex justify-between items-center py-2 border-b border-custom/50 last:border-b-0">
                        <span className="text-sub text-sm font-medium">Air Date</span>
                        <span className="text-foreground text-sm font-semibold">
                          {new Date(currentEpisode.air_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {currentEpisode.runtime && (
                      <div className="flex justify-between items-center py-2 border-b border-custom/50 last:border-b-0">
                        <span className="text-sub text-sm font-medium">Duration</span>
                        <span className="text-foreground text-sm font-semibold">
                          {currentEpisode.runtime} min
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2 border-b border-custom/50 last:border-b-0">
                      <span className="text-sub text-sm font-medium">Season</span>
                      <span className="text-foreground text-sm font-semibold">
                        {seasonNumber}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-custom/50 last:border-b-0">
                      <span className="text-sub text-sm font-medium">Episode</span>
                      <span className="text-foreground text-sm font-semibold">
                        {episodeNumber}
                      </span>
                    </div>

                    {currentEpisode.vote_count > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sub text-sm font-medium">Votes</span>
                        <span className="text-foreground text-sm font-semibold">
                          {currentEpisode.vote_count.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Show Info */}
              <Card className="bg-card-custom border-custom shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-6 text-lg">Show Details</h3>
                  <div className="space-y-4">
                    {show.first_air_date && (
                      <div className="flex justify-between items-center py-2 border-b border-custom/50 last:border-b-0">
                        <span className="text-sub text-sm font-medium">First Aired</span>
                        <span className="text-foreground text-sm font-semibold">
                          {new Date(show.first_air_date).getFullYear()}
                        </span>
                      </div>
                    )}
                    
                    {show.number_of_seasons && (
                      <div className="flex justify-between items-center py-2 border-b border-custom/50 last:border-b-0">
                        <span className="text-sub text-sm font-medium">Seasons</span>
                        <span className="text-foreground text-sm font-semibold">
                          {show.number_of_seasons}
                        </span>
                      </div>
                    )}

                    {show.number_of_episodes && (
                      <div className="flex justify-between items-center py-2 border-b border-custom/50 last:border-b-0">
                        <span className="text-sub text-sm font-medium">Episodes</span>
                        <span className="text-foreground text-sm font-semibold">
                          {show.number_of_episodes}
                        </span>
                      </div>
                    )}

                    {show.vote_average > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sub text-sm font-medium">Show Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-accent fill-current" />
                          <span className="text-foreground text-sm font-semibold">
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
                <Card className="bg-card-custom border-custom shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-6 text-lg">Networks</h3>
                    <div className="space-y-3">
                      {show.networks.slice(0, 3).map((network) => (
                        <div key={network.id} className="text-sm text-foreground font-medium py-2 px-3 bg-muted/30 rounded-lg">
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
      <div className="sticky top-0 z-50 bg-main/95 backdrop-blur-md border-b border-custom">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Video Player Skeleton */}
          <div className="mb-6 sm:mb-8">
            <Skeleton className="w-full aspect-video rounded-lg" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
            <div className="xl:col-span-3 space-y-6">
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <Skeleton className="w-full max-w-xs lg:w-64 aspect-video rounded-xl mx-auto lg:mx-0" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card-custom border-custom">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24 mb-6" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card-custom border-custom">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-6" />
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between py-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card-custom border-custom">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-28 mb-6" />
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between py-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card-custom border-custom">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24 mb-6" />
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}