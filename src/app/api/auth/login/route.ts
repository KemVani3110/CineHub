import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import pool from '@/lib/db';
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
    const { email, password, firebaseToken } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    if (isProduction) {
      // Firestore authentication for production
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

        // Get user data from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists) {
          return NextResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        }

        const userData = userDoc.data();

        // Check if user is active
        if (!userData.is_active) {
          return NextResponse.json(
            { message: 'Account is deactivated' },
            { status: 403 }
          );
        }

        // Update last login
        await userDoc.ref.update({
          last_login_at: new Date(),
          updated_at: new Date()
        });

        return NextResponse.json(
          {
            message: 'Login successful',
            user: {
              id: parseInt(decodedToken.uid.slice(-8), 16), // Convert to number for compatibility
              email: userData.email,
              name: userData.name,
              role: userData.role,
              avatar: userData.avatar,
              is_active: userData.is_active,
              email_verified: decodedToken.email_verified,
              created_at: userData.created_at.toISOString ? userData.created_at.toISOString() : new Date().toISOString(),
              updated_at: userData.updated_at.toISOString ? userData.updated_at.toISOString() : new Date().toISOString(),
              last_login_at: userData.last_login_at.toISOString ? userData.last_login_at.toISOString() : new Date().toISOString(),
              provider: userData.provider || 'local'
            },
            token: firebaseToken
          },
          { status: 200 }
        );
      } catch (firebaseError: any) {
        console.error('Firebase token verification error:', firebaseError);
        
        return NextResponse.json(
          { message: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } else {
      // MySQL authentication for local development
      if (!password) {
        return NextResponse.json(
          { message: 'Password is required' },
          { status: 400 }
        );
      }

      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      ) as [any[], any];

      const user = users[0];

      if (!user) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json(
          { message: 'Account is deactivated' },
          { status: 403 }
        );
      }

      // Verify password
      const isValidPassword = await compare(password, user.password_hash);

      if (!isValidPassword) {
        // Update login attempts
        await pool.query(
          'UPDATE users SET login_attempts = login_attempts + 1 WHERE id = ?',
          [user.id]
        );

        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Reset login attempts on successful login
      await pool.query(
        'UPDATE users SET login_attempts = 0, last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Generate JWT token
      const token = sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Create session
      await pool.query(
        'INSERT INTO sessions (user_id, token_id, refresh_token, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
        [user.id, token, token]
      );

      // Set cookie
      const response = NextResponse.json(
        {
          message: 'Login successful',
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
            provider: user.provider || 'local'
          },
          token: token
        },
        { status: 200 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 