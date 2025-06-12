import { useQuery } from '@tanstack/react-query';
import { useSearchStore } from '@/store/searchStore';
import { searchMulti, searchMovies, searchTVShows } from '@/services/tmdb';
import { useDebounce } from '@/hooks/useDebounce';

export const useSearch = (page: number = 1) => {
  const { query, type } = useSearchStore();
  const debouncedQuery = useDebounce(query, 500);

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery, type, page],
    queryFn: async () => {
      if (!debouncedQuery) return { results: [], page: 1, total_pages: 1, total_results: 0 };

      switch (type) {
        case 'movie':
          return searchMovies(debouncedQuery, page);
        case 'tv':
          return searchTVShows(debouncedQuery, page);
        default:
          return searchMulti(debouncedQuery, page);
      }
    },
    enabled: !!debouncedQuery,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ...searchQuery,
    query: debouncedQuery,
  };
}; 