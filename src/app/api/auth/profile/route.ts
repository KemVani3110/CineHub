import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { compare, hash } from 'bcrypt';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { updatePassword } from 'firebase/auth';

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

export async function PUT(req: Request) {
  try {
    if (isProduction) {
      // Firestore profile update for production
      const authHeader = req.headers.get('authorization');
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

      const { name, email, avatar } = await req.json();

      // Update user in Firestore
      const userDocRef = adminDb.collection('users').doc(decodedToken.uid);
      const updateData: any = {
        updated_at: new Date()
      };

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (avatar) updateData.avatar = avatar;

      await userDocRef.update(updateData);

      // Get updated user data
      const userDoc = await userDocRef.get();
      const userData = userDoc.data();

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          id: parseInt(decodedToken.uid.slice(-8), 16),
          email: userData?.email,
          name: userData?.name,
          role: userData?.role,
          avatar: userData?.avatar,
          is_active: userData?.is_active,
          email_verified: userData?.email_verified,
          created_at: userData?.created_at?.toISOString ? userData.created_at.toISOString() : new Date().toISOString(),
          updated_at: userData?.updated_at?.toISOString ? userData.updated_at.toISOString() : new Date().toISOString(),
          last_login_at: userData?.last_login_at?.toISOString ? userData.last_login_at.toISOString() : new Date().toISOString(),
          provider: userData?.provider
        }
      });
    } else {
      // MySQL profile update for local development
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }

      const { name, email, currentPassword, newPassword } = await req.json();

      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Update basic info if provided
        if (name || email) {
          const [result] = await connection.execute(
            'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
            [name, email, session.user.id]
          );
        }

        // Update password if provided
        if (currentPassword && newPassword) {
          // Verify current password
          const [rows] = await connection.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [session.user.id]
          );
          const users = rows as any[];

          if (users.length === 0) {
            throw new Error('User not found');
          }

          const isValid = await compare(currentPassword, users[0].password_hash);
          if (!isValid) {
            throw new Error('Current password is incorrect');
          }

          // Hash and update new password
          const hashedPassword = await hash(newPassword, 10);
          await connection.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, session.user.id]
          );
        }

        await connection.commit();

        return NextResponse.json({
          message: 'Profile updated successfully',
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    if (isProduction) {
      // Firestore profile get for production
      const authHeader = req.headers.get('authorization');
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
          email: userData?.email,
          name: userData?.name,
          role: userData?.role,
          avatar: userData?.avatar,
          is_active: userData?.is_active,
          email_verified: userData?.email_verified,
          created_at: userData?.created_at?.toISOString ? userData.created_at.toISOString() : new Date().toISOString(),
          updated_at: userData?.updated_at?.toISOString ? userData.updated_at.toISOString() : new Date().toISOString(),
          last_login_at: userData?.last_login_at?.toISOString ? userData.last_login_at.toISOString() : new Date().toISOString(),
          provider: userData?.provider
        }
      });
    } else {
      // MySQL profile get for local development
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }

      const [rows] = await pool.execute(
        'SELECT id, name, email, avatar, role, created_at, last_login_at FROM users WHERE id = ?',
        [session.user.id]
      );
      const users = rows as any[];

      if (users.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: users[0],
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: 'Failed to get profile' },
      { status: 500 }
    );
  }
} 