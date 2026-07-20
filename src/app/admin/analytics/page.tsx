import { Metadata } from "next";
import {
  AlertTriangle,
  BarChart3,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Heart,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminDb, toIsoString } from "@/lib/firebase-admin";
import { listAdminLogs, listAdminUsers } from "@/lib/admin-firestore";

export const metadata: Metadata = {
  title: "Admin Analytics | CineHub",
  description:
    "Operational analytics for CineHub users, engagement, source reports, and content signals.",
};

type CountItem = {
  label: string;
  count: number;
};

type TopMediaItem = {
  key: string;
  title: string;
  mediaType: string;
  count: number;
};

type RatingMediaItem = {
  key: string;
  title: string;
  mediaType: string;
  count: number;
  average: number;
};

type ActionItem = {
  title: string;
  value: number;
  detail: string;
  tone: "danger" | "warning" | "success" | "neutral";
};

const sourceStatusLabels: Record<string, string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const sourceReasonLabels: Record<string, string> = {
  wrong_title: "Wrong title",
  wrong_episode: "Wrong episode",
  not_working: "Not working",
  poor_quality: "Poor quality",
  other: "Other",
};

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce((acc: Record<string, number>, item) => {
    const key = getKey(item) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function toCountItems(record: Record<string, number>, labels?: Record<string, string>): CountItem[] {
  return Object.entries(record)
    .map(([label, count]) => ({ label: labels?.[label] || label, count }))
    .sort((a, b) => b.count - a.count);
}

function timestampToDate(value: any) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(toIsoString(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function lastDaysLabels(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    return date.toISOString().slice(0, 10);
  });
}

function mediaTitle(data: FirebaseFirestore.DocumentData, fallback: string) {
  return data.title || data.name || data.media_title || fallback;
}

function topMediaFromDocs(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const map = new Map<string, TopMediaItem>();

  docs.forEach((doc) => {
    const data = doc.data();
    const mediaType = data.media_type || data.mediaType || "unknown";
    const mediaId = data.movie_id || data.tv_id || data.media_id || data.mediaId || "unknown";
    const key = data.media_key || `${mediaType}:${mediaId}`;
    const item = map.get(key) || {
      key,
      title: mediaTitle(data, key),
      mediaType,
      count: 0,
    };

    item.count += 1;
    if (!item.title || item.title === key) {
      item.title = mediaTitle(data, key);
    }
    map.set(key, item);
  });

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function ratingMediaFromDocs(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const map = new Map<
    string,
    { key: string; title: string; mediaType: string; count: number; total: number }
  >();

  docs.forEach((doc) => {
    const data = doc.data();
    const rating = Number(data.rating);
    if (Number.isNaN(rating)) return;

    const mediaType = data.media_type || data.mediaType || "unknown";
    const mediaId = data.movie_id || data.tv_id || data.media_id || data.mediaId || "unknown";
    const key = data.media_key || `${mediaType}:${mediaId}`;
    const item = map.get(key) || {
      key,
      title: mediaTitle(data, key),
      mediaType,
      count: 0,
      total: 0,
    };

    item.count += 1;
    item.total += rating;
    if (!item.title || item.title === key) {
      item.title = mediaTitle(data, key);
    }
    map.set(key, item);
  });

  return Array.from(map.values())
    .map((item): RatingMediaItem => ({
      key: item.key,
      title: item.title,
      mediaType: item.mediaType,
      count: item.count,
      average: Number((item.total / item.count).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count || b.average - a.average)
    .slice(0, 8);
}

async function getAnalyticsData() {
  const [
    users,
    adminLogs,
    ratingsSnapshot,
    reviewsSnapshot,
    watchlistsSnapshot,
    historySnapshot,
    favoriteActorsSnapshot,
    userActivitySnapshot,
    sourceReportsSnapshot,
  ] = await Promise.all([
    listAdminUsers(),
    listAdminLogs(),
    adminDb.collection("ratings").get(),
    adminDb.collection("reviews").get(),
    adminDb.collection("watchlists").get(),
    adminDb.collection("watch_history").get(),
    adminDb.collection("favorite_actors").get(),
    adminDb.collection("user_activity_logs").get(),
    adminDb.collection("source_reports").get(),
  ]);

  const sourceReports = sourceReportsSnapshot.docs.map((doc) => doc.data());
  const ratings = ratingsSnapshot.docs.map((doc) => doc.data());
  const ratingValues = ratings
    .map((rating) => Number(rating.rating))
    .filter((rating) => !Number.isNaN(rating));
  const averageRating = ratingValues.length
    ? Number((ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(1))
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    label: `${rating} star`,
    count: ratingValues.filter((value) => Math.round(value) === rating).length,
  }));

  const dayLabels = lastDaysLabels(7);
  const activityDocs: Array<{ data: () => any }> = [
    ...userActivitySnapshot.docs,
    ...adminLogs.map((log) => ({ data: () => ({ created_at: log.created_at }) })),
  ];
  const activityByDay = dayLabels.map((day) => {
    const count = activityDocs.filter((doc) => {
      const data = doc.data();
      const date = timestampToDate(data.timestamp || data.created_at);
      return date?.toISOString().slice(0, 10) === day;
    }).length;

    return {
      label: day.slice(5),
      count,
    };
  });

  const openSourceReports = sourceReports.filter(
    (report) => (report.status || "open") === "open"
  ).length;
  const reviewingSourceReports = sourceReports.filter(
    (report) => report.status === "reviewing"
  ).length;
  const unresolvedSourceReports = openSourceReports + reviewingSourceReports;
  const activeUsers = users.filter((user) => user.isActive).length;
  const verifiedUsers = users.filter((user) => user.emailVerified).length;
  const totalActivities = userActivitySnapshot.size + adminLogs.length;
  const totalSavedContent =
    watchlistsSnapshot.size + historySnapshot.size + favoriteActorsSnapshot.size;
  const engagementPerUser = users.length
    ? Number((totalActivities / users.length).toFixed(1))
    : 0;
  const sourceHealthScore = clamp(
    100 - percentage(unresolvedSourceReports, Math.max(sourceReportsSnapshot.size, 1)) * 0.6,
    0,
    100
  );
  const productHealthScore = Math.round(
    clamp(
      sourceHealthScore * 0.45 +
        percentage(activeUsers, users.length) * 0.25 +
        percentage(verifiedUsers, users.length) * 0.2 +
        (averageRating ? averageRating * 20 * 0.1 : 0),
      0,
      100
    )
  );

  const actionQueue: ActionItem[] = [
    {
      title: "Open source reports",
      value: openSourceReports,
      detail: "Prioritize sources users cannot trust yet.",
      tone: openSourceReports ? "danger" : "success",
    },
    {
      title: "Reports in review",
      value: reviewingSourceReports,
      detail: "Keep these moving toward resolved or dismissed.",
      tone: reviewingSourceReports ? "warning" : "neutral",
    },
    {
      title: "Inactive users",
      value: users.length - activeUsers,
      detail: "Accounts that may need cleanup or follow-up.",
      tone: users.length - activeUsers ? "warning" : "success",
    },
    {
      title: "Unverified users",
      value: users.length - verifiedUsers,
      detail: "Auth quality signal for production readiness.",
      tone: users.length - verifiedUsers ? "warning" : "success",
    },
  ];

  return {
    totals: {
      users: users.length,
      activeUsers,
      inactiveUsers: users.length - activeUsers,
      verifiedUsers,
      ratings: ratingsSnapshot.size,
      reviews: reviewsSnapshot.size,
      watchlistItems: watchlistsSnapshot.size,
      historyItems: historySnapshot.size,
      favoriteActors: favoriteActorsSnapshot.size,
      adminLogs: adminLogs.length,
      userActivities: userActivitySnapshot.size,
      sourceReports: sourceReportsSnapshot.size,
      openSourceReports,
      reviewingSourceReports,
      unresolvedSourceReports,
      averageRating,
      engagementPerUser,
      totalActivities,
      totalSavedContent,
      productHealthScore,
    },
    actionQueue,
    usersByRole: toCountItems(countBy(users, (user) => user.role || "user")),
    usersByProvider: toCountItems(countBy(users, (user) => user.provider || "local")),
    sourceReportsByStatus: toCountItems(
      countBy(sourceReports, (report) => report.status || "open"),
      sourceStatusLabels
    ),
    sourceReportsByReason: toCountItems(
      countBy(sourceReports, (report) => report.reason || "other"),
      sourceReasonLabels
    ),
    ratingDistribution,
    activityByDay,
    topWatchlist: topMediaFromDocs(watchlistsSnapshot.docs),
    topHistory: topMediaFromDocs(historySnapshot.docs),
    topRatedMedia: ratingMediaFromDocs(ratingsSnapshot.docs),
    recentAdminLogs: adminLogs.slice(0, 5),
  };
}

function toneClasses(tone: ActionItem["tone"]) {
  if (tone === "danger") return "border-red-500/35 bg-red-500/10 text-red-200";
  if (tone === "warning") return "border-amber-500/35 bg-amber-500/10 text-amber-200";
  if (tone === "success") return "border-emerald-500/35 bg-emerald-500/10 text-emerald-200";
  return "border-slate-700 bg-slate-900/70 text-slate-300";
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  tone?: "primary" | "amber" | "emerald" | "rose";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-500/10 text-amber-300"
      : tone === "emerald"
        ? "bg-emerald-500/10 text-emerald-300"
        : tone === "rose"
          ? "bg-rose-500/10 text-rose-300"
          : "bg-primary/10 text-primary";

  return (
    <Card className="min-h-[150px] border-slate-800 bg-slate-950/75 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        <p className="mt-2 text-sm leading-5 text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DistributionCard({
  title,
  items,
  total,
  detail,
}: {
  title: string;
  items: CountItem[];
  total: number;
  detail?: string;
}) {
  return (
    <Card className="border-slate-800 bg-slate-950/75 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white">{title}</CardTitle>
        {detail && <p className="text-sm text-slate-400">{detail}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate capitalize text-slate-300">{item.label}</span>
                <span className="font-medium text-slate-100">{item.count}</span>
              </div>
              <Progress value={percentage(item.count, total)} className="h-2 bg-slate-800" />
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No data yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityChart({ items }: { items: CountItem[] }) {
  const highestDailyActivity = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card className="border-slate-800 bg-slate-950/75 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base text-white">7-day activity</CardTitle>
            <p className="mt-1 text-sm text-slate-400">
              User and admin events grouped by day.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            Live Firestore
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid h-56 grid-cols-7 items-end gap-2 sm:gap-4">
          {items.map((item) => {
            const height = Math.max(7, percentage(item.count, highestDailyActivity));
            return (
              <div key={item.label} className="flex h-full flex-col justify-end gap-2">
                <div className="text-center text-xs font-medium text-slate-300">{item.count}</div>
                <div className="flex flex-1 items-end rounded-t-lg bg-slate-900">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-cyan-300"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.count} activities`}
                  />
                </div>
                <div className="text-center text-[11px] text-slate-500 sm:text-xs">{item.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TopMediaTable({
  title,
  items,
  countLabel,
}: {
  title: string;
  items: TopMediaItem[];
  countLabel: string;
}) {
  return (
    <Card className="border-slate-800 bg-slate-950/75 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="min-w-[220px] text-slate-400">Title</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-right text-slate-400">{countLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length ? (
                items.map((item) => (
                  <TableRow key={item.key} className="border-slate-900">
                    <TableCell className="max-w-[260px] truncate font-medium text-white">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-slate-700 text-slate-300">
                        {item.mediaType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-200">
                      {item.count}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-slate-400">
                    No data yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function RatedMediaTable({ items }: { items: RatingMediaItem[] }) {
  return (
    <Card className="border-slate-800 bg-slate-950/75 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white">Most rated media</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="min-w-[220px] text-slate-400">Media</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-right text-slate-400">Ratings</TableHead>
                <TableHead className="text-right text-slate-400">Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length ? (
                items.map((item) => (
                  <TableRow key={item.key} className="border-slate-900">
                    <TableCell className="max-w-[260px] truncate font-medium text-white">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-slate-700 text-slate-300">
                        {item.mediaType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-200">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-200">
                      {item.average}/5
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-slate-400">
                    No ratings yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl md:p-7">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Analytics
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                  A cleaner operations view for users, engagement, content demand,
                  ratings, and playback source health.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Users</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {data.totals.users.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {percentage(data.totals.activeUsers, data.totals.users)}% active
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Engagement</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {data.totals.totalActivities.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {data.totals.engagementPerUser} events per user
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Saved content</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {data.totals.totalSavedContent.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  watchlist, history, favorite actors
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Product health</p>
                <p className="mt-1 text-sm text-slate-300">
                  Based on auth quality, activity, ratings, and unresolved source reports.
                </p>
              </div>
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-bold tracking-tight text-white">
                {data.totals.productHealthScore}
              </span>
              <span className="pb-2 text-sm font-medium text-slate-400">/100</span>
            </div>
            <Progress value={data.totals.productHealthScore} className="mt-4 h-3 bg-slate-800" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Source Reports"
          value={data.totals.sourceReports.toLocaleString()}
          detail={`${data.totals.unresolvedSourceReports} unresolved reports need attention`}
          icon={Flag}
          tone={data.totals.unresolvedSourceReports ? "rose" : "emerald"}
        />
        <MetricCard
          title="Ratings"
          value={data.totals.ratings.toLocaleString()}
          detail={`Average score ${data.totals.averageRating || 0}/5`}
          icon={Star}
          tone="amber"
        />
        <MetricCard
          title="Reviews"
          value={data.totals.reviews.toLocaleString()}
          detail="Community reviews saved in Firestore"
          icon={MessageSquare}
        />
        <MetricCard
          title="Verified Users"
          value={data.totals.verifiedUsers.toLocaleString()}
          detail={`${percentage(data.totals.verifiedUsers, data.totals.users)}% of all users`}
          icon={Shield}
          tone="emerald"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="border-slate-800 bg-slate-950/75 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <AlertTriangle className="h-5 w-5 text-amber-300" />
              Action queue
            </CardTitle>
            <p className="text-sm text-slate-400">
              The work list an admin should check first.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.actionQueue.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border p-4 ${toneClasses(item.tone)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 opacity-80">{item.detail}</p>
                  </div>
                  <span className="text-2xl font-bold text-white">{item.value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <ActivityChart items={data.activityByDay} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <DistributionCard
          title="Users by role"
          items={data.usersByRole}
          total={data.totals.users}
          detail="Admin/user split from Firestore users."
        />
        <DistributionCard
          title="Auth providers"
          items={data.usersByProvider}
          total={data.totals.users}
          detail="How users sign in to CineHub."
        />
        <DistributionCard
          title="Rating spread"
          items={data.ratingDistribution}
          total={data.totals.ratings}
          detail="Distribution of saved user ratings."
        />
        <DistributionCard
          title="Source report status"
          items={data.sourceReportsByStatus}
          total={data.totals.sourceReports}
          detail="Playback issue triage state."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <TopMediaTable
            title="Most saved watchlist items"
            items={data.topWatchlist}
            countLabel="Saves"
          />
          <TopMediaTable
            title="Most watched items"
            items={data.topHistory}
            countLabel="Views"
          />
        </div>

        <DistributionCard
          title="Report reasons"
          items={data.sourceReportsByReason}
          total={data.totals.sourceReports}
          detail="Why users report a playback source."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <RatedMediaTable items={data.topRatedMedia} />

        <Card className="border-slate-800 bg-slate-950/75 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Recent admin activity</CardTitle>
            <p className="text-sm text-slate-400">
              Latest moderation or admin-side changes.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentAdminLogs.length ? (
              data.recentAdminLogs.map((log: any) => (
                <div
                  key={log.id || `${log.action}-${log.created_at}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{log.action || "Admin action"}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {log.details || log.description || "No extra detail recorded."}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                      <Clock className="h-3 w-3" />
                      Log
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
                <p className="mt-3 text-sm text-slate-400">No admin logs yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <MetricCard
          title="Watchlist Items"
          value={data.totals.watchlistItems.toLocaleString()}
          detail="Movies and TV shows saved by users"
          icon={BookmarkPlus}
        />
        <MetricCard
          title="Watch History"
          value={data.totals.historyItems.toLocaleString()}
          detail="Media entries watched by users"
          icon={Eye}
        />
        <MetricCard
          title="Favorite Actors"
          value={data.totals.favoriteActors.toLocaleString()}
          detail="Actors saved by users"
          icon={Heart}
          tone="emerald"
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/75 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Analytics reading guide</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Treat this page as an operations dashboard: fix open source reports first,
              watch the provider/verification split, and use top content lists to decide
              what to polish next.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
            <TrendingUp className="h-3 w-3" />
            Production focused
          </Badge>
        </div>
      </section>
    </div>
  );
}
