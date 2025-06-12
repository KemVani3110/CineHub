import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.query(
      `SELECT * FROM watch_history 
       WHERE user_id = ? 
       ORDER BY watched_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mediaType, movieId, tvId, title, posterPath } = await request.json();

    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle duplicates
    const [result] = await pool.query(
      `INSERT INTO watch_history 
        (user_id, media_type, movie_id, tv_id, title, poster_path, watched_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE 
        watched_at = CURRENT_TIMESTAMP,
        title = VALUES(title),
        poster_path = VALUES(poster_path)`,
      [session.user.id, mediaType, movieId, tvId, title, posterPath]
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error adding to history:", error);
    return NextResponse.json(
      { error: "Failed to add to history" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mediaType, movieId, tvId, title, posterPath } = await request.json();

    // Update existing record
    const [result] = await pool.query(
      `UPDATE watch_history 
       SET watched_at = CURRENT_TIMESTAMP,
           title = ?,
           poster_path = ?
       WHERE user_id = ? AND media_type = ? AND movie_id = ? AND tv_id = ?`,
      [title, posterPath, session.user.id, mediaType, movieId, tvId]
    );

    if ((result as any).affectedRows === 0) {
      // If no record was updated, try inserting a new one
      const [insertResult] = await pool.query(
        `INSERT INTO watch_history 
          (user_id, media_type, movie_id, tv_id, title, poster_path, watched_at) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [session.user.id, mediaType, movieId, tvId, title, posterPath]
      );
      return NextResponse.json(insertResult);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating history:", error);
    return NextResponse.json(
      { error: "Failed to update history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Delete specific history item
      await pool.query(
        "DELETE FROM watch_history WHERE id = ? AND user_id = ?",
        [id, session.user.id]
      );
    } else {
      // Clear all history
      await pool.query(
        "DELETE FROM watch_history WHERE user_id = ?",
        [session.user.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting history:", error);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
} 