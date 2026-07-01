import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, numericIdFromUid, serverTimestamp, toIsoString } from "@/lib/firebase-admin";

type MediaType = "movie" | "tv";

function getMediaParams(searchParams: URLSearchParams) {
  const mediaType = (searchParams.get("mediaType") || "movie") as MediaType;
  const movieId = searchParams.get("movieId");
  const tvId = searchParams.get("tvId");
  const mediaId = Number(mediaType === "movie" ? movieId : tvId);

  return { mediaType, mediaId };
}

function docId(userId: string, mediaType: MediaType, mediaId: number) {
  return `${userId}_${mediaType}_${mediaId}`;
}

function serializeRating(id: string, data: any, reviewData?: any) {
  return {
    id: data.numeric_id || numericIdFromUid(id),
    user_id: data.numeric_user_id || numericIdFromUid(data.userId || ""),
    movie_id: data.movie_id || null,
    tv_id: data.tv_id || null,
    media_type: data.media_type,
    rating: data.rating,
    created_at: toIsoString(data.created_at),
    updated_at: toIsoString(data.updated_at),
    review: reviewData?.content || null,
    review_id: reviewData?.numeric_id || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { mediaType, mediaId } = getMediaParams(searchParams);

    if (!["movie", "tv"].includes(mediaType) || !mediaId) {
      return NextResponse.json(
        { error: "Movie ID or TV ID is required" },
        { status: 400 }
      );
    }

    const id = docId(user.id, mediaType, mediaId);
    const [ratingDoc, reviewDoc] = await Promise.all([
      adminDb.collection("ratings").doc(id).get(),
      adminDb.collection("reviews").doc(id).get(),
    ]);

    if (!ratingDoc.exists) {
      return NextResponse.json(null);
    }

    return NextResponse.json(
      serializeRating(id, ratingDoc.data(), reviewDoc.exists ? reviewDoc.data() : undefined)
    );
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const mediaType = (body.mediaType || "movie") as MediaType;
    const mediaId = Number(mediaType === "movie" ? body.movieId : body.tvId);
    const rating = Number(body.rating);

    if (!["movie", "tv"].includes(mediaType) || !mediaId) {
      return NextResponse.json(
        { error: "Movie ID or TV ID is required" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating value" }, { status: 400 });
    }

    const id = docId(user.id, mediaType, mediaId);
    const now = serverTimestamp();
    const ratingRef = adminDb.collection("ratings").doc(id);
    const existingRating = await ratingRef.get();

    const ratingData = {
      userId: user.id,
      numeric_user_id: numericIdFromUid(user.id),
      numeric_id: numericIdFromUid(id),
      media_key: `${mediaType}:${mediaId}`,
      movie_id: mediaType === "movie" ? mediaId : null,
      tv_id: mediaType === "tv" ? mediaId : null,
      media_type: mediaType,
      rating,
      created_at: existingRating.exists ? existingRating.data()?.created_at : now,
      updated_at: now,
    };

    await ratingRef.set(ratingData, { merge: true });

    let reviewData: any;
    if (typeof body.review === "string" && body.review.trim()) {
      const reviewRef = adminDb.collection("reviews").doc(id);
      const existingReview = await reviewRef.get();
      reviewData = {
        userId: user.id,
        numeric_user_id: numericIdFromUid(user.id),
        numeric_id: numericIdFromUid(id),
        media_key: `${mediaType}:${mediaId}`,
        movie_id: mediaType === "movie" ? mediaId : null,
        tv_id: mediaType === "tv" ? mediaId : null,
        media_type: mediaType,
        content: body.review.trim(),
        rating,
        is_edited: existingReview.exists,
        user_name: user.name || "Anonymous",
        user_image: user.avatar || "",
        created_at: existingReview.exists ? existingReview.data()?.created_at : now,
        updated_at: now,
      };
      await reviewRef.set(reviewData, { merge: true });
    }

    const savedReview = reviewData || (await adminDb.collection("reviews").doc(id).get()).data();
    return NextResponse.json(serializeRating(id, ratingData, savedReview));
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
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
    const { mediaType, mediaId } = getMediaParams(searchParams);

    if (!["movie", "tv"].includes(mediaType) || !mediaId) {
      return NextResponse.json(
        { error: "Movie ID or TV ID is required" },
        { status: 400 }
      );
    }

    const id = docId(user.id, mediaType, mediaId);
    const ratingRef = adminDb.collection("ratings").doc(id);
    const ratingDoc = await ratingRef.get();

    if (!ratingDoc.exists) {
      return NextResponse.json({ error: "No rating found to delete" }, { status: 404 });
    }

    await Promise.all([
      ratingRef.delete(),
      adminDb.collection("reviews").doc(id).delete(),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
