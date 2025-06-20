import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '@/lib/db';
import { compare } from 'bcrypt';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
  }
}

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

async function getUserByEmail(email: string) {
  if (isProduction && adminDb) {
    // Use Firestore for production
    try {
      const usersRef = adminDb.collection('users');
      const snapshot = await usersRef.where('email', '==', email).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        is_active: userData.is_active,
        provider: userData.provider
      };
    } catch (error) {
      console.error('Error fetching user from Firestore:', error);
      return null;
    }
  } else {
    // Use MySQL for local development
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }
}

async function updateUserLastLogin(email: string) {
  if (isProduction && adminDb) {
    // Use Firestore for production
    try {
      const usersRef = adminDb.collection('users');
      const snapshot = await usersRef.where('email', '==', email).get();
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({
          last_login_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating last login in Firestore:', error);
    }
  } else {
    // Use MySQL for local development
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE email = ?',
        [email]
      );
    } finally {
      connection.release();
    }
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        try {
          // Check if this is a social login attempt (Firebase token)
          if (credentials.password?.startsWith('eyJ')) {
            try {
              // Verify Firebase token
              const decodedToken = await auth().verifyIdToken(credentials.password);
              const email = decodedToken.email;

              if (!email) {
                return null;
              }

              const user = await getUserByEmail(email);

              if (!user || !user.is_active) {
                return null;
              }

              return {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.avatar,
              };
            } catch (error) {
              console.error('Token verification error:', error);
              return null;
            }
          }

          // Regular email/password login
          if (!credentials?.password) {
            return null;
          }

          const user = await getUserByEmail(credentials.email);

          if (!user || !user.is_active) {
            return null;
          }

          // For production (Firestore), we rely on Firebase Auth for password verification
          // For local (MySQL), we use bcrypt comparison
          if (isProduction) {
            // In production, password verification is handled by Firebase Auth
            // This should not reach here for production as we use Firebase Auth directly
            return null;
          } else {
            // Local MySQL authentication
            if (!user.password_hash) {
              return null;
            }

            const isValid = await compare(credentials.password, user.password_hash);

            if (!isValid) {
              return null;
            }
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.email) {
        try {
          await updateUserLastLogin(user.email);
        } catch (error) {
          console.error('Error updating last login:', error);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 