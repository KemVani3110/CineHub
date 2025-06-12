import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface UserAvatar extends RowDataPacket {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  is_active: boolean;
  created_at: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [avatars] = await db.query<UserAvatar[]>(
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