# CineHub

<p align="center">
  <img src="./public/logo.png" alt="CineHub logo" width="120" />
</p>

<h3 align="center">A modern movie and TV discovery platform built with Next.js, Firebase, Firestore, and TMDB.</h3>

<p align="center">
  <a href="#"><img alt="Version" src="https://img.shields.io/badge/version-2.11.0-14b8a6?style=for-the-badge" /></a>
  <a href="#"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-15.5.19-black?style=for-the-badge&logo=nextdotjs" /></a>
  <a href="#"><img alt="React" src="https://img.shields.io/badge/React-19.1.8-61dafb?style=for-the-badge&logo=react&logoColor=111827" /></a>
  <a href="#"><img alt="Firebase" src="https://img.shields.io/badge/Firebase-Firestore-f59e0b?style=for-the-badge&logo=firebase&logoColor=111827" /></a>
  <a href="#"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-3178c6?style=for-the-badge&logo=typescript&logoColor=white" /></a>
</p>

## Overview

CineHub is a personal final project focused on a polished movie discovery and watch experience. It combines TMDB metadata, Firebase Authentication, Firestore user data, admin tools, watch history, watchlists, ratings, source reports, and a real contact system that stores messages and sends email through SMTP.

The app is designed for Vercel deployment and no longer depends on MySQL or NextAuth. Firebase is the source of truth for authentication, user profiles, admin access, activity data, watch data, and contact workflows.

## Highlights

| Area | What CineHub Supports |
| --- | --- |
| Discovery | Browse movies and TV shows, search titles, view details, actors, seasons, and episodes. |
| Watch Experience | Movie and TV watch pages, source selection, trailer fallback for unreleased content, and source report flow. |
| Authentication | Firebase email/password auth plus social login support. |
| User Data | Firestore watchlist, smarter history, ratings, reviews, favorite actors, profile stats, and avatar data. |
| Admin | Dashboard, analytics, users, avatars, activity logs, source reports, and contact messages. |
| Notifications | Firestore-backed notification bell with unread counts, source chips, refresh, read controls, and deep links. |
| Contact | Server-side SMTP email delivery, Firestore message storage, and admin reply popup. |
| Deployment | Vercel-ready Next.js App Router project with Firebase Admin session support. |

## Core Features

### Movie And TV Discovery

- TMDB-powered movie and TV metadata.
- Dedicated detail pages for movies, TV shows, and actors.
- Explore and search pages for browsing content quickly.
- Season and episode navigation for TV shows.

### Watch Experience

- Watch pages for movies and TV episodes.
- Multiple third-party source options through stream routes.
- Source report button so users can report broken or wrong playback.
- Trailer fallback for movies or episodes that have not released yet.
- Smarter history with search, filtering, sorting, activity buckets, resume actions, and progress hints.

### Firebase Auth And Firestore

- Email/password login and registration.
- Social login support through Firebase providers.
- Firestore-backed user profile data.
- Profile dashboard with watched, watchlist, ratings, favorite actor stats, recent activity, account security, and avatar picker.
- Server-side Firebase Admin checks for protected admin routes.
- No MySQL, no NextAuth, and no legacy JWT auth flow.

### Admin Dashboard

- Real Firestore-backed admin pages.
- User management overview.
- Analytics and project stats.
- Avatar management.
- Activity logs.
- Source report review.
- Contact message inbox and reply workflow.

### Contact Workflow

- Contact form stores submissions in Firestore.
- Server sends email automatically with Nodemailer and SMTP.
- Admin can read messages inside the dashboard.
- Admin can reply from a popup without leaving the app.
- Contact emails use a polished HTML template for Gmail and other clients.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 19, Tailwind CSS, Radix UI, Lucide React |
| State | Zustand, TanStack React Query |
| Backend | Next.js Route Handlers |
| Auth | Firebase Authentication, Firebase Admin SDK |
| Database | Firestore |
| Email | Nodemailer with SMTP |
| Movie Data | TMDB API |
| Deployment | Vercel |

## Project Structure

```text
cinehub/
  docs/                   Feature notes and maintenance documentation
  public/                 Static assets and logo files
  src/
    app/                  Next.js App Router pages and API routes
    components/           Shared UI, admin UI, auth UI, watch UI
    hooks/                App hooks
    lib/                  Firebase, email, auth, helpers, app metadata
    services/             TMDB service layer
    store/                Zustand stores
  package.json
  README.md
```

## Documentation

- [Feature Guide](./docs/FEATURE_GUIDE.md) explains the latest notification, history, detail, and profile flows.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment file

```bash
cp .env.example .env.local
```

On Windows PowerShell, you can also create it manually:

```powershell
Copy-Item .env.example .env.local
```

### 3. Configure Firebase

Enable these in Firebase Console:

- Authentication with Email/Password.
- Google provider if social login is used.
- Firestore Database.
- Authorized domains for `localhost` and your Vercel domain.
- Firebase Admin service account for server-side admin operations.

### 4. Configure TMDB

Create a TMDB API key and set:

```env
NEXT_PUBLIC_TMDB_API_KEY=
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

### 5. Configure contact email

For Gmail SMTP, use a Google App Password, not your normal Gmail password.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

### 6. Run the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

These are the main variables required for a production deployment.

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

Important notes:

- Keep `FIREBASE_PRIVATE_KEY` and `SMTP_PASS` private.
- In Vercel, mark private server variables as Sensitive.
- `NEXT_PUBLIC_*` variables are exposed to the browser by design.
- Set `NEXT_PUBLIC_APP_URL` to the real deployed URL in production.
- Add the production domain to Firebase Authentication authorized domains.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Start the built production app. |
| `npx tsc --noEmit` | Run TypeScript validation. |

## Deployment

CineHub is optimized for Vercel.

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add all Firebase, TMDB, app, and SMTP environment variables.
4. Set the production Firebase authorized domain.
5. Redeploy the latest commit.

After deployment, verify:

- Login and register.
- Google login, if enabled.
- Watchlist and history.
- Admin dashboard access.
- Contact form email delivery.
- Admin reply from contact messages.
- Watch pages and source report flow.

## Version

Current application version:

```text
2.11.0
```

Version 2.11.0 adds the smarter notification bell, upgraded watch history, movie/TV detail availability polish, featured trailer media sections, compact actor cards, profile stats/activity/security panels, and a feature guide document.

Version 2.10.2 redesigns the Contact page with a more polished responsive layout, animated form states, clearer contact cards, and stronger dark-mode input contrast while keeping the existing mail/admin flow intact.

Version 2.10.1 expands the bundled avatar library with more playful cinema-friendly character options, including cat, mouse, robot, astronaut, detective, director, and other stylized profile identities.

Version 2.10.0 redesigns the Profile page with a cleaner account header, practical settings layout, improved avatar picker, and bundled local default avatars for user profiles.

Version 2.9.2 standardizes admin pagination so data-heavy admin lists show at most 5 items per page, including users, activity logs, source reports, contact messages, analytics highlights, and avatar management.

Version 2.9.1 polishes the admin sidebar, removes horizontal-scroll table layouts from user management, and adds a real user detail dialog with practical account context.

Version 2.9.0 adds a realistic Admin Settings page, keeps Dashboard as the admin entry point, and adds an Admin Operations view with health, priorities, quick actions, and activity signals.

Version 2.8.0 reworks Admin Analytics into a cleaner operational dashboard and adds SEO/portfolio polish with richer metadata, sitemap, robots rules, and clearer public project copy.

Version 2.7.1 improves the admin source report workflow with search, status/media/reason filters, visible issue counts, affected source counts, and clearer empty states.

Version 2.7.0 makes source reports affect playback source ranking: actively reported sources are annotated, deprioritized, and shown with a warning in the player source menu.

Version 2.6.1 redesigns the movie and TV detail tab navigation with a lighter responsive tab bar, icon-led scanning, stronger touch targets, and safer horizontal scrolling on mobile.

Version 2.6.0 adds the real notification bell: Firestore-backed notifications, unread counts, read controls, watchlist notifications, and source report status updates.

Version 2.5.0 adds the responsive foundation pass: shared touch targets, stronger form controls, mobile Explore filters, responsive detail/watch pages, and admin mobile card views for key workflows.

Version 2.4.1 polishes app-wide interaction states: clickable controls now consistently show pointer cursors, form borders are clearer on dark panels, and shared hover states have stronger contrast.

Version 2.4 focuses on more realistic home recommendations powered by watchlist signals, recent history, duplicate filtering, and trending fallbacks.

## Roadmap

- Improve source reliability and automatic fallback.
- Add stronger admin filtering for contact messages and source reports.
- Add CSV export for admin datasets.
- Add more watch experience polish.
- Continue dependency security updates.

## Credits

- Movie and TV metadata is provided by TMDB.
- Built by Huynh Chu Minh Khoi as a personal final project.
- Portfolio: https://hcmkportfolio.netlify.app/
