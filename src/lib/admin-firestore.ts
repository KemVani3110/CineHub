import { NextRequest } from "next/server";
import { adminAuth, adminDb, numericIdFromUid, serverTimestamp, toIsoString } from "@/lib/firebase-admin";
import { AuthUser, getAuthenticatedUser, isAdmin, isAdminOrModerator } from "@/lib/auth-helpers";

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user || !isAdmin(user)) {
    throw new Error(error || "Unauthorized");
  }
  return user;
}

export async function requireAdminOrModerator(request: NextRequest): Promise<AuthUser> {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user || !isAdminOrModerator(user)) {
    throw new Error(error || "Unauthorized");
  }
  return user;
}

export function serializeAdminUser(uid: string, data: any) {
  return {
    id: numericIdFromUid(uid),
    uid,
    name: data.name || "",
    email: data.email || "",
    role: data.role || "user",
    isActive: data.is_active !== false,
    avatar: data.avatar || "",
    createdAt: toIsoString(data.created_at),
    updatedAt: toIsoString(data.updated_at),
    lastLoginAt: data.last_login_at ? toIsoString(data.last_login_at) : null,
    provider: data.provider || "local",
    emailVerified: Boolean(data.email_verified),
  };
}

export async function listAdminUsers() {
  const snapshot = await adminDb.collection("users").get();
  return snapshot.docs
    .map((doc) => serializeAdminUser(doc.id, doc.data()))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function findUserDocByNumericId(userId: number | string) {
  const id = String(userId);
  const directDoc = await adminDb.collection("users").doc(id).get();
  if (directDoc.exists) return directDoc;

  const users = await adminDb.collection("users").get();
  return users.docs.find((doc) => String(numericIdFromUid(doc.id)) === id) || null;
}

export async function writeAdminActivityLog(
  admin: AuthUser,
  action: string,
  description: string,
  request?: NextRequest,
  options: {
    targetUserId?: string | number | null;
    targetUserName?: string | null;
    targetUserEmail?: string | null;
    metadata?: Record<string, any>;
  } = {}
) {
  const adminUser = await adminDb.collection("users").doc(admin.id).get();
  const adminData = adminUser.data() || {};

  await adminDb.collection("admin_activity_logs").add({
    admin_id: admin.id,
    admin_numeric_id: numericIdFromUid(admin.id),
    admin_name: adminData.name || admin.name || "",
    admin_email: adminData.email || admin.email || "",
    admin_avatar: adminData.avatar || admin.avatar || "",
    action,
    target_user_id: options.targetUserId || null,
    target_user_name: options.targetUserName || null,
    target_user_email: options.targetUserEmail || null,
    description,
    metadata: options.metadata || {},
    ip_address: request?.headers.get("x-forwarded-for") || "unknown",
    user_agent: request?.headers.get("user-agent") || "unknown",
    created_at: serverTimestamp(),
  });
}

export function serializeAdminLog(id: string, data: any) {
  return {
    id,
    admin_id: data.admin_numeric_id || numericIdFromUid(data.admin_id || ""),
    action: data.action || "",
    target_user_id: data.target_user_id || null,
    description: data.description || "",
    metadata:
      typeof data.metadata === "string"
        ? data.metadata
        : JSON.stringify(data.metadata || {}),
    ip_address: data.ip_address || "",
    user_agent: data.user_agent || "",
    created_at: toIsoString(data.created_at),
    admin_name: data.admin_name || "",
    admin_email: data.admin_email || "",
    admin_avatar: data.admin_avatar || "",
    target_user_name: data.target_user_name || "",
    target_user_email: data.target_user_email || "",
    target_user_avatar: data.target_user_avatar || "",
  };
}

export async function listAdminLogs() {
  const snapshot = await adminDb.collection("admin_activity_logs").get();
  return snapshot.docs
    .map((doc) => serializeAdminLog(doc.id, doc.data()))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function deleteFirebaseAuthUser(uid: string) {
  await adminAuth.deleteUser(uid).catch(() => undefined);
}
