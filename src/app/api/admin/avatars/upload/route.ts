import { NextRequest, NextResponse } from "next/server";
import { adminDb, numericIdFromUid, serverTimestamp } from "@/lib/firebase-admin";
import { requireAdminOrModerator, writeAdminActivityLog } from "@/lib/admin-firestore";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminOrModerator(request);
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size should be less than 5MB" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name}`;
    const filePath = `data:${file.type};base64,${bytes.toString("base64")}`;
    const ref = adminDb.collection("admin_avatars").doc();
    const avatarData = {
      numeric_id: numericIdFromUid(ref.id),
      filename,
      original_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: admin.id,
      is_active: true,
      created_at: serverTimestamp(),
    };

    await ref.set(avatarData);
    await writeAdminActivityLog(
      admin,
      "UPLOAD_AVATAR",
      `Uploaded avatar: ${file.name}`,
      request,
      { metadata: { filename, size: file.size } }
    );

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatar: {
        id: avatarData.numeric_id,
        uid: ref.id,
        ...avatarData,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
