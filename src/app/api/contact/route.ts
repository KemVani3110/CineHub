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

function escapeHtmlWithBreaks(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function buildAdminContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtmlWithBreaks(message);
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    `Re: ${subject}`
  )}`;

  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
        <div style="overflow:hidden;border-radius:18px;background:#ffffff;border:1px solid #e5e7eb;box-shadow:0 18px 45px rgba(15,23,42,0.08);">
          <div style="padding:28px 30px;background:#07111f;color:#ffffff;">
            <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#22d3ee;font-weight:700;">CineHub Contact</div>
            <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;font-weight:800;">New message received</h1>
            <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;line-height:1.6;">A visitor sent a message from your CineHub contact page.</p>
          </div>

          <div style="padding:28px 30px;">
            <div style="margin-bottom:22px;padding:18px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 0;width:92px;color:#64748b;font-size:13px;font-weight:700;">Name</td>
                  <td style="padding:6px 0;color:#0f172a;font-size:15px;font-weight:700;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;width:92px;color:#64748b;font-size:13px;font-weight:700;">Email</td>
                  <td style="padding:6px 0;color:#0f172a;font-size:15px;"><a href="mailto:${encodeURIComponent(email)}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding:6px 0;width:92px;color:#64748b;font-size:13px;font-weight:700;">Subject</td>
                  <td style="padding:6px 0;color:#0f172a;font-size:15px;">${safeSubject}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom:24px;">
              <div style="margin-bottom:10px;color:#64748b;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">Message</div>
              <div style="padding:20px;border-left:4px solid #06b6d4;border-radius:12px;background:#ecfeff;color:#0f172a;font-size:16px;line-height:1.7;">${safeMessage}</div>
            </div>

            <a href="${replyHref}" style="display:inline-block;padding:13px 18px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;">Reply to ${safeName}</a>
          </div>

          <div style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;line-height:1.6;">
            This email was generated automatically from the CineHub contact form. The message is also saved in your admin dashboard.
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildReplyEmail({
  replyMessage,
  originalMessage,
}: {
  replyMessage: string;
  originalMessage: string;
}) {
  const safeReplyMessage = escapeHtmlWithBreaks(replyMessage);
  const safeOriginalMessage = escapeHtmlWithBreaks(originalMessage);

  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
        <div style="overflow:hidden;border-radius:18px;background:#ffffff;border:1px solid #e5e7eb;box-shadow:0 18px 45px rgba(15,23,42,0.08);">
          <div style="padding:24px 30px;background:#07111f;color:#ffffff;">
            <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#22d3ee;font-weight:700;">CineHub</div>
            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;font-weight:800;">Thanks for reaching out</h1>
          </div>
          <div style="padding:28px 30px;">
            <div style="color:#0f172a;font-size:16px;line-height:1.7;">${safeReplyMessage}</div>
            <div style="height:1px;background:#e5e7eb;margin:26px 0;"></div>
            <div style="margin-bottom:10px;color:#64748b;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">Original message</div>
            <div style="padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;color:#334155;font-size:14px;line-height:1.7;">${safeOriginalMessage}</div>
          </div>
        </div>
      </div>
    </div>
  `;
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
          `Subject: ${subject}`,
          "",
          "Message:",
          message,
        ].join("\n"),
        html: buildAdminContactEmail({
          name,
          email,
          subject,
          message,
        }),
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
      html: buildReplyEmail({
        replyMessage,
        originalMessage: message.message,
      }),
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
