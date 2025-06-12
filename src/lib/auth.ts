import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '@/lib/db';
import { compare } from 'bcrypt';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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

async function getUserByEmail(email: string) {
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

async function updateUserLastLogin(email: string) {
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
          // Check if this is a social login attempt
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

          if (!user || !user.password_hash || !user.is_active) {
            return null;
          }

          const isValid = await compare(credentials.password, user.password_hash);

          if (!isValid) {
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