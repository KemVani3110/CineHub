"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/services/tmdb";
import { TMDBMovieDetails } from "@/types/tmdb";
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
} from "lucide-react";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { MovieActions } from "@/components/watch/MovieActions";
import { SimilarMovies } from "@/components/watch/SimilarMovies";
import { Comments } from "@/components/watch/Comments";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchMoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const data = await fetchMovieDetails(Number(id));
        setMovie(data);
      } catch (error) {
        console.error("Error loading movie:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const handleShare = async () => {
    if (!movie) return;
    try {
      await navigator.share({
        title: movie.title,
        text: `Watch ${movie.title} on CineHub!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main px-4">
        <Card className="w-full max-w-md bg-card-custom border-custom">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-danger" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-danger mb-2">
              Movie Not Found
            </h1>
            <p className="text-sub mb-6">
              The movie you're looking for could not be loaded.
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

  return (
    <div className="min-h-screen bg-main text-foreground">
      {/*Header with Back Button and Movie Title*/}
      <div className="fixed top-0 left-0 right-0 z-50 bg-main/95 backdrop-blur-sm border-b border-custom">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-accent hover:bg-accent/10 shrink-0 cursor-pointer"
              onClick={() => router.push(`/movie/${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                {movie.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-sub">
                <Calendar className="h-3 w-3" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
                {movie.runtime && (
                  <>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{movie.runtime} min</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Video Player Section - Remove margin và container */}
          <div className="mb-6 sm:mb-8">
            <div className="relative w-full aspect-video bg-black overflow-hidden">
              <VideoPlayer
                videoUrl={`/api/stream/movie/${id}`}
                posterUrl={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined}
                title={movie.title}
                duration={movie.runtime}
              />
            </div>
          </div>

          {/* Movie Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Movie Info Card */}
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Poster */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <div className="relative w-24 h-36 sm:w-32 sm:h-48 rounded-lg overflow-hidden bg-muted">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Movie Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                          {movie.title}
                        </h2>
                        {movie.tagline && (
                          <p className="text-accent italic text-sm sm:text-base">
                            "{movie.tagline}"
                          </p>
                        )}
                      </div>

                      {/* Rating and Info */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {movie.vote_average > 0 && (
                          <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 text-accent fill-current" />
                            <span className="text-sm font-medium text-accent">
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                          <div className="flex items-center gap-1 text-sub text-sm">
                            <Globe className="h-4 w-4" />
                            <span>{movie.spoken_languages[0].english_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Genres */}
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {movie.genres.slice(0, 4).map((genre) => (
                            <Badge
                              key={genre.id}
                              variant="secondary"
                              className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Overview */}
                      {movie.overview && (
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Overview</h3>
                          <p className="text-sub text-sm sm:text-base leading-relaxed line-clamp-3 sm:line-clamp-none">
                            {movie.overview}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <MovieActions 
                    title={movie.title} 
                    onShare={handleShare}
                    id={movie.id}
                    posterPath={movie.poster_path || ""}
                  />
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <Comments
                    mediaId={movie.id}
                    mediaType="movie"
                    mediaTitle={movie.title}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Movie Stats */}
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-foreground mb-4">Movie Details</h3>
                  <div className="space-y-3">
                    {movie.release_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-sub text-sm">Release Date</span>
                        <span className="text-foreground text-sm font-medium">
                          {new Date(movie.release_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {movie.runtime && (
                      <div className="flex justify-between items-center">
                        <span className="text-sub text-sm">Duration</span>
                        <span className="text-foreground text-sm font-medium">
                          {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                        </span>
                      </div>
                    )}

                    {movie.budget > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sub text-sm">Budget</span>
                        <span className="text-foreground text-sm font-medium">
                          ${(movie.budget / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}

                    {movie.revenue > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sub text-sm">Revenue</span>
                        <span className="text-foreground text-sm font-medium">
                          ${(movie.revenue / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}

                    {movie.vote_count > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sub text-sm">Votes</span>
                        <span className="text-foreground text-sm font-medium">
                          {movie.vote_count.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Production Companies */}
              {movie.production_companies && movie.production_companies.length > 0 && (
                <Card className="bg-card-custom border-custom">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4">Production</h3>
                    <div className="space-y-2">
                      {movie.production_companies.slice(0, 3).map((company) => (
                        <div key={company.id} className="text-sm text-sub">
                          {company.name}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Similar Movies Section */}
          {movie.similar && movie.similar.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="section-title mb-6">You might also like</h3>
                  <SimilarMovies movies={movie.similar} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-main">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-main/95 backdrop-blur-sm border-b border-custom">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </div>

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Video Player Skeleton */}
          <div className="mb-6 sm:mb-8">
            <Skeleton className="w-full aspect-video" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <Skeleton className="w-24 h-36 sm:w-32 sm:h-48 rounded-lg mx-auto sm:mx-0" />
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
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card-custom border-custom">
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-6 w-24 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
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
  );
}