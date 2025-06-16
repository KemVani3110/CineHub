import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const tvId = searchParams.get('tvId');
    const mediaType = searchParams.get('mediaType') || 'movie';

    if (!movieId && !tvId) {
      return NextResponse.json({ error: 'Movie ID or TV ID is required' }, { status: 400 });
    }

    const [reviews] = await db.query(
      `SELECT 
        c.*, 
        u.name, 
        u.avatar as image,
        DATE_FORMAT(c.created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
        DATE_FORMAT(c.updated_at, '%Y-%m-%dT%H:%i:%s.000Z') as updated_at
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.media_type = ? 
       AND c.${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ? 
       ORDER BY c.created_at DESC`,
      [mediaType, mediaType === 'movie' ? movieId : tvId]
    );

    console.log('Fetched reviews:', reviews); // Debug log

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 