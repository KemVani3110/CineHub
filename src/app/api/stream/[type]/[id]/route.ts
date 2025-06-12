import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mysql from "mysql2/promise";

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(
  request: NextRequest,
  context: { params: { type: string; id: string } }
) {
  console.log("Stream API called with params:", context.params);
  
  try {
    // Get session first
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    // Check authentication
    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // Get params from context
    const { type, id } = context.params;
    console.log("Processing request for:", { type, id });

    // Validate media type
    if (!["movie", "tv"].includes(type)) {
      console.log("Invalid media type:", type);
      return NextResponse.json(
        { error: "Invalid media type" },
        { status: 400 }
      );
    }

    // Check TMDB API key
    const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.error("TMDB API key is not configured");
      return NextResponse.json(
        { error: "TMDB API key is not configured" },
        { status: 500 }
      );
    }

    // Get media details from TMDB
    const tmdbUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${tmdbApiKey}`;
    console.log("Fetching from TMDB:", tmdbUrl);
    
    const tmdbResponse = await fetch(tmdbUrl);
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.statusText}`);
    }

    const mediaData = await tmdbResponse.json();

    // Add to watch history
    await pool.execute(
      `INSERT INTO watch_history 
        (user_id, media_type, movie_id, tv_id, title, poster_path, watched_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
         watched_at = CURRENT_TIMESTAMP,
         title = VALUES(title),
         poster_path = VALUES(poster_path)`,
      [
        session.user.id,
        type,
        type === 'movie' ? id : null,
        type === 'tv' ? id : null,
        mediaData.title || mediaData.name,
        mediaData.poster_path
      ]
    );

    // Return video sources (placeholder)
    return NextResponse.json({
      sources: [
        {
          url: `https://example.com/stream/${type}/${id}/source1`,
          quality: "1080p",
          type: "video/mp4",
        },
        {
          url: `https://example.com/stream/${type}/${id}/source2`,
          quality: "720p",
          type: "video/mp4",
        },
      ],
      mediaInfo: mediaData,
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 