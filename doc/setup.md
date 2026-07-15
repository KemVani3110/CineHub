# CineHub Setup Guide

CineHub v2.0.0 is a Firebase-first movie and TV discovery app. This guide explains how to run the project locally without the old MySQL or NextAuth setup.

## Requirements

- Node.js 18 or newer
- npm
- Firebase project
- TMDB API key
- Gmail App Password or another SMTP account for contact email

## 1. Install The Project

```bash
git clone <repository-url>
cd cinehub
npm install
```

## 2. Create The Environment File

```bash
cp .env.example .env.local
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env.local
```

## 3. Configure Environment Variables

Fill these groups in `.env.local`.

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

Notes:

- `FIREBASE_PRIVATE_KEY` and `SMTP_PASS` are private server-side values.
- `NEXT_PUBLIC_*` values are exposed to the browser by design.
- Gmail SMTP requires a Google App Password, not the normal Gmail password.
- Do not add MySQL, NextAuth, JWT, or legacy database variables.

## 4. Configure Firebase

In Firebase Console:

1. Enable Authentication.
2. Enable Email/Password.
3. Enable Google provider if the app should use Google login.
4. Create a Firestore database.
5. Add `localhost` to Authentication authorized domains.
6. Generate a Firebase Admin service account key.
7. Copy the Firestore rules from `firestore.rules`.

## 5. Configure TMDB

Create an API key at TMDB and set:

```env
NEXT_PUBLIC_TMDB_API_KEY=
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

## 6. Start Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 7. Verify The Main Flows

After the app starts, test:

- Register and login.
- Google login if enabled.
- Browse `/home`, `/explore`, `/search`, movie details, and TV details.
- Add a title to watchlist.
- Watch a movie or TV episode.
- Submit a source report from the player.
- Submit the contact form and confirm email delivery.
- Open admin pages with an admin account.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Build the production app. |
| `npm run start` | Run the built app. |
| `npx tsc --noEmit` | Validate TypeScript. |

## Project Map

```text
cinehub/
  doc/                    Project documentation
  public/                 Logo and static assets
  src/
    app/                  App Router pages and API routes
    components/           UI, auth, admin, watch, and shared components
    hooks/                React hooks
    lib/                  Firebase, email, admin, auth, and app helpers
    services/             TMDB service layer
    store/                Zustand stores
```

## Common Local Issues

| Issue | Fix |
| --- | --- |
| Firebase private key error | Keep escaped `\n` newlines in `FIREBASE_PRIVATE_KEY`. |
| Google login blocked | Add the domain in Firebase authorized domains. |
| Contact email fails | Check `SMTP_*` values and use a Gmail App Password. |
| Admin redirects to login | Confirm the logged-in user's email matches `ADMIN_EMAIL` or admin role logic. |
| Movie data missing | Confirm the TMDB key and base URLs are set. |
