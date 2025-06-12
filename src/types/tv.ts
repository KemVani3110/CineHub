/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/tv.ts

import {
    TMDBTV,
    TMDBTVDetails,
    TMDBSeason,
    TMDBSeasonDetails,
    TMDBEpisode,
    TMDBGenre,
    TMDBCreatedBy,
    TMDBNetwork,
    TMDBCredits,
    TMDBVideos,
    TMDBImages,
    TMDBReviews,
    TMDBExternalIds,
    TMDBWatchProviders,
    TMDBKeywords,
    TMDBTranslations
} from './tmdb';

// Extended TV Show types for CineHub application
export interface TVShow extends TMDBTV {
    // Additional properties for local storage/processing
    watchlist_id?: number;
    user_rating?: number;
    user_comment?: string;
    watch_progress?: WatchProgress;
    added_to_watchlist_at?: Date;
    last_watched_at?: Date;
    is_favorite?: boolean;
}

export interface TVShowDetails extends TMDBTVDetails {
    // Additional details from TMDB API
    credits?: TMDBCredits;
    videos?: TMDBVideos;
    images?: TMDBImages;
    reviews?: TMDBReviews;
    similar?: TMDBTV[];
    recommendations?: TMDBTV[];
    external_ids?: TMDBExternalIds;
    watch_providers?: TMDBWatchProviders;
    keywords?: TMDBKeywords;
    translations?: TMDBTranslations;

    // User-specific data
    user_rating?: number;
    user_comment?: string;
    in_watchlist?: boolean;
    watch_progress?: WatchProgress;
    last_watched_at?: Date;
    user_review?: UserTVReview;
}

// Season with additional user data
export interface Season extends TMDBSeason {
    user_rating?: number;
    watch_progress?: SeasonProgress;
    completed?: boolean;
    last_watched_episode?: number;
    last_watched_at?: Date;
}

export interface SeasonDetails extends TMDBSeasonDetails {
    credits?: TMDBCredits;
    videos?: TMDBVideos;
    images?: TMDBImages;
    external_ids?: TMDBExternalIds;

    // User progress data
    user_rating?: number;
    watch_progress?: SeasonProgress;
    episodes_watched?: number[];
    completed?: boolean;
}

// Episode with user progress
export interface Episode extends TMDBEpisode {
    watched?: boolean;
    watch_progress?: EpisodeProgress;
    user_rating?: number;
    watched_at?: Date;
    duration_watched?: number; // in seconds
}

// Watch Progress Types
export interface WatchProgress {
    current_season: number;
    current_episode: number;
    total_seasons: number;
    total_episodes: number;
    completed_episodes: number;
    percentage: number;
    last_watched_at: Date;
    status: WatchStatus;
}

export interface SeasonProgress {
    season_number: number;
    total_episodes: number;
    watched_episodes: number;
    current_episode: number;
    percentage: number;
    completed: boolean;
    last_watched_at?: Date;
}

export interface EpisodeProgress {
    episode_id: number;
    season_number: number;
    episode_number: number;
    duration: number; // total duration in seconds
    watched_duration: number; // watched duration in seconds
    percentage: number;
    completed: boolean;
    watched_at?: Date;
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
export interface UserTVReview {
    id: number;
    user_id: number;
    tv_id: number;
    season_number?: number;
    episode_number?: number;
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

export interface TVReviewRequest {
    tv_id: number;
    season_number?: number;
    episode_number?: number;
    rating: number;
    comment?: string;
    spoiler?: boolean;
}

// TV Show Lists and Categories
export interface TVShowList {
    id: string;
    name: string;
    description?: string;
    shows: TVShow[];
    total_count: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface TVShowCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    shows: TVShow[];
    total_pages: number;
    current_page: number;
}

// TV Show Search and Filter
export interface TVShowSearchParams {
    query?: string;
    page?: number;
    include_adult?: boolean;
    language?: string;
    first_air_date_year?: number;
    with_genres?: number[];
    without_genres?: number[];
    with_networks?: number[];
    vote_average_gte?: number;
    vote_average_lte?: number;
    air_date_gte?: string;
    air_date_lte?: string;
    sort_by?: TVShowSortBy;
    sort_order?: 'asc' | 'desc';
}

export enum TVShowSortBy {
    POPULARITY = 'popularity.desc',
    RATING = 'vote_average.desc',
    FIRST_AIR_DATE = 'first_air_date.desc',
    NAME = 'name.asc'
}

export interface TVShowFilterOptions {
    genres: TMDBGenre[];
    networks: TMDBNetwork[];
    years: number[];
    ratings: {
        min: number;
        max: number;
    };
    status: string[];
    type: string[];
}

// Watchlist Management
export interface TVWatchlistItem {
    id: number;
    user_id: number;
    tv_id: number;
    tv_show: TVShow;
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
    tv_id: number;
    priority?: WatchlistPriority;
    notes?: string;
    reminder_date?: Date;
}

// TV Show History
export interface TVWatchHistory {
    id: number;
    user_id: number;
    tv_id: number;
    season_number?: number;
    episode_number?: number;
    tv_show: TVShow;
    watched_at: Date;
    duration_watched?: number;
    completed?: boolean;
    device?: string;
    platform?: string;
}

export interface TVWatchHistoryRequest {
    tv_id: number;
    season_number?: number;
    episode_number?: number;
    duration_watched?: number;
    completed?: boolean;
}

// TV Show Recommendations
export interface TVRecommendation {
    id: number;
    user_id: number;
    tv_show: TVShow;
    reason: RecommendationReason;
    confidence_score: number; // 0-1
    based_on: {
        type: 'genre' | 'similar_show' | 'cast' | 'network';
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
    SIMILAR_SHOW = 'similar_show',
    SAME_NETWORK = 'same_network',
    SAME_CAST = 'same_cast',
    TRENDING = 'trending',
    HIGH_RATED = 'high_rated',
    NEW_RELEASE = 'new_release'
}

// TV Show Statistics
export interface TVShowStats {
    total_shows_watched: number;
    total_episodes_watched: number;
    total_watch_time: number; // in minutes
    favorite_genres: Array<{
        genre: TMDBGenre;
        count: number;
        percentage: number;
    }>;
    favorite_networks: Array<{
        network: TMDBNetwork;
        count: number;
        percentage: number;
    }>;
    average_rating: number;
    completion_rate: number; // percentage
    most_watched_year: number;
    binge_watching_sessions: number;
}

// External Integration
export interface ExternalTVShowData {
    imdb_id?: string;
    imdb_rating?: number;
    rotten_tomatoes_score?: number;
    metacritic_score?: number;
    trakt_id?: number;
    tvdb_id?: number;
}

// TV Show Collection/Series
export interface TVShowCollection {
    id: number;
    name: string;
    description?: string;
    poster_path?: string;
    backdrop_path?: string;
    shows: TVShow[];
    created_by: TMDBCreatedBy[];
    networks: TMDBNetwork[];
    genres: TMDBGenre[];
}

// Notification Types for TV Shows
export interface TVShowNotification {
    id: number;
    user_id: number;
    tv_id: number;
    type: TVNotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    created_at: Date;
}

export enum TVNotificationType {
    NEW_EPISODE = 'new_episode',
    NEW_SEASON = 'new_season',
    SERIES_FINALE = 'series_finale',
    WATCHLIST_REMINDER = 'watchlist_reminder',
    RECOMMENDATION = 'recommendation'
}

// Export types for API responses
export interface TVShowResponse {
    success: boolean;
    data: TVShow | TVShow[];
    pagination?: {
        page: number;
        total_pages: number;
        total_results: number;
    };
    message?: string;
}

export interface TVShowDetailsResponse {
    success: boolean;
    data: TVShowDetails;
    message?: string;
}

export interface SeasonDetailsResponse {
    success: boolean;
    data: SeasonDetails;
    message?: string;
}

// Utility types
export type TVShowID = number;
export type SeasonNumber = number;
export type EpisodeNumber = number;

export interface TVShowIdentifier {
    tv_id: TVShowID;
    season_number?: SeasonNumber;
    episode_number?: EpisodeNumber;
}

// Component Props Types
export interface TVShowCardProps {
    tvShow: TVShow;
    showProgress?: boolean;
    showRating?: boolean;
    showWatchlistButton?: boolean;
    size?: 'small' | 'medium' | 'large';
    onClick?: (tvShow: TVShow) => void;
}

export interface SeasonCardProps {
    season: Season;
    tvShow: TVShow;
    showProgress?: boolean;
    onClick?: (season: Season) => void;
}

export interface EpisodeCardProps {
    episode: Episode;
    season: Season;
    tvShow: TVShow;
    showProgress?: boolean;
    onClick?: (episode: Episode) => void;
}