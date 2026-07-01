import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function getAuthState(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const firebaseSession = request.cookies.get('__session');

  if (authHeader?.startsWith('Bearer ') || firebaseSession) {
    return { authenticated: true, role: 'user' };
  }

  return { authenticated: false, role: null };
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

    console.log('Middleware - Access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register']
}; 
