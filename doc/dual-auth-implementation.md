# Dual Authentication System Implementation

## Overview

CineHub now implements a comprehensive dual authentication system that automatically detects the environment and uses the appropriate authentication method:

- **Local Development**: MySQL + NextAuth.js + bcrypt
- **Production (Vercel)**: Firebase Auth + Firestore

## Core Components

### 1. Helper Library (`src/lib/auth-helpers.ts`)

A centralized helper library that provides:
- **`getAuthenticatedUser(request: NextRequest)`**: Universal authentication function
- **`getUserId(user: AuthUser)`**: Environment-aware user ID formatting
- **`logActivity()`**: Dual database activity logging
- **`isAdmin()` / `isAdminOrModerator()`**: Role checking utilities

### 2. Updated Auth API Routes

All auth API routes now support dual system:

#### Core Auth Routes
- ✅ **`/api/auth/login`** - Email/password + Firebase token support
- ✅ **`/api/auth/register`** - User registration with dual database
- ✅ **`/api/auth/logout`** - Cleanup for both systems
- ✅ **`/api/auth/profile`** - Profile management with dual support
- ✅ **`/api/auth/me`** - Current user fetching
- ✅ **`/api/auth/social-login`** - Google/Facebook login (already dual)

#### Feature API Routes (Updated)
- ✅ **`/api/watchlist`** - Watchlist management with Firestore/MySQL
- ✅ **`/api/favorites`** - Favorite actors with dual database
- ✅ **`/api/ratings`** - Movie/TV ratings with complete dual support

### 3. Authentication Service (`src/services/auth/authService.ts`)

- **FirestoreAuthService**: Production authentication with Firebase
- **AuthService**: Local development with MySQL
- Automatic environment detection and service selection

### 4. Auth Hook (`src/hooks/useAuth.ts`)

- Unified authentication interface for components
- Environment-aware state management
- Automatic Firebase/NextAuth session handling

### 5. Frontend Components

Updated components for dual auth:
- **LoginForm**: Works with both auth systems
- **RegisterForm**: Handles dual registration
- **SocialLoginButtons**: Firebase social auth with fallbacks

## Environment Detection

The system uses consistent environment detection across all components:

```typescript
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
```

## Database Schema Compatibility

### MySQL (Local Development)
- Uses existing table structure
- Integer user IDs
- Traditional foreign keys
- bcrypt password hashing

### Firestore (Production)
- Document-based collections
- String user IDs (Firebase UIDs)
- Subcollections for related data
- Firebase Auth password handling

## API Routes Implementation Status

### ✅ Fully Implemented (Dual System)
- `/api/auth/*` - All authentication routes
- `/api/watchlist` - Watchlist management
- `/api/favorites` - Favorite actors
- `/api/ratings` - Movie/TV ratings
- `/api/profile` - User profile management

### 🔄 Remaining Routes (MySQL Only)
These routes still use MySQL/NextAuth only and would need updates for full production compatibility:
- `/api/reviews` - Review system
- `/api/history` - Watch history
- `/api/admin/*` - Admin panel routes
- `/api/avatars` - Avatar management
- `/api/stream/*` - Streaming functionality

### ⚠️ Admin Routes
Admin routes require special attention as they need:
- Role-based access control
- User management across both systems
- Activity logging in both databases

## Usage Examples

### Using the Helper Function

```typescript
import { getAuthenticatedUser, getUserId, logActivity } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  
  if (!user) {
    return NextResponse.json(
      { message: error || 'Unauthorized' },
      { status: 401 }
    );
  }

  // Use appropriate user ID format
  const userId = getUserId(user);
  
  // Log activity to appropriate database
  await logActivity(user.id, 'user_action', { details: 'example' });
}
```

### Frontend Auth Hook

```typescript
const { user, loading, login, register, logout } = useAuth();

// Works the same in both environments
await login(email, password);
```

## Security Considerations

### Local Development
- Session-based authentication with NextAuth.js
- JWT tokens for API access
- bcrypt for password hashing
- MySQL prepared statements

### Production
- Firebase Auth for authentication
- Firestore security rules
- Server-side token verification
- Firebase Admin SDK for backend operations

## Deployment Configuration

### Local Development (.env.local)
```bash
# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=CINEHUB

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# Firebase (same as production)
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... other Firebase config
```

### Production (Vercel Environment Variables)
```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Firebase Admin (Private)
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Environment Flags
NODE_ENV=production
VERCEL_ENV=production

# TMDB API
TMDB_API_KEY=...
```

## Migration Strategy

### For New Features
1. Use `getAuthenticatedUser()` helper
2. Implement both Firestore and MySQL logic
3. Use environment detection for database selection
4. Test in both environments

### For Existing Routes
1. Import auth helpers
2. Replace `getServerSession()` with `getAuthenticatedUser()`
3. Add Firestore implementation alongside MySQL
4. Update error handling and responses

## Testing

### Local Testing
- Uses MySQL database
- NextAuth.js session management
- Standard bcrypt authentication

### Production Testing
- Requires Firebase project setup
- Test with Firebase Auth
- Verify Firestore security rules
- Test social login functionality

## Best Practices

1. **Always use helper functions** instead of direct database calls
2. **Test both environments** when developing new features
3. **Use consistent error handling** across auth systems
4. **Log activities** using the unified logging function
5. **Validate user roles** using helper functions

## Troubleshooting

### Common Issues
1. **Firebase not initialized**: Check environment variables
2. **Token verification fails**: Verify Firebase admin config
3. **Database connection errors**: Check MySQL config in local
4. **Social login popup blocked**: Implement redirect fallback

### Debug Steps
1. Check environment detection logic
2. Verify Firebase/MySQL configuration
3. Test authentication tokens
4. Check security rules (Firestore) or database permissions (MySQL) 