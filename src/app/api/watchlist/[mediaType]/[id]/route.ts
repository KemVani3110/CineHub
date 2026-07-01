import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ mediaType: string; id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const { mediaType, id } = await params;
    const mediaId = Number(id);

    if (!["movie", "tv"].includes(mediaType) || !mediaId) {
      return NextResponse.json(
        { message: "Media type and ID are required" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("watchlists")
      .doc(`${user.id}_${mediaType}_${mediaId}`)
      .delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
