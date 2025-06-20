import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  provider: string;
  created_at: Date;
  last_login_at: Date | null;
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
          provider: userData.provider,
          created_at: userData.created_at.toISOString ? userData.created_at.toISOString() : new Date().toISOString(),
          last_login_at: userData.last_login_at?.toISOString ? userData.last_login_at.toISOString() : null,
        }
      });
    } else {
      // For development, use NextAuth session
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }

      const [users] = await pool.query(
        "SELECT id, name, email, avatar, role, provider, created_at, last_login_at FROM users WHERE id = ?",
        [session.user.id]
      ) as [User[], any];

      const user = users[0];
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ user });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

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

      // Update user in Firestore
      const userDocRef = adminDb.collection('users').doc(decodedToken.uid);
      await userDocRef.update({
        name,
        email,
        updated_at: new Date()
      });

      // Get updated user data
      const userDoc = await userDocRef.get();
      const userData = userDoc.data();

      return NextResponse.json({
        message: "Profile updated successfully",
        user: {
          id: parseInt(decodedToken.uid.slice(-8), 16),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar,
          provider: userData.provider,
          created_at: userData.created_at.toISOString ? userData.created_at.toISOString() : new Date().toISOString(),
          last_login_at: userData.last_login_at?.toISOString ? userData.last_login_at.toISOString() : null,
        }
      });
    } else {
      // For development, use NextAuth session
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }

      // Update user data in the database
      const [result] = await pool.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, session.user.id]
      );

      if (!result) {
        return NextResponse.json(
          { message: "Failed to update profile" },
          { status: 500 }
        );
      }

      // Get updated user data
      const [users] = await pool.query(
        "SELECT id, name, email, avatar, role, provider, created_at, last_login_at FROM users WHERE id = ?",
        [session.user.id]
      ) as [User[], any];

      const user = users[0];

      return NextResponse.json({
        message: "Profile updated successfully",
        user,
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 