// src/types/comment.ts

export interface Comment {
    id: number;
    userId: number;
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
    content: string;
    rating?: number; // 1-5 stars, optional rating with comment
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: CommentUser;
    likes?: number;
    isLiked?: boolean; // For current user
}

export interface CommentUser {
    id: number;
    name: string;
    avatar?: string;
    role: string;
}

export interface CreateCommentRequest {
    movieId?: number;
    tvId?: number;
    mediaType: 'movie' | 'tv';
    content: string;
    rating?: number;
}

export interface UpdateCommentRequest {
    content: string;
    rating?: number;
}

export interface CommentResponse {
    success: boolean;
    comment: Comment;
    message?: string;
}

export interface CommentListResponse {
    comments: Comment[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    statistics: {
        totalComments: number;
        averageRating: number;
        ratingDistribution: {
            [key: number]: number; // rating: count
        };
    };
}

export interface CommentFilters {
    rating?: number;
    sortBy?: 'createdAt' | 'rating' | 'likes';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface CommentStats {
    totalComments: number;
    averageRating: number;
    ratingsCount: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

// For moderation purposes
export interface CommentReport {
    id: number;
    commentId: number;
    reportedBy: number;
    reason: CommentReportReason;
    description?: string;
    status: CommentReportStatus;
    createdAt: Date;
    reviewedAt?: Date;
    reviewedBy?: number;
}

export enum CommentReportReason {
    SPAM = 'spam',
    INAPPROPRIATE = 'inappropriate',
    HARASSMENT = 'harassment',
    SPOILER = 'spoiler',
    OFF_TOPIC = 'off_topic',
    OTHER = 'other'
}

export enum CommentReportStatus {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed'
}