import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch avatars from the database
    const [rows] = await pool.execute(
      'SELECT id, path, name FROM avatars WHERE is_active = true'
    );

    return NextResponse.json({
      avatars: rows,
    });
  } catch (error) {
    console.error('Get avatars error:', error);
    return NextResponse.json(
      { message: 'Failed to get avatars' },
      { status: 500 }
    );
  }
} 