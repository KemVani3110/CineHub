'use client';
import { Suspense } from 'react';
import { InternalMovieCard } from '@/components/lazy';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/common/Loading';

async function getInternalMovies() {
  const res = await fetch('/api/internal-movies');
  if (!res.ok) {
    throw new Error('Failed to fetch internal movies');
  }
  return res.json();
}

function InternalMoviesList() {
  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['internalMovies'],
    queryFn: getInternalMovies,
  });

  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="skeleton aspect-[2/3] w-full rounded-lg" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16 flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-danger/10 p-4">
          <svg className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-text-sub max-w-md">
            Error loading movies. Please check your connection and try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!movies?.length) {
    return (
      <div className="mt-16 flex min-h-[400px] flex-col items-center justify-center space-y-6">
        <div className="rounded-full bg-card-custom p-6">
          <svg className="h-12 w-12 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v11a1 1 0 102 0V6a1 1 0 10-2 0zm4 0v11a1 1 0 102 0V6a1 1 0 10-2 0z" />
          </svg>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-semibold text-white">No Content Available</h3>
          <p className="text-text-sub max-w-md">
            We're working hard to bring you amazing content. Check back soon for new releases!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Movies Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {movies.map((movie: any, index: number) => (
          <div
            key={movie.id}
            className="group"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <InternalMovieCard
              id={movie.id}
              title={movie.title}
              shortDescription={movie.shortDescription}
              posterUrl={movie.posterUrl}
              releaseDate={movie.releaseDate}
              durationMinutes={movie.durationMinutes}
              genres={movie.genres}
              status={movie.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InternalMoviesPage() {
  return (
    <div className="min-h-screen bg-main px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,209,197,0.1),transparent_70%)]"></div>
        
        <div className="container relative mx-auto max-w-7xl py-12 lg:py-16">
          {/* Title Section */}
          <div className="space-y-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-end lg:justify-between lg:space-y-0">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <h1 className="section-title font-poppins">CineHub's Films</h1>
                    <p className="text-text-sub mt-1 font-inter">
                      Exclusive content crafted with passion
                    </p>
                  </div>
                </div>
                
                <div className="max-w-2xl">
                  <p className="text-text-sub leading-relaxed font-inter">
                    Discover our collection of premium, original content. Each film is carefully curated 
                    and produced to deliver an exceptional viewing experience that you won't find anywhere else.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center space-x-2 rounded-lg border border-border bg-card-custom/50 px-4 py-2 text-sm text-text-main transition-all hover:border-cinehub-accent/50 hover:bg-card-custom font-inter">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 rounded-lg border border-border bg-card-custom/50 px-4 py-2 text-sm text-text-main transition-all hover:border-cinehub-accent/50 hover:bg-card-custom font-inter">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl pb-16">
        <Suspense fallback={<Loading />}>
          <InternalMoviesList />
        </Suspense>
      </div>
    </div>
  );
}