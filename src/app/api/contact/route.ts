import { NextRequest, NextResponse } from "next/server";
import {
  adminDb,
  numericIdFromUid,
  serverTimestamp,
  toIsoString,
} from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-firestore";
import {
  getContactEmail,
  isEmailConfigured,
  sendEmail,
} from "@/lib/email";

const MAIN_CONTACT_EMAIL = getContactEmail();

export const runtime = "nodejs";

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
    email_status: data.email_status || "pending",
    reply_message: data.reply_message || "",
    replied_at: data.replied_at ? toIsoString(data.replied_at) : null,
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
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

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
      email_status: "pending",
      target_email: MAIN_CONTACT_EMAIL,
      created_at: now,
      updated_at: now,
    });

    try {
      await sendEmail({
        to: MAIN_CONTACT_EMAIL,
        replyTo: email,
        subject: `[CineHub Contact] ${subject}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          "",
          "Message:",
          message,
        ].join("\n"),
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New CineHub Contact Message</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr />
            <p style="white-space: pre-wrap;">${safeMessage}</p>
          </div>
        `,
      });

      await ref.update({
        email_status: "sent",
        updated_at: serverTimestamp(),
      });
    } catch (emailError) {
      await ref.update({
        email_status: "failed",
        email_error:
          emailError instanceof Error ? emailError.message : "Unknown email error",
        updated_at: serverTimestamp(),
      });

      return NextResponse.json(
        {
          message:
            emailError instanceof Error
              ? emailError.message
              : "Message was saved, but email delivery failed",
          id: ref.id,
          saved: true,
          emailSent: false,
          emailConfigured: isEmailConfigured(),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message: "Contact message sent",
        id: ref.id,
        targetEmail: MAIN_CONTACT_EMAIL,
        emailSent: true,
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

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const id = cleanText(body.id, 140);
    const replyMessage = cleanText(body.replyMessage, 3000);
    const safeReplyMessage = escapeHtml(replyMessage);

    if (!id || !replyMessage) {
      return NextResponse.json(
        { message: "Message ID and reply message are required" },
        { status: 400 }
      );
    }

    const ref = adminDb.collection("contact_messages").doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { message: "Contact message not found" },
        { status: 404 }
      );
    }

    const message = serializeMessage(snapshot.id, snapshot.data());
    const safeOriginalMessage = escapeHtml(message.message);

    await sendEmail({
      to: message.email,
      replyTo: MAIN_CONTACT_EMAIL,
      subject: `Re: ${message.subject}`,
      text: [
        replyMessage,
        "",
        "---",
        "Original message:",
        message.message,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p style="white-space: pre-wrap;">${safeReplyMessage}</p>
          <hr />
          <p><strong>Original message:</strong></p>
          <p style="white-space: pre-wrap;">${safeOriginalMessage}</p>
        </div>
      `,
    });

    await ref.update({
      status: "replied",
      reply_message: replyMessage,
      replied_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return NextResponse.json({ message: "Reply email sent" });
  } catch (error) {
    console.error("Contact PATCH error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to send reply email",
      },
      { status: 500 }
    );
  }
}
