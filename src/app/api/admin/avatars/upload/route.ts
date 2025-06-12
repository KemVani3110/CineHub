import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size should be less than 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${uuidv4()}-${file.name}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    const filePath = join(uploadDir, filename);

    // Save file
    await writeFile(filePath, buffer);

    // Save to database
    const [result] = await db.query(
      `INSERT INTO user_avatars (filename, original_name, file_path, file_size, mime_type, uploaded_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      [
        filename,
        file.name,
        `/uploads/avatars/${filename}`,
        file.size,
        file.type,
        session.user.id,
      ]
    );

    const [avatar] = await db.query(
      `SELECT * FROM user_avatars WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatar: avatar[0],
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 