import { NextResponse } from 'next/server';
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
    if (isProduction) {
      // Firestore logout for production
      // Get Firebase token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const decodedToken = await auth().verifyIdToken(token);
          
          // Log activity in Firestore
          if (adminDb) {
            await adminDb.collection('user_activity_logs').add({
              userId: decodedToken.uid,
              action: 'user_logged_out',
              details: { method: 'firebase_auth' },
              timestamp: new Date(),
              ip_address: null
            });
          }
        } catch (error) {
          console.error('Error verifying Firebase token during logout:', error);
        }
      }

      return NextResponse.json(
        { message: 'Logged out successfully' },
        { status: 200 }
      );
    } else {
      // MySQL logout for local development
      // Get token from cookie
      const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

      if (token) {
        // Delete session from database
        await db.query(
          'DELETE FROM sessions WHERE token_id = ?',
          [token]
        );
      }

      // Clear cookie
      const response = NextResponse.json(
        { message: 'Logged out successfully' },
        { status: 200 }
      );

      response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      return response;
    }
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 