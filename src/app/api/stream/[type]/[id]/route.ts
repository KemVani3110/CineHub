import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, numericIdFromUid, serverTimestamp } from "@/lib/firebase-admin";

const STREAMING_SERVICES = {
  movies111: {
    movie: (id: string) => `https://111movies.net/movie/${id}`,
    tv: (id: string, season: string, episode: string) => 
      `https://111movies.net/tv/${id}/${season}/${episode}`,
  },
  videasy: {
    movie: (id: string) => `https://player.videasy.net/movie/${id}`,
    tv: (id: string, season: string, episode: string) =>
      `https://player.videasy.net/tv/${id}/${season}/${episode}`,
  },
  multiembed: {
    movie: (id: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: string, season: string, episode: string) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  embed2: {
    movie: (id: string) => `https://www.2embed.cc/embed/${id}`,
    tv: (id: string, season: string, episode: string) =>
      `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  },
};

async function getOptionalFirebaseUid(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("__session")?.value;

  try {
    if (authHeader?.startsWith("Bearer ")) {
      const decoded = await adminAuth.verifyIdToken(authHeader.split(" ")[1]);
      return decoded.uid;
    }

    if (sessionCookie) {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      return decoded.uid;
    }
  } catch {
    return null;
  }

  return null;
}

async function upsertWatchHistory(
  userId: string,
  type: "movie" | "tv",
  id: string,
  title: string,
  posterPath: string | null
) {
  const mediaId = Number(id);
  const docId = `${userId}_${type}_${mediaId}`;
  const now = serverTimestamp();

  await adminDb.collection("watch_history").doc(docId).set(
    {
      userId,
      numeric_id: numericIdFromUid(docId),
      media_key: `${type}:${mediaId}`,
      media_type: type,
      movie_id: type === "movie" ? mediaId : null,
      tv_id: type === "tv" ? mediaId : null,
      title,
      poster_path: posterPath || "",
      watched_at: now,
      updated_at: now,
      created_at: now,
    },
    { merge: true }
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await context.params;
    const url = new URL(request.url);
    const season = url.searchParams.get('season') || '1';
    const episode = url.searchParams.get('episode') || '1';
    if (!type || !id || typeof type !== 'string' || typeof id !== 'string') {
      return NextResponse.json(
        { message: "Type and ID are required" },
        { status: 400 }
      );
    }

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

    const uid = await getOptionalFirebaseUid(request);
    if (uid) {
      await upsertWatchHistory(
        uid,
        type as "movie" | "tv",
        id,
        mediaData.title || mediaData.name,
        mediaData.poster_path
      );
    }

    // Generate streaming URLs from multiple services
    const streamingSources = [];
    
    // Add 111Movies source first because it is the most stable in this app.
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

    // Add VidEasy source
    if (type === 'movie') {
      streamingSources.push({
        name: 'VidEasy',
        url: STREAMING_SERVICES.videasy.movie(id),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    } else {
      streamingSources.push({
        name: 'VidEasy',
        url: STREAMING_SERVICES.videasy.tv(id, season, episode),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    }

    // Add MultiEmbed source
    if (type === 'movie') {
      streamingSources.push({
        name: 'MultiEmbed',
        url: STREAMING_SERVICES.multiembed.movie(id),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    } else {
      streamingSources.push({
        name: 'MultiEmbed',
        url: STREAMING_SERVICES.multiembed.tv(id, season, episode),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    }

    // Add 2Embed fallback
    if (type === 'movie') {
      streamingSources.push({
        name: '2Embed',
        url: STREAMING_SERVICES.embed2.movie(id),
        quality: 'HD',
        type: 'iframe',
        embed: true
      });
    } else {
      streamingSources.push({
        name: '2Embed',
        url: STREAMING_SERVICES.embed2.tv(id, season, episode),
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
