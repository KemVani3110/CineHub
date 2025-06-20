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
        c.id,
        c.user_id,
        c.movie_id,
        c.tv_id,
        c.media_type,
        c.content,
        c.rating,
        c.is_edited,
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

    // Transform the data to match the expected format
    const transformedReviews = Array.isArray(reviews) ? reviews.map((review: any) => ({
      id: review.id.toString(),
      userId: review.user_id.toString(),
      movieId: review.movie_id || undefined,
      tvId: review.tv_id || undefined,
      mediaType: review.media_type,
      content: review.content,
      rating: review.rating,
      isEdited: review.is_edited === 1,
      createdAt: new Date(review.created_at),
      updatedAt: new Date(review.updated_at),
      user: {
        name: review.name || 'Anonymous',
        image: review.image || ''
      }
    })) : [];

    return NextResponse.json({ reviews: transformedReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 