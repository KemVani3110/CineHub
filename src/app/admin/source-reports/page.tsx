import { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, Flag, type LucideIcon } from "lucide-react";
import { adminDb, toIsoString } from "@/lib/firebase-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceReport, SourceReportsTable } from "@/components/admin/SourceReportsTable";

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
