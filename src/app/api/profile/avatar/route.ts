import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminAuth, adminDb, serverTimestamp } from "@/lib/firebase-admin";
import { getUserFromUid } from "@/lib/firebase-user";

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }

    const { avatar } = await request.json();
    if (!avatar) {
      return NextResponse.json(
        { message: "Avatar path is required" },
        { status: 400 }
      );
    }

    await Promise.all([
      adminDb.collection("users").doc(user.id).update({
        avatar,
        updated_at: serverTimestamp(),
      }),
      adminAuth.updateUser(user.id, { photoURL: avatar }).catch(() => undefined),
    ]);

    const updatedUser = await getUserFromUid(user.id);

    return NextResponse.json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
