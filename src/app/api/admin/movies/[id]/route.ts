import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin or moderator
    if (!session.user.role || !["admin", "moderator"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { message: "Movie ID is required" },
        { status: 400 }
      );
    }

    const [movies] = await db.query<RowDataPacket[]>(
      'SELECT * FROM local_movies WHERE id = ?',
      [id]
    );

    if (!movies.length) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const movie = movies[0];
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

      return NextResponse.json({ ...movie, genres });
    } catch (error) {
      console.error('Error parsing genres for movie:', movie.id, error);
      return NextResponse.json({ ...movie, genres: [] });
    }
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin or moderator
    if (!session.user.role || !["admin", "moderator"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { message: "Movie ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = movieSchema.parse(body);

    const [result] = await db.query<ResultSetHeader>(
      `UPDATE local_movies SET
        title = ?, short_description = ?, full_description = ?,
        release_date = ?, duration_minutes = ?, genres = ?,
        status = ?, poster_url = ?, trailer_url = ?
      WHERE id = ?`,
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
        id
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // Log admin activity
    await db.query<ResultSetHeader>(
      `INSERT INTO admin_activity_logs (
        admin_id, action, target_user_id, description, metadata
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        session.user.id,
        'update',
        null,
        `Updated movie: ${validatedData.title}`,
        JSON.stringify({ title: validatedData.title })
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating movie:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid movie data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin or moderator
    if (!session.user.role || !["admin", "moderator"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { message: "Movie ID is required" },
        { status: 400 }
      );
    }

    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM local_movies WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // Log admin activity
    await db.query<ResultSetHeader>(
      `INSERT INTO admin_activity_logs (
        admin_id, action, target_user_id, description, metadata
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        session.user.id,
        'delete',
        null,
        `Deleted movie with ID: ${id}`,
        JSON.stringify({ action: 'deleted' })
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
} 