import { NextRequest, NextResponse } from "next/server";
import {
  adminDb,
  numericIdFromUid,
  serverTimestamp,
  toIsoString,
} from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-firestore";

const MAIN_CONTACT_EMAIL = "minhkhoi3110953@gmail.com";

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function serializeMessage(id: string, data: any) {
  return {
    id,
    numeric_id: data.numeric_id ?? numericIdFromUid(id),
    name: data.name || "",
    email: data.email || "",
    subject: data.subject || "",
    message: data.message || "",
    status: data.status || "new",
    target_email: data.target_email || MAIN_CONTACT_EMAIL,
    created_at: toIsoString(data.created_at),
    updated_at: toIsoString(data.updated_at),
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const snapshot = await adminDb
      .collection("contact_messages")
      .orderBy("created_at", "desc")
      .limit(100)
      .get();

    return NextResponse.json({
      messages: snapshot.docs.map((doc) => serializeMessage(doc.id, doc.data())),
    });
  } catch (error) {
    console.error("Contact GET error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const subject = cleanText(body.subject, 180);
    const message = cleanText(body.message, 3000);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "A valid email address is required" },
        { status: 400 }
      );
    }

    const ref = adminDb.collection("contact_messages").doc();
    const now = serverTimestamp();

    await ref.set({
      numeric_id: numericIdFromUid(ref.id),
      name,
      email,
      subject,
      message,
      status: "new",
      target_email: MAIN_CONTACT_EMAIL,
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json(
      {
        message: "Contact message saved",
        id: ref.id,
        targetEmail: MAIN_CONTACT_EMAIL,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json(
      { message: "Failed to submit contact message" },
      { status: 500 }
    );
  }
}
