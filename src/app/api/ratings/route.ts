import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

interface RatingWithReview extends RowDataPacket {
  id: number;
  user_id: number;
  movie_id: number | null;
  tv_id: number | null;
  media_type: 'movie' | 'tv';
  rating: number;
  created_at: Date;
  updated_at: Date;
  review: string | null;
  review_id: number | null;
}

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

    const [rows] = await db.query<RatingWithReview[]>(
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

    return NextResponse.json(rows[0] || null);
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
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

    // Insert or update rating
    const [result] = await db.query<OkPacket>(
      `INSERT INTO ratings (user_id, movie_id, tv_id, media_type, rating) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?`,
      [session.user.id, movieId || null, tvId || null, mediaType, rating, rating]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
    }

    // Handle review if provided
    if (review) {
      await db.query<OkPacket>(
        `INSERT INTO comments (user_id, movie_id, tv_id, media_type, content, rating) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE content = ?, rating = ?`,
        [session.user.id, movieId || null, tvId || null, mediaType, review, rating, review, rating]
      );
    }

    // Get the complete rating data with review
    const [rows] = await db.query<RatingWithReview[]>(
      `SELECT r.*, c.content as review, c.id as review_id 
       FROM ratings r 
       LEFT JOIN comments c ON r.user_id = c.user_id 
       AND r.movie_id = c.movie_id 
       AND r.tv_id = c.tv_id 
       AND r.media_type = c.media_type 
       WHERE r.user_id = ? 
       AND r.media_type = ? 
       AND r.${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ? 
       ORDER BY r.updated_at DESC 
       LIMIT 1`,
      [session.user.id, mediaType, mediaType === 'movie' ? movieId : tvId]
    );

    const ratingData = rows[0];
    if (!ratingData) {
      console.error('No rating data found after insertion:', {
        userId: session.user.id,
        mediaType,
        movieId,
        tvId,
      });
      return NextResponse.json({ error: 'Failed to retrieve rating data' }, { status: 500 });
    }

    return NextResponse.json(ratingData);
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
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

    const [result] = await db.query<OkPacket>(
      `DELETE FROM ratings 
       WHERE user_id = ? AND media_type = ? 
       AND ${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ?`,
      [session.user.id, mediaType, mediaType === 'movie' ? movieId : tvId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'No rating found to delete' }, { status: 404 });
    }

    await db.query<OkPacket>(
      `DELETE FROM comments 
       WHERE user_id = ? AND media_type = ? 
       AND ${mediaType === 'movie' ? 'movie_id' : 'tv_id'} = ?`,
      [session.user.id, mediaType, mediaType === 'movie' ? movieId : tvId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 