# CineHub API Documentation

## TMDB API Integration

The application integrates with The Movie Database (TMDB) API for movie and TV show data.

### Base URL
```
https://api.themoviedb.org/3
```

### Authentication
All requests require an API key passed as a query parameter:
```
?api_key=YOUR_TMDB_API_KEY
```

### Available Endpoints

#### Movies
- `GET /movie/popular` - Get popular movies
- `GET /movie/top_rated` - Get top rated movies
- `GET /movie/upcoming` - Get upcoming movies
- `GET /movie/{id}` - Get movie details
- `GET /movie/{id}/credits` - Get movie credits
- `GET /movie/{id}/videos` - Get movie videos
- `GET /movie/{id}/similar` - Get similar movies

#### TV Shows
- `GET /tv/popular` - Get popular TV shows
- `GET /tv/top_rated` - Get top rated TV shows
- `GET /tv/{id}` - Get TV show details
- `GET /tv/{id}/credits` - Get TV show credits
- `GET /tv/{id}/videos` - Get TV show videos
- `GET /tv/{id}/similar` - Get similar TV shows

#### Search
- `GET /search/movie` - Search movies
- `GET /search/tv` - Search TV shows
- `GET /search/multi` - Search movies and TV shows

## Firebase Services

### Authentication
- Email/Password authentication
- Google authentication
- Facebook authentication

### Firestore Collections

#### Users
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Reviews
```typescript
interface Review {
  id: string;
  userId: string;
  movieId: number;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Watchlist
```typescript
interface WatchlistItem {
  id: string;
  userId: string;
  movieId: number;
  addedAt: Date;
}
```

#### Favorites
```typescript
interface Favorite {
  id: string;
  userId: string;
  movieId: number;
  addedAt: Date;
}
```

## Custom API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/avatar` - Update user avatar

### Reviews
- `GET /api/reviews/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add movie to watchlist
- `DELETE /api/watchlist/:movieId` - Remove movie from watchlist

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add movie to favorites
- `DELETE /api/favorites/:movieId` - Remove movie from favorites

## Error Handling

All API endpoints follow a consistent error response format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

Common error codes:
- `AUTH_REQUIRED` - Authentication required
- `INVALID_CREDENTIALS` - Invalid login credentials
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `SERVER_ERROR` - Internal server error