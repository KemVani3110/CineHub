import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, numericIdFromUid, serverTimestamp, toIsoString } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-firestore";

const VALID_REASONS = new Set([
  "wrong_title",
  "wrong_episode",
  "not_working",
  "poor_quality",
  "other",
]);

async function getOptionalUid(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("__session")?.value;

  try {
    if (authHeader?.startsWith("Bearer ")) {
      const decoded = await adminAuth.verifyIdToken(authHeader.split(" ")[1]);
      return decoded.uid;
    }

    if (sessionCookie) {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      return decoded.uid;
    }
  } catch {
    return null;
  }

  return null;
}

function serializeReport(id: string, data: any) {
  return {
    id,
    numeric_id: data.numeric_id ?? numericIdFromUid(id),
    media_type: data.media_type,
    media_id: data.media_id,
    season_number: data.season_number ?? null,
    episode_number: data.episode_number ?? null,
    title: data.title || "",
    source_name: data.source_name || "",
    source_url: data.source_url || "",
    reason: data.reason || "other",
    status: data.status || "open",
    user_id: data.user_id || null,
    notes: data.notes || "",
    created_at: toIsoString(data.created_at),
    updated_at: toIsoString(data.updated_at),
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);

    let query: FirebaseFirestore.Query = adminDb
      .collection("source_reports")
      .orderBy("created_at", "desc")
      .limit(limit);

    if (status && status !== "all") {
      query = adminDb
        .collection("source_reports")
        .where("status", "==", status)
        .limit(limit);
    }

    const snapshot = await query.get();
    const reports = snapshot.docs
      .map((doc) => serializeReport(doc.id, doc.data()))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Source reports GET error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mediaType = body.mediaType;
    const mediaId = Number(body.mediaId);
    const reason = VALID_REASONS.has(body.reason) ? body.reason : "other";

    if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(mediaId)) {
      return NextResponse.json(
        { message: "Valid media type and media ID are required" },
        { status: 400 }
      );
    }

    if (!body.sourceName || !body.sourceUrl || !body.title) {
      return NextResponse.json(
        { message: "Source name, source URL, and title are required" },
        { status: 400 }
      );
    }

    const userId = await getOptionalUid(request);
    const ref = adminDb.collection("source_reports").doc();
    const now = serverTimestamp();

    await ref.set({
      numeric_id: numericIdFromUid(ref.id),
      media_type: mediaType,
      media_id: mediaId,
      season_number: body.seasonNumber ? Number(body.seasonNumber) : null,
      episode_number: body.episodeNumber ? Number(body.episodeNumber) : null,
      title: body.title,
      source_name: body.sourceName,
      source_url: body.sourceUrl,
      reason,
      status: "open",
      user_id: userId,
      notes: body.notes || "",
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json(
      { message: "Source report submitted", id: ref.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Source reports POST error:", error);
    return NextResponse.json({ message: "Failed to submit report" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const id = String(body.id || "");
    const status = String(body.status || "");

    if (!id || !["open", "reviewing", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json(
        { message: "Valid report ID and status are required" },
        { status: 400 }
      );
    }

    await adminDb.collection("source_reports").doc(id).update({
      status,
      updated_at: serverTimestamp(),
    });

    return NextResponse.json({ message: "Source report updated" });
  } catch (error) {
    console.error("Source reports PATCH error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update report" },
      { status: 500 }
    );
  }
}
