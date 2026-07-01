import { DecodedIdToken } from "firebase-admin/auth";
import { adminDb, numericIdFromUid, serverTimestamp, toIsoString } from "@/lib/firebase-admin";

export type FirebaseUserRole = "user" | "admin" | "moderator";
export type FirebaseUserProvider = "local" | "google" | "facebook";

export function providerFromToken(decodedToken: DecodedIdToken): FirebaseUserProvider {
  const provider = decodedToken.firebase?.sign_in_provider;
  if (provider === "google.com") return "google";
  if (provider === "facebook.com") return "facebook";
  return "local";
}

export function serializeUser(uid: string, data: any) {
  return {
    id: numericIdFromUid(uid),
    uid,
    email: data.email || "",
    name: data.name || "",
    role: (data.role || "user") as FirebaseUserRole,
    avatar: data.avatar || "",
    is_active: data.is_active !== false,
    email_verified: Boolean(data.email_verified),
    created_at: toIsoString(data.created_at),
    updated_at: toIsoString(data.updated_at),
    last_login_at: toIsoString(data.last_login_at),
    provider: (data.provider || "local") as FirebaseUserProvider,
    provider_id: data.provider_id || uid,
  };
}

export async function getUserDocument(uid: string) {
  return adminDb.collection("users").doc(uid).get();
}

export async function getUserFromUid(uid: string) {
  const userDoc = await getUserDocument(uid);
  if (!userDoc.exists) return null;
  return serializeUser(uid, userDoc.data() || {});
}

export async function upsertUserFromToken(
  decodedToken: DecodedIdToken,
  data: {
    name?: string;
    email?: string;
    avatar?: string;
    provider?: FirebaseUserProvider;
  } = {}
) {
  const ref = adminDb.collection("users").doc(decodedToken.uid);
  const snapshot = await ref.get();
  const now = serverTimestamp();
  const provider = data.provider || providerFromToken(decodedToken);

  if (!snapshot.exists) {
    await ref.set({
      id: decodedToken.uid,
      name: data.name || decodedToken.name || "",
      email: data.email || decodedToken.email || "",
      avatar: data.avatar || decodedToken.picture || "",
      role: "user",
      is_active: true,
      email_verified: decodedToken.email_verified || false,
      created_at: now,
      updated_at: now,
      last_login_at: now,
      provider,
      provider_id: decodedToken.uid,
    });

    await adminDb.collection("user_activity_logs").add({
      userId: decodedToken.uid,
      action: "user_registered",
      details: { provider },
      timestamp: now,
      ip_address: null,
    });
  } else {
    const existing = snapshot.data() || {};
    await ref.update({
      name: data.name || existing.name || decodedToken.name || "",
      email: data.email || existing.email || decodedToken.email || "",
      avatar: data.avatar || existing.avatar || decodedToken.picture || "",
      email_verified: decodedToken.email_verified || existing.email_verified || false,
      last_login_at: now,
      updated_at: now,
      provider: existing.provider || provider,
      provider_id: existing.provider_id || decodedToken.uid,
    });
  }

  const updated = await ref.get();
  return serializeUser(decodedToken.uid, updated.data() || {});
}
