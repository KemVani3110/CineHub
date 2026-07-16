import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { adminDb, serverTimestamp } from "@/lib/firebase-admin";
import { serializeNotification } from "@/lib/notifications";

const MAX_NOTIFICATIONS = 100;

async function getOwnedNotification(userId: string, notificationId: string) {
  const ref = adminDb.collection("notifications").doc(notificationId);
  const snapshot = await ref.get();

  if (!snapshot.exists || snapshot.data()?.userId !== userId) {
    return null;
  }

  return { ref, snapshot };
}

async function commitInChunks(
  refs: FirebaseFirestore.DocumentReference[],
  operation: (batch: FirebaseFirestore.WriteBatch, ref: FirebaseFirestore.DocumentReference) => void
) {
  for (let index = 0; index < refs.length; index += 450) {
    const batch = adminDb.batch();
    refs.slice(index, index + 450).forEach((ref) => operation(batch, ref));
    await batch.commit();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") || 30), 1),
      MAX_NOTIFICATIONS
    );

    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", user.id)
      .get();

    const allNotifications = snapshot.docs
      .map((doc) => serializeNotification(doc.id, doc.data()))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    const notifications = allNotifications.slice(0, limit);

    const unreadCount = allNotifications.filter(
      (notification) => !notification.read
    ).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { message: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const now = serverTimestamp();

    if (body.all === true) {
      const snapshot = await adminDb
        .collection("notifications")
        .where("userId", "==", user.id)
        .where("read", "==", false)
        .get();

      await commitInChunks(snapshot.docs.map((doc) => doc.ref), (batch, ref) => {
        batch.update(ref, {
          read: true,
          read_at: now,
          updated_at: now,
        });
      });

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const ownedNotification = await getOwnedNotification(user.id, id);
    if (!ownedNotification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    await ownedNotification.ref.update({
      read: true,
      read_at: now,
      updated_at: now,
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    if (body.read === true) {
      const snapshot = await adminDb
        .collection("notifications")
        .where("userId", "==", user.id)
        .where("read", "==", true)
        .get();

      await commitInChunks(snapshot.docs.map((doc) => doc.ref), (batch, ref) => {
        batch.delete(ref);
      });

      return NextResponse.json({ message: "Read notifications cleared" });
    }

    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const ownedNotification = await getOwnedNotification(user.id, id);
    if (!ownedNotification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    await ownedNotification.ref.delete();

    return NextResponse.json({ message: "Notification removed" });
  } catch (error) {
    console.error("Notifications DELETE error:", error);
    return NextResponse.json(
      { message: "Failed to remove notification" },
      { status: 500 }
    );
  }
}
