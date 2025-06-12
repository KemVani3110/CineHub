/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/common.ts

// Generic pagination interface
export interface Pagination {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Generic sort options
export interface SortOptions {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

// Generic filter interface
export interface BaseFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

// Media types
export type MediaType = 'movie' | 'tv';

// Generic media item interface
export interface MediaItem {
    id: number;
    title: string;
    overview: string;
    posterPath?: string;
    backdropPath?: string;
    releaseDate: string;
    voteAverage: number;
    voteCount: number;
    popularity: number;
    mediaType: MediaType;
}

// Generic response wrapper
export interface BaseResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
    pagination?: Pagination;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic API state
export interface ApiState<T = any> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    lastFetch?: Date;
}

// Toast/Notification types
export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
    action?: ToastAction;
}

export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

export interface ToastAction {
    label: string;
    onClick: () => void;
}

// Modal types
export interface ModalState {
    isOpen: boolean;
    type?: string;
    data?: any;
    onClose?: () => void;
    onConfirm?: () => void;
}

// Form validation
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
    placeholder?: string;
    rules?: ValidationRule;
    options?: SelectOption[];
}

export interface SelectOption {
    label: string;
    value: string | number;
}

// Theme and styling
export interface Theme {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        border: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    fonts: {
        body: string;
        heading: string;
        mono: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}

// Device and responsive
export interface BreakpointConfig {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

// Error handling
export interface AppError {
    code: string;
    message: string;
    status?: number;
    field?: string;
    context?: Record<string, any>;
    timestamp: Date;
}

// Navigation
export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon?: string;
    requiresAuth?: boolean;
    roles?: string[];
    children?: NavItem[];
}

// Search
export interface SearchResult<T = any> {
    results: T[];
    query: string;
    totalResults: number;
    page: number;
    totalPages: number;
    filters?: Record<string, any>;
}

// Generic dropdown/select component
export interface DropdownItem {
    id: string | number;
    label: string;
    value: string | number;
    disabled?: boolean;
    icon?: string;
    description?: string;
}

// File upload
export interface FileUpload {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    url?: string;
}

// Date range
export interface DateRange {
    from?: Date;
    to?: Date;
}

// Generic statistics
export interface Statistics {
    total: number;
    change?: number;
    changeType?: 'increase' | 'decrease';
    period?: string;
}

// Color scheme
export type ColorScheme = 'light' | 'dark' | 'system';

// Language
export interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag?: string;
}

// Feature flags
export interface FeatureFlag {
    key: string;
    enabled: boolean;
    description?: string;
    rolloutPercentage?: number;
}

// Generic list item for UI components
export interface ListItem {
    id: string | number;
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    metadata?: Record<string, any>;
    actions?: ListItemAction[];
}

export interface ListItemAction {
    id: string;
    label: string;
    icon?: string;
    variant?: 'default' | 'destructive' | 'outline';
    onClick: (item: ListItem) => void;
}