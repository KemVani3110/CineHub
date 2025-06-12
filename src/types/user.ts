/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/user.ts

import { UserRole, AuthProvider } from './auth';

export interface UserProfile {
    id: number;
    email: string;
    name: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    provider: AuthProvider;
    providerId?: string;
    preferences?: UserPreferences;
    stats?: UserStats;
}

export interface UserPreferences {
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
        recommendations: boolean;
        newReleases: boolean;
    };
    privacy: {
        showWatchlist: boolean;
        showRatings: boolean;
        showActivity: boolean;
    };
    genrePreferences?: number[]; // TMDB genre IDs
}

export interface UserStats {
    totalMoviesWatched: number;
    totalTVShowsWatched: number;
    totalRatings: number;
    totalComments: number;
    averageRating: number;
    favoriteGenres: GenreStats[];
    watchTime: number; // in minutes
    joinedDate: Date;
}

export interface GenreStats {
    genreId: number;
    genreName: string;
    count: number;
    percentage: number;
}

export interface UpdateUserProfileRequest {
    name?: string;
    email?: string;
    avatar?: string;
    preferences?: Partial<UserPreferences>;
}

export interface UserActivity {
    id: number;
    userId: number;
    type: ActivityType;
    entityType: 'movie' | 'tv';
    entityId: number;
    entityTitle: string;
    entityPoster?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

export enum ActivityType {
    WATCHED = 'watched',
    RATED = 'rated',
    ADDED_TO_WATCHLIST = 'added_to_watchlist',
    REMOVED_FROM_WATCHLIST = 'removed_from_watchlist',
    COMMENTED = 'commented',
    LIKED = 'liked'
}

// Admin-specific types
export interface AdminUserView {
    id: number;
    email: string;
    name: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    provider: AuthProvider;
    stats: UserStats;
    recentActivity: UserActivity[];
}

export interface AdminUserUpdateRequest {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    password?: string; // Admin can reset user password
}

export interface AdminStats {
    totalUsers: number;
    totalActiveUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    usersByRole: {
        [key in UserRole]: number;
    };
    usersByProvider: {
        [key in AuthProvider]: number;
    };
    topGenres: GenreStats[];
    totalMoviesRated: number;
    totalTVShowsRated: number;
    totalComments: number;
    averageRating: number;
}

export interface AdminActivityLog {
    id: number;
    adminId: number;
    adminName: string;
    action: AdminAction;
    targetUserId?: number;
    targetUserName?: string;
    details: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

export enum AdminAction {
    USER_CREATED = 'user_created',
    USER_UPDATED = 'user_updated',
    USER_DELETED = 'user_deleted',
    USER_ACTIVATED = 'user_activated',
    USER_DEACTIVATED = 'user_deactivated',
    ROLE_CHANGED = 'role_changed',
    PASSWORD_RESET = 'password_reset',
    AVATAR_UPLOADED = 'avatar_uploaded'
}

// Avatar management
export interface UserAvatar {
    id: number;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
    uploadedBy: number;
    uploadedAt: Date;
    isActive: boolean;
}

export interface UploadAvatarRequest {
    file: File;
}

export interface UploadAvatarResponse {
    success: boolean;
    avatar: UserAvatar;
    url: string;
    message?: string;
}

// User search and filtering
export interface UserSearchParams {
    query?: string;
    role?: UserRole;
    provider?: AuthProvider;
    isActive?: boolean;
    emailVerified?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
    sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface UserListResponse {
    users: AdminUserView[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Social features
export interface UserFollowing {
    id: number;
    followerId: number;
    followingId: number;
    createdAt: Date;
    follower: Pick<UserProfile, 'id' | 'name' | 'avatar'>;
    following: Pick<UserProfile, 'id' | 'name' | 'avatar'>;
}

export interface UserPublicProfile {
    id: number;
    name: string;
    avatar?: string;
    joinedDate: Date;
    stats: {
        totalMoviesRated: number;
        totalTVShowsRated: number;
        averageRating: number;
        favoriteGenres: GenreStats[];
    };
    recentActivity?: UserActivity[];
    isFollowing?: boolean;
    followersCount: number;
    followingCount: number;
}

// Account deletion
export interface DeleteAccountRequest {
    password: string;
    reason?: string;
    feedback?: string;
}

export interface DeleteAccountResponse {
    success: boolean;
    message: string;
    scheduledDeletionDate?: Date;
}

export interface User {
    id: number;
    email: string;
    name: string;
    avatar?: string;
    role: 'user' | 'admin' | 'moderator';
    is_active: boolean;
    email_verified: boolean;
    email_verified_at?: string;
    provider: 'local' | 'google' | 'facebook' | 'github';
    provider_id?: string;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
}