# CineHub Deployment Guide

CineHub is designed for Vercel with Firebase Authentication, Firestore, Firebase Admin, TMDB, and SMTP contact email.

## Production Checklist

Before deploying, confirm:

- Firebase Authentication is enabled.
- Firestore is created and rules are applied.
- Firebase Admin service account values are ready.
- TMDB API key is ready.
- SMTP credentials are ready for contact messages.
- Your Vercel domain is added to Firebase authorized domains.

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

Mark private values as Sensitive in Vercel:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_EMAIL`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

## Firebase Setup

### Authentication

Enable:

- Email/Password
- Google provider if used

Then add authorized domains:

```text
localhost
your-vercel-domain.vercel.app
your-custom-domain.com
```

### Firestore

1. Create the Firestore database.
2. Open Firestore Rules.
3. Paste the rules from `firestore.rules`.
4. Publish the rules.

### Firebase Admin

1. Open Project Settings.
2. Go to Service accounts.
3. Generate a new private key.
4. Copy values into Vercel:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

For `FIREBASE_PRIVATE_KEY`, keep escaped newlines:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## SMTP Contact Email

For Gmail:

1. Enable 2-Step Verification.
2. Create a Google App Password.
3. Use the 16-character App Password as `SMTP_PASS`.
4. Use port `465` with `SMTP_SECURE=true`.

The contact flow does two things:

- Saves the message in Firestore under contact messages.
- Sends an HTML email to `CONTACT_TO_EMAIL`.

Admin replies are sent from the admin dashboard through `/api/contact`.

## Deploy Steps

```bash
git status
git add .
git commit -m "Prepare production deployment"
git push
```

Then in Vercel:

1. Import the GitHub repository.
2. Select the Next.js framework preset.
3. Add all environment variables.
4. Deploy.
5. Redeploy after changing environment variables.

## Post-Deploy Verification

Check these routes and flows:

| Area | What To Verify |
| --- | --- |
| Health | `/api/auth/health` returns `ok: true`. |
| Auth | Login, register, logout, and Google login if enabled. |
| Firebase | Watchlist, history, profile, ratings, reviews. |
| Watch | Movie watch page and TV episode watch page. |
| Source Reports | Report a broken source and view it in admin. |
| Contact | Submit a contact message and receive email. |
| Admin | Dashboard, analytics, users, avatars, activity logs, contact messages. |

## Troubleshooting

### Login does not work on Vercel

- Check Firebase authorized domains.
- Check all Firebase client env values.
- Confirm `NEXT_PUBLIC_APP_URL` matches the deployed URL.
- Clear old cookies and retry.

### Google login says unauthorized domain

- Add the Vercel domain to Firebase Authentication > Settings > Authorized domains.
- Redeploy if environment variables changed.

### Contact email does not send

- Check `/api/auth/health`.
- Confirm `SMTP_PASS` is a Google App Password.
- Confirm `SMTP_PORT=465` and `SMTP_SECURE=true`.
- Redeploy after adding env variables.

### Firebase private key error

- Keep `\n` escaped in the private key.
- Do not paste the JSON file directly into Vercel.
- Put only the private key string in `FIREBASE_PRIVATE_KEY`.

### Source opens the wrong title

- Prefer TMDB-explicit source providers.
- Check the stream route provider order.
- Ask users to submit source reports from the player.

## Rollback

Use Vercel's instant rollback if a deployment breaks. Keep the previous working environment variable set unchanged so rollback can recover quickly.
