# CineHub Documentation Index

This folder contains the main technical documentation for CineHub v2.11.0.

## Read First

| Document | Purpose |
| --- | --- |
| [Setup Guide](./setup.md) | Run the project locally, configure Firebase, TMDB, SMTP, and verify flows. |
| [Deployment Guide](./deployment.md) | Deploy to Vercel and configure production environment variables. |
| [Architecture](./architecture.md) | Understand the app layers, data flow, auth, admin, watch, contact, and SEO architecture. |
| [API Documentation](./api.md) | Review all current route handlers under `src/app/api`. |
| [Feature Guide](../docs/FEATURE_GUIDE.md) | Understand current user-facing features and maintenance notes. |

## Current App Version

```text
2.11.0
```

## Main Product Areas

- Home discovery and recommendations.
- Explore and Search for movies, TV shows, and people.
- Movie detail and TV detail pages.
- Actor detail and favorite actor flows.
- Watch movie and watch TV episode pages.
- Watchlist, history, ratings, reviews, and profile.
- Notification bell.
- Contact page and email workflow.
- Admin dashboard, analytics, users, source reports, contact messages, logs, avatars, and settings.

## Environment Groups

| Group | Examples | Required For |
| --- | --- | --- |
| Firebase client | `NEXT_PUBLIC_FIREBASE_API_KEY` | Browser auth and Firebase client SDK. |
| Firebase Admin | `FIREBASE_PRIVATE_KEY` | Server auth checks and Firestore admin reads/writes. |
| TMDB | `NEXT_PUBLIC_TMDB_API_KEY` | Media discovery, detail, images, trailers, and search. |
| App | `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAIL` | Metadata, deploy URL, admin authorization. |
| SMTP | `SMTP_HOST`, `SMTP_PASS` | Contact form and admin replies. |

## Maintenance Rules

- Keep `README.md` useful for GitHub visitors.
- Keep `doc/` focused on setup, deploy, architecture, and API.
- Keep `docs/FEATURE_GUIDE.md` focused on feature behavior.
- Bump `package.json`, `package-lock.json`, and `src/lib/app-info.ts` for major user-facing app updates.
- Do not put real secrets in documentation.
