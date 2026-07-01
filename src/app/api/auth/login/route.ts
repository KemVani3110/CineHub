import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { upsertUserFromToken } from "@/lib/firebase-user";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const body = await req.json().catch(() => ({}));

    if (body.email && decodedToken.email !== body.email) {
      return NextResponse.json({ message: "Email mismatch" }, { status: 400 });
    }

    const user = await upsertUserFromToken(decodedToken);
    if (!user.is_active) {
      return NextResponse.json({ message: "Account is deactivated" }, { status: 403 });
    }

    const response = NextResponse.json({
      message: "Login successful",
      user,
      token,
    });

    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    });
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}
