# CineHub API Documentation

This document lists the current Next.js route handlers in CineHub v2.12.0. All routes live under `src/app/api`.

## Auth Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/health` | Check required production environment variables. |
| `POST` | `/api/auth/register` | Register a Firebase user and initialize app user data. |
| `POST` | `/api/auth/login` | Verify a Firebase login token and sync user data. |
| `POST` | `/api/auth/logout` | End the app session. |
| `GET` | `/api/auth/me` | Return current authenticated user data. |
| `POST` | `/api/auth/social-login` | Sync Firebase social login users with the app backend. |

## Profile Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/profile` | Get the current user's profile. |
| `PUT` | `/api/profile` | Update the current user's profile. |
| `GET` | `/api/profile/stats` | Return watched, watchlist, rating, favorite actor, and recent activity stats. |
| `GET` | `/api/profile/avatars` | List available profile avatars. |
| `PUT` | `/api/profile/avatar` | Update the current user's selected avatar. |
| `PUT` | `/api/profile/password` | Update password-related account data. |

## Movie And TV Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/movies/trending` | Fetch trending movies. |
| `GET` | `/api/movies/[listType]` | Fetch movie lists such as `popular`, `top_rated`, `now_playing`, or `upcoming`. |
| `GET` | `/api/tv` | Fetch TV discovery data. |
| `GET` | `/api/tv/[listType]` | Fetch TV lists such as `popular`, `top_rated`, or `on_the_air`. |

TMDB remains the source for public movie and TV metadata. Client pages also call the TMDB service layer for details, people, search, images, videos, reviews, and similar content.

## Watch And Stream Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/stream/[type]/[id]` | Resolve stream sources for a movie or media item. |
| `GET` | `/api/stream/tv/[id]/season/[seasonNumber]/episode/[episodeNumber]` | Resolve stream sources for a TV episode. |
| `GET` | `/api/source-reports` | Admin list of source reports. |
| `POST` | `/api/source-reports` | Submit a source report from the watch player. |
| `PATCH` | `/api/source-reports` | Update a source report status. |

Source reports help the player and admin workflows identify broken, wrong, slow, or low-quality providers.

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
| `GET` | `/api/favorites` | Get favorite media or actor items. |
| `POST` | `/api/favorites` | Add a favorite item. |
| `DELETE` | `/api/favorites` | Remove a favorite item. |
| `GET` | `/api/ratings` | Get ratings. |
| `POST` | `/api/ratings` | Create or update a rating. |
| `DELETE` | `/api/ratings` | Remove a rating. |
| `GET` | `/api/reviews` | Get reviews. |

## Recommendation Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/recommendations/signals` | Return authenticated rating and favorite actor signals used by personalized recommendations. |

## Notification Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/notifications` | List current user notifications and unread count. |
| `PATCH` | `/api/notifications` | Mark one notification or all notifications as read. |
| `DELETE` | `/api/notifications` | Delete read notifications or clear notification items. |

Notification sources include:

- `watchlist`
- `source_report`
- `contact`
- `admin`
- `system`

## Contact Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/contact` | Save a public contact message and send an email notification. |
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
| `GET` | `/api/admin/stats` | Dashboard and analytics stats. |
| `GET` | `/api/admin/users` | List users. |
| `PATCH` | `/api/admin/users` | Update a user. |
| `DELETE` | `/api/admin/users` | Delete or disable a user record. |
| `GET` | `/api/admin/activity-logs` | List admin activity logs. |
| `GET` | `/api/admin/avatars` | List avatars. |
| `POST` | `/api/admin/avatars/upload` | Upload an avatar. |
| `DELETE` | `/api/admin/avatars/[id]` | Delete an avatar. |

Admin routes require server-side authorization.

## External Services

### Firebase

Firebase services used:

- Firebase Authentication
- Firestore
- Firebase Admin SDK

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
- People and actor details
- Videos and trailers
- Images
- Search
- Reviews
- Similar content

### SMTP

SMTP is used by:

- `POST /api/contact`
- `PATCH /api/contact`

## Common Response Patterns

The app generally returns JSON. Error responses should include a readable `message` or `error` field.

Common failure categories:

| Category | Typical Cause |
| --- | --- |
| Unauthorized | Missing or invalid Firebase session/token. |
| Forbidden | Authenticated user is not an admin. |
| Validation | Missing required fields or invalid email format. |
| Not found | Firestore document does not exist. |
| Email failed | SMTP variables are missing or the provider rejected credentials. |
| External API failed | TMDB or stream provider request failed. |

## Health Check

Use this after deploy:

```text
GET /api/auth/health
```

Expected result when all required environment variables are present:

```json
{
  "ok": true,
  "missing": []
}
```

If `missing` contains values, add them in Vercel and redeploy.
