import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, numericIdFromUid, serverTimestamp } from "@/lib/firebase-admin";

const STREAMING_SERVICES = {
  movies111: {
    tv: (id: string, season: string, episode: string) => 
      `https://111movies.net/tv/${id}/${season}/${episode}`,
  },
  videasy: {
    tv: (id: string, season: string, episode: string) =>
      `https://player.videasy.net/tv/${id}/${season}/${episode}`,
  },
  multiembed: {
    tv: (id: string, season: string, episode: string) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  embed2: {
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

export async function GET(
  request: NextRequest,
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

    const uid = await getOptionalFirebaseUid(request);
    if (uid) {
      const mediaId = Number(id);
      const docId = `${uid}_tv_${mediaId}`;
      const now = serverTimestamp();

      await adminDb.collection("watch_history").doc(docId).set(
        {
          userId: uid,
          numeric_id: numericIdFromUid(docId),
          media_key: `tv:${mediaId}`,
          media_type: "tv",
          movie_id: null,
          tv_id: mediaId,
          title: `${tvShowData.name} - S${seasonNumber}E${episodeNumber}`,
          poster_path: tvShowData.poster_path || "",
          watched_at: now,
          current_season: Number(seasonNumber),
          current_episode: Number(episodeNumber),
          updated_at: now,
          created_at: now,
        },
        { merge: true }
      );
    }

    // Generate streaming URLs from multiple services
    const streamingSources = [];
    
    // Add 111Movies source first because it is the most stable in this app.
    streamingSources.push({
      name: '111Movies',
      url: STREAMING_SERVICES.movies111.tv(id, seasonNumber, episodeNumber),
      quality: 'HD',
      type: 'iframe',
      embed: true
    });

    // Add VidEasy source
    streamingSources.push({
      name: 'VidEasy',
      url: STREAMING_SERVICES.videasy.tv(id, seasonNumber, episodeNumber),
      quality: 'HD',
      type: 'iframe',
      embed: true
    });

    // Add MultiEmbed source
    streamingSources.push({
      name: 'MultiEmbed',
      url: STREAMING_SERVICES.multiembed.tv(id, seasonNumber, episodeNumber),
      quality: 'HD',
      type: 'iframe',
      embed: true
    });

    // Add 2Embed fallback
    streamingSources.push({
      name: '2Embed',
      url: STREAMING_SERVICES.embed2.tv(id, seasonNumber, episodeNumber),
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
