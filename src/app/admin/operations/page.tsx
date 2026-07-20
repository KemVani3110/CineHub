import { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Flag,
  Gauge,
  Heart,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/lib/firebase-admin";
import { listAdminLogs, listAdminUsers } from "@/lib/admin-firestore";
import { APP_VERSION } from "@/lib/app-info";

export const metadata: Metadata = {
  title: "Admin Operations | CineHub",
  description: "CineHub admin operations overview",
};

export const dynamic = "force-dynamic";

type QuickAction = {
  title: string;
  detail: string;
  href: string;
  icon: typeof Users;
  tone: "primary" | "warning" | "success" | "neutral";
};

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

async function getAdminHomeData() {
  try {
    const [
      users,
      logs,
      ratingsSnapshot,
      watchlistSnapshot,
      historySnapshot,
      reviewsSnapshot,
      sourceReportsSnapshot,
      contactMessagesSnapshot,
    ] = await Promise.all([
      listAdminUsers(),
      listAdminLogs(),
      adminDb.collection("ratings").get(),
      adminDb.collection("watchlists").get(),
      adminDb.collection("watch_history").get(),
      adminDb.collection("reviews").get(),
      adminDb.collection("source_reports").get(),
      adminDb.collection("contact_messages").get(),
    ]);

    const activeUsers = users.filter((user) => user.isActive).length;
    const verifiedUsers = users.filter((user) => user.emailVerified).length;
    const openSourceReports = sourceReportsSnapshot.docs.filter(
      (doc) => (doc.data().status || "open") === "open"
    ).length;
    const reviewingSourceReports = sourceReportsSnapshot.docs.filter(
      (doc) => doc.data().status === "reviewing"
    ).length;
    const unreadMessages = contactMessagesSnapshot.docs.filter((doc) => {
      const status = doc.data().status || "new";
      return status === "new" || status === "unread" || status === "open";
    }).length;
    const ratingValues = ratingsSnapshot.docs
      .map((doc) => Number(doc.data().rating))
      .filter((rating) => !Number.isNaN(rating));
    const averageRating = ratingValues.length
      ? Number(
          (
            ratingValues.reduce((sum, rating) => sum + rating, 0) /
            ratingValues.length
          ).toFixed(1)
        )
      : 0;

    return {
      ok: true,
      users: users.length,
      activeUsers,
      verifiedUsers,
      ratings: ratingsSnapshot.size,
      reviews: reviewsSnapshot.size,
      watchlist: watchlistSnapshot.size,
      history: historySnapshot.size,
      sourceReports: sourceReportsSnapshot.size,
      openSourceReports,
      reviewingSourceReports,
      contactMessages: contactMessagesSnapshot.size,
      unreadMessages,
      averageRating,
      logs: logs.slice(0, 5),
    };
  } catch (error) {
    console.error("Admin home data error:", error);
    return {
      ok: false,
      users: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      ratings: 0,
      reviews: 0,
      watchlist: 0,
      history: 0,
      sourceReports: 0,
      openSourceReports: 0,
      reviewingSourceReports: 0,
      contactMessages: 0,
      unreadMessages: 0,
      averageRating: 0,
      logs: [],
    };
  }
}

function toneClass(tone: QuickAction["tone"]) {
  if (tone === "warning") return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  if (tone === "success") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (tone === "neutral") return "border-slate-800 bg-slate-950/75 text-slate-300";
  return "border-primary/30 bg-primary/10 text-primary";
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <Card className="border-slate-800 bg-slate-950/75 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">
              {value}
            </p>
            <p className="mt-2 text-sm leading-5 text-slate-400">{detail}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminOperationsPage() {
  const data = await getAdminHomeData();
  const unresolvedReports = data.openSourceReports + data.reviewingSourceReports;
  const engagementTotal = data.watchlist + data.history + data.ratings + data.reviews;
  const adminHealth = Math.round(
    Math.min(
      100,
      percentage(data.activeUsers, data.users) * 0.3 +
        percentage(data.verifiedUsers, data.users) * 0.25 +
        (data.averageRating ? data.averageRating * 20 * 0.2 : 0) +
        (unresolvedReports ? 15 : 25)
    )
  );

  const quickActions: QuickAction[] = [
    {
      title: "Review source reports",
      detail: `${unresolvedReports} unresolved playback issue(s)`,
      href: "/admin/source-reports",
      icon: Flag,
      tone: unresolvedReports ? "warning" : "success",
    },
    {
      title: "Read contact messages",
      detail: `${data.unreadMessages} message(s) need attention`,
      href: "/admin/contact-messages",
      icon: MessageSquare,
      tone: data.unreadMessages ? "warning" : "success",
    },
    {
      title: "Open analytics",
      detail: "View product health and engagement trends",
      href: "/admin/analytics",
      icon: BarChart3,
      tone: "primary",
    },
    {
      title: "Check settings",
      detail: "Review env readiness and deployment checklist",
      href: "/admin/settings",
      icon: Settings,
      tone: "neutral",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl md:p-7">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Gauge className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Admin Operations
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                  A focused starting point for CineHub operations: check system
                  health, fix urgent reports, review user signals, and jump into
                  the right admin workflow.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                CineHub v{APP_VERSION}
              </Badge>
              <Badge
                variant="outline"
                className={
                  data.ok
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                }
              >
                {data.ok ? "Firestore connected" : "Data fallback active"}
              </Badge>
            </div>
          </div>

          <Card className="border-primary/25 bg-primary/10 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">Admin health</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Blends user status, verification, ratings, and unresolved
                    source reports.
                  </p>
                </div>
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="mt-5 text-5xl font-bold text-white">{adminHealth}</div>
              <p className="mt-2 text-sm text-slate-400">out of 100</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Users"
          value={data.users.toLocaleString()}
          detail={`${data.activeUsers} active, ${data.verifiedUsers} verified`}
          icon={Users}
        />
        <MetricCard
          title="Engagement"
          value={engagementTotal.toLocaleString()}
          detail="Watchlist, history, ratings, and reviews"
          icon={Heart}
        />
        <MetricCard
          title="Average Rating"
          value={`${data.averageRating || 0}/5`}
          detail={`${data.ratings} rating record(s)`}
          icon={Star}
        />
        <MetricCard
          title="Open Work"
          value={(unresolvedReports + data.unreadMessages).toLocaleString()}
          detail="Source reports and contact messages"
          icon={Clock}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl ${toneClass(action.tone)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/50">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">{action.title}</h2>
                      <p className="mt-1 text-sm leading-6 opacity-80">{action.detail}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            );
          })}
        </div>

        <Card className="border-slate-800 bg-slate-950/75 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Shield className="h-5 w-5 text-primary" />
              Today priority
            </CardTitle>
            <p className="text-sm leading-6 text-slate-400">
              The practical order to review this admin area.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Resolve playback source reports first.",
              "Reply to contact messages that are still open.",
              "Check analytics for unusual engagement drops.",
              "Verify settings before each Vercel deployment.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/45 p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="border-slate-800 bg-slate-950/75 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Activity className="h-5 w-5 text-primary" />
              Recent admin activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.logs.length ? (
              data.logs.map((log: any) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/45 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-white">{log.action || "Admin action"}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                        {log.description || "No description recorded."}
                      </p>
                    </div>
                    <Badge variant="outline" className="w-fit border-slate-700 text-slate-300">
                      Log
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/45 p-8 text-center">
                <Activity className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-3 text-sm text-slate-400">No admin logs yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/75 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Content signals</CardTitle>
            <p className="text-sm leading-6 text-slate-400">
              A compact read on what users are doing across the app.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Watchlist saves", value: data.watchlist, icon: Heart },
              { label: "Watch history entries", value: data.history, icon: Clock },
              { label: "Reviews", value: data.reviews, icon: MessageSquare },
              { label: "Source reports", value: data.sourceReports, icon: Flag },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/45 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-semibold text-white">{item.value.toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/75 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Need the full dashboard?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Use Dashboard for paginated logs and Analytics for deeper product
              metrics. Admin Operations stays intentionally focused.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900">
              <Link href="/admin/dashboard">Open Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/analytics">Open Analytics</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
