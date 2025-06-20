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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div 
                className="skeleton aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
              <div className="space-y-3">
                <div className="skeleton h-5 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
                <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-bg-card to-border" />
                <div className="skeleton h-3 w-2/3 rounded-lg bg-gradient-to-r from-bg-card to-border" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 flex min-h-[500px] flex-col items-center justify-center space-y-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-danger/20 to-warning/20 blur-xl"></div>
          <div className="relative rounded-full bg-gradient-to-br from-danger/10 to-warning/10 p-6 backdrop-blur-sm border border-danger/20">
            <svg className="h-12 w-12 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold text-white font-poppins">Something went wrong</h3>
          <p className="text-text-sub max-w-md font-inter leading-relaxed">
            We encountered an issue while loading our exclusive content. Please check your connection and try again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 cursor-pointer inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-cinehub-accent/25 hover:scale-105 font-inter"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!movies?.length) {
    return (
      <div className="mt-20 flex min-h-[500px] flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-cinehub-accent/20 to-text-sub/20 blur-2xl"></div>
          <div className="relative rounded-full bg-gradient-to-br from-card/50 to-bg-card/80 p-8 backdrop-blur-sm border border-border">
            <svg className="h-16 w-16 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v11a1 1 0 102 0V6a1 1 0 10-2 0zm4 0v11a1 1 0 102 0V6a1 1 0 10-2 0z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-semibold text-white font-poppins">No Content Available</h3>
          <p className="text-text-sub max-w-lg font-inter leading-relaxed text-lg">
            We're working hard to bring you amazing original content. Our creative team is crafting exceptional films that will be available soon!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button className="cursor-pointer inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-cinehub-accent/25 hover:scale-105 font-inter">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM12 3v18M9 8l3-3 3 3" />
              </svg>
              <span>Browse Popular Movies</span>
            </button>
            <button className="cursor-pointer inline-flex items-center space-x-2 rounded-xl border border-border bg-card/50 px-6 py-3 text-sm font-medium text-text-main transition-all duration-300 hover:bg-card hover:border-cinehub-accent/50 hover:scale-105 font-inter">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Explore All Content</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Stats Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-card/50 to-bg-card/30 p-6 backdrop-blur-sm border border-border">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white font-poppins">{movies.length}</div>
            <div className="text-sm text-text-sub font-inter">Total Films</div>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cinehub-accent font-poppins">HD</div>
            <div className="text-sm text-text-sub font-inter">Quality</div>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success font-poppins">NEW</div>
            <div className="text-sm text-text-sub font-inter">Content</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-sub font-inter">
          <div className="h-2 w-2 rounded-full bg-cinehub-accent animate-pulse"></div>
          <span>Updated regularly</span>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {movies.map((movie: any, index: number) => (
          <div
            key={movie.id}
            className="group animate-fade-in hover-lift"
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

      {/* Load More Section (if needed in future) */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center space-x-2 text-text-sub font-inter">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-border"></div>
          <span className="text-sm">End of exclusive content</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-border"></div>
        </div>
      </div>
    </div>
  );
}

export default function InternalMoviesPage() {
  return (
    <div className="min-h-screen bg-main">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cinehub-accent/5 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,209,197,0.1),transparent_70%)]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cinehub-accent/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-success/10 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Main Title Section */}
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-cinehub-accent/10 to-success/10 px-4 py-2 text-sm font-medium text-cinehub-accent border border-cinehub-accent/20">
              <div className="h-2 w-2 rounded-full bg-cinehub-accent animate-pulse"></div>
              <span className="font-inter">Exclusive CineHub Originals</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="section-title font-poppins text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-white via-text-main to-cinehub-accent bg-clip-text text-transparent">
                CineHub's Films
              </h1>
              <p className="text-text-sub text-lg md:text-xl font-inter max-w-3xl mx-auto leading-relaxed">
                Discover our exclusive collection of premium, original content. Each film is carefully curated 
                and produced to deliver an exceptional viewing experience that you won't find anywhere else.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button className="cursor-pointer flex items-center space-x-3 rounded-xl bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-cinehub-accent/25 hover:scale-105 font-inter">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span>Filter Content</span>
              </button>
              
              <button className="cursor-pointer flex items-center space-x-3 rounded-xl border border-border bg-card/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-text-main transition-all duration-300 hover:bg-card/50 hover:border-cinehub-accent/50 hover:scale-105 font-inter">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>Sort by Date</span>
              </button>
              
              <button className="cursor-pointer flex items-center space-x-3 rounded-xl border border-border bg-card/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-text-main transition-all duration-300 hover:bg-card/50 hover:border-cinehub-accent/50 hover:scale-105 font-inter">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Favorites</span>
              </button>
            </div>

            {/* Divider with decorative elements */}
            <div className="relative flex items-center justify-center py-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
              <div className="relative flex items-center space-x-3 bg-main px-6">
                <div className="h-2 w-2 rounded-full bg-cinehub-accent animate-pulse"></div>
                <div className="h-1 w-1 rounded-full bg-text-sub"></div>
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <Suspense fallback={<Loading />}>
          <InternalMoviesList />
        </Suspense>
      </div>
    </div>
  );
}