# CineHub Deployment Guide

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Vercel account (recommended for Next.js deployment)
- Firebase project
- MySQL database
- TMDB API key

## Environment Setup

1. Create a production `.env` file with the following variables:
```env
# Database
DATABASE_URL=your_production_mysql_connection_string

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_API_URL=https://api.themoviedb.org/3

# NextAuth
NEXTAUTH_URL=your_production_url
NEXTAUTH_SECRET=your_production_nextauth_secret
```

## Deployment Options

### 1. Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### 2. Docker Deployment

1. Build the Docker image:
```bash
docker build -t cinehub .
```

2. Run the container:
```bash
docker run -p 3000:3000 cinehub
```

### 3. Traditional Server Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Database Setup

1. Create a production MySQL database
2. Run database migrations
3. Configure database connection string in environment variables

## Firebase Setup

1. Create a new Firebase project
2. Enable Authentication methods
3. Set up Firestore database
4. Configure Firebase security rules
5. Update Firebase configuration in environment variables

## SSL/TLS Configuration

For production deployment, ensure SSL/TLS is properly configured:

1. Obtain SSL certificates
2. Configure SSL in your hosting platform
3. Update `NEXTAUTH_URL` to use HTTPS

## Monitoring and Maintenance

### Health Checks

Implement health check endpoints:
- `/api/health` - Basic health check
- `/api/health/db` - Database connection check
- `/api/health/firebase` - Firebase connection check

### Logging

Configure logging for production:
- Application logs
- Error logs
- Access logs

### Backup Strategy

1. Database backups
   - Regular MySQL dumps
   - Firestore exports

2. Application backups
   - Source code version control
   - Environment configuration backups

## Performance Optimization

1. Enable caching:
   - API responses
   - Static assets
   - Database queries

2. Configure CDN:
   - Static assets
   - Images
   - API responses

3. Enable compression:
   - Gzip/Brotli compression
   - Image optimization

## Security Considerations

1. Enable security headers:
   - Content Security Policy (CSP)
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

2. Configure CORS:
   - Set appropriate origins
   - Configure allowed methods
   - Set security headers

3. Rate limiting:
   - API endpoints
   - Authentication attempts
   - Search requests

## Troubleshooting

Common issues and solutions:

1. Database connection issues
   - Check connection string
   - Verify network access
   - Check database credentials

2. Firebase authentication issues
   - Verify Firebase configuration
   - Check authentication methods
   - Verify security rules

3. API integration issues
   - Verify API keys
   - Check rate limits
   - Verify endpoint access

## Rollback Procedure

1. Keep track of deployments
2. Maintain database backups
3. Document configuration changes
4. Test rollback procedures regularly
