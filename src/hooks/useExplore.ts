import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { discoverMovies, discoverTVShows, fetchGenres } from '@/services/tmdb';
import { useExploreStore } from '@/store/exploreStore';
import { useEffect } from 'react';

const getDiscoverParams = (
  activeTab: 'movie' | 'tv',
  filters: any,
  page: number = 1
) => {
  const params: Record<string, any> = {
    page,
    sort_by: `${filters.sortBy}.${filters.sortOrder}`,
    'vote_average.gte': filters.rating,
    'vote_count.gte': 100,
    include_adult: false,
    include_video: false,
    language: 'en-US',
  };

  if (filters.genres.length > 0) {
    params.with_genres = filters.genres.join(',');
  }

  if (activeTab === 'movie') {
    if (filters.year) {
      params.primary_release_year = filters.year;
    }
    if (filters.runtime.min) {
      params['with_runtime.gte'] = filters.runtime.min;
    }
    if (filters.runtime.max) {
      params['with_runtime.lte'] = filters.runtime.max;
    }
    if (filters.releaseDate.from) {
      params['primary_release_date.gte'] = filters.releaseDate.from;
    }
    if (filters.releaseDate.to) {
      params['primary_release_date.lte'] = filters.releaseDate.to;
    }
  } else {
    if (filters.year) {
      params.first_air_date_year = filters.year;
    }
    if (filters.runtime.min) {
      params['with_runtime.gte'] = filters.runtime.min;
    }
    if (filters.runtime.max) {
      params['with_runtime.lte'] = filters.runtime.max;
    }
    if (filters.releaseDate.from) {
      params['first_air_date.gte'] = filters.releaseDate.from;
    }
    if (filters.releaseDate.to) {
      params['first_air_date.lte'] = filters.releaseDate.to;
    }
  }

  return params;
};

export const useExplore = () => {
  const { activeTab, filters } = useExploreStore();
  const queryClient = useQueryClient();

  // Reset queries when tab changes
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ['discover', activeTab === 'movie' ? 'tv' : 'movie'] });
  }, [activeTab, queryClient]);

  const { data: genres } = useQuery({
    queryKey: ['genres', activeTab],
    queryFn: () => fetchGenres(activeTab),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const {
    data: movieData,
    fetchNextPage: fetchNextMoviePage,
    hasNextPage: hasNextMoviePage,
    isFetchingNextPage: isFetchingNextMoviePage,
    isLoading: isMovieLoading,
    refetch: refetchMovies
  } = useInfiniteQuery({
    queryKey: ['discover', 'movie', filters],
    queryFn: ({ pageParam = 1 }) => {
      const params = getDiscoverParams('movie', filters, pageParam as number);
      return discoverMovies(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page && lastPage.total_pages && lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 0, // Don't cache
    enabled: activeTab === 'movie',
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    gcTime: 0, // Don't keep in cache
  });

  const {
    data: tvData,
    fetchNextPage: fetchNextTVPage,
    hasNextPage: hasNextTVPage,
    isFetchingNextPage: isFetchingNextTVPage,
    isLoading: isTVLoading,
    refetch: refetchTV
  } = useInfiniteQuery({
    queryKey: ['discover', 'tv', filters],
    queryFn: ({ pageParam = 1 }) => {
      const params = getDiscoverParams('tv', filters, pageParam as number);
      return discoverTVShows(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page && lastPage.total_pages && lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 0, // Don't cache
    enabled: activeTab === 'tv',
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    gcTime: 0, // Don't keep in cache
  });

  const results = activeTab === 'movie' 
    ? movieData?.pages.flatMap((page) => page.results) || []
    : tvData?.pages.flatMap((page) => page.results) || [];

  return {
    data: results,
    genres,
    isLoading: activeTab === 'movie' ? isMovieLoading : isTVLoading,
    loadMore: activeTab === 'movie' ? fetchNextMoviePage : fetchNextTVPage,
    hasMore: activeTab === 'movie' ? hasNextMoviePage : hasNextTVPage,
    isFetchingMore: activeTab === 'movie' ? isFetchingNextMoviePage : isFetchingNextTVPage,
    refetch: activeTab === 'movie' ? refetchMovies : refetchTV
  };
}; 