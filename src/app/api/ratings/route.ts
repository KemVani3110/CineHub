import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const tvId = searchParams.get('tvId');
    const mediaType = searchParams.get('mediaType') || 'movie';

    if (!movieId && !tvId) {
      return NextResponse.json({ error: 'Movie ID or TV ID is required' }, { status: 400 });
    }

    const [rating] = await db.query(
      `SELECT r.*, c.content as review, c.id as review_id 
       FROM ratings r 
       LEFT JOIN comments c ON r.user_id = c.user_id 
       AND r.movie_id = c.movie_id 
       AND r.tv_id = c.tv_id 
       AND r.media_type = c.media_type 
       WHERE r.user_id = ? AND r.media_type = ? 
       AND r.${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ?`,
      [session.user.id, mediaType, mediaType === 'movie' ? movieId : tvId]
    );

    return NextResponse.json(rating[0] || null);
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, tvId, mediaType, rating, review } = body;

    if (!movieId && !tvId) {
      return NextResponse.json({ error: 'Movie ID or TV ID is required' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating value' }, { status: 400 });
    }

    await db.query(
      `INSERT INTO ratings (user_id, movie_id, tv_id, media_type, rating) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?`,
      [session.user.id, movieId, tvId, mediaType, rating, rating]
    );

    if (review) {
      await db.query(
        `INSERT INTO comments (user_id, movie_id, tv_id, media_type, content, rating) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE content = ?, rating = ?`,
        [session.user.id, movieId, tvId, mediaType, review, rating, review, rating]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const tvId = searchParams.get('tvId');
    const mediaType = searchParams.get('mediaType') || 'movie';

    if (!movieId && !tvId) {
      return NextResponse.json({ error: 'Movie ID or TV ID is required' }, { status: 400 });
    }

    await db.query(
      `DELETE FROM ratings 
       WHERE user_id = ? AND media_type = ? 
       AND ${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ?`,
      [session.user.id, mediaType, mediaType === 'movie' ? movieId : tvId]
    );

    await db.query(
      `DELETE FROM comments 
       WHERE user_id = ? AND media_type = ? 
       AND ${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ?`,
      [session.user.id, mediaType, mediaType === 'movie' ? movieId : tvId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 