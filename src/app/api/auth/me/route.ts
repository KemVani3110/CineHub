import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserDocument, serializeUser } from "@/lib/firebase-user";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userDoc = await getUserDocument(decodedToken.uid);

    if (!userDoc.exists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = serializeUser(decodedToken.uid, userDoc.data() || {});
    if (!user.is_active) {
      return NextResponse.json({ message: "Account is deactivated" }, { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
