import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unlink } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin or moderator
    if (!["admin", "moderator"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const avatarId = parseInt(params.id);
    if (isNaN(avatarId)) {
      return NextResponse.json(
        { message: "Invalid avatar ID" },
        { status: 400 }
      );
    }

    // Get avatar info before deleting
    const [avatars] = await db.query(
      `SELECT * FROM user_avatars WHERE id = ?`,
      [avatarId]
    );

    if (!avatars.length) {
      return NextResponse.json(
        { message: "Avatar not found" },
        { status: 404 }
      );
    }

    const avatar = avatars[0];

    // Delete file from filesystem
    const filePath = join(process.cwd(), "public", avatar.file_path);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db.query(
      `DELETE FROM user_avatars WHERE id = ?`,
      [avatarId]
    );

    return NextResponse.json({
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 