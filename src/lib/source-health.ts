import { adminDb } from "@/lib/firebase-admin";

type MediaType = "movie" | "tv";

export interface StreamingSourceHealthInput {
  mediaType: MediaType;
  mediaId: number;
  seasonNumber?: number | string | null;
  episodeNumber?: number | string | null;
}

export interface SourceHealth {
  reportCount: number;
  reasons: string[];
}

type StreamingSourceLike = {
  name: string;
  [key: string]: unknown;
};

const ACTIVE_REPORT_STATUSES = new Set(["open", "reviewing"]);

function normalizeSourceName(sourceName: string) {
  return sourceName.trim().toLowerCase();
}

function normalizeOptionalNumber(value?: number | string | null) {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export async function getSourceHealthMap({
  mediaType,
  mediaId,
  seasonNumber,
  episodeNumber,
}: StreamingSourceHealthInput) {
  try {
    const season = normalizeOptionalNumber(seasonNumber);
    const episode = normalizeOptionalNumber(episodeNumber);
    const snapshot = await adminDb
      .collection("source_reports")
      .where("media_id", "==", mediaId)
      .limit(100)
      .get();

    const healthMap = new Map<string, SourceHealth>();

    snapshot.docs.forEach((doc) => {
      const report = doc.data();

      if (report.media_type !== mediaType) return;
      if (!ACTIVE_REPORT_STATUSES.has(report.status || "open")) return;

      if (mediaType === "tv") {
        const reportSeason = normalizeOptionalNumber(report.season_number);
        const reportEpisode = normalizeOptionalNumber(report.episode_number);
        if (season !== reportSeason || episode !== reportEpisode) return;
      }

      const sourceKey = normalizeSourceName(report.source_name || "");
      if (!sourceKey) return;

      const current = healthMap.get(sourceKey) || {
        reportCount: 0,
        reasons: [],
      };
      current.reportCount += 1;

      if (report.reason && !current.reasons.includes(report.reason)) {
        current.reasons.push(report.reason);
      }

      healthMap.set(sourceKey, current);
    });

    return healthMap;
  } catch (error) {
    console.warn("Could not load source report health:", error);
    return new Map<string, SourceHealth>();
  }
}

export function applySourceHealth<T extends StreamingSourceLike>(
  sources: T[],
  healthMap: Map<string, SourceHealth>
) {
  return sources
    .map((source, index) => {
      const health = healthMap.get(normalizeSourceName(source.name));

      return {
        ...source,
        healthStatus: health ? "reported" : "healthy",
        reportCount: health?.reportCount || 0,
        reportReasons: health?.reasons || [],
        healthMessage: health
          ? `${health.reportCount} active report${health.reportCount > 1 ? "s" : ""}`
          : null,
        originalOrder: index,
      };
    })
    .sort((a, b) => {
      if (a.healthStatus !== b.healthStatus) {
        return a.healthStatus === "healthy" ? -1 : 1;
      }

      return a.originalOrder - b.originalOrder;
    })
    .map(({ originalOrder, ...source }) => source);
}
