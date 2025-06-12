import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
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
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 