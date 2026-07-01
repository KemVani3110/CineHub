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
    const { name, email, avatar } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    if (decodedToken.email !== email) {
      return NextResponse.json({ message: "Email mismatch" }, { status: 400 });
    }

    const user = await upsertUserFromToken(decodedToken, {
      name,
      email,
      avatar,
      provider: "local",
    });

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user,
        token,
      },
      { status: 201 }
    );

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
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
