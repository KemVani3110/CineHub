import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { avatar } = await req.json();
    if (!avatar) {
      return NextResponse.json(
        { message: "Avatar path is required" },
        { status: 400 }
      );
    }

    // Update user's avatar in the database
    const [result] = await db.query(
      "UPDATE users SET avatar = ? WHERE id = ?",
      [avatar, session.user.id]
    );

    if (!result) {
      return NextResponse.json(
        { message: "Failed to update avatar" },
        { status: 500 }
      );
    }

    // Get updated user data
    const [users] = await db.query<User[]>(
      "SELECT id, name, email, avatar, role FROM users WHERE id = ?",
      [session.user.id]
    );

    const user = users[0];

    return NextResponse.json({
      message: "Avatar updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 