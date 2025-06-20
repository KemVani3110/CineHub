import { NextRequest, NextResponse } from 'next/server';
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
  const app = initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  adminDb = getFirestore(app);
}

export async function GET(request: NextRequest) {
  try {
    if (isProduction) {
      // For production, verify Firebase token
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await auth().verifyIdToken(token);
      
      if (!decodedToken.uid || !adminDb) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get user from Firestore
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      const userData = userDoc.data();
      
      return NextResponse.json({
        user: {
          id: parseInt(decodedToken.uid.slice(-8), 16),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar,
          is_active: userData.is_active,
          email_verified: userData.email_verified,
          created_at: userData.created_at.toISOString ? userData.created_at.toISOString() : new Date().toISOString(),
          updated_at: userData.updated_at.toISOString ? userData.updated_at.toISOString() : new Date().toISOString(),
          last_login_at: userData.last_login_at.toISOString ? userData.last_login_at.toISOString() : new Date().toISOString(),
          provider: userData.provider
        }
      });
    } else {
      // For development, use NextAuth session
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get user from MySQL
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(
          'SELECT * FROM users WHERE id = ?',
          [session.user.id]
        );
        
        const user = (rows as any[])[0];
        
        if (!user) {
          return NextResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            is_active: user.is_active,
            email_verified: user.email_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_login_at: user.last_login_at,
            provider: user.provider
          }
        });
      } finally {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 