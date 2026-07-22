import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, toIsoString } from "@/lib/firebase-admin";

function latestDate(data: any) {
  return (
    toIsoString(data.updated_at) ||
    toIsoString(data.created_at) ||
    toIsoString(data.added_at) ||
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

    const [ratingsSnapshot, favoriteActorsSnapshot] = await Promise.all([
      adminDb.collection("ratings").where("userId", "==", user.id).get(),
      adminDb.collection("favorite_actors").where("userId", "==", user.id).get(),
    ]);

    const ratings = ratingsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          mediaType: data.media_type === "tv" ? "tv" : "movie",
          mediaId: Number(data.media_type === "tv" ? data.tv_id : data.movie_id),
          rating: Number(data.rating || 0),
          updatedAt: latestDate(data),
        };
      })
      .filter((item) => item.mediaId && item.rating >= 4)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 6);

    const favoriteActors = favoriteActorsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          actorId: Number(data.actor_id),
          name: data.name || "Favorite actor",
          profilePath: data.profile_path || "",
          addedAt: latestDate(data),
        };
      })
      .filter((item) => item.actorId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 6);

    return NextResponse.json({
      ratings,
      favoriteActors,
      summary: {
        highRatings: ratings.length,
        favoriteActors: favoriteActors.length,
      },
    });
  } catch (error) {
    console.error("Recommendation signals error:", error);
    return NextResponse.json(
      { message: "Failed to load recommendation signals" },
      { status: 500 }
    );
  }
}
