/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/movie.ts

import {
  TMDBMovie,
  TMDBMovieDetails,
  TMDBGenre,
  TMDBCollection,
  TMDBProductionCountry,
  TMDBSpokenLanguage,
  TMDBCredits,
  TMDBVideos,
  TMDBImages,
  TMDBReviews,
  TMDBExternalIds,
  TMDBWatchProviders,
  TMDBKeywords,
  TMDBTranslations
} from './tmdb';

// Extended Movie types for CineHub application
export interface Movie extends TMDBMovie {
  // Additional properties for local storage/processing
  watchlist_id?: number;
  user_rating?: number;
  user_comment?: string;
  watch_progress?: WatchProgress;
  added_to_watchlist_at?: Date;
  last_watched_at?: Date;
  is_favorite?: boolean;
  watched?: boolean;
}

export interface MovieDetails extends TMDBMovieDetails {
  // Additional details from TMDB API
  credits?: TMDBCredits;
  videos?: TMDBVideos;
  images?: TMDBImages;
  reviews?: TMDBReviews;
  similar?: TMDBMovie[];
  recommendations?: TMDBMovie[];
  external_ids?: TMDBExternalIds;
  watch_providers?: TMDBWatchProviders;
  keywords?: TMDBKeywords;
  translations?: TMDBTranslations;
  release_dates?: MovieReleaseDates;

  // User-specific data
  user_rating?: number;
  user_comment?: string;
  in_watchlist?: boolean;
  watch_progress?: WatchProgress;
  watched_at?: Date;
  user_review?: UserMovieReview;
}

// Movie Watch Progress
export interface WatchProgress {
  duration: number; // total duration in seconds
  watched_duration: number; // watched duration in seconds
  percentage: number; // 0-100
  completed: boolean;
  last_watched_at: Date;
  status: WatchStatus;
}

export enum WatchStatus {
  NOT_STARTED = 'not_started',
  WATCHING = 'watching',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  DROPPED = 'dropped',
  PLAN_TO_WATCH = 'plan_to_watch'
}

// User Reviews and Ratings
export interface UserMovieReview {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number; // 1-5 stars
  comment?: string;
  spoiler: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface MovieReviewRequest {
  movie_id: number;
  rating: number;
  comment?: string;
  spoiler?: boolean;
}

// Movie Lists and Categories
export interface MovieList {
  id: string;
  name: string;
  description?: string;
  movies: Movie[];
  total_count: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface MovieCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  movies: Movie[];
  total_pages: number;
  current_page: number;
}

// Movie Search and Filter
export interface MovieSearchParams {
  query?: string;
  page?: number;
  include_adult?: boolean;
  language?: string;
  primary_release_year?: number;
  year?: number;
  region?: string;
  with_genres?: number[];
  without_genres?: number[];
  vote_average_gte?: number;
  vote_average_lte?: number;
  release_date_gte?: string;
  release_date_lte?: string;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  sort_by?: MovieSortBy;
  sort_order?: 'asc' | 'desc';
}

export enum MovieSortBy {
  POPULARITY = 'popularity.desc',
  RATING = 'vote_average.desc',
  RELEASE_DATE = 'release_date.desc',
  TITLE = 'title.asc',
  REVENUE = 'revenue.desc'
}

export interface MovieFilterOptions {
  genres: TMDBGenre[];
  years: number[];
  ratings: {
    min: number;
    max: number;
  };
  runtime: {
    min: number;
    max: number;
  };
  languages: TMDBSpokenLanguage[];
  countries: TMDBProductionCountry[];
}

// Watchlist Management
export interface MovieWatchlistItem {
  id: number;
  user_id: number;
  movie_id: number;
  movie: Movie;
  added_at: Date;
  priority: WatchlistPriority;
  notes?: string;
  reminder_date?: Date;
  status: WatchStatus;
}

export enum WatchlistPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface AddToWatchlistRequest {
  movie_id: number;
  priority?: WatchlistPriority;
  notes?: string;
  reminder_date?: Date;
}

// Movie History
export interface MovieWatchHistory {
  id: number;
  user_id: number;
  movie_id: number;
  movie: Movie;
  watched_at: Date;
  duration_watched?: number;
  completed?: boolean;
  device?: string;
  platform?: string;
}

export interface MovieWatchHistoryRequest {
  movie_id: number;
  duration_watched?: number;
  completed?: boolean;
}

// Movie Recommendations
export interface MovieRecommendation {
  id: number;
  user_id: number;
  movie: Movie;
  reason: RecommendationReason;
  confidence_score: number; // 0-1
  based_on: {
    type: 'genre' | 'similar_movie' | 'cast' | 'director' | 'collection';
    reference_id: number;
    reference_name: string;
  };
  created_at: Date;
  clicked?: boolean;
  clicked_at?: Date;
  added_to_watchlist?: boolean;
}

export enum RecommendationReason {
  SIMILAR_GENRE = 'similar_genre',
  SIMILAR_MOVIE = 'similar_movie',
  SAME_DIRECTOR = 'same_director',
  SAME_CAST = 'same_cast',
  SAME_COLLECTION = 'same_collection',
  TRENDING = 'trending',
  HIGH_RATED = 'high_rated',
  NEW_RELEASE = 'new_release'
}

// Movie Statistics
export interface MovieStats {
  total_movies_watched: number;
  total_watch_time: number; // in minutes
  favorite_genres: Array<{
    genre: TMDBGenre;
    count: number;
    percentage: number;
  }>;
  favorite_directors: Array<{
    director: {
      id: number;
      name: string;
    };
    count: number;
    percentage: number;
  }>;
  average_rating: number;
  completion_rate: number; // percentage
  most_watched_year: number;
  favorite_decade: string;
}

// External Integration
export interface ExternalMovieData {
  imdb_id?: string;
  imdb_rating?: number;
  rotten_tomatoes_score?: number;
  metacritic_score?: number;
  letterboxd_rating?: number;
  trakt_id?: number;
}

// Release Dates (extended from TMDB)
export interface MovieReleaseDates {
  results: CountryReleaseDate[];
}

export interface CountryReleaseDate {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
}

export interface ReleaseDate {
  certification: string;
  descriptors: string[];
  iso_639_1: string;
  note: string;
  release_date: string;
  type: ReleaseDateType;
}

export enum ReleaseDateType {
  PREMIERE = 1,
  THEATRICAL_LIMITED = 2,
  THEATRICAL = 3,
  DIGITAL = 4,
  PHYSICAL = 5,
  TV = 6
}

// Notification Types for Movies
export interface MovieNotification {
  id: number;
  user_id: number;
  movie_id: number;
  type: MovieNotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: Date;
}

export enum MovieNotificationType {
  NEW_TRAILER = 'new_trailer',
  RELEASE_DATE = 'release_date',
  STREAMING_AVAILABLE = 'streaming_available',
  WATCHLIST_REMINDER = 'watchlist_reminder',
  RECOMMENDATION = 'recommendation',
  COLLECTION_UPDATE = 'collection_update'
}

// Export types for API responses
export interface MovieResponse {
  success: boolean;
  data: Movie | Movie[];
  pagination?: {
    page: number;
    total_pages: number;
    total_results: number;
  };
  message?: string;
}

export interface MovieDetailsResponse {
  success: boolean;
  data: MovieDetails;
  message?: string;
}

// Utility types
export type MovieID = number;

export interface MovieIdentifier {
  movie_id: MovieID;
}

// Trending
export interface TrendingMoviesParams {
  time_window: 'day' | 'week';
  page?: number;
}

// Movie Lists from TMDB
export type TMDBMovieListType =
  | 'popular'
  | 'top_rated'
  | 'now_playing'
  | 'upcoming';

// Component Props Types
export interface MovieCardProps {
  movie: Movie;
  showProgress?: boolean;
  showRating?: boolean;
  showWatchlistButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: (movie: Movie) => void;
}

export interface MovieCollectionProps {
  collection: TMDBCollection;
  onClick?: (collection: TMDBCollection) => void;
}

// Person Credits (for cast/crew in movies)
export interface PersonMovieCredits {
  cast: PersonMovieCastCredit[];
  crew: PersonMovieCrewCredit[];
}

export interface PersonMovieCastCredit extends TMDBMovie {
  character: string;
  credit_id: string;
  order?: number;
}

export interface PersonMovieCrewCredit extends TMDBMovie {
  job: string;
  department: string;
  credit_id: string;
}