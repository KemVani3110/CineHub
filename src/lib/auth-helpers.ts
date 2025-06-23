import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import pool from '@/lib/db';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

// Initialize Firebase Admin if not already initialized
let adminDb: any = null;
if (!getApps().length) {
  const firebaseApp = initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  adminDb = getFirestore(firebaseApp);
} else {
  adminDb = getFirestore();
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  is_active?: boolean;
  email_verified?: boolean;
  provider?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error?: string;
}

/**
 * Get authenticated user from either Firebase (production) or NextAuth (development)
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  try {
    if (isProduction) {
      // Firebase authentication for production
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: 'No authorization header' };
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return { user: null, error: 'No token provided' };
      }

      try {
        const decodedToken = await auth().verifyIdToken(token);
        
        if (!decodedToken.uid || !adminDb) {
          return { user: null, error: 'Invalid token or Firebase not initialized' };
        }

        // Get user from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists) {
          return { user: null, error: 'User not found' };
        }

        const userData = userDoc.data();
        
        if (!userData.is_active) {
          return { user: null, error: 'Account is deactivated' };
        }

        return {
          user: {
            id: decodedToken.uid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            avatar: userData.avatar,
            is_active: userData.is_active,
            email_verified: userData.email_verified,
            provider: userData.provider
          }
        };
      } catch (error) {
        return { user: null, error: 'Invalid or expired token' };
      }
    } else {
      // NextAuth for development
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return { user: null, error: 'No session found' };
      }

      // Get user from MySQL
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(
          'SELECT * FROM users WHERE id = ?',
          [session.user.id]
        );
        
        const userData = (rows as any[])[0];
        
        if (!userData) {
          return { user: null, error: 'User not found' };
        }

        if (!userData.is_active) {
          return { user: null, error: 'Account is deactivated' };
        }

        return {
          user: {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name,
            role: userData.role,
            avatar: userData.avatar,
            is_active: userData.is_active,
            email_verified: userData.email_verified,
            provider: userData.provider
          }
        };
      } finally {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Check if user has admin or moderator role
 */
export function isAdminOrModerator(user: AuthUser): boolean {
  return user.role === 'admin' || user.role === 'moderator';
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * Get user ID in appropriate format for the current environment
 */
export function getUserId(user: AuthUser): number | string {
  if (isProduction) {
    return user.id; // Keep as string for Firebase
  } else {
    return parseInt(user.id); // Convert to number for MySQL
  }
}

/**
 * Log user activity to the appropriate database
 */
export async function logActivity(
  userId: string,
  action: string,
  details: any = {},
  entityType?: 'movie' | 'tv',
  entityId?: number,
  entityTitle?: string
): Promise<void> {
  try {
    if (isProduction && adminDb) {
      // Log to Firestore
      await adminDb.collection('user_activity_logs').add({
        userId,
        action,
        details,
        entityType: entityType || null,
        entityId: entityId || null,
        entityTitle: entityTitle || null,
        timestamp: new Date(),
        ip_address: null
      });
    } else {
      // Log to MySQL
      const connection = await pool.getConnection();
      try {
        if (entityType && entityId && entityTitle) {
          // Detailed activity log
          await connection.execute(
            'INSERT INTO user_activity_logs (user_id, activity_type, entity_type, entity_id, entity_title, metadata) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, action, entityType, entityId, entityTitle, JSON.stringify(details)]
          );
        } else {
          // Simple activity log
          await connection.execute(
            'INSERT INTO user_activity_logs (user_id, activity_type, entity_type, entity_id, entity_title, metadata) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, action, 'system', 0, action, JSON.stringify(details)]
          );
        }
      } finally {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export { isProduction, adminDb }; 