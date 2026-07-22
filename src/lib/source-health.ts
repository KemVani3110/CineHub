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

export interface SourceHealthProviderSummary {
  sourceName: string;
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  affectedTitles: number;
  reasons: string[];
  risk: "healthy" | "watch" | "high";
}

export interface SourceHealthSummary {
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  affectedSources: number;
  highRiskSources: number;
  providers: SourceHealthProviderSummary[];
  reasons: Array<{ reason: string; count: number }>;
}

type InternalSourceHealthProviderSummary = SourceHealthProviderSummary & {
  titleKeys: Set<string>;
};

type StreamingSourceLike = {
  name: string;
  [key: string]: unknown;
};

const ACTIVE_REPORT_STATUSES = new Set(["open", "reviewing"]);

function normalizeSourceName(sourceName: string) {
  return sourceName.trim().toLowerCase();
}

function displaySourceName(sourceName: string) {
  return sourceName.trim() || "Unknown source";
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
        healthRisk: health
          ? health.reportCount >= 2 || health.reasons.some((reason) => reason === "wrong_title" || reason === "wrong_episode")
            ? "high"
            : "watch"
          : "healthy",
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

export function buildSourceHealthSummary(reports: any[]): SourceHealthSummary {
  const providerMap = new Map<string, InternalSourceHealthProviderSummary>();
  const reasonMap = new Map<string, number>();

  reports.forEach((report) => {
    const sourceName = displaySourceName(report.source_name || report.sourceName || "");
    const sourceKey = normalizeSourceName(sourceName);
    const status = report.status || "open";
    const reason = report.reason || "other";
    const isActive = ACTIVE_REPORT_STATUSES.has(status);
    const titleKey = [
      report.media_type || report.mediaType || "movie",
      report.media_id || report.mediaId || "unknown",
      report.season_number || report.seasonNumber || "",
      report.episode_number || report.episodeNumber || "",
    ].join(":");

    const current: InternalSourceHealthProviderSummary = providerMap.get(sourceKey) || {
      sourceName,
      totalReports: 0,
      activeReports: 0,
      resolvedReports: 0,
      affectedTitles: 0,
      reasons: [],
      risk: "healthy" as const,
      titleKeys: new Set<string>(),
    };

    current.totalReports += 1;
    if (isActive) current.activeReports += 1;
    if (status === "resolved") current.resolvedReports += 1;
    current.titleKeys.add(titleKey);
    if (reason && !current.reasons.includes(reason)) current.reasons.push(reason);

    providerMap.set(sourceKey, current);
    reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
  });

  const providers = Array.from(providerMap.values())
    .map((provider) => {
      const risk: SourceHealthProviderSummary["risk"] =
        provider.activeReports >= 3 ||
        provider.reasons.some((reason) => reason === "wrong_title" || reason === "wrong_episode")
          ? "high"
          : provider.activeReports > 0
            ? "watch"
            : "healthy";

      return {
        sourceName: provider.sourceName,
        totalReports: provider.totalReports,
        activeReports: provider.activeReports,
        resolvedReports: provider.resolvedReports,
        affectedTitles: provider.titleKeys.size,
        reasons: provider.reasons,
        risk,
      };
    })
    .sort((a, b) => {
      if (b.activeReports !== a.activeReports) return b.activeReports - a.activeReports;
      return b.totalReports - a.totalReports;
    });

  const activeReports = reports.filter((report) =>
    ACTIVE_REPORT_STATUSES.has(report.status || "open")
  ).length;

  return {
    totalReports: reports.length,
    activeReports,
    resolvedReports: reports.filter((report) => report.status === "resolved").length,
    affectedSources: providers.length,
    highRiskSources: providers.filter((provider) => provider.risk === "high").length,
    providers,
    reasons: Array.from(reasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
  };
}
