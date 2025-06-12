import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const [rows] = await db.query(
      `SELECT 
        CASE 
          WHEN movie_id IS NOT NULL THEN movie_id 
          ELSE tv_id 
        END as id,
        media_type as mediaType,
        title,
        poster_path as posterPath,
        added_at as addedAt
       FROM watchlist 
       WHERE user_id = ? 
       ORDER BY added_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { id, mediaType, title, posterPath } = body;

    const [result] = await db.query(
      `INSERT INTO watchlist (user_id, movie_id, tv_id, media_type, title, poster_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        session.user.id,
        mediaType === 'movie' ? id : null,
        mediaType === 'tv' ? id : null,
        mediaType,
        title,
        posterPath,
      ]
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 