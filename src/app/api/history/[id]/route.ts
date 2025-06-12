import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { watchedAt } = await request.json();

    // Update the watched_at timestamp for the existing record
    const [result] = await pool.execute(
      `UPDATE watch_history 
       SET watched_at = ? 
       WHERE id = ? AND user_id = ?`,
      [watchedAt, params.id, session.user.id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { message: "History record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "History updated successfully" });
  } catch (error) {
    console.error("Error updating history:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 