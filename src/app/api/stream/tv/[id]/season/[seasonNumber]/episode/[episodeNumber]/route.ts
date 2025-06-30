import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mysql from "mysql2/promise";

// Create MySQL connection pool for local development
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
    tv: (id: string, season: string, episode: string) => 
      `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`,
  },
  vidsrc: {
    tv: (id: string, season: string, episode: string) => 
      `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`,
  },
  movies111: {
    tv: (id: string, season: string, episode: string) => 
      `https://111movies.com/tv/${id}/${season}/${episode}`,
  }
};

export async function GET(
  request: Request,
  context: { 
    params: Promise<{ 
      id: string; 
      seasonNumber: string; 
      episodeNumber: string; 
    }> 
  }
) {
  try {
    const { id, seasonNumber, episodeNumber } = await context.params;

    if (!id || !seasonNumber || !episodeNumber) {
      return NextResponse.json(
        { message: "ID, season number, and episode number are required" },
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
    const tvShowUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=${tmdbApiKey}`;
    const episodeUrl = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${tmdbApiKey}`;

    const [tvShowResponse, episodeResponse] = await Promise.all([
      fetch(tvShowUrl),
      fetch(episodeUrl)
    ]);

    if (!tvShowResponse.ok || !episodeResponse.ok) {
      throw new Error(`TMDB API error: ${tvShowResponse.statusText || episodeResponse.statusText}`);
    }

    const [tvShowData, episodeData] = await Promise.all([
      tvShowResponse.json(),
      episodeResponse.json()
    ]);

    // Add to watch history (only if user is logged in)
    if (session?.user?.id) {
      await pool.execute(
        `INSERT INTO watch_history 
          (user_id, media_type, tv_id, title, poster_path, watched_at, current_season, current_episode)
         VALUES (?, 'tv', ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
         ON DUPLICATE KEY UPDATE 
           watched_at = CURRENT_TIMESTAMP,
           title = VALUES(title),
           poster_path = VALUES(poster_path),
           current_season = VALUES(current_season),
           current_episode = VALUES(current_episode)`,
        [
          session.user.id,
          id,
          `${tvShowData.name} - S${seasonNumber}E${episodeNumber}`,
          tvShowData.poster_path,
          parseInt(seasonNumber),
          parseInt(episodeNumber)
        ]
      );
    }

    // Generate streaming URLs from multiple services
    const streamingSources = [];
    
    // Add AutoEmbed source
    streamingSources.push({
      name: 'AutoEmbed',
      url: STREAMING_SERVICES.autoembed.tv(id, seasonNumber, episodeNumber),
      quality: 'HD',
      type: 'iframe',
      embed: true
    });

    // Add VidSrc source
    streamingSources.push({
      name: 'VidSrc',
      url: STREAMING_SERVICES.vidsrc.tv(id, seasonNumber, episodeNumber),
      quality: 'HD',
      type: 'iframe',
      embed: true
    });

    // Add 111Movies source
    streamingSources.push({
      name: '111Movies',
      url: STREAMING_SERVICES.movies111.tv(id, seasonNumber, episodeNumber),
      quality: 'HD',
      type: 'iframe',
      embed: true
    });

    // Return multiple streaming sources with comprehensive episode info
    return NextResponse.json({
      success: true,
      sources: streamingSources,
      tvShowInfo: {
        id: tvShowData.id,
        name: tvShowData.name,
        overview: tvShowData.overview,
        poster_path: tvShowData.poster_path,
        backdrop_path: tvShowData.backdrop_path,
        first_air_date: tvShowData.first_air_date,
        vote_average: tvShowData.vote_average,
        genres: tvShowData.genres,
        number_of_seasons: tvShowData.number_of_seasons,
        number_of_episodes: tvShowData.number_of_episodes,
        episode_run_time: tvShowData.episode_run_time,
        networks: tvShowData.networks,
        created_by: tvShowData.created_by
      },
      episodeInfo: {
        id: episodeData.id,
        name: episodeData.name,
        overview: episodeData.overview,
        air_date: episodeData.air_date,
        episode_number: episodeData.episode_number,
        season_number: episodeData.season_number,
        still_path: episodeData.still_path,
        vote_average: episodeData.vote_average,
        runtime: episodeData.runtime,
        crew: episodeData.crew,
        guest_stars: episodeData.guest_stars
      },
      streamingInfo: {
        type: 'tv',
        id,
        season: seasonNumber,
        episode: episodeNumber,
        title: `${tvShowData.name} - S${seasonNumber}E${episodeNumber}: ${episodeData.name}`
      }
    });
  } catch (error) {
    console.error("TV Episode Stream API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 