import { NextRequest } from "next/server";
import { adminAuth, adminDb, serverTimestamp } from "@/lib/firebase-admin";

export const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  is_active?: boolean;
  email_verified?: boolean;
  provider?: string;
  source?: "firebase";
}

export interface AuthResult {
  user: AuthUser | null;
  error?: string;
}

export function isFirebaseUser(user: AuthUser): boolean {
  return user.source === "firebase";
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("__session")?.value;

  try {
    const decodedToken = authHeader?.startsWith("Bearer ")
      ? await adminAuth.verifyIdToken(authHeader.split(" ")[1])
      : sessionCookie
        ? await adminAuth.verifySessionCookie(sessionCookie, true)
        : null;

    if (!decodedToken) {
      return { user: null, error: "No Firebase credentials" };
    }

    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return { user: null, error: "User not found" };
    }

    const userData = userDoc.data() || {};
    if (userData.is_active === false) {
      return { user: null, error: "Account is deactivated" };
    }

    return {
      user: {
        id: decodedToken.uid,
        email: userData.email || decodedToken.email || "",
        name: userData.name || decodedToken.name || "",
        role: userData.role || "user",
        avatar: userData.avatar || decodedToken.picture || "",
        is_active: userData.is_active !== false,
        email_verified: Boolean(userData.email_verified ?? decodedToken.email_verified),
        provider: userData.provider || "local",
        source: "firebase",
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { user: null, error: "Invalid or expired token" };
  }
}

export function isAdminOrModerator(user: AuthUser): boolean {
  return user.role === "admin" || user.role === "moderator";
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === "admin";
}

export function getUserId(user: AuthUser): string {
  return user.id;
}

export async function logActivity(
  userId: string,
  action: string,
  details: any = {},
  entityType?: "movie" | "tv",
  entityId?: number,
  entityTitle?: string
): Promise<void> {
  try {
    await adminDb.collection("user_activity_logs").add({
      userId,
      action,
      details,
      entityType: entityType || null,
      entityId: entityId || null,
      entityTitle: entityTitle || null,
      timestamp: serverTimestamp(),
      ip_address: null,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export { adminDb };
