# CineHub

<p align="center">
  <img src="./public/logo.png" alt="CineHub logo" width="120" />
</p>

<h3 align="center">A production-style movie and TV discovery platform built with Next.js, Firebase, Firestore, TMDB, and Vercel.</h3>

<p align="center">
  <a href="#"><img alt="Version" src="https://img.shields.io/badge/version-2.11.0-14b8a6?style=for-the-badge" /></a>
  <a href="#"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-15.5.19-black?style=for-the-badge&logo=nextdotjs" /></a>
  <a href="#"><img alt="React" src="https://img.shields.io/badge/React-19.1.8-61dafb?style=for-the-badge&logo=react&logoColor=111827" /></a>
  <a href="#"><img alt="Firebase" src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-f59e0b?style=for-the-badge&logo=firebase&logoColor=111827" /></a>
  <a href="#"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-3178c6?style=for-the-badge&logo=typescript&logoColor=white" /></a>
</p>

## Overview

CineHub is a personal final project by Huynh Chu Minh Khoi. It is designed like a real streaming discovery product: users can discover movies and TV shows, view details, watch trailers or available sources, save watchlists, track watch history, rate titles, manage favorite actors, receive notifications, submit source reports, and contact the site owner.

The project is Firebase-first. Authentication, profiles, watch data, admin data, notifications, contact messages, source reports, ratings, reviews, and activity logs are stored in Firebase Authentication and Firestore. The app no longer uses MySQL, NextAuth, or legacy JWT authentication.

## Live Product Goals

- Provide a polished portfolio-grade movie and TV web app.
- Keep user workflows realistic: login, watchlist, history, profile, contact, reports, and admin review.
- Keep deploy flow simple on Vercel with Firebase, TMDB, and SMTP environment variables.
- Keep future upgrades easy through documented architecture and route boundaries.

## Highlights

| Area | Current Support |
| --- | --- |
| Discovery | Home, Explore, Search, movie detail, TV detail, actor detail, seasons, episodes, and similar content. |
| Watch Experience | Movie and TV episode watch pages, source selection, theater mode, source reporting, and trailer fallback for unreleased content. |
| Auth | Firebase email/password login, registration, Google login support, logout, and server-side token/session checks. |
| User Features | Watchlist, smarter history, ratings, reviews, favorite actors, profile stats, avatar picker, and account security panel. |
| Notifications | Firestore-backed bell with unread count, source labels, refresh, read controls, cleanup, and linked actions. |
| Admin | Dashboard, analytics, user management, source reports, contact inbox, activity logs, avatar management, and settings. |
| Contact | Responsive contact page, Firestore message storage, SMTP email delivery, and admin reply workflow. |
| Deployment | Vercel-ready Next.js App Router project with production environment documentation. |

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 19, Tailwind CSS 4, Radix UI, Lucide React, Framer Motion |
| State/Data | Zustand, TanStack React Query |
| Backend | Next.js Route Handlers |
| Auth | Firebase Authentication, Firebase Admin SDK |
| Database | Firestore |
| Email | Nodemailer with SMTP |
| Movie Data | TMDB API |
| SEO | App Router metadata, sitemap, robots |
| Deployment | Vercel |

## Core Features

### Movie And TV Discovery

- TMDB-powered movie, TV, actor, season, episode, image, trailer, and review metadata.
- Home recommendations with watchlist/history signals and trending fallbacks.
- Explore page with movie/TV tabs, responsive filters, genres, year, runtime, date range, and Vietnamese genre support.
- Search page with movie, TV, and people discovery.
- Detail tabs for overview, cast, reviews, photos/videos, seasons, and similar content.

### Watch Experience

- Watch movie and watch TV episode pages.
- Multiple stream providers resolved through API routes.
- TMDB/IMDb-aware source ordering to reduce wrong-title playback.
- Source report flow for broken, wrong, slow, or low-quality sources.
- Trailer fallback when a movie or TV episode has not released yet.
- Responsive player controls for desktop, tablet, and mobile.

### User Account

- Firebase email/password login and registration.
- Firebase social login sync through the app backend.
- Profile page with:
  - watched count
  - watchlist count
  - rating count
  - favorite actor count
  - recent activity timeline
  - account security overview
  - avatar picker
- Watchlist page with practical saved-title layout.
- Smart history page with search, type filter, sort, buckets, resume actions, and progress hints.

### Admin System

- Protected admin area with Firebase Admin checks.
- Dashboard-first admin flow for quick operational overview.
- Analytics cards and paginated data sections.
- User management with detail dialog and safe actions.
- Source reports with status/media/reason filters.
- Contact inbox with reply popup.
- Activity logs with pagination.
- Avatar management and admin settings.

### Contact Workflow

- Contact page stores submissions in Firestore.
- Server sends HTML email automatically through SMTP.
- Admin reads messages in the dashboard.
- Admin replies from the app, and the reply is sent by email.

## Project Structure

```text
cinehub/
  doc/                    Main project documentation
  docs/                   Feature notes and maintenance guides
  public/                 Static assets, logo, avatars
  src/
    app/                  App Router pages and API routes
    components/           Shared, movie, TV, actor, watch, profile, auth, admin UI
    hooks/                React hooks for app workflows
    lib/                  Firebase, admin, email, auth, notifications, app metadata
    services/             TMDB service layer
    store/                Zustand client stores
    types/                Shared TypeScript types
  package.json
  README.md
```

## Documentation

- [Documentation Index](./doc/README.md)
- [Setup Guide](./doc/setup.md)
- [Deployment Guide](./doc/deployment.md)
- [Architecture](./doc/architecture.md)
- [API Documentation](./doc/api.md)
- [Feature Guide](./docs/FEATURE_GUIDE.md)

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

For full local setup, read [doc/setup.md](./doc/setup.md).

## Required Environment Variables

```env
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# TMDB
NEXT_PUBLIC_TMDB_API_KEY=
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=CineHub
ADMIN_EMAIL=

# Contact email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Security notes:

- Never commit real `.env.local` secrets.
- Mark private Vercel variables as Sensitive.
- `NEXT_PUBLIC_*` values are public browser values by design.
- Use a Gmail App Password for `SMTP_PASS`, not the normal Gmail password.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server. |
| `npm run build` | Build the production app. |
| `npm run start` | Start the production build. |
| `npx tsc --noEmit` | Validate TypeScript without emitting files. |

## Deployment Summary

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add Firebase, Firebase Admin, TMDB, app, and SMTP variables.
4. Add the Vercel domain to Firebase Authentication authorized domains.
5. Deploy, then verify auth, profile, watchlist, history, contact, admin, and watch pages.

Full instructions are in [doc/deployment.md](./doc/deployment.md).

## Current Version

```text
2.11.0
```

Version 2.11.0 adds:

- smarter notification bell
- upgraded watch history
- movie/TV availability polish
- featured trailer media sections
- compact actor cards
- profile stats, activity, and security panels
- full feature guide documentation

## Roadmap

- Improve source reliability and automatic fallback.
- Continue polishing Movie/TV detail pages.
- Add deeper admin filtering and exports.
- Add richer profile insights and account security flows.
- Keep responsive behavior consistent across Android, iPhone, iPad, tablet, laptop, and desktop.
- Continue dependency and deployment security updates.

## Credits

- Movie and TV metadata is provided by TMDB.
- Built by Huynh Chu Minh Khoi as a personal final project.
- Portfolio: https://hcmkportfolio.netlify.app/
