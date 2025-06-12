import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import pool from '@/lib/db';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const { provider, token, user } = await request.json();

    if (!token || !provider || !user) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the Firebase token
    const decodedToken = await auth().verifyIdToken(token);

    if (!decodedToken.email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists by provider_id
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE provider_id = ? AND provider = ?',
      [user.providerId, provider]
    );
    const existingUser = (rows as any[])[0];

    if (existingUser) {
      // Update user info if needed
      if (!existingUser.is_active) {
        return NextResponse.json(
          { message: 'Account is disabled' },
          { status: 403 }
        );
      }

      // Update last login and user info
      await pool.execute(
        `UPDATE users 
         SET last_login_at = CURRENT_TIMESTAMP,
             name = ?,
             avatar = ?,
             email = ?
         WHERE id = ?`,
        [
          user.name || decodedToken.name,
          user.avatar || decodedToken.picture,
          decodedToken.email,
          existingUser.id
        ]
      );

      return NextResponse.json({
        user: {
          id: existingUser.id,
          name: user.name || decodedToken.name,
          email: decodedToken.email,
          avatar: user.avatar || decodedToken.picture,
          role: existingUser.role,
        },
      });
    }

    // Check if email already exists
    const [emailRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [decodedToken.email]
    );
    const existingEmailUser = (emailRows as any[])[0];

    if (existingEmailUser) {
      // Update existing user with social login info
      await pool.execute(
        `UPDATE users 
         SET provider = ?,
             provider_id = ?,
             last_login_at = CURRENT_TIMESTAMP,
             name = ?,
             avatar = ?
         WHERE id = ?`,
        [
          provider,
          user.providerId,
          user.name || decodedToken.name,
          user.avatar || decodedToken.picture,
          existingEmailUser.id
        ]
      );

      return NextResponse.json({
        user: {
          id: existingEmailUser.id,
          name: user.name || decodedToken.name,
          email: decodedToken.email,
          avatar: user.avatar || decodedToken.picture,
          role: existingEmailUser.role,
        },
      });
    }

    // Create new user if doesn't exist
    const [result] = await pool.execute(
      `INSERT INTO users (
        email, name, avatar, role, is_active, 
        email_verified, provider, provider_id, last_login_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        decodedToken.email,
        user.name || decodedToken.name,
        user.avatar || decodedToken.picture,
        'user', // Always set role as 'user' for social login
        true,
        true,
        provider,
        user.providerId,
      ]
    );

    const [newUser] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [decodedToken.email]
    );

    return NextResponse.json({
      user: {
        id: (newUser as any[])[0].id,
        name: (newUser as any[])[0].name,
        email: (newUser as any[])[0].email,
        avatar: (newUser as any[])[0].avatar,
        role: (newUser as any[])[0].role,
      },
    });
  } catch (error) {
    console.error('Social login error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 }
    );
  }
} 