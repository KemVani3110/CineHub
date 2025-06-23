# CineHub Deployment Guide

## Overview

CineHub uses a dual authentication system:
- **Local Development**: MySQL + NextAuth.js + bcrypt
- **Production (Vercel)**: Firebase Auth + Firestore

This allows for fast local development while using serverless-compatible auth in production.

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- MySQL database
- Firebase project (for testing production auth locally)

### Environment Variables (.env.local)

```bash
# Database (MySQL - Local Only)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=CINEHUB

# NextAuth.js (Local Only)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl

# JWT (Local Only)
JWT_SECRET=your-jwt-secret

# Firebase Configuration (Used in both Local & Production)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Production Auth)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Environment Flags
NODE_ENV=development
```

### Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository>
   cd cinehub
   npm install
   ```

2. **Setup MySQL Database**
   ```bash
   # Import the database schema
   mysql -u root -p < database/cinehub.sql
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in all the variables above

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Production Deployment (Vercel)

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication
   - Enable Firestore Database

2. **Configure Authentication Providers**
   ```bash
   # In Firebase Console > Authentication > Sign-in method
   # Enable Email/Password
   # Enable Google (optional)
   # Enable Facebook (optional)
   ```

3. **Setup Firestore Security Rules**
   - Copy the rules from `firestore.rules` to your Firebase project
   - Deploy the rules in Firebase Console

4. **Generate Service Account Key**
   ```bash
   # In Firebase Console > Project Settings > Service accounts
   # Click "Generate new private key"
   # Download the JSON file
   ```

### Vercel Environment Variables

#### Required for Production

```bash
# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin Configuration (Private)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Environment Flags (Critical!)
NODE_ENV=production
VERCEL_ENV=production
```

#### DO NOT INCLUDE in Production
```bash
# These are MySQL-specific and not needed for Vercel
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
JWT_SECRET=
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Framework preset: Next.js

3. **Configure Environment Variables**
   - In Vercel project settings > Environment Variables
   - Add all the required production variables above
   - Set environment to "Production"

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Check deployment logs for any errors

### Environment Variable Setup in Vercel

#### Option 1: Through Vercel Dashboard
1. Go to your project in Vercel
2. Navigate to Settings > Environment Variables
3. Add each variable one by one
4. Select "Production" environment

#### Option 2: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
# ... add all other variables
```

### Important Notes

1. **Firebase Private Key**: Make sure to properly escape the private key:
   ```bash
   # Correct format with escaped newlines
   "-----BEGIN PRIVATE KEY-----\nMIIEvg...key_content...\n-----END PRIVATE KEY-----\n"
   ```

2. **Environment Detection**: The app automatically detects the environment:
   ```javascript
   const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
   ```

3. **Database Migration**: In production, user data is stored in Firestore, not MySQL.

## Authentication Flow

### Local Development
1. User enters email/password
2. API validates against MySQL database
3. NextAuth.js creates session
4. JWT token stored in HTTP-only cookie

### Production (Vercel)
1. User enters email/password
2. Firebase Auth validates credentials
3. Firebase ID token generated
4. API verifies token and updates Firestore
5. User data retrieved from Firestore

## Troubleshooting

### Common Issues

1. **"Firebase token required" Error**
   - Check that `NODE_ENV=production` is set
   - Verify Firebase configuration is correct

2. **"Invalid private key" Error**
   - Ensure private key is properly escaped with \n
   - Check that quotes are properly formatted

3. **Authentication Loop**
   - Clear browser cookies/localStorage
   - Check environment variable configuration

4. **Build Errors**
   - Verify all required environment variables are set
   - Check that Firebase project has correct configuration

### Debugging Commands

```bash
# Check environment variables are loaded
vercel env ls

# View deployment logs
vercel logs

# Run local production build
npm run build
npm run start
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive variables to git
2. **Firebase Rules**: Ensure Firestore rules are properly configured
3. **API Keys**: Use environment-specific API keys
4. **CORS**: Configure proper CORS settings for production domain

## Performance Optimization

1. **Firebase Connection**: Connection pooling is handled automatically
2. **Caching**: Implement caching for frequently accessed data
3. **Bundle Size**: Tree-shake unused Firebase features
4. **CDN**: Leverage Vercel's edge network for static assets

## Monitoring

1. **Vercel Analytics**: Monitor performance and errors
2. **Firebase Console**: Track authentication usage
3. **Error Tracking**: Implement error tracking service
4. **Logs**: Monitor function logs for issues

## Rollback Strategy

1. **Vercel Instant Rollback**: Use Vercel dashboard to rollback deployments
2. **Environment Variables**: Keep backup of working configurations
3. **Database**: Firestore has built-in backup/restore capabilities
4. **Git**: Use git tags for release management
