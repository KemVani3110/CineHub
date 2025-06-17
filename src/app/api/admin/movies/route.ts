import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { LocalMoviesTable } from '@/types/database';

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  short_description: z.string().min(1, 'Short description is required'),
  full_description: z.string().min(1, 'Full description is required'),
  release_date: z.string().min(1, 'Release date is required'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  status: z.enum(['coming_soon', 'now_showing', 'stopped']),
  poster_url: z.string().min(1, 'Poster URL is required'),
  trailer_url: z.string().min(1, 'Trailer URL is required'),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [movies] = await db.query<RowDataPacket[]>(
      'SELECT * FROM local_movies ORDER BY created_at DESC'
    );

    console.log('Fetched movies:', movies.length);

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
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = movieSchema.parse(body);

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO local_movies (
        title, short_description, full_description, release_date,
        duration_minutes, genres, status, poster_url, trailer_url, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.title,
        validatedData.short_description,
        validatedData.full_description,
        validatedData.release_date,
        validatedData.duration_minutes,
        JSON.stringify(validatedData.genres),
        validatedData.status,
        validatedData.poster_url,
        validatedData.trailer_url,
        session.user.id
      ]
    );

    console.log('Created movie:', result.insertId);

    // Log admin activity
    await db.query<ResultSetHeader>(
      `INSERT INTO admin_activity_logs (
        admin_id, action, target_user_id, description, metadata
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        session.user.id,
        'create',
        null,
        `Created new movie: ${validatedData.title}`,
        JSON.stringify({ title: validatedData.title })
      ]
    );

    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    console.error('Error creating movie:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid movie data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    );
  }
} 