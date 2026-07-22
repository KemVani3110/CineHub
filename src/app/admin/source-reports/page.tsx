import { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, Flag, Gauge, ShieldAlert, type LucideIcon } from "lucide-react";
import { adminDb, toIsoString } from "@/lib/firebase-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceReport, SourceReportsTable } from "@/components/admin/SourceReportsTable";
import { Badge } from "@/components/ui/badge";
import { buildSourceHealthSummary } from "@/lib/source-health";

export const metadata: Metadata = {
  title: "Source Reports | CineHub Admin",
  description: "Review playback source reports from CineHub users",
};

export const dynamic = "force-dynamic";

function serializeReport(id: string, data: any): SourceReport {
  return {
    id,
    media_type: data.media_type === "tv" ? "tv" : "movie",
    media_id: Number(data.media_id),
    season_number: data.season_number ?? null,
    episode_number: data.episode_number ?? null,
    title: data.title || "Untitled",
    source_name: data.source_name || "Unknown source",
    source_url: data.source_url || "",
    reason: data.reason || "other",
    status: data.status || "open",
    user_id: data.user_id || null,
    notes: data.notes || "",
    created_at: toIsoString(data.created_at),
    updated_at: toIsoString(data.updated_at),
  };
}

async function getSourceReports() {
  const snapshot = await adminDb
    .collection("source_reports")
    .orderBy("created_at", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => serializeReport(doc.id, doc.data()));
}

function countByStatus(reports: SourceReport[], status: string) {
  return reports.filter((report) => report.status === status).length;
}

const reasonLabels: Record<string, string> = {
  wrong_title: "Wrong title",
  wrong_episode: "Wrong episode",
  not_working: "Not working",
  poor_quality: "Poor quality",
  other: "Other",
};

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: number;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value.toLocaleString()}</div>
        <p className="mt-2 text-xs text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default async function SourceReportsPage() {
  const reports = await getSourceReports();
  const openCount = countByStatus(reports, "open");
  const reviewingCount = countByStatus(reports, "reviewing");
  const resolvedCount = countByStatus(reports, "resolved");
  const sourceHealth = buildSourceHealthSummary(reports);
  const topProviders = sourceHealth.providers.slice(0, 5);

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <Flag className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Source Reports</h1>
            <p className="text-slate-400">
              User-reported playback issues from movie and TV watch pages.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={reports.length}
          detail="Latest 100 reports from Firestore"
          icon={Flag}
        />
        <StatCard
          title="Open"
          value={openCount}
          detail="Needs admin review"
          icon={AlertTriangle}
        />
        <StatCard
          title="Reviewing"
          value={reviewingCount}
          detail="Already being checked"
          icon={Clock}
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          detail="Fixed or source confirmed"
          icon={CheckCircle2}
        />
      </div>

      <Card className="overflow-hidden border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Gauge className="h-5 w-5 text-primary" />
                Source Health Monitor
              </CardTitle>
              <p className="mt-2 text-sm text-slate-400">
                Aggregated source reliability from active and historical reports.
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                sourceHealth.highRiskSources
                  ? "w-fit border-red-500/40 bg-red-500/10 text-red-300"
                  : "w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              }
            >
              {sourceHealth.highRiskSources
                ? `${sourceHealth.highRiskSources} high-risk source(s)`
                : "No high-risk sources"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ["Active reports", sourceHealth.activeReports, "open or reviewing"],
              ["Affected sources", sourceHealth.affectedSources, "unique provider names"],
              ["Resolved reports", sourceHealth.resolvedReports, "closed as fixed"],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{Number(value).toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-400">{detail}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {topProviders.length ? (
              topProviders.map((provider) => (
                <div
                  key={provider.sourceName}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-white">{provider.sourceName}</h3>
                        <Badge
                          variant="outline"
                          className={
                            provider.risk === "high"
                              ? "border-red-500/40 bg-red-500/10 text-red-300"
                              : provider.risk === "watch"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          }
                        >
                          {provider.risk === "high" ? (
                            <ShieldAlert className="h-3 w-3" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {provider.risk}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {provider.activeReports} active / {provider.totalReports} total reports across{" "}
                        {provider.affectedTitles} title(s)
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {provider.reasons.slice(0, 3).map((reason) => (
                        <Badge key={reason} variant="outline" className="border-slate-700 text-slate-300">
                          {reasonLabels[reason] || reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                Source health will appear after users submit reports.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Recent Source Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SourceReportsTable reports={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
