import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  
  try {
    const [movies] = await db.query<RowDataPacket[]>(
      `SELECT 
        id,
        title,
        short_description as shortDescription,
        full_description as fullDescription,
        release_date as releaseDate,
        duration_minutes as durationMinutes,
        genres,
        status,
        poster_url as posterUrl,
        trailer_url as trailerUrl
      FROM local_movies 
      WHERE id = ?`,
      [id]
    );

    if (!movies.length) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    const movie = movies[0];
    try {
      let genres: string[] = [];
      const genresData = movie.genres;
      
      if (genresData) {
        if (typeof genresData === 'string') {
          // Split by comma and clean up each genre
          genres = genresData.split(',').map(g => g.trim());
        } else if (Array.isArray(genresData)) {
          genres = genresData;
        }
      }

      // Ensure genres is always an array
      if (!Array.isArray(genres)) {
        console.error('Invalid genres format for movie:', movie.id);
        genres = [];
      }
      
      return NextResponse.json({ ...movie, genres });
    } catch (error) {
      console.error('Error parsing genres for movie:', movie.id, error);
      return NextResponse.json({ ...movie, genres: [] });
    }
  } catch (error) {
    console.error('Error fetching internal movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internal movie' },
      { status: 500 }
    );
  }
} 