import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, serverTimestamp, toIsoString } from "@/lib/firebase-admin";

type MediaType = "movie" | "tv";

function mediaIdFor(mediaType: MediaType, movieId?: number | null, tvId?: number | null) {
  return mediaType === "movie" ? movieId : tvId;
}

function watchlistDocId(userId: string, mediaType: MediaType, mediaId: number) {
  return `${userId}_${mediaType}_${mediaId}`;
}

function serializeWatchlistItem(data: any) {
  return {
    id: data.movie_id || data.tv_id,
    media_type: data.media_type,
    title: data.title || "",
    poster_path: data.poster_path || "",
    added_at: toIsoString(data.added_at),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const snapshot = await adminDb
      .collection("watchlists")
      .where("userId", "==", user.id)
      .get();

    const watchlist = snapshot.docs
      .map((doc) => serializeWatchlistItem(doc.data()))
      .sort(
        (a, b) =>
          new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      );

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const mediaType = body.media_type as MediaType;
    const movieId = body.movie_id ? Number(body.movie_id) : null;
    const tvId = body.tv_id ? Number(body.tv_id) : null;
    const mediaId = Number(mediaIdFor(mediaType, movieId, tvId));

    if (!["movie", "tv"].includes(mediaType) || !mediaId || !body.title) {
      return NextResponse.json(
        { message: "Valid media type, media ID, and title are required" },
        { status: 400 }
      );
    }

    const id = watchlistDocId(user.id, mediaType, mediaId);
    const ref = adminDb.collection("watchlists").doc(id);
    const existing = await ref.get();

    if (existing.exists) {
      return NextResponse.json(
        { message: "Item already in watchlist" },
        { status: 409 }
      );
    }

    const now = serverTimestamp();
    await ref.set({
      userId: user.id,
      media_key: `${mediaType}:${mediaId}`,
      movie_id: mediaType === "movie" ? mediaId : null,
      tv_id: mediaType === "tv" ? mediaId : null,
      media_type: mediaType,
      title: body.title,
      poster_path: body.poster_path || "",
      added_at: now,
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json(
      {
        message: "Successfully added to watchlist",
        id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
