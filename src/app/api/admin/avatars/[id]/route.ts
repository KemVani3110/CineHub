import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdminOrModerator, writeAdminActivityLog } from "@/lib/admin-firestore";

async function findAvatarDoc(id: string) {
  const direct = await adminDb.collection("admin_avatars").doc(id).get();
  if (direct.exists) return direct;

  const snapshot = await adminDb
    .collection("admin_avatars")
    .where("numeric_id", "==", Number(id))
    .limit(1)
    .get();

  return snapshot.docs[0] || null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminOrModerator(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Avatar ID is required" }, { status: 400 });
    }

    const avatarDoc = await findAvatarDoc(id);
    if (!avatarDoc?.exists) {
      return NextResponse.json({ message: "Avatar not found" }, { status: 404 });
    }

    const avatar = avatarDoc.data() || {};
    await avatarDoc.ref.delete();
    await writeAdminActivityLog(
      admin,
      "DELETE_AVATAR",
      `Deleted avatar: ${avatar.original_name || id}`,
      request,
      { metadata: { avatarId: id } }
    );

    return NextResponse.json({ message: "Avatar deleted successfully" });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
