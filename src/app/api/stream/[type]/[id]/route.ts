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

// Free streaming services configuration
const STREAMING_SERVICES = {
  autoembed: {
    movie: (id: string) => `https://autoembed.co/movie/tmdb/${id}`,
    tv: (id: string, season: string, episode: string) => 
      `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`,
  },
  vidsrc: {
    movie: (id: string) => `https://vidsrc.net/embed/movie/${id}`,
    tv: (id: string, season: string, episode: string) => 
      `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`,
  },
  movies111: {
    movie: (id: string) => `https://111movies.com/movie/${id}`,
    tv: (id: string, season: string, episode: string) => 
      `https://111movies.com/tv/${id}/${season}/${episode}`,
  }
};

export async function GET(
  request: Request,
  context: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await context.params;
    const url = new URL(request.url);
    const season = url.searchParams.get('season') || '1';
    const episode = url.searchParams.get('episode') || '1';
    const service = url.searchParams.get('service') || 'autoembed';

    if (!type || !id || typeof type !== 'string' || typeof id !== 'string') {
      return NextResponse.json(
        { message: "Type and ID are required" },
        { status: 400 }
      );
    }

    // Get session (optional for streaming)
    const session = await getServerSession(authOptions);

    // Validate media type
    if (!["movie", "tv"].includes(type)) {
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
 
    const tmdbResponse = await fetch(tmdbUrl);
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.statusText}`);
    }

    const mediaData = await tmdbResponse.json();

    // Add to watch history (only if user is logged in)
    if (session?.user?.id) {
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
    }

    // Generate streaming URLs from multiple services
    const streamingSources = [];
    
    // Add AutoEmbed source
    if (type === 'movie') {
      streamingSources.push({
        name: 'AutoEmbed',
        url: STREAMING_SERVICES.autoembed.movie(id),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    } else {
      streamingSources.push({
        name: 'AutoEmbed',
        url: STREAMING_SERVICES.autoembed.tv(id, season, episode),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    }

    // Add VidSrc source
    if (type === 'movie') {
      streamingSources.push({
        name: 'VidSrc',
        url: STREAMING_SERVICES.vidsrc.movie(id),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    } else {
      streamingSources.push({
        name: 'VidSrc',
        url: STREAMING_SERVICES.vidsrc.tv(id, season, episode),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    }

    // Add 111Movies source
    if (type === 'movie') {
      streamingSources.push({
        name: '111Movies',
        url: STREAMING_SERVICES.movies111.movie(id),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    } else {
      streamingSources.push({
        name: '111Movies',
        url: STREAMING_SERVICES.movies111.tv(id, season, episode),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    }

    // Return multiple streaming sources
    return NextResponse.json({
      success: true,
      sources: streamingSources,
      mediaInfo: {
        id: mediaData.id,
        title: mediaData.title || mediaData.name,
        overview: mediaData.overview,
        poster_path: mediaData.poster_path,
        backdrop_path: mediaData.backdrop_path,
        release_date: mediaData.release_date || mediaData.first_air_date,
        vote_average: mediaData.vote_average,
        genres: mediaData.genres,
        runtime: mediaData.runtime || mediaData.episode_run_time?.[0],
        ...(type === 'tv' && {
          season_number: parseInt(season),
          episode_number: parseInt(episode),
          number_of_seasons: mediaData.number_of_seasons,
          number_of_episodes: mediaData.number_of_episodes
        })
      },
      streamingInfo: {
        type,
        id,
        ...(type === 'tv' && { season, episode })
      }
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 