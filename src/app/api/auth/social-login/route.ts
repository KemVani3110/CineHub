import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { upsertUserFromToken } from "@/lib/firebase-user";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { provider, token: bodyToken, user: socialUser } = await request.json();
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : bodyToken;

    if (!token || !provider || !socialUser) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (!["google", "facebook"].includes(provider)) {
      return NextResponse.json({ message: "Unsupported provider" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await upsertUserFromToken(decodedToken, {
      provider,
      email: decodedToken.email,
      name: socialUser.name || decodedToken.name || "",
      avatar: socialUser.avatar || decodedToken.picture || "",
    });

    if (!user.is_active) {
      return NextResponse.json({ message: "Account is deactivated" }, { status: 403 });
    }

    const response = NextResponse.json({
      success: true,
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
    console.error("Social login error:", error);
    return NextResponse.json({ message: "Authentication failed" }, { status: 401 });
  }
}
