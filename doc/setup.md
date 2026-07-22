# CineHub Setup Guide

This guide explains how to run CineHub v2.12.0 locally. CineHub uses Firebase Authentication, Firestore, Firebase Admin, TMDB, and SMTP email. It does not require MySQL, NextAuth, or legacy JWT environment variables.

## Requirements

| Requirement | Recommended |
| --- | --- |
| Node.js | 18 or newer |
| Package manager | npm |
| Auth and database | Firebase project with Authentication and Firestore |
| Server admin access | Firebase Admin service account |
| Movie data | TMDB API key |
| Contact email | Gmail App Password or another SMTP account |

## 1. Install

```bash
git clone <repository-url>
cd cinehub
npm install
```

If the project is already on your machine:

```powershell
cd C:\InternFE\FinalProject\cinehub
npm install
```

## 2. Create `.env.local`

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Do not commit `.env.local`.

## 3. Environment Variables

Fill these values in `.env.local`.

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

Variable notes:

| Variable | Purpose | Public |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK config. | Yes |
| `FIREBASE_ADMIN_PROJECT_ID` | Server Firebase Admin project ID. | No |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account email. | No |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key. | No |
| `NEXT_PUBLIC_TMDB_*` | TMDB metadata and image config. | Yes |
| `NEXT_PUBLIC_APP_URL` | Base URL for metadata, sitemap, redirects, and deploy checks. | Yes |
| `ADMIN_EMAIL` | Primary admin account email. | No |
| `SMTP_*` | SMTP transport for contact and admin replies. | No |
| `CONTACT_FROM_EMAIL` | Sender address for contact emails. | No |
| `CONTACT_TO_EMAIL` | Inbox that receives contact messages. | No |

## 4. Firebase Setup

In Firebase Console:

1. Create or open a Firebase project.
2. Enable Authentication.
3. Enable Email/Password.
4. Enable Google provider if Google login is used.
5. Add `localhost` to Authentication authorized domains.
6. Create a Firestore database.
7. Publish `firestore.rules`.
8. Generate a Firebase Admin service account key.

Firebase Admin values:

- `FIREBASE_ADMIN_PROJECT_ID`: Firebase project ID.
- `FIREBASE_CLIENT_EMAIL`: `client_email` from the service account JSON.
- `FIREBASE_PRIVATE_KEY`: `private_key` from the service account JSON.

Keep escaped newlines in `.env.local`:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 5. TMDB Setup

Create a TMDB API key and set:

```env
NEXT_PUBLIC_TMDB_API_KEY=
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

TMDB is used for:

- home hero and discovery lists
- explore and search
- movie/TV/actor detail pages
- trailers, videos, images, credits, reviews, and similar content
- stream source resolution helpers

## 6. SMTP Contact Setup

For Gmail:

1. Turn on 2-Step Verification.
2. Create a Google App Password.
3. Use the 16-character app password for `SMTP_PASS`.
4. Use `SMTP_PORT=465` and `SMTP_SECURE=true`.

The contact workflow:

- Saves contact messages in Firestore.
- Sends an HTML email to `CONTACT_TO_EMAIL`.
- Lets admins reply from the dashboard.
- Sends admin replies through the same SMTP transport.

## 7. Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 8. Verify Main Flows

After the app starts, test:

- `/home`: hero, recommended section, navigation, notification bell.
- `/explore`: filters, movie/TV tabs, responsive grid.
- `/search`: movie, TV, and people search.
- `/movie/[id]`: overview, trailer, cast, reviews, media, similar movies.
- `/tv/[id]`: overview, seasons, trailer, cast, reviews, media, similar shows.
- `/watch-movie/[id]`: player, source menu, report button.
- `/watch-tv/[id]/season/[seasonNumber]/episode/[episodeNumber]`: player and episode history.
- `/watchlist`: add/remove saved titles.
- `/history`: search, sort, filters, resume.
- `/profile`: profile stats, avatar picker, security panel.
- `/api/recommendations/signals`: authenticated rating and favorite actor signals for recommendations.
- `/contact`: contact form, Firestore save, email send.
- `/admin`: dashboard, analytics, users, reports, contact inbox, logs, avatars, settings.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Run the built production app. |
| `npx tsc --noEmit` | Run TypeScript validation. |

## Common Local Issues

| Issue | Likely Fix |
| --- | --- |
| Firebase private key error | Keep escaped `\n` newlines in `FIREBASE_PRIVATE_KEY`. |
| Google login blocked | Add the local or deployed domain in Firebase authorized domains. |
| Contact email fails | Check `SMTP_*`, use a Gmail App Password, and verify `CONTACT_FROM_EMAIL`. |
| Admin redirects to login | Confirm the logged-in account matches `ADMIN_EMAIL` or admin role logic. |
| Movie data missing | Confirm TMDB key and base URLs. |
| Watch source opens wrong title | Use the report source flow so admin can review and source ranking can adjust. |
