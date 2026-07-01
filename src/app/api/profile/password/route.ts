import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isFirebaseUser } from "@/lib/auth-helpers";
import { adminAuth, adminDb, serverTimestamp } from "@/lib/firebase-admin";

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "Current password, new password and confirm password are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { message: "New password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { message: "New password must contain at least one number" },
        { status: 400 }
      );
    }

    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }

    if (!isFirebaseUser(user)) {
      return NextResponse.json(
        { message: "Password change is only available for Firebase accounts" },
        { status: 400 }
      );
    }

    if (user.provider && user.provider !== "local") {
      return NextResponse.json(
        { message: "Password change not supported for social login accounts" },
        { status: 400 }
      );
    }

    await Promise.all([
      adminAuth.updateUser(user.id, { password: newPassword }),
      adminDb.collection("users").doc(user.id).update({
        updated_at: serverTimestamp(),
      }),
    ]);

    return NextResponse.json({
      message: "Password updated successfully. Please use the new password next time you log in.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 }
    );
  }
}
