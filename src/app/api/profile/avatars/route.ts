import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, toIsoString } from "@/lib/firebase-admin";

const AVATAR_DIR = join(process.cwd(), "public", "uploads", "avatars");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

function getExtension(filename: string) {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";
}

function getMimeType(filename: string) {
  const extension = getExtension(filename);
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".jpg") return "image/jpeg";
  return `image/${extension.slice(1)}`;
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }

    const files = await readdir(AVATAR_DIR).catch(() => []);
    const avatars = await Promise.all(
      files
        .filter((filename) => ALLOWED_EXTENSIONS.has(getExtension(filename)))
        .map(async (filename, index) => {
          const filePath = join(AVATAR_DIR, filename);
          const fileStat = await stat(filePath);

          return {
            id: index + 1,
            filename,
            original_name: filename,
            file_path: `/uploads/avatars/${filename}`,
            file_size: fileStat.size,
            mime_type: getMimeType(filename),
            uploaded_by: null,
            is_active: true,
            created_at: fileStat.birthtime.toISOString(),
          };
        })
    );

    const uploadedAvatarsSnapshot = await adminDb.collection("admin_avatars").get();
    const uploadedAvatars = uploadedAvatarsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: data.numeric_id || doc.id,
          filename: data.filename || "",
          original_name: data.original_name || "",
          file_path: data.file_path || "",
          file_size: data.file_size || 0,
          mime_type: data.mime_type || "",
          uploaded_by: data.uploaded_by || null,
          is_active: data.is_active !== false,
          created_at: toIsoString(data.created_at),
        };
      })
      .filter((avatar) => avatar.is_active);

    const allAvatars = [...uploadedAvatars, ...avatars];

    allAvatars.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ avatars: allAvatars });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
