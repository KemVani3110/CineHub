import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, toIsoString } from "@/lib/firebase-admin";

function latestDate(data: any) {
  return (
    (data.watched_at ? toIsoString(data.watched_at) : "") ||
    (data.added_at ? toIsoString(data.added_at) : "") ||
    (data.updated_at ? toIsoString(data.updated_at) : "") ||
    (data.created_at ? toIsoString(data.created_at) : "") ||
    ""
  );
}

function countMediaType(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  return docs.reduce(
    (acc, doc) => {
      const data = doc.data();
      if (data.media_type === "tv") acc.tv += 1;
      else acc.movie += 1;
      return acc;
    },
    { movie: 0, tv: 0 }
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
      reviewsSnapshot,
      favoriteActorsSnapshot,
    ] = await Promise.all([
      adminDb.collection("watch_history").where("userId", "==", user.id).get(),
      adminDb.collection("watchlists").where("userId", "==", user.id).get(),
      adminDb.collection("ratings").where("userId", "==", user.id).get(),
      adminDb.collection("reviews").where("userId", "==", user.id).get(),
      adminDb.collection("favorite_actors").where("userId", "==", user.id).get(),
    ]);

    const ratingValues = ratingsSnapshot.docs
      .map((doc) => Number(doc.data().rating))
      .filter((rating) => Number.isFinite(rating));
    const averageRating = ratingValues.length
      ? Number((ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1))
      : 0;
    const historyMix = countMediaType(historySnapshot.docs);
    const watchlistMix = countMediaType(watchlistSnapshot.docs);
    const favoriteActorPreview = favoriteActorsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          actorId: Number(data.actor_id),
          name: data.name || "Unknown actor",
          profilePath: data.profile_path || "",
          addedAt: latestDate(data),
        };
      })
      .filter((actor) => actor.actorId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 4);

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
      ...ratingsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "Rated",
          title: data.title || `${data.media_type === "tv" ? "TV" : "Movie"} #${data.tv_id || data.movie_id || ""}`,
          mediaType: data.media_type || "movie",
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
      reviews: reviewsSnapshot.size,
      favoriteActors: favoriteActorsSnapshot.size,
      averageRating,
      mediaMix: {
        watchedMovies: historyMix.movie,
        watchedTV: historyMix.tv,
        watchlistMovies: watchlistMix.movie,
        watchlistTV: watchlistMix.tv,
      },
      favoriteActorPreview,
      activityScore: Math.min(
        100,
        historySnapshot.size * 8 +
          watchlistSnapshot.size * 5 +
          ratingsSnapshot.size * 7 +
          favoriteActorsSnapshot.size * 6 +
          reviewsSnapshot.size * 10
      ),
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
