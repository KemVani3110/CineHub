import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Log the current path
  ('Middleware - Current path:', request.nextUrl.pathname);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Log token for debugging
  ('Middleware - Token:', token);

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  // Handle auth routes - redirect to home if already logged in
  if (token && isAuthRoute) {
    ('Middleware - User already logged in, redirecting to home');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!token) {
      ('Middleware - No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token.role !== 'admin') {
      ('Middleware - User is not admin, redirecting to home');
      return NextResponse.redirect(new URL('/home', request.url));
    }

    ('Middleware - Admin access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register']
}; 