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
  request: Request,
  context: { params: Promise<{ id: string; seasonNumber: string; episodeNumber: string }> }
) {
  try {
    const { id, seasonNumber, episodeNumber } = await context.params;
    
    if (!id || !seasonNumber || !episodeNumber || 
        typeof id !== 'string' || 
        typeof seasonNumber !== 'string' || 
        typeof episodeNumber !== 'string') {
      return NextResponse.json(
        { message: "TV show ID, season number, and episode number are required" },
        { status: 400 }
      );
    }

    // Get session (optional for streaming)
    const session = await getServerSession(authOptions);

    // Check TMDB API key
    const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.error("TMDB API key is not configured");
      return NextResponse.json(
        { error: "TMDB API key is not configured" },
        { status: 500 }
      );
    }

    // Get TV show details from TMDB
    const tmdbUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=${tmdbApiKey}`;
    const tmdbResponse = await fetch(tmdbUrl);
    
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.statusText}`);
    }

    const showData = await tmdbResponse.json();

    // Get season details from TMDB to get episode info
    const seasonUrl = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${tmdbApiKey}`;
    const seasonResponse = await fetch(seasonUrl);
    
    if (!seasonResponse.ok) {
      throw new Error(`TMDB Season API error: ${seasonResponse.statusText}`);
    }

    const seasonData = await seasonResponse.json();
    
    // Find the specific episode
    const episode = seasonData.episodes.find((ep: any) => ep.episode_number === Number(episodeNumber));
    
    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Add to watch history (only if user is logged in)
    if (session?.user?.id) {
      await pool.execute(
        `INSERT INTO watch_history 
          (user_id, media_type, tv_id, title, poster_path, watched_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE 
           watched_at = CURRENT_TIMESTAMP,
           title = VALUES(title),
           poster_path = VALUES(poster_path)`,
        [
          session.user.id,
          'tv',
          id,
          `${showData.name} - S${seasonNumber}E${episodeNumber}: ${episode.name}`,
          episode.still_path || showData.poster_path
        ]
      );
    }

    // Return video sources (placeholder - you would integrate with actual streaming service)
    return NextResponse.json({
      sources: [
        {
          url: `https://example.com/stream/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}/source1`,
          quality: "1080p",
          type: "video/mp4",
        },
        {
          url: `https://example.com/stream/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}/source2`,
          quality: "720p",
          type: "video/mp4",
        },
      ],
      mediaInfo: {
        show: showData,
        season: seasonData,
        episode: episode,
        streamInfo: {
          showId: id,
          seasonNumber: Number(seasonNumber),
          episodeNumber: Number(episodeNumber),
          title: `${showData.name} - S${seasonNumber}E${episodeNumber}: ${episode.name}`
        }
      },
    });
  } catch (error) {
    console.error("TV Episode Stream API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 