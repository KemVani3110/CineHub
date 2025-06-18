'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { WatchlistButton } from '@/components/common/WatchlistButton';
import MediaReviews from '@/components/common/MediaReviews';
import { Recommendations } from '@/components/common/Recommendations';
import Loading from '@/components/common/Loading';
import { formatDate } from '@/lib/utils';
import { 
  Play, 
  Calendar, 
  Clock, 
  Star, 
  AlertTriangle,
  Sparkles,
  Film,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

async function getInternalMovie(id: string) {
  const res = await fetch(`/api/internal-movies/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch internal movie');
  }
  return res.json();
}

function InternalMovieDetail() {
  const { id } = useParams();
  const { data: session } = useSession();
  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['internalMovie', id],
    queryFn: () => getInternalMovie(id as string),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster Skeleton */}
            <div className="lg:col-span-1">
              <div className="skeleton aspect-[2/3] w-full rounded-lg" />
            </div>
            
            {/* Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="skeleton h-10 w-3/4 rounded" />
                <div className="flex gap-4">
                  <div className="skeleton h-6 w-24 rounded" />
                  <div className="skeleton h-6 w-20 rounded" />
                  <div className="skeleton h-6 w-28 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-6 w-18 rounded-full" />
                </div>
              </div>
              
              <div className="skeleton h-32 w-full rounded" />
              
              <div className="flex gap-4">
                <div className="skeleton h-10 w-32 rounded" />
                <div className="skeleton h-10 w-28 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <Card className="max-w-md mx-4 bg-card-custom border-border">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-poppins">
              Movie Not Found
            </h3>
            <p className="text-text-sub">
              The movie you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main">
      {/* Hero Section with  Background */}
      <div className="relative overflow-hidden">
        {/*  Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/10 via-transparent to-cinehub-accent/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(79,209,197,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(79,209,197,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-transparent" />
        </div>

        <div className="container relative mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/*  Poster Section */}
            <div className="lg:col-span-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cinehub-accent/20 to-cinehub-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl">
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            {/*  Movie Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Basic Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Film className="h-8 w-8 text-cinehub-accent mt-5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white font-poppins leading-tight">
                      {movie.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-text-sub">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(movie.releaseDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{movie.durationMinutes} min</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-cinehub-accent/20 text-cinehub-accent border-cinehub-accent/30 font-medium"
                      >
                        {movie.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cinehub-accent" />
                  <h3 className="text-lg font-semibold text-white font-poppins">Genres</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: string) => (
                    <Badge
                      key={genre}
                      variant="outline"
                      className="bg-card-custom/80 text-text-main border-border hover:bg-cinehub-accent/20 hover:border-cinehub-accent/50 transition-all duration-200 cursor-default"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/*  Description */}
              <Card className="bg-card-custom/50 border-border backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-cinehub-accent" />
                    <h3 className="text-lg font-semibold text-white font-poppins">Synopsis</h3>
                  </div>
                  
                  {movie.shortDescription && (
                    <p className="text-text-main leading-relaxed font-medium">
                      {movie.shortDescription}
                    </p>
                  )}
                  
                  {movie.fullDescription && (
                    <>
                      {movie.shortDescription && <Separator className="bg-border" />}
                      <p className="text-text-sub leading-relaxed">
                        {movie.fullDescription}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/*  Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {movie.trailerUrl && (
                  <Button
                    onClick={() => window.open(movie.trailerUrl, '_blank')}
                    className="bg-cinehub-accent hover:bg-cinehub-accent-hover text-white font-medium px-6 py-3 h-auto cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Watch Trailer
                  </Button>
                )}
                
                {session && (
                  <div className="cursor-pointer">
                    <WatchlistButton
                      id={movie.id}
                      mediaType="movie"
                      title={movie.title}
                      posterPath={movie.posterUrl}
                      className="flex items-center gap-2 bg-card-custom/80 hover:bg-card-custom border-border hover:border-cinehub-accent/50 text-text-main hover:text-white px-6 py-3 h-auto cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  Reviews Section */}
      {session && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cinehub-accent/5 to-transparent" />
          <div className="container relative mx-auto max-w-7xl px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
              <Star className="h-6 w-6 text-cinehub-accent" />
              <h2 className="text-2xl font-bold text-white font-poppins">Reviews & Ratings</h2>
            </div>
            <MediaReviews
              reviews={{
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
              }}
              mediaId={movie.id}
              mediaType="movie"
            />
          </div>
        </div>
      )}

      {/*  Recommendations Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-6 w-6 text-cinehub-accent" />
          <h2 className="text-2xl font-bold text-white font-poppins">You Might Also Like</h2>
        </div>
        <Recommendations />
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