import { adminDb, serverTimestamp, toIsoString } from "@/lib/firebase-admin";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationSource =
  | "system"
  | "watchlist"
  | "source_report"
  | "contact"
  | "admin";

interface CreateNotificationInput {
  userId: string | null | undefined;
  title: string;
  message: string;
  type?: NotificationType;
  href?: string | null;
  source?: NotificationSource;
  metadata?: Record<string, unknown>;
}

function cleanMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined)
  );
}

export async function createNotification(input: CreateNotificationInput) {
  if (!input.userId || !input.title || !input.message) return null;

  try {
    const now = serverTimestamp();
    const ref = adminDb.collection("notifications").doc();

    await ref.set({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || "info",
      href: input.href || null,
      source: input.source || "system",
      metadata: cleanMetadata(input.metadata),
      read: false,
      read_at: null,
      created_at: now,
      updated_at: now,
    });

    return ref.id;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
}

export function serializeNotification(id: string, data: any) {
  return {
    id,
    title: data.title || "",
    message: data.message || "",
    type: data.type || "info",
    read: Boolean(data.read),
    href: data.href || null,
    source: data.source || "system",
    metadata: data.metadata || {},
    createdAt: toIsoString(data.created_at),
    updatedAt: toIsoString(data.updated_at),
    readAt: data.read_at ? toIsoString(data.read_at) : null,
  };
}
