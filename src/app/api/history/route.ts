import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, numericIdFromUid, serverTimestamp, toIsoString } from "@/lib/firebase-admin";

function getMediaValue(mediaType: string, movieId?: number | null, tvId?: number | null) {
  return mediaType === "movie" ? movieId : tvId;
}

function historyDocId(userId: string, mediaType: string, mediaId: number) {
  return `${userId}_${mediaType}_${mediaId}`;
}

function serializeHistory(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot) {
  const data = doc.data() || {};
  return {
    id: data.numeric_id || numericIdFromUid(doc.id),
    user_id: data.userId,
    media_type: data.media_type,
    movie_id: data.movie_id || null,
    tv_id: data.tv_id || null,
    title: data.title || "",
    poster_path: data.poster_path || "",
    watched_at: toIsoString(data.watched_at),
    current_season: data.current_season || null,
    current_episode: data.current_episode || null,
    created_at: toIsoString(data.created_at),
    updated_at: toIsoString(data.updated_at),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("watch_history")
      .where("userId", "==", user.id)
      .get();

    const history = snapshot.docs
      .map(serializeHistory)
      .sort(
        (a, b) =>
          new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
      );

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return upsertHistory(request);
}

export async function PUT(request: NextRequest) {
  return upsertHistory(request);
}

async function upsertHistory(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const {
      mediaType,
      movieId,
      tvId,
      title,
      posterPath,
      currentSeason,
      currentEpisode,
    } = await request.json();
    const mediaId = Number(getMediaValue(mediaType, movieId, tvId));

    if (!["movie", "tv"].includes(mediaType) || !mediaId) {
      return NextResponse.json(
        { error: "Valid media type and media ID are required" },
        { status: 400 }
      );
    }

    const now = serverTimestamp();
    const ref = adminDb
      .collection("watch_history")
      .doc(historyDocId(user.id, mediaType, mediaId));

    await ref.set(
      {
        userId: user.id,
        numeric_id: numericIdFromUid(historyDocId(user.id, mediaType, mediaId)),
        media_key: `${mediaType}:${mediaId}`,
        media_type: mediaType,
        movie_id: mediaType === "movie" ? mediaId : null,
        tv_id: mediaType === "tv" ? mediaId : null,
        title: title || "",
        poster_path: posterPath || "",
        current_season:
          mediaType === "tv" && currentSeason ? Number(currentSeason) : null,
        current_episode:
          mediaType === "tv" && currentEpisode ? Number(currentEpisode) : null,
        watched_at: now,
        updated_at: now,
        created_at: now,
      },
      { merge: true }
    );

    const updated = await ref.get();
    return NextResponse.json(serializeHistory(updated));
  } catch (error) {
    console.error("Error updating history:", error);
    return NextResponse.json(
      { error: "Failed to update history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      const snapshot = await adminDb
        .collection("watch_history")
        .where("userId", "==", user.id)
        .get();

      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return NextResponse.json({ success: true });
    }

    const snapshot = await adminDb
      .collection("watch_history")
      .where("userId", "==", user.id)
      .where("numeric_id", "==", Number(id))
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "History record not found" }, { status: 404 });
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting history:", error);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
}
