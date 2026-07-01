import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb } from "@/lib/firebase-admin";

async function findHistoryDocs(userId: string, id: string) {
  return adminDb
    .collection("watch_history")
    .where("userId", "==", userId)
    .where("numeric_id", "==", Number(id))
    .get();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { watchedAt } = await request.json();

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { message: "History ID is required" },
        { status: 400 }
      );
    }

    const snapshot = await findHistoryDocs(user.id, id);
    if (snapshot.empty) {
      return NextResponse.json(
        { message: "History record not found" },
        { status: 404 }
      );
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        watched_at: watchedAt ? new Date(watchedAt) : new Date(),
        updated_at: new Date(),
      });
    });
    await batch.commit();

    return NextResponse.json({ message: "History updated successfully" });
  } catch (error) {
    console.error("Error updating history:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { message: "History ID is required" },
        { status: 400 }
      );
    }

    const snapshot = await findHistoryDocs(user.id, id);
    if (snapshot.empty) {
      return NextResponse.json(
        { message: "History record not found" },
        { status: 404 }
      );
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json({ message: "History deleted successfully" });
  } catch (error) {
    console.error("Error deleting history:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
