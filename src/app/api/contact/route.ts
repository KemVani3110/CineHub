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
  const senderInitial = escapeHtml(name.charAt(0).toUpperCase() || "C");
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    `Re: ${subject}`
  )}`;

  return `
    <div style="margin:0;padding:0;background:#eef3f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;padding:34px 16px;">
        <div style="overflow:hidden;border-radius:24px;background:#ffffff;border:1px solid #dbe3ef;box-shadow:0 24px 60px rgba(15,23,42,0.14);">
          <div style="padding:0;background:#07111f;">
            <div style="height:6px;background:#12d6c5;"></div>
            <div style="padding:30px 32px 28px;color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#67e8f9;font-weight:800;">CineHub Contact</div>
                    <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;font-weight:900;">New lead from your portfolio</h1>
                    <p style="margin:12px 0 0;color:#cbd5e1;font-size:14px;line-height:1.7;">A visitor submitted the CineHub contact form. The message is saved in your admin dashboard.</p>
                  </td>
                  <td align="right" style="vertical-align:top;width:120px;">
                    <span style="display:inline-block;border-radius:999px;background:rgba(20,184,166,0.16);border:1px solid rgba(45,212,191,0.45);padding:8px 12px;color:#99f6e4;font-size:12px;font-weight:800;">New message</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div style="padding:30px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:22px;">
              <tr>
                <td style="width:62px;vertical-align:top;">
                  <div style="width:52px;height:52px;border-radius:18px;background:#0f172a;color:#ffffff;text-align:center;line-height:52px;font-size:22px;font-weight:900;">${senderInitial}</div>
                </td>
                <td style="vertical-align:middle;">
                  <div style="color:#0f172a;font-size:18px;font-weight:900;line-height:1.3;">${safeName}</div>
                  <div style="margin-top:4px;color:#64748b;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a></div>
                </td>
              </tr>
            </table>

            <div style="margin-bottom:24px;padding:20px;border-radius:18px;background:#f8fafc;border:1px solid #dbeafe;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:0 0 8px;color:#64748b;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">Subject</td>
                </tr>
                <tr>
                  <td style="padding:0;color:#0f172a;font-size:18px;font-weight:800;line-height:1.45;">${safeSubject}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom:24px;">
              <div style="margin-bottom:12px;color:#64748b;font-size:12px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">Message</div>
              <div style="padding:22px 24px;border-radius:18px;background:#ecfeff;border:1px solid #a5f3fc;border-left:6px solid #06b6d4;color:#0f172a;font-size:17px;line-height:1.75;">${safeMessage}</div>
            </div>

            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td>
                  <a href="${replyHref}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;">Reply to ${safeName}</a>
                </td>
                <td style="padding-left:12px;color:#64748b;font-size:13px;">Reply-To is already set to the sender.</td>
              </tr>
            </table>
          </div>

          <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;line-height:1.6;">
            Sent automatically by CineHub Contact. Keep replies professional and continue the conversation from your admin dashboard when needed.
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
    <div style="margin:0;padding:0;background:#eef3f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;padding:34px 16px;">
        <div style="overflow:hidden;border-radius:24px;background:#ffffff;border:1px solid #dbe3ef;box-shadow:0 24px 60px rgba(15,23,42,0.14);">
          <div style="padding:0;background:#07111f;color:#ffffff;">
            <div style="height:6px;background:#12d6c5;"></div>
            <div style="padding:28px 32px;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#67e8f9;font-weight:900;">CineHub</div>
              <h1 style="margin:10px 0 0;font-size:27px;line-height:1.2;font-weight:900;">Thanks for reaching out</h1>
              <p style="margin:12px 0 0;color:#cbd5e1;font-size:14px;line-height:1.7;">Here is a reply from Huynh Chu Minh Khoi about your message.</p>
            </div>
          </div>
          <div style="padding:30px 32px;">
            <div style="padding:22px 24px;border-radius:18px;background:#ffffff;border:1px solid #e2e8f0;color:#0f172a;font-size:16px;line-height:1.75;">${safeReplyMessage}</div>
            <div style="height:1px;background:#e5e7eb;margin:28px 0;"></div>
            <div style="margin-bottom:12px;color:#64748b;font-size:12px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">Original message</div>
            <div style="padding:18px 20px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;border-left:5px solid #94a3b8;color:#334155;font-size:14px;line-height:1.7;">${safeOriginalMessage}</div>
          </div>
          <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;line-height:1.6;">
            You can reply directly to this email to continue the conversation.
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
