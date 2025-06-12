/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/database.ts

import { UserRole, AuthProvider } from './auth';

// User table
export interface UserTable {
    id: number;
    email: string;
    password_hash?: string; // null for social auth users
    name: string;
    avatar?: string;
    role: UserRole;
    is_active: boolean;
    email_verified: boolean;
    email_verified_at?: Date;
    provider: AuthProvider;
    provider_id?: string;
    remember_token?: string;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
    login_attempts: number;
    locked_until?: Date;
}

// User preferences table
export interface UserPreferencesTable {
    id: number;
    user_id: number;
    language: string;
    notifications_email: boolean;
    notifications_push: boolean;
    notifications_recommendations: boolean;
    notifications_new_releases: boolean;
    privacy_show_watchlist: boolean;
    privacy_show_ratings: boolean;
    privacy_show_activity: boolean;
    genre_preferences?: string; // JSON array of genre IDs
    created_at: Date;
    updated_at: Date;
}

// Watchlist table
export interface WatchlistTable {
    id: number;
    user_id: number;
    movie_id?: number;
    tv_id?: number;
    media_type: 'movie' | 'tv';
    added_at: Date;
    priority?: number; // For ordering
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

// Ratings table
export interface RatingsTable {
    id: number;
    user_id: number;
    movie_id?: number;
    tv_id?: number;
    media_type: 'movie' | 'tv';
    rating: number; // 1-5
    created_at: Date;
    updated_at: Date;
}

// Comments table
export interface CommentsTable {
    id: number;
    user_id: number;
    movie_id?: number;
    tv_id?: number;
    media_type: 'movie' | 'tv';
    content: string;
    rating?: number; // Optional rating with comment
    is_edited: boolean;
    created_at: Date;
    updated_at: Date;
}

// Watch history table
export interface WatchHistoryTable {
    id: number;
    user_id: number;
    movie_id?: number;
    tv_id?: number;
    media_type: 'movie' | 'tv';
    watched_at: Date;
    watch_duration?: number; // in minutes
    completed: boolean;
    created_at: Date;
    updated_at: Date;
}

// User avatars table (for admin uploaded avatars)
export interface UserAvatarsTable {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    uploaded_by: number; // admin/moderator user ID
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

// Password reset tokens table
export interface PasswordResetTokensTable {
    id: number;
    email: string;
    token: string;
    expires_at: Date;
    used_at?: Date;
    created_at: Date;
}

// Email verification tokens table
export interface EmailVerificationTokensTable {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
    verified_at?: Date;
    created_at: Date;
}

// Sessions table (for JWT token management)
export interface SessionsTable {
    id: number;
    user_id: number;
    token_id: string;
    refresh_token: string;
    expires_at: Date;
    user_agent?: string;
    ip_address?: string;
    last_activity: Date;
    created_at: Date;
}

// Admin activity logs table
export interface AdminActivityLogsTable {
    id: number;
    admin_id: number;
    action: string;
    target_user_id?: number;
    description: string;
    metadata?: string; // JSON
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}

// User activity logs table
export interface UserActivityLogsTable {
    id: number;
    user_id: number;
    activity_type: string;
    entity_type: 'movie' | 'tv';
    entity_id: number;
    entity_title: string;
    entity_poster?: string;
    metadata?: string; // JSON
    created_at: Date;
}

// Search history table
export interface SearchHistoryTable {
    id: number;
    user_id: number;
    query: string;
    media_type?: 'movie' | 'tv' | 'all';
    results_count: number;
    created_at: Date;
}

// Comment reports table (for moderation)
export interface CommentReportsTable {
    id: number;
    comment_id: number;
    reported_by: number;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    reviewed_by?: number;
    reviewed_at?: Date;
    created_at: Date;
    updated_at: Date;
}

// User followers table (if implementing social features)
export interface UserFollowersTable {
    id: number;
    follower_id: number;
    following_id: number;
    created_at: Date;
}

// Recommendations cache table
export interface RecommendationsCacheTable {
    id: number;
    user_id: number;
    movie_id?: number;
    tv_id?: number;
    media_type: 'movie' | 'tv';
    score: number;
    reason: string; // "Because you liked X"
    created_at: Date;
    expires_at: Date;
}

// Database configuration
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    pool: {
        min: number;
        max: number;
        idle: number;
        acquire: number;
    };
    logging: boolean;
    timezone: string;
}

// Migration interface
export interface Migration {
    id: number;
    name: string;
    executed_at: Date;
}

// Database transaction interface
export interface Transaction {
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

// Query builder interfaces
export interface QueryOptions {
    where?: Record<string, any>;
    select?: string[];
    include?: string[];
    orderBy?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
    limit?: number;
    offset?: number;
    distinct?: boolean;
}

export interface InsertOptions {
    returning?: string[];
    onConflict?: 'ignore' | 'update';
    updateColumns?: string[];
}

export interface UpdateOptions {
    where: Record<string, any>;
    returning?: string[];
}

export interface DeleteOptions {
    where: Record<string, any>;
    returning?: string[];
}

// Database model base interface
export interface BaseModel {
    id: number;
    created_at: Date;
    updated_at: Date;
}

// Seeder interface
export interface Seeder {
    name: string;
    run(): Promise<void>;
}