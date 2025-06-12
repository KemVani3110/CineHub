/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/tmdb.ts

// Base TMDB API response structure
export interface TMDBResponse<T = any> {
    page?: number;
    results?: T[];
    total_pages?: number;
    total_results?: number;
    dates?: {
        maximum: string;
        minimum: string;
    };
}

// TMDB Configuration
export interface TMDBConfiguration {
    images: {
        base_url: string;
        secure_base_url: string;
        backdrop_sizes: string[];
        logo_sizes: string[];
        poster_sizes: string[];
        profile_sizes: string[];
        still_sizes: string[];
    };
    change_keys: string[];
}

// Base TMDB Movie object (from API)
export interface TMDBMovie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    release_date: string;
    poster_path?: string;
    backdrop_path?: string;
    adult: boolean;
    genre_ids: number[];
    original_language: string;
    popularity: number;
    vote_count: number;
    vote_average: number;
    video: boolean;
}

// Detailed TMDB Movie (from movie/{id} endpoint)
export interface TMDBMovieDetails extends TMDBMovie {
    belongs_to_collection?: TMDBCollection;
    budget: number;
    genres: TMDBGenre[];
    homepage?: string;
    imdb_id?: string;
    production_companies: TMDBProductionCompany[];
    production_countries: TMDBProductionCountry[];
    revenue: number;
    runtime?: number;
    spoken_languages: TMDBSpokenLanguage[];
    status: string;
    tagline?: string;
    credits?: TMDBCredits;
    videos?: TMDBVideos;
    reviews?: TMDBReviews;
    similar?: TMDBMovie[];
}

// TMDB TV Show object
export interface TMDBTV {
    id: number;
    name: string;
    original_name: string;
    overview: string;
    first_air_date: string;
    last_air_date?: string;
    poster_path?: string;
    backdrop_path?: string;
    genre_ids: number[];
    original_language: string;
    popularity: number;
    vote_count: number;
    vote_average: number;
    origin_country: string[];
}

// Detailed TMDB TV Show
export interface TMDBTVDetails extends TMDBTV {
    created_by: TMDBCreatedBy[];
    episode_run_time: number[];
    genres: TMDBGenre[];
    homepage?: string;
    in_production: boolean;
    languages: string[];
    last_episode_to_air?: TMDBEpisode;
    next_episode_to_air?: TMDBEpisode;
    networks: TMDBNetwork[];
    number_of_episodes: number;
    number_of_seasons: number;
    production_companies: TMDBProductionCompany[];
    production_countries: TMDBProductionCountry[];
    seasons: TMDBSeason[];
    spoken_languages: TMDBSpokenLanguage[];
    status: string;
    tagline?: string;
    type: string;
    credits?: TMDBCredits;
    videos?: TMDBVideos;
    reviews?: TMDBReviews;
    similar?: TMDBTV[];
}

// TMDB Season
export interface TMDBSeason {
    id: number;
    air_date?: string;
    episode_count: number;
    name: string;
    overview: string;
    poster_path?: string;
    season_number: number;
    vote_average: number;
}

// Detailed TMDB Season
export interface TMDBSeasonDetails extends TMDBSeason {
    _id: string;
    episodes: TMDBEpisode[];
}

// TMDB Episode
export interface TMDBEpisode {
    id: number;
    air_date?: string;
    episode_number: number;
    name: string;
    overview: string;
    production_code?: string;
    runtime?: number;
    season_number: number;
    show_id: number;
    still_path?: string;
    vote_average: number;
    vote_count: number;
    crew: TMDBCrewMember[];
    guest_stars: TMDBCastMember[];
}

// Common TMDB objects
export interface TMDBGenre {
    id: number;
    name: string;
}

export interface TMDBCollection {
    id: number;
    name: string;
    overview: string;
    poster_path?: string;
    backdrop_path?: string;
    parts: TMDBMovie[];
}

export interface TMDBProductionCompany {
    id: number;
    logo_path?: string;
    name: string;
    origin_country: string;
}

export interface TMDBProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface TMDBSpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface TMDBCreatedBy {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path?: string;
}

export interface TMDBNetwork {
    id: number;
    logo_path?: string;
    name: string;
    origin_country: string;
}

// TMDB Credits
export interface TMDBCredits {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
}

export interface TMDBCastMember {
    id: number;
    name: string;
    character: string;
    credit_id: string;
    order: number;
    adult: boolean;
    gender?: number;
    known_for_department: string;
    original_name: string;
    popularity: number;
    profile_path?: string;
}

export interface TMDBCrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    credit_id: string;
    adult: boolean;
    gender?: number;
    known_for_department: string;
    original_name: string;
    popularity: number;
    profile_path?: string;
}

// TMDB Videos
export interface TMDBVideos {
    results: TMDBVideo[];
}

export interface TMDBVideo {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    official: boolean;
    published_at: string;
    site: string;
    size: number;
    type: string;
}

// TMDB Images
export interface TMDBImages {
    backdrops: TMDBImage[];
    logos: TMDBImage[];
    posters: TMDBImage[];
}

export interface TMDBImage {
    aspect_ratio: number;
    height: number;
    iso_639_1?: string;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
}

// TMDB Reviews
export interface TMDBReviews {
    page: number;
    results: TMDBReview[];
    total_pages: number;
    total_results: number;
}

export interface TMDBReview {
    id: string;
    author: string;
    author_details: TMDBAuthorDetails;
    content: string;
    created_at: string;
    updated_at: string;
    url: string;
}

export interface TMDBAuthorDetails {
    name: string;
    username: string;
    avatar_path?: string;
    rating?: number;
}

// TMDB Search
export interface TMDBSearchMulti {
    page: number;
    results: TMDBSearchResult[];
    total_pages: number;
    total_results: number;
}

export interface TMDBSearchResult {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title?: string; // for movies
    name?: string; // for TV shows and persons
    original_title?: string;
    original_name?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string;
    backdrop_path?: string;
    profile_path?: string; // for persons
    adult: boolean;
    genre_ids?: number[];
    original_language?: string;
    popularity: number;
    vote_count?: number;
    vote_average?: number;
    video?: boolean;
    known_for?: TMDBSearchResult[]; // for persons
    known_for_department?: string; // for persons
}

// TMDB Discover parameters
export interface TMDBDiscoverMovieParams {
    sort_by?: string;
    page?: number;
    include_adult?: boolean;
    include_video?: boolean;
    language?: string;
    primary_release_year?: number;
    primary_release_date_gte?: string;
    primary_release_date_lte?: string;
    release_date_gte?: string;
    release_date_lte?: string;
    with_release_type?: number;
    year?: number;
    vote_count_gte?: number;
    vote_count_lte?: number;
    vote_average_gte?: number;
    vote_average_lte?: number;
    with_cast?: string;
    with_crew?: string;
    with_companies?: string;
    with_genres?: string;
    without_genres?: string;
    with_keywords?: string;
    without_keywords?: string;
    with_people?: string;
    with_original_language?: string;
    without_companies?: string;
    region?: string;
}

export interface TMDBDiscoverTVParams {
    sort_by?: string;
    page?: number;
    language?: string;
    first_air_date_year?: number;
    first_air_date_gte?: string;
    first_air_date_lte?: string;
    air_date_gte?: string;
    air_date_lte?: string;
    vote_count_gte?: number;
    vote_count_lte?: number;
    vote_average_gte?: number;
    vote_average_lte?: number;
    with_genres?: string;
    without_genres?: string;
    with_keywords?: string;
    without_keywords?: string;
    with_networks?: string;
    with_companies?: string;
    with_original_language?: string;
    timezone?: string;
    screened_theatrically?: boolean;
    include_null_first_air_dates?: boolean;
}

// TMDB Person
export interface TMDBPerson {
    id: number;
    name: string;
    known_for_department: string;
    gender: number;
    biography: string;
    birthday?: string;
    deathday?: string;
    place_of_birth?: string;
    profile_path?: string;
    adult: boolean;
    imdb_id?: string;
    homepage?: string;
    popularity: number;
    also_known_as: string[];
}

// TMDB Person Credits
export interface TMDBPersonCredits {
    cast: TMDBPersonCastCredit[];
    crew: TMDBPersonCrewCredit[];
}

export interface TMDBPersonCastCredit {
    id: number;
    title?: string;
    name?: string;
    character: string;
    credit_id: string;
    poster_path?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    media_type: 'movie' | 'tv';
    genre_ids: number[];
    adult?: boolean;
    overview: string;
    original_language: string;
    popularity: number;
}

export interface TMDBPersonCrewCredit {
    id: number;
    title?: string;
    name?: string;
    job: string;
    department: string;
    credit_id: string;
    poster_path?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    media_type: 'movie' | 'tv';
    genre_ids: number[];
    adult?: boolean;
    overview: string;
    original_language: string;
    popularity: number;
}

// TMDB Trending
export interface TMDBTrendingParams {
    media_type: 'all' | 'movie' | 'tv' | 'person';
    time_window: 'day' | 'week';
    page?: number;
}

// TMDB Movie Lists
export type TMDBMovieListType = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

// TMDB TV Lists
export type TMDBTVListType =
    | 'popular'
    | 'top_rated'
    | 'on_the_air'
    | 'airing_today';

// Image helper types
export interface ImageSize {
    width: number;
    height: number;
    aspectRatio: number;
}

export interface TMDBImageConfig {
    baseUrl: string;
    secureBaseUrl: string;
    sizes: {
        poster: string[];
        backdrop: string[];
        profile: string[];
        logo: string[];
        still: string[];
    };
}

// Helper functions types
export type TMDBImageType =
    | 'poster'
    | 'backdrop'
    | 'profile'
    | 'logo'
    | 'still';

export interface TMDBImageUrl {
    original: string;
    w500: string;
    w780: string;
    w1280: string;
}

// Error handling
export interface TMDBError {
    success: boolean;
    status_code: number;
    status_message: string;
}

// Rate limiting
export interface TMDBRateLimit {
    limit: number;
    remaining: number;
    reset: number;
}

// External IDs
export interface TMDBExternalIds {
    imdb_id?: string;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
    id: number;
}

// Watch Providers
export interface TMDBWatchProviders {
    results: {
        [countryCode: string]: TMDBCountryWatchProviders;
    };
}

export interface TMDBCountryWatchProviders {
    link?: string;
    buy?: TMDBWatchProvider[];
    rent?: TMDBWatchProvider[];
    flatrate?: TMDBWatchProvider[];
}

export interface TMDBWatchProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}

// Keywords
export interface TMDBKeywords {
    keywords?: TMDBKeyword[]; // for movies
    results?: TMDBKeyword[]; // for tv shows
}

export interface TMDBKeyword {
    id: number;
    name: string;
}

// Translations
export interface TMDBTranslations {
    translations: TMDBTranslation[];
}

export interface TMDBTranslation {
    iso_3166_1: string;
    iso_639_1: string;
    name: string;
    english_name: string;
    data: {
        title?: string;
        name?: string;
        overview: string;
        homepage?: string;
        tagline?: string;
    };
}

export interface TMDBTVShow {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    next_episode_to_air?: {
        air_date: string;
        episode_number: number;
        id: number;
        name: string;
        overview: string;
        production_code: string;
        season_number: number;
        still_path: string | null;
        vote_average: number;
        vote_count: number;
    };
}