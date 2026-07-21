import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, toIsoString } from "@/lib/firebase-admin";

function latestDate(data: any) {
  return (
    toIsoString(data.watched_at) ||
    toIsoString(data.added_at) ||
    toIsoString(data.updated_at) ||
    toIsoString(data.created_at) ||
    ""
  );
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

    const [
      historySnapshot,
      watchlistSnapshot,
      ratingsSnapshot,
      favoriteActorsSnapshot,
    ] = await Promise.all([
      adminDb.collection("watch_history").where("userId", "==", user.id).get(),
      adminDb.collection("watchlists").where("userId", "==", user.id).get(),
      adminDb.collection("ratings").where("userId", "==", user.id).get(),
      adminDb.collection("favorite_actors").where("userId", "==", user.id).get(),
    ]);

    const recentActivity = [
      ...historySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "Watched",
          title: data.title || "Untitled",
          mediaType: data.media_type || "movie",
          date: latestDate(data),
        };
      }),
      ...watchlistSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "Saved",
          title: data.title || "Untitled",
          mediaType: data.media_type || "movie",
          date: latestDate(data),
        };
      }),
      ...favoriteActorsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "Favorite actor",
          title: data.name || "Unknown actor",
          mediaType: "actor",
          date: latestDate(data),
        };
      }),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    return NextResponse.json({
      watched: historySnapshot.size,
      watchlist: watchlistSnapshot.size,
      ratings: ratingsSnapshot.size,
      favoriteActors: favoriteActorsSnapshot.size,
      recentActivity,
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    return NextResponse.json(
      { message: "Failed to load profile stats" },
      { status: 500 }
    );
  }
}
