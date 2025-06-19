import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { message: "History ID is required" },
        { status: 400 }
      );
    }

    const { watchedAt } = await request.json();

    // Update the watched_at timestamp for the existing record
    const [result] = await pool.execute(
      `UPDATE watch_history 
       SET watched_at = ? 
       WHERE id = ? AND user_id = ?`,
      [watchedAt, id, session.user.id]
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { message: "History ID is required" },
        { status: 400 }
      );
    }

    // Delete the history record
    const [result] = await pool.execute(
      `DELETE FROM watch_history 
       WHERE id = ? AND user_id = ?`,
      [id, session.user.id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { message: "History record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "History deleted successfully" });
  } catch (error) {
    console.error("Error deleting history:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 