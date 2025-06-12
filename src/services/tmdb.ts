import axios from 'axios';
import { TMDBMovie, TMDBResponse, TMDBTVShow, TMDBDiscoverMovieParams, TMDBDiscoverTVParams, TMDBGenre } from '@/types/tmdb';

export type TMDBMovieListType = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
export type TMDBTVListType = 'popular' | 'top_rated' | 'on_the_air';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL;

// Create axios instance
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for logging
tmdbApi.interceptors.request.use(
  (config) => {
    console.log('TMDB API Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error('TMDB API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
tmdbApi.interceptors.response.use(
  (response) => {
    console.log('TMDB API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('TMDB API Response Error:', error);
    return Promise.reject(error);
  }
);

export const TMDB_ENDPOINTS = {
  MOVIES: {
    POPULAR: 'popular',
    TOP_RATED: 'top_rated',
    NOW_PLAYING: 'now_playing',
    UPCOMING: 'upcoming',
  },
  TV: {
    POPULAR: 'popular',
    TOP_RATED: 'top_rated',
    ON_THE_AIR: 'on_the_air',
  },
};

// API functions
export const fetchMovies = async (listType: TMDBMovieListType = 'popular', page: number = 1): Promise<TMDBResponse<TMDBMovie>> => {
  try {
    const response = await tmdbApi.get(`/movie/${listType}`, {
      params: { page },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching movies:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        params: error.config?.params,
      }
    });
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }
};

export const fetchTVShows = async (listType: TMDBTVListType = 'popular', page: number = 1): Promise<TMDBResponse<TMDBTVShow>> => {
  try {
    const response = await tmdbApi.get(`/tv/${listType}`, {
      params: { page },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching TV shows:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        params: error.config?.params,
      }
    });
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }
};

export const fetchGenres = async (type: 'movie' | 'tv'): Promise<TMDBGenre[]> => {
  try {
    const response = await tmdbApi.get(`/genre/${type}/list`);
    return response.data.genres;
  } catch (error) {
    console.error(`Error fetching ${type} genres:`, error);
    return [];
  }
};

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) return '/images/no-poster.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const fetchMovieDetails = async (movieId: number) => {
  try {
    const [movieDetails, credits, videos, reviews, similar] = await Promise.all([
      tmdbApi.get(`/movie/${movieId}`),
      tmdbApi.get(`/movie/${movieId}/credits`),
      tmdbApi.get(`/movie/${movieId}/videos`),
      tmdbApi.get(`/movie/${movieId}/reviews`),
      tmdbApi.get(`/movie/${movieId}/similar`),
    ]);

    return {
      ...movieDetails.data,
      credits: credits.data,
      videos: videos.data,
      reviews: reviews.data,
      similar: similar.data.results,
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const fetchTVShowDetails = async (tvShowId: number) => {
  try {
    const [details, credits, videos, reviews, similar] = await Promise.all([
      tmdbApi.get(`/tv/${tvShowId}`),
      tmdbApi.get(`/tv/${tvShowId}/credits`),
      tmdbApi.get(`/tv/${tvShowId}/videos`),
      tmdbApi.get(`/tv/${tvShowId}/reviews`),
      tmdbApi.get(`/tv/${tvShowId}/similar`),
    ]);

    return {
      ...details.data,
      credits: credits.data,
      videos: videos.data,
      reviews: reviews.data,
      similar: similar.data.results,
    };
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
};

export const fetchSeasonDetails = async (tvShowId: number, seasonNumber: number) => {
  try {
    const { data } = await tmdbApi.get(`/tv/${tvShowId}/season/${seasonNumber}`);
    return data;
  } catch (error) {
    console.error('Error fetching season details:', error);
    throw error;
  }
};

export const searchMulti = async (query: string, page: number = 1) => {
  try {
    const { data } = await tmdbApi.get('/search/multi', {
      params: { query, page },
    });
    return data;
  } catch (error) {
    console.error('Error searching:', error);
    return { results: [], page: 1, total_pages: 1, total_results: 0 };
  }
};

export const searchMovies = async (query: string, page: number = 1) => {
  try {
    const { data } = await tmdbApi.get('/search/movie', {
      params: { query, page },
    });
    return data;
  } catch (error) {
    console.error('Error searching movies:', error);
    return { results: [], page: 1, total_pages: 1, total_results: 0 };
  }
};

export const searchTVShows = async (query: string, page: number = 1) => {
  try {
    const { data } = await tmdbApi.get('/search/tv', {
      params: { query, page },
    });
    return data;
  } catch (error) {
    console.error('Error searching TV shows:', error);
    return { results: [], page: 1, total_pages: 1, total_results: 0 };
  }
};

export const discoverMovies = async (params: Record<string, any> = {}): Promise<TMDBResponse<TMDBMovie>> => {
  try {
    const response = await tmdbApi.get('/discover/movie', { params });
    const adjustedItems = response.data.results
      .filter((item: TMDBMovie) => item.poster_path)
      .map((item: TMDBMovie) => ({
        ...item,
        media_type: 'movie' as const,
      }));

    return {
      ...response.data,
      results: adjustedItems,
    };
  } catch (error) {
    console.error('Error discovering movies:', error);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }
};

export const discoverTVShows = async (params: Record<string, any> = {}): Promise<TMDBResponse<TMDBTVShow>> => {
  try {
    const response = await tmdbApi.get('/discover/tv', { params });
    const adjustedItems = response.data.results
      .filter((item: TMDBTVShow) => item.poster_path)
      .map((item: TMDBTVShow) => ({
        ...item,
        media_type: 'tv' as const,
      }));

    return {
      ...response.data,
      results: adjustedItems,
    };
  } catch (error) {
    console.error('Error discovering TV shows:', error);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }
}; 