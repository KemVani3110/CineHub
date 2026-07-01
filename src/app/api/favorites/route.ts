import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, numericIdFromUid, serverTimestamp, toIsoString } from "@/lib/firebase-admin";

function favoriteDocId(userId: string, actorId: number) {
  return `${userId}_${actorId}`;
}

function serializeFavorite(id: string, data: any) {
  return {
    id: data.numeric_id || numericIdFromUid(id),
    user_id: data.userId,
    actor_id: data.actor_id,
    name: data.name || "",
    profile_path: data.profile_path || "",
    added_at: toIsoString(data.added_at),
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
      .collection("favorite_actors")
      .where("userId", "==", user.id)
      .get();

    const favorites = snapshot.docs
      .map((doc) => serializeFavorite(doc.id, doc.data()))
      .sort(
        (a, b) =>
          new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      );

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
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
    const actorId = Number(body.actorId);
    const { name, profilePath } = body;

    if (!actorId || !name) {
      return NextResponse.json(
        { error: "Actor ID and name are required" },
        { status: 400 }
      );
    }

    const id = favoriteDocId(user.id, actorId);
    const ref = adminDb.collection("favorite_actors").doc(id);
    const existing = await ref.get();

    if (existing.exists) {
      return NextResponse.json(
        { error: "Actor already in favorites" },
        { status: 400 }
      );
    }

    const now = serverTimestamp();
    const favoriteData = {
      userId: user.id,
      numeric_id: numericIdFromUid(id),
      actor_id: actorId,
      name,
      profile_path: profilePath || "",
      added_at: now,
      created_at: now,
      updated_at: now,
    };

    await ref.set(favoriteData);

    return NextResponse.json(serializeFavorite(id, favoriteData));
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Failed to add to favorites" },
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
    const actorId = Number(searchParams.get("actorId"));

    if (!actorId) {
      return NextResponse.json(
        { error: "Actor ID is required" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("favorite_actors")
      .doc(favoriteDocId(user.id, actorId))
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
}
