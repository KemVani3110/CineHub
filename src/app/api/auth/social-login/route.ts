import { NextResponse } from 'next/server';
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

    if (isProduction && adminDb) {
      // Use Firestore for production
      try {
        // Check if user exists by email
        const usersRef = adminDb.collection('users');
        const emailSnapshot = await usersRef.where('email', '==', decodedToken.email).get();
        
        let userData;
        
        if (emailSnapshot.empty) {
          // Create new user in Firestore
          const newUserRef = usersRef.doc(decodedToken.uid);
          userData = {
            id: decodedToken.uid,
            name: user.name || decodedToken.name || '',
            email: decodedToken.email,
            avatar: user.avatar || decodedToken.picture || '',
            role: 'user',
            is_active: true,
            email_verified: decodedToken.email_verified || false,
            created_at: new Date(),
            updated_at: new Date(),
            last_login_at: new Date(),
            provider: provider,
            provider_id: decodedToken.uid,
          };
          
          await newUserRef.set(userData);
          
          // Log activity
          await adminDb.collection('user_activity_logs').add({
            userId: decodedToken.uid,
            action: 'user_registered',
            details: { provider },
            timestamp: new Date(),
            ip_address: null
          });
        } else {
          // Update existing user
          const existingUser = emailSnapshot.docs[0];
          userData = existingUser.data();
          
          await existingUser.ref.update({
            last_login_at: new Date(),
            updated_at: new Date()
          });
        }

        return NextResponse.json({
          success: true,
          user: {
            id: parseInt(decodedToken.uid.slice(-8), 16), // Convert to number for compatibility
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
          },
          token: token,
        });
      } catch (error) {
        console.error('Firestore social login error:', error);
        return NextResponse.json(
          { message: 'Internal server error' },
          { status: 500 }
        );
      }
    } else {
      // Use MySQL for local development (existing code)
      // Check if user exists by provider_id
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE provider_id = ? AND provider = ?',
        [user.providerId, provider]
      );
      const existingUser = (rows as any[])[0];

      let userData;

      if (existingUser) {
        // Update existing user
        await pool.execute(
          'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
          [existingUser.id]
        );
        userData = existingUser;
      } else {
        // Check if user exists by email
        const [emailRows] = await pool.execute(
          'SELECT * FROM users WHERE email = ?',
          [decodedToken.email]
        );
        const emailUser = (emailRows as any[])[0];

        if (emailUser) {
          // Update existing user with provider info
          await pool.execute(
            'UPDATE users SET provider = ?, provider_id = ?, last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
            [provider, user.providerId, emailUser.id]
          );
          userData = { ...emailUser, provider, provider_id: user.providerId };
        } else {
          // Create new user
          const [result] = await pool.execute(
            'INSERT INTO users (email, name, avatar, provider, provider_id, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [decodedToken.email, user.name, user.avatar || '', provider, user.providerId, 'user', true, decodedToken.email_verified || false]
          );

          const insertResult = result as any;
          userData = {
            id: insertResult.insertId,
            email: decodedToken.email,
            name: user.name,
            avatar: user.avatar || '',
            provider,
            provider_id: user.providerId,
            role: 'user',
            is_active: true,
            email_verified: decodedToken.email_verified || false,
          };
        }
      }

      return NextResponse.json({
        success: true,
        user: userData,
        token: token,
      });
    }
  } catch (error) {
    console.error('Social login error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 401 }
    );
  }
} 