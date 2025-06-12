// src/types/review.ts

// External reviews from TMDB
export interface TMDBReview {
    id: string;
    author: string;
    authorDetails: TMDBReviewAuthor;
    content: string;
    createdAt: string;
    updatedAt: string;
    url: string;
}

export interface TMDBReviewAuthor {
    name: string;
    username: string;
    avatarPath?: string;
    rating?: number; // 1-10 from TMDB
}

export interface TMDBReviewsResponse {
    page: number;
    results: TMDBReview[];
    totalPages: number;
    totalResults: number;
}

// Internal user reviews (if implementing custom review system)
export interface UserReview {
    id: number;
    userId: number;
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
    title: string;
    content: string;
    rating: number; // 1-5 stars
    spoilerWarning: boolean;
    isPublished: boolean;
    isEdited: boolean;
    helpfulCount: number;
    reportCount: number;
    createdAt: Date;
    updatedAt: Date;
    user: ReviewUser;
    isHelpful?: boolean; // For current user
    isReported?: boolean; // For current user
}

export interface ReviewUser {
    id: number;
    name: string;
    avatar?: string;
    reviewCount: number;
    averageRating: number;
    isVerified: boolean;
}

export interface CreateReviewRequest {
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
    title: string;
    content: string;
    rating: number;
    spoilerWarning: boolean;
}

export interface UpdateReviewRequest {
    title?: string;
    content?: string;
    rating?: number;
    spoilerWarning?: boolean;
}

export interface ReviewResponse {
    success: boolean;
    review: UserReview;
    message?: string;
}

export interface ReviewListResponse {
    reviews: UserReview[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    statistics: ReviewStatistics;
}

export interface ReviewStatistics {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    totalHelpfulVotes: number;
    spoilerReviewCount: number;
}

export interface ReviewFilters {
    rating?: number;
    hasSpoilers?: boolean;
    sortBy?: ReviewSortBy;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    userId?: number; // Filter by specific user
}

export enum ReviewSortBy {
    CREATED_AT = 'createdAt',
    RATING = 'rating',
    HELPFUL = 'helpfulCount',
    UPDATED_AT = 'updatedAt'
}

// Review interactions
export interface ReviewHelpful {
    id: number;
    reviewId: number;
    userId: number;
    isHelpful: boolean; // true = helpful, false = not helpful
    createdAt: Date;
}

export interface ReviewReport {
    id: number;
    reviewId: number;
    reportedBy: number;
    reason: ReviewReportReason;
    description?: string;
    status: ReviewReportStatus;
    createdAt: Date;
    reviewedAt?: Date;
    reviewedBy?: number;
}

export enum ReviewReportReason {
    SPAM = 'spam',
    INAPPROPRIATE = 'inappropriate',
    SPOILERS = 'spoilers',
    HARASSMENT = 'harassment',
    COPYRIGHT = 'copyright',
    FAKE = 'fake',
    OTHER = 'other'
}

export enum ReviewReportStatus {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed'
}

// Review moderation (for admin/moderator)
export interface ReviewModerationAction {
    id: number;
    reviewId: number;
    moderatorId: number;
    action: ModerationAction;
    reason?: string;
    createdAt: Date;
    moderator: {
        id: number;
        name: string;
    };
}

export enum ModerationAction {
    APPROVED = 'approved',
    HIDDEN = 'hidden',
    DELETED = 'deleted',
    FLAGGED = 'flagged',
    EDITED = 'edited'
}

// Review aggregation for media items
export interface MediaReviewSummary {
    mediaId: number;
    mediaType: 'movie' | 'tv';
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    featuredReviews: UserReview[]; // Top helpful reviews
    recentReviews: UserReview[];
    criticScore?: number; // If integrating with critics
    audienceScore: number;
}

// Combined review data (TMDB + Internal)
export interface CombinedReviews {
    tmdbReviews: TMDBReview[];
    userReviews: UserReview[];
    summary: MediaReviewSummary;
    pagination: {
        tmdb: {
            page: number;
            totalPages: number;
            hasMore: boolean;
        };
        user: {
            page: number;
            totalPages: number;
            hasMore: boolean;
        };
    };
}

// Review preferences for users
export interface ReviewPreferences {
    hideSpolliers: boolean;
    preferredSortBy: ReviewSortBy;
    showOnlyVerifiedReviews: boolean;
    minimumRating?: number;
    maximumRating?: number;
    hideNegativeReviews: boolean;
}