import { NextRequest, NextResponse } from "next/server";
import { adminDb, toIsoString } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");
    const tvId = searchParams.get("tvId");
    const mediaType = searchParams.get("mediaType") || "movie";
    const mediaId = Number(mediaType === "movie" ? movieId : tvId);

    if (!["movie", "tv"].includes(mediaType) || !mediaId) {
      return NextResponse.json(
        { error: "Movie ID or TV ID is required" },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection("reviews")
      .where("media_key", "==", `${mediaType}:${mediaId}`)
      .get();

    const reviews = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: String(data.numeric_id || doc.id),
          userId: String(data.numeric_user_id || data.userId || ""),
          movieId: data.movie_id || undefined,
          tvId: data.tv_id || undefined,
          mediaType: data.media_type,
          content: data.content || "",
          rating: data.rating || 0,
          isEdited: Boolean(data.is_edited),
          createdAt: toIsoString(data.created_at),
          updatedAt: toIsoString(data.updated_at),
          user: {
            name: data.user_name || "Anonymous",
            image: data.user_image || "",
          },
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
