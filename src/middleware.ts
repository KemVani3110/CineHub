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
  const authState = await getAuthState(request);

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // Handle admin routes
  if (isAdminRoute) {
    if (!authState.authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
}; 
