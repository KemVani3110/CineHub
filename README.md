# CineHub

A movie and TV discovery app built with Next.js, Firebase Authentication, Firestore, and TMDB.

## Features

- Movie and TV browsing/search via TMDB
- Firebase email/password and social login
- Watchlist, history, ratings, reviews, favorite actors, and profile data in Firestore
- Admin panel for users, movies, avatars, stats, and activity logs
- Vercel-ready serverless deployment

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Firebase Auth
- Firestore
- Firebase Admin SDK
- Zustand
- Tailwind CSS
- TMDB API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill Firebase, Firebase Admin, and TMDB values in `.env.local`.

4. Enable these in Firebase Console:

- Authentication: Email/Password
- Authentication providers: Google/Facebook if used
- Firestore Database
- Authorized domains: `localhost` and your Vercel domain

5. Run locally:

```bash
npm run dev
```

## Deploy

Set the same Firebase/TMDB variables in Vercel.

Required Vercel variables include:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_TMDB_API_KEY=
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=CineHub
```
