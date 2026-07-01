import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isFirebaseUser } from "@/lib/auth-helpers";
import { adminAuth, adminDb, serverTimestamp } from "@/lib/firebase-admin";
import { serializeUser } from "@/lib/firebase-user";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user || !isFirebaseUser(user)) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(user.id).get();
    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: serializeUser(user.id, userDoc.data() || {}),
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user || !isFirebaseUser(user)) {
      return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();
    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    const userDocRef = adminDb.collection("users").doc(user.id);
    await userDocRef.update({
      name,
      email,
      ...(avatar ? { avatar } : {}),
      updated_at: serverTimestamp(),
    });

    await adminAuth
      .updateUser(user.id, {
        displayName: name,
        email,
        ...(avatar ? { photoURL: avatar } : {}),
      })
      .catch(() => undefined);

    const userDoc = await userDocRef.get();
    return NextResponse.json({
      message: "Profile updated successfully",
      user: serializeUser(user.id, userDoc.data() || {}),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
