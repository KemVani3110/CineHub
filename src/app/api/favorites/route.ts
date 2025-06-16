import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [favorites] = await db.query(
      "SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC",
      [session.user.id]
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { actorId, name, profilePath } = await request.json();

    // Check if actor is already in favorites
    const [existing] = await db.query(
      "SELECT id FROM favorites WHERE user_id = ? AND actor_id = ?",
      [session.user.id, actorId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Actor already in favorites" },
        { status: 400 }
      );
    }

    // Add new actor to favorites
    const [result] = await db.query(
      "INSERT INTO favorites (user_id, actor_id, name, profile_path) VALUES (?, ?, ?, ?)",
      [session.user.id, actorId, name, profilePath]
    );

    const [newFavorite] = await db.query(
      "SELECT * FROM favorites WHERE id = ?",
      [(result as any).insertId]
    );

    return NextResponse.json(newFavorite[0]);
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get("actorId");

    if (!actorId) {
      return NextResponse.json(
        { error: "Actor ID is required" },
        { status: 400 }
      );
    }

    await db.query(
      "DELETE FROM favorites WHERE user_id = ? AND actor_id = ?",
      [session.user.id, actorId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
} 