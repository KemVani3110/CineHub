import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { compare, hash } from "bcrypt";
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase';

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

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "Current password, new password and confirm password are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { message: "New password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { message: "New password must contain at least one number" },
        { status: 400 }
      );
    }

    if (isProduction) {
      // Firebase production environment
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

      // For Firebase users, we need to update password through Firebase Auth
      // Note: In production, password update should be handled on client side with proper re-authentication
      // This is just updating the stored hash in Firestore for local providers
      if (userData.provider === 'email') {
        // Verify current password if it exists in Firestore
        if (userData.password_hash) {
          const isValid = await compare(currentPassword, userData.password_hash);
          if (!isValid) {
            return NextResponse.json(
              { message: 'Current password is incorrect' },
              { status: 400 }
            );
          }
        }

        // Hash and store new password
        const hashedPassword = await hash(newPassword, 12);
        await adminDb.collection('users').doc(decodedToken.uid).update({
          password_hash: hashedPassword,
          updated_at: new Date()
        });

        return NextResponse.json({
          message: "Password updated successfully. Your current session will remain active until you log out."
        });
      } else {
        return NextResponse.json(
          { message: 'Password change not supported for social login accounts' },
          { status: 400 }
        );
      }
    } else {
      // MySQL development environment
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }

      // Get connection and start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
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
        const hashedPassword = await hash(newPassword, 12);
        await connection.execute(
          'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
          [hashedPassword, session.user.id]
        );

        await connection.commit();

        return NextResponse.json({
          message: "Password updated successfully. Your current session will remain active until you log out."
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 }
    );
  }
} 