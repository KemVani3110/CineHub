import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

async function getAuthState(request: NextRequest) {
  if (isProduction) {
    // For production, check if there's a Firebase session
    // We'll look for Firebase auth cookies or custom auth headers
    const authHeader = request.headers.get('authorization');
    const firebaseSession = request.cookies.get('__session');
    
    if (authHeader?.startsWith('Bearer ') || firebaseSession) {
      // In production, we trust the client-side auth state
      // The actual verification happens in API routes
      return { authenticated: true, role: 'user' }; // Default role, will be verified in API
    }
    
    return { authenticated: false, role: null };
  } else {
    // For development, use NextAuth JWT
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    return {
      authenticated: !!token,
      role: token?.role || null
    };
  }
}

export async function middleware(request: NextRequest) {
  // Log the current path
  console.log('Middleware - Current path:', request.nextUrl.pathname);

  const authState = await getAuthState(request);

  // Log auth state for debugging
  console.log('Middleware - Auth state:', authState);

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  // Handle auth routes - redirect to home if already logged in
  if (authState.authenticated && isAuthRoute) {
    console.log('Middleware - User already logged in, redirecting to home');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!authState.authenticated) {
      console.log('Middleware - No authentication found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // For production, we'll do role verification in the admin pages themselves
    // since we can't easily verify Firebase tokens in middleware
    if (!isProduction && authState.role !== 'admin') {
      console.log('Middleware - User is not admin, redirecting to home');
      return NextResponse.redirect(new URL('/home', request.url));
    }

    console.log('Middleware - Access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register']
}; 