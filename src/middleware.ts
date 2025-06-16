import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Log the current path
  console.log('Middleware - Current path:', request.nextUrl.pathname);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Log token for debugging
  console.log('Middleware - Token:', token);

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  // Handle auth routes - redirect to home if already logged in
  if (token && isAuthRoute) {
    console.log('Middleware - User already logged in, redirecting to home');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!token) {
      console.log('Middleware - No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token.role !== 'admin') {
      console.log('Middleware - User is not admin, redirecting to home');
      return NextResponse.redirect(new URL('/home', request.url));
    }

    console.log('Middleware - Admin access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register']
}; 