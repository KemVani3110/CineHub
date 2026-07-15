# CineHub API Documentation

This document lists the current app route handlers in CineHub v2.1.0. All routes live under `src/app/api`.

## Auth Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/health` | Check required production environment variables. |
| `POST` | `/api/auth/register` | Register a Firebase user and initialize app user data. |
| `POST` | `/api/auth/login` | Verify login token and sync user data. |
| `POST` | `/api/auth/logout` | End the app session. |
| `GET` | `/api/auth/me` | Return current authenticated user data. |
| `POST` | `/api/auth/social-login` | Sync social login users with the app backend. |

## Profile Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/profile` | Get the current user's profile. |
| `PUT` | `/api/profile` | Update the current user's profile. |
| `PUT` | `/api/profile/avatar` | Update the current user's selected avatar. |
| `GET` | `/api/profile/avatars` | List available profile avatars. |
| `PUT` | `/api/profile/password` | Update password-related account data. |

## Movie And TV Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/movies/trending` | Fetch trending movies. |
| `GET` | `/api/movies/[listType]` | Fetch movie lists such as popular, top rated, or upcoming. |
| `GET` | `/api/tv` | Fetch TV discovery data. |
| `GET` | `/api/tv/[listType]` | Fetch TV lists such as popular or top rated. |

TMDB remains the source for public movie and TV metadata.

## Watch And Stream Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/stream/[type]/[id]` | Resolve stream sources for a movie or media item. |
| `GET` | `/api/stream/tv/[id]/season/[seasonNumber]/episode/[episodeNumber]` | Resolve stream sources for a TV episode. |
| `GET` | `/api/source-reports` | Admin list of source reports. |
| `POST` | `/api/source-reports` | Submit a source report from the watch player. |
| `PATCH` | `/api/source-reports` | Update a source report status. |

## User Media Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/watchlist` | Get the current user's watchlist. |
| `POST` | `/api/watchlist` | Add an item to the watchlist. |
| `DELETE` | `/api/watchlist/[mediaType]/[id]` | Remove an item from the watchlist. |
| `GET` | `/api/history` | Get watch history. |
| `POST` | `/api/history` | Add a watch history item. |
| `PUT` | `/api/history` | Update watch history progress. |
| `DELETE` | `/api/history` | Clear watch history. |
| `PUT` | `/api/history/[id]` | Update one history item. |
| `DELETE` | `/api/history/[id]` | Delete one history item. |
| `GET` | `/api/favorites` | Get favorite items. |
| `POST` | `/api/favorites` | Add a favorite item. |
| `DELETE` | `/api/favorites` | Remove a favorite item. |
| `GET` | `/api/ratings` | Get ratings. |
| `POST` | `/api/ratings` | Create or update a rating. |
| `DELETE` | `/api/ratings` | Remove a rating. |
| `GET` | `/api/reviews` | Get reviews. |

## Contact Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/contact` | Save a contact message and send an email notification. |
| `GET` | `/api/contact` | Admin list of contact messages. |
| `PATCH` | `/api/contact` | Admin reply to a contact message. |

Contact behavior:

- Public visitors can submit contact messages.
- Messages are saved in Firestore.
- SMTP sends a styled HTML email to `CONTACT_TO_EMAIL`.
- Admin replies send an email to the visitor and mark the message as replied.

## Admin Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/stats` | Dashboard stats. |
| `GET` | `/api/admin/users` | List users. |
| `PATCH` | `/api/admin/users` | Update a user. |
| `DELETE` | `/api/admin/users` | Delete or disable a user record. |
| `GET` | `/api/admin/activity-logs` | List admin activity logs. |
| `GET` | `/api/admin/avatars` | List avatars. |
| `POST` | `/api/admin/avatars/upload` | Upload an avatar. |
| `DELETE` | `/api/admin/avatars/[id]` | Delete an avatar. |

Admin routes require server-side authorization.

## External Services

### TMDB

Base URL:

```text
https://api.themoviedb.org/3
```

Common TMDB areas used by the app:

- Movies
- TV shows
- Seasons and episodes
- Credits
- Videos and trailers
- Images
- Search
- Similar content

### Firebase

Firebase services used:

- Firebase Authentication
- Firestore
- Firebase Admin SDK

### SMTP

SMTP is used by contact flows only:

- `POST /api/contact`
- `PATCH /api/contact`

## Error Handling

The app generally returns JSON responses with a `message` field for errors.

Common failure categories:

| Category | Typical Cause |
| --- | --- |
| Unauthorized | Missing or invalid Firebase session/token. |
| Validation | Missing required fields or invalid email format. |
| Not found | Firestore document does not exist. |
| Email failed | SMTP variables missing or provider rejected credentials. |
| External API failed | TMDB or stream provider request failed. |

## Health Check

Use this after deploy:

```text
GET /api/auth/health
```

Expected result when all required env vars are present:

```json
{
  "ok": true,
  "missing": []
}
```
