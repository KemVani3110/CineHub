"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { WatchlistButton } from "@/components/common/WatchlistButton";
import MediaReviews from "@/components/common/MediaReviews";
import { Recommendations } from "@/components/common/Recommendations";
import Loading from "@/components/common/Loading";
import { formatDate } from "@/lib/utils";
import {
  Play,
  Calendar,
  Clock,
  Star,
  AlertTriangle,
  Sparkles,
  Film,
  Info,
  Heart,
  Share2,
  Bookmark,
  Award,
  Users,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function getInternalMovie(id: string) {
  const res = await fetch(`/api/internal-movies/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch internal movie");
  }
  return res.json();
}

function InternalMovieDetail() {
  const { id } = useParams();
  const { data: session } = useSession();
  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["internalMovie", id],
    queryFn: () => getInternalMovie(id as string),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Skeleton */}
          <div className="relative mb-16">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-muted/10 animate-pulse" />
            <div className="relative p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Poster Skeleton */}
                <div className="lg:col-span-2 flex justify-center lg:justify-start">
                  <div className="relative group w-80 max-w-full">
                    <div className="aspect-[2/3] rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-muted/20 animate-pulse shadow-2xl" />
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="space-y-6">
                    <div className="h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl animate-pulse" />
                    <div className="flex flex-wrap gap-4">
                      <div className="h-6 w-32 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg animate-pulse" />
                      <div className="h-6 w-24 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg animate-pulse" />
                      <div className="h-6 w-20 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="h-8 w-20 bg-gradient-to-r from-muted/20 to-muted/40 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg animate-pulse" />
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-gradient-to-r from-muted/20 to-muted/40 rounded animate-pulse" />
                      <div className="h-4 w-5/6 bg-gradient-to-r from-muted/20 to-muted/40 rounded animate-pulse" />
                      <div className="h-4 w-4/5 bg-gradient-to-r from-muted/20 to-muted/40 rounded animate-pulse" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-12 w-36 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl animate-pulse" />
                    <div className="h-12 w-32 bg-gradient-to-r from-muted/20 to-muted/40 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-8 px-4 max-w-md mx-auto">
          {/* Error Icon */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-red-500/70" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
              Movie Not Found
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The movie you're looking for doesn't exist or has been removed
              from our collection.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => (window.location.href = "/movie/internal")}
          >
            <Film className="w-5 h-5 mr-2" />
            Browse Movies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(79,209,197,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(79,209,197,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Content Card */}
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Poster Section */}
                <div className="lg:col-span-2 relative">
                  <div className="aspect-[2/3] lg:aspect-auto lg:h-full relative group overflow-hidden">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/40" />

                    {/* Quality Badge */}
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-black/80 backdrop-blur-sm text-white border-white/20 px-3 py-1.5">
                        <Award className="w-4 h-4 mr-1.5" />
                        Premium
                      </Badge>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-6 right-6 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="bg-black/80 backdrop-blur-sm hover:bg-black/90 text-white border-white/20 w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="bg-black/80 backdrop-blur-sm hover:bg-black/90 text-white border-white/20 w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Movie Info */}
                <div className="lg:col-span-3 p-8 lg:p-12 space-y-8">
                  {/* Title Section */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h1
                        className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight"
                        style={{ lineHeight: "1.5" }}
                      >
                        {movie.title}
                      </h1>

                      {/* Movie Meta */}
                      <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="font-medium leading-relaxed">
                            {formatDate(movie.releaseDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-accent" />
                          <span className="font-medium leading-relaxed">
                            {movie.durationMinutes} minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium leading-relaxed">
                            Global Release
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 px-4 py-2 text-sm font-medium">
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        {movie.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Film className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground leading-tight">
                        Genres
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre: string, index: number) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="bg-muted/30 hover:bg-primary/20 hover:border-primary/50 text-foreground border-border transition-all duration-300 cursor-pointer px-3 py-1.5 leading-relaxed"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                        <Info className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground leading-tight">
                        Synopsis
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {movie.shortDescription && (
                        <p
                          className="text-foreground leading-relaxed text-lg"
                          style={{ lineHeight: "1.7" }}
                        >
                          {movie.shortDescription}
                        </p>
                      )}

                      {movie.fullDescription && (
                        <div className="space-y-3">
                          {movie.shortDescription && (
                            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                          )}
                          <p
                            className="text-muted-foreground leading-relaxed"
                            style={{ lineHeight: "1.6" }}
                          >
                            {movie.fullDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-6">
                    {movie.trailerUrl && (
                      <Button
                        onClick={() => window.open(movie.trailerUrl, "_blank")}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        <span className="leading-tight">Watch Trailer</span>
                      </Button>
                    )}

                    {session && (
                      <WatchlistButton
                        id={movie.id}
                        mediaType="movie"
                        title={movie.title}
                        posterPath={movie.posterUrl}
                        className="flex items-center gap-2 bg-card/80 hover:bg-card border-border hover:border-primary/50 text-foreground hover:text-primary px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      {session && (
        <div className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                  Reviews & Ratings
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                See what other viewers think about this movie and share your own
                experience
              </p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <MediaReviews
                  reviews={{
                    page: 1,
                    results: [],
                    total_pages: 0,
                    total_results: 0,
                  }}
                  mediaId={movie.id}
                  mediaType="movie"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <div className="relative py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
                You Might Also Like
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover more amazing movies based on your interests and viewing
              history
            </p>
          </div>

          <Card className="bg-card/30 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <Recommendations />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function InternalMoviePage() {
  return (
    <Suspense fallback={<Loading />}>
      <InternalMovieDetail />
    </Suspense>
  );
}
