import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
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
      ORDER BY release_date DESC`
    );

    const parsedMovies = movies.map(movie => {
      try {
        let genres: string[] = [];
        const genresData = movie.genres;
        
        if (genresData) {
          if (typeof genresData === 'string') {
            try {
              // Try parsing as JSON first
              genres = JSON.parse(genresData);
            } catch {
              // If not JSON, treat as comma-separated string
              genres = genresData.split(',').map(g => g.trim());
            }
          } else if (Array.isArray(genresData)) {
            genres = genresData;
          }
        }

        if (!Array.isArray(genres)) {
          console.error('Invalid genres format for movie:', movie.id);
          genres = [];
        }
        
        return { ...movie, genres };
      } catch (error) {
        console.error('Error parsing genres for movie:', movie.id, error);
        return { ...movie, genres: [] };
      }
    });

    return NextResponse.json(parsedMovies);
  } catch (error) {
    console.error('Error fetching internal movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internal movies' },
      { status: 500 }
    );
  }
} 