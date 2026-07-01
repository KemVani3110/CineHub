import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { adminDb, serverTimestamp } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decodedToken = await adminAuth.verifyIdToken(token);

      await adminDb.collection("user_activity_logs").add({
        userId: decodedToken.uid,
        action: "user_logout",
        details: { method: "firebase_auth" },
        timestamp: serverTimestamp(),
        ip_address: null,
      });
    }

    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set("__session", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set("__session", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return response;
  }
}
