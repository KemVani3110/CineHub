import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
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

    const [avatars] = await db.query(
      `SELECT * FROM user_avatars WHERE is_active = true ORDER BY created_at DESC`
    );

    return NextResponse.json({ avatars });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 