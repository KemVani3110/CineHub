'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MovieCard } from '@/components/common/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMovies, TMDBMovieListType } from '@/services/tmdb';

interface MovieListProps {
  listType: TMDBMovieListType;
  apiPath?: string;
}

const MovieList = ({ listType }: MovieListProps) => {
  const { data: firstPageData, isLoading: isLoadingFirstPage } = useQuery({
    queryKey: ['movies', listType, 1],
    queryFn: () => fetchMovies(listType, 1),
  });

  const { data: secondPageData, isLoading: isLoadingSecondPage } = useQuery({
    queryKey: ['movies', listType, 2],
    queryFn: () => fetchMovies(listType, 2),
  });

  const isLoading = isLoadingFirstPage || isLoadingSecondPage;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {[...Array(24)].map((_, index) => (
          <div key={index} className="group relative cursor-pointer">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="relative aspect-[2/3] w-full">
                <div className="absolute inset-0 bg-[#1B263B]">
                  <Skeleton className="w-full h-full" />
                </div>
              </div>
              <div className="mt-3 px-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!firstPageData?.results?.length) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xl">No movies found</div>
          <div className="text-gray-500">Try a different category</div>
        </div>
      </div>
    );
  }

  // Combine results from both pages and remove duplicates
  const allMovies = [
    ...(firstPageData?.results || []),
    ...(secondPageData?.results || [])
  ].filter((movie, index, self) => 
    index === self.findIndex((m) => m.id === movie.id)
  );

  // Filter upcoming movies to show only future releases
  const filteredMovies = listType === 'upcoming' 
    ? allMovies.filter(movie => {
        const releaseDate = new Date(movie.release_date);
        return releaseDate > new Date();
      })
    : allMovies;

  // Get first 24 movies
  const displayMovies = filteredMovies.slice(0, 24);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {displayMovies.map((movie, index) => (
        <MovieCard key={`${movie.id}-${index}`} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList; 