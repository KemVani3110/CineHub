import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export async function POST(req: Request) {
  try {
    const { name, email, password, firebaseToken } = await req.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (isProduction) {
      // Firestore registration for production
      // Expect Firebase token from client-side authentication
      if (!firebaseToken) {
        return NextResponse.json(
          { message: 'Firebase token is required for production' },
          { status: 400 }
        );
      }

      try {
        // Verify Firebase token
        const decodedToken = await auth().verifyIdToken(firebaseToken);
        
        if (decodedToken.email !== email) {
          return NextResponse.json(
            { message: 'Email mismatch' },
            { status: 400 }
          );
        }

        // Check if user already exists in Firestore
        const existingUser = await adminDb.collection('users').doc(decodedToken.uid).get();
        
        if (existingUser.exists) {
          return NextResponse.json(
            { message: 'User already exists' },
            { status: 400 }
          );
        }

        // Create user document in Firestore
        const userData = {
          id: decodedToken.uid,
          name: name,
          email: email,
          avatar: '',
          role: 'user',
          is_active: true,
          email_verified: decodedToken.email_verified || false,
          created_at: new Date(),
          updated_at: new Date(),
          last_login_at: new Date(),
          provider: 'email'
        };

        await adminDb.collection('users').doc(decodedToken.uid).set(userData);

        // Log activity
        await adminDb.collection('user_activity_logs').add({
          userId: decodedToken.uid,
          action: 'user_registered',
          details: { provider: 'email' },
          timestamp: new Date(),
          ip_address: null
        });

        return NextResponse.json(
          {
            message: 'Registration successful',
            user: {
              id: parseInt(decodedToken.uid.slice(-8), 16),
              name: userData.name,
              email: userData.email,
              role: userData.role,
              avatar: userData.avatar,
              is_active: userData.is_active,
              email_verified: userData.email_verified,
              created_at: userData.created_at.toISOString(),
              updated_at: userData.updated_at.toISOString(),
              provider: userData.provider
            },
            token: firebaseToken
          },
          { status: 201 }
        );
      } catch (firebaseError: any) {
        console.error('Firebase token verification error:', firebaseError);
        
        return NextResponse.json(
          { message: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } else {
      // MySQL registration for local development
      if (!password) {
        return NextResponse.json(
          { message: 'Password is required' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      ) as [any[], any];

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await hash(password, 12);

      // Create user
      const [result] = await db.query(
        `INSERT INTO users (
          name,
          email,
          password_hash,
          role,
          is_active,
          provider
        ) VALUES (?, ?, ?, 'user', true, 'local')`,
        [name, email, passwordHash]
      ) as [any, any];

      const userId = (result as any).insertId;

      // Create default user preferences
      await db.query(
        `INSERT INTO user_preferences (
          user_id,
          language,
          notifications_email,
          notifications_push,
          notifications_recommendations,
          notifications_new_releases,
          privacy_show_watchlist,
          privacy_show_ratings,
          privacy_show_activity
        ) VALUES (?, 'en', true, true, true, true, true, true, true)`,
        [userId]
      );

      return NextResponse.json(
        {
          message: 'Registration successful',
          user: {
            id: userId,
            name,
            email,
            role: 'user',
            provider: 'local'
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 