# CineHub Deployment Guide

CineHub is designed for Vercel. Production requires Firebase Authentication, Firestore, Firebase Admin, TMDB, and SMTP contact email.

## Production Checklist

Before deploying, confirm:

- The latest code is pushed to GitHub.
- Firebase Authentication is enabled.
- Email/Password is enabled.
- Google provider is enabled if the app uses Google login.
- Firestore database exists.
- Firestore rules are published from `firestore.rules`.
- Firebase Admin service account values are ready.
- TMDB API key is ready.
- SMTP credentials are ready.
- The Vercel domain is added to Firebase Authentication authorized domains.

## Required Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables.

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
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
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

## Sensitive Variables

Mark these as Sensitive in Vercel:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_EMAIL`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Public variables:

- `NEXT_PUBLIC_FIREBASE_*`
- `NEXT_PUBLIC_TMDB_*`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`

Public variables are bundled into browser code by design, so do not store secrets in `NEXT_PUBLIC_*`.

## Firebase Production Setup

### Authentication

Enable:

- Email/Password
- Google provider, if used

Add authorized domains:

```text
localhost
your-vercel-domain.vercel.app
your-custom-domain.com
```

If login or Google login does not redirect correctly on Vercel, this is usually the first place to check.

### Firestore

1. Create the Firestore database.
2. Open Firestore Rules.
3. Paste the contents of `firestore.rules`.
4. Publish the rules.

Firestore stores:

- users and profiles
- watchlists
- watch history
- ratings and reviews
- favorite actors
- notifications
- source reports
- contact messages
- admin activity logs
- avatar metadata

### Firebase Admin

1. Open Firebase Project Settings.
2. Go to Service accounts.
3. Generate a new private key.
4. Copy these values into Vercel:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

For `FIREBASE_PRIVATE_KEY`, keep escaped newlines:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Do not paste the full service-account JSON file into Vercel as one value.

## SMTP Production Setup

For Gmail:

1. Enable 2-Step Verification.
2. Create a Google App Password.
3. Use the 16-character App Password as `SMTP_PASS`.
4. Use `SMTP_HOST=smtp.gmail.com`.
5. Use `SMTP_PORT=465`.
6. Use `SMTP_SECURE=true`.

Contact behavior in production:

- `POST /api/contact` saves the public message and sends an HTML email.
- `GET /api/contact` lists messages for admin.
- `PATCH /api/contact` sends an admin reply and marks the message as replied.

## Deploy Steps

```bash
git status
git add .
git commit -m "Update project documentation"
git push
```

Then in Vercel:

1. Import the GitHub repository.
2. Select the Next.js preset.
3. Add all environment variables.
4. Deploy.
5. Redeploy after changing environment variables.

## Post-Deploy Verification

| Area | What To Verify |
| --- | --- |
| Health | `/api/auth/health` returns `ok: true` and `missing: []`. |
| Auth | Register, login, logout, and Google login if enabled. |
| Firebase Data | Profile, avatar, watchlist, history, ratings, reviews, favorite actors. |
| Home | Hero loads quickly, recommendations render, notifications open. |
| Explore/Search | Filters, tabs, search results, actor results. |
| Detail Pages | Movie/TV availability labels, trailer section, cast cards, similar content. |
| Watch Pages | Movie player, TV episode player, source menu, theater mode, report source. |
| Contact | Submit contact form and receive email. |
| Admin | Dashboard, analytics, users, source reports, contact inbox, activity logs, avatars, settings. |
| SEO | Metadata, sitemap, robots, social preview text. |

## Troubleshooting

### Login or register does not work on Vercel

- Check Firebase authorized domains.
- Check all Firebase client environment variables.
- Confirm `NEXT_PUBLIC_APP_URL` matches the deployed URL.
- Clear old browser cookies and retry.
- Redeploy after changing environment variables.

### Google login says unauthorized domain

- Add the Vercel domain in Firebase Authentication > Settings > Authorized domains.
- Check Google provider is enabled.
- Redeploy if Firebase client variables changed.

### Contact email does not send

- Confirm `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `CONTACT_FROM_EMAIL`.
- Use a Gmail App Password, not the normal Gmail password.
- Confirm `SMTP_PORT=465` and `SMTP_SECURE=true`.
- Check Vercel function logs for SMTP provider errors.

### Firebase private key error

- Keep `\n` escaped in `FIREBASE_PRIVATE_KEY`.
- Wrap the value in quotes if needed.
- Do not paste the full JSON file as `FIREBASE_PRIVATE_KEY`.

### Movie or TV data is missing

- Confirm `NEXT_PUBLIC_TMDB_API_KEY`.
- Confirm `NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3`.
- Confirm `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p`.

### Source opens the wrong title

- Prefer TMDB-aware sources first.
- Submit a source report from the watch page.
- Review source reports in admin and let reported sources be deprioritized.

## Rollback

Use Vercel's instant rollback if a deployment breaks. Keep the previous working environment variable set unchanged so rollback can recover quickly.
