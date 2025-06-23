import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getUserId, logActivity, isProduction, adminDb } from '@/lib/auth-helpers';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    if (isProduction && adminDb) {
      // Firestore implementation
      const watchlistSnapshot = await adminDb
        .collection('watchlists')
        .where('userId', '==', user.id)
        .orderBy('added_at', 'desc')
        .get();

      const watchlist = watchlistSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: data.movie_id || data.tv_id,
          media_type: data.media_type,
          title: data.title,
          poster_path: data.poster_path,
          added_at: data.added_at?.toDate()?.toISOString() || new Date().toISOString(),
        };
      });

      return NextResponse.json({ watchlist });
    } else {
      // MySQL implementation
      const userId = getUserId(user);
      
      const [rows] = await pool.query(
        `SELECT 
          CASE 
            WHEN movie_id IS NOT NULL THEN movie_id 
            ELSE tv_id 
          END as id,
          media_type,
          title,
          poster_path,
          added_at
         FROM watchlist 
         WHERE user_id = ? 
         ORDER BY added_at DESC`,
        [userId]
      );

      return NextResponse.json({ watchlist: rows });
    }
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { movie_id, tv_id, media_type, title, poster_path } = body;

    // Validate required fields
    if (!media_type || !title) {
      return NextResponse.json(
        { message: 'Media type and title are required' },
        { status: 400 }
      );
    }

    if (!['movie', 'tv'].includes(media_type)) {
      return NextResponse.json(
        { message: 'Invalid media type' },
        { status: 400 }
      );
    }

    if (media_type === 'movie' && !movie_id) {
      return NextResponse.json(
        { message: 'Movie ID is required for movie type' },
        { status: 400 }
      );
    }

    if (media_type === 'tv' && !tv_id) {
      return NextResponse.json(
        { message: 'TV ID is required for TV type' },
        { status: 400 }
      );
    }

    if (isProduction && adminDb) {
      // Firestore implementation
      const watchlistData = {
        userId: user.id,
        movie_id: movie_id || null,
        tv_id: tv_id || null,
        media_type,
        title,
        poster_path: poster_path || '',
        added_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Check if item already exists
      const existingSnapshot = await adminDb
        .collection('watchlists')
        .where('userId', '==', user.id)
        .where('media_type', '==', media_type)
        .where(media_type === 'movie' ? 'movie_id' : 'tv_id', '==', media_type === 'movie' ? movie_id : tv_id)
        .get();

      if (!existingSnapshot.empty) {
        return NextResponse.json(
          { message: 'Item already in watchlist' },
          { status: 409 }
        );
      }

      const docRef = await adminDb.collection('watchlists').add(watchlistData);

      // Log activity
      await logActivity(
        user.id,
        'added_to_watchlist',
        { media_type },
        media_type as 'movie' | 'tv',
        media_type === 'movie' ? movie_id : tv_id,
        `Added ${title} to watchlist`
      );

      return NextResponse.json(
        { 
          message: 'Successfully added to watchlist',
          id: docRef.id 
        },
        { status: 201 }
      );
    } else {
      // MySQL implementation
      const userId = getUserId(user);

      // Check if item already exists
      const [existing] = await pool.query(
        `SELECT id FROM watchlist 
         WHERE user_id = ? 
         AND media_type = ? 
         AND ${media_type === 'movie' ? 'movie_id' : 'tv_id'} = ?`,
        [userId, media_type, media_type === 'movie' ? movie_id : tv_id]
      );

      if ((existing as any[]).length > 0) {
        return NextResponse.json(
          { message: 'Item already in watchlist' },
          { status: 409 }
        );
      }

      const [result] = await pool.query(
        `INSERT INTO watchlist (user_id, movie_id, tv_id, media_type, title, poster_path)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          movie_id,
          tv_id,
          media_type,
          title,
          poster_path,
        ]
      );

      // Log activity
      await logActivity(
        user.id,
        'added_to_watchlist',
        { media_type },
        media_type as 'movie' | 'tv',
        media_type === 'movie' ? movie_id : tv_id,
        `Added ${title} to watchlist`
      );

      return NextResponse.json(
        { 
          message: 'Successfully added to watchlist',
          id: (result as any).insertId 
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 