import { NextRequest, NextResponse } from "next/server";
import { adminDb, numericIdFromUid, toIsoString } from "@/lib/firebase-admin";
import { requireAdminOrModerator } from "@/lib/admin-firestore";

function serializeAvatar(id: string, data: any) {
  return {
    id: data.numeric_id || numericIdFromUid(id),
    uid: id,
    filename: data.filename || "",
    original_name: data.original_name || "",
    file_path: data.file_path || "",
    file_size: data.file_size || 0,
    mime_type: data.mime_type || "",
    uploaded_by: data.uploaded_by || null,
    is_active: data.is_active !== false,
    created_at: toIsoString(data.created_at),
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrModerator(request);

    const snapshot = await adminDb.collection("admin_avatars").get();
    const avatars = snapshot.docs
      .map((doc) => serializeAvatar(doc.id, doc.data()))
      .filter((avatar) => avatar.is_active)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    return NextResponse.json({ avatars });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
