// src/types/api.ts

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    message?: string;
}

export interface SearchParams {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
}

export interface FilterOptions {
    genres?: number[];
    releaseYear?: {
        min?: number;
        max?: number;
    };
    rating?: {
        min?: number;
        max?: number;
    };
    sortBy?: 'popularity' | 'release_date' | 'rating' | 'title';
    sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
    message: string;
    code?: string | number;
    status?: number;
    details?: any;
}

export interface RequestConfig {
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}

export interface CacheConfig {
    ttl?: number; // Time to live in milliseconds
    key?: string;
    tags?: string[];
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Endpoints
export interface ApiEndpoints {
    // Auth endpoints
    AUTH: {
        LOGIN: '/api/auth/login';
        REGISTER: '/api/auth/register';
        LOGOUT: '/api/auth/logout';
        REFRESH: '/api/auth/refresh';
        FORGOT_PASSWORD: '/api/auth/forgot-password';
        RESET_PASSWORD: '/api/auth/reset-password';
    };

    // User endpoints
    USERS: {
        PROFILE: '/api/users/profile';
        UPDATE_PROFILE: '/api/users/profile';
        CHANGE_PASSWORD: '/api/users/change-password';
        DELETE_ACCOUNT: '/api/users/delete';
        UPLOAD_AVATAR: '/api/users/avatar';
    };

    // Movie endpoints
    MOVIES: {
        POPULAR: '/api/movies/popular';
        TOP_RATED: '/api/movies/top-rated';
        NOW_PLAYING: '/api/movies/now-playing';
        UPCOMING: '/api/movies/upcoming';
        SEARCH: '/api/movies/search';
        DETAILS: '/api/movies/:id';
        SIMILAR: '/api/movies/:id/similar';
        DISCOVER: '/api/movies/discover';
    };

    // TV Show endpoints
    TV: {
        POPULAR: '/api/tv/popular';
        TOP_RATED: '/api/tv/top-rated';
        ON_THE_AIR: '/api/tv/on-the-air';
        AIRING_TODAY: '/api/tv/airing-today';
        SEARCH: '/api/tv/search';
        DETAILS: '/api/tv/:id';
        SIMILAR: '/api/tv/:id/similar';
        SEASONS: '/api/tv/:id/seasons';
        SEASON_DETAILS: '/api/tv/:id/seasons/:season_number';
    };

    // Watchlist endpoints
    WATCHLIST: {
        GET: '/api/watchlist';
        ADD: '/api/watchlist';
        REMOVE: '/api/watchlist/:id';
        CHECK: '/api/watchlist/check/:id';
    };

    // Ratings endpoints
    RATINGS: {
        GET: '/api/ratings';
        ADD: '/api/ratings';
        UPDATE: '/api/ratings/:id';
        DELETE: '/api/ratings/:id';
        GET_USER_RATING: '/api/ratings/user/:movieId';
    };

    // Comments endpoints
    COMMENTS: {
        GET: '/api/comments/:movieId';
        ADD: '/api/comments';
        UPDATE: '/api/comments/:id';
        DELETE: '/api/comments/:id';
    };

    // History endpoints
    HISTORY: {
        GET: '/api/history';
        ADD: '/api/history';
        DELETE: '/api/history/:id';
        CLEAR: '/api/history/clear';
    };

    // Recommendations endpoints
    RECOMMENDATIONS: {
        GET: '/api/recommendations';
        REFRESH: '/api/recommendations/refresh';
    };

    // Admin endpoints
    ADMIN: {
        USERS: '/api/admin/users';
        USER_DETAILS: '/api/admin/users/:id';
        UPDATE_USER: '/api/admin/users/:id';
        DELETE_USER: '/api/admin/users/:id';
        STATS: '/api/admin/stats';
        UPLOAD_AVATAR: '/api/admin/avatars/upload';
        GET_AVATARS: '/api/admin/avatars';
    };
}

// Query Keys for TanStack Query
export const QueryKeys = {
    // Movies
    MOVIES: 'movies',
    MOVIE_DETAILS: 'movie-details',
    MOVIE_SIMILAR: 'movie-similar',
    MOVIES_POPULAR: 'movies-popular',
    MOVIES_TOP_RATED: 'movies-top-rated',
    MOVIES_NOW_PLAYING: 'movies-now-playing',
    MOVIES_UPCOMING: 'movies-upcoming',
    MOVIES_SEARCH: 'movies-search',
    MOVIES_DISCOVER: 'movies-discover',

    // TV Shows
    TV: 'tv',
    TV_DETAILS: 'tv-details',
    TV_SIMILAR: 'tv-similar',
    TV_POPULAR: 'tv-popular',
    TV_TOP_RATED: 'tv-top-rated',
    TV_ON_THE_AIR: 'tv-on-the-air',
    TV_AIRING_TODAY: 'tv-airing-today',
    TV_SEARCH: 'tv-search',
    TV_SEASONS: 'tv-seasons',
    TV_SEASON_DETAILS: 'tv-season-details',

    // User Data
    USER_PROFILE: 'user-profile',
    WATCHLIST: 'watchlist',
    RATINGS: 'ratings',
    USER_RATING: 'user-rating',
    COMMENTS: 'comments',
    HISTORY: 'history',
    RECOMMENDATIONS: 'recommendations',

    // Admin
    ADMIN_USERS: 'admin-users',
    ADMIN_USER_DETAILS: 'admin-user-details',
    ADMIN_STATS: 'admin-stats',
    ADMIN_AVATARS: 'admin-avatars',
} as const;

// Mutation Keys
export const MutationKeys = {
    // Auth
    LOGIN: 'login',
    REGISTER: 'register',
    LOGOUT: 'logout',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',

    // User
    UPDATE_PROFILE: 'update-profile',
    CHANGE_PASSWORD: 'change-password',
    DELETE_ACCOUNT: 'delete-account',
    UPLOAD_AVATAR: 'upload-avatar',

    // Watchlist
    ADD_TO_WATCHLIST: 'add-to-watchlist',
    REMOVE_FROM_WATCHLIST: 'remove-from-watchlist',

    // Ratings
    ADD_RATING: 'add-rating',
    UPDATE_RATING: 'update-rating',
    DELETE_RATING: 'delete-rating',

    // Comments
    ADD_COMMENT: 'add-comment',
    UPDATE_COMMENT: 'update-comment',
    DELETE_COMMENT: 'delete-comment',

    // History
    ADD_TO_HISTORY: 'add-to-history',
    DELETE_FROM_HISTORY: 'delete-from-history',
    CLEAR_HISTORY: 'clear-history',

    // Recommendations
    REFRESH_RECOMMENDATIONS: 'refresh-recommendations',

    // Admin
    UPDATE_USER: 'admin-update-user',
    DELETE_USER: 'admin-delete-user',
    ADMIN_UPLOAD_AVATAR: 'admin-upload-avatar',
} as const;

// Request/Response Types
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        avatar?: string;
    };
    token: string;
    refreshToken: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    avatar?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface WatchlistRequest {
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
}

export interface RatingRequest {
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
    rating: number; // 1-5
    comment?: string;
}

export interface CommentRequest {
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
    comment: string;
    rating?: number;
}

export interface HistoryRequest {
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
}

// API Status Codes
export enum ApiStatusCode {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
}

// Error Types
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

export interface FormErrors {
    [key: string]: string | string[];
}

// Upload Types
export interface UploadResponse {
    success: boolean;
    url?: string;
    filename?: string;
    size?: number;
    message?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// Generic List Response
export interface ListResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// Search Response
export interface SearchResponse<T> {
    results: T[];
    totalResults: number;
    totalPages: number;
    page: number;
}

export type ApiResponseStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T = any> {
    data: T | null;
    status: ApiResponseStatus;
    error: string | null;
    lastUpdated: Date | null;
}