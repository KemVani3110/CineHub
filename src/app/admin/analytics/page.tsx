import { Metadata } from "next";
import {
  Activity,
  BarChart3,
  BookmarkPlus,
  Clock,
  Heart,
  MessageSquare,
  Shield,
  Star,
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
  description: "Real Firestore analytics for CineHub admin",
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
  mediaType: string;
  count: number;
  average: number;
};

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce((acc: Record<string, number>, item) => {
    const key = getKey(item) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function toCountItems(record: Record<string, number>): CountItem[] {
  return Object.entries(record)
    .map(([label, count]) => ({ label, count }))
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

function topMediaFromDocs(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const map = new Map<string, TopMediaItem>();

  docs.forEach((doc) => {
    const data = doc.data();
    const mediaType = data.media_type || "unknown";
    const mediaId = data.movie_id || data.tv_id || data.media_id || "unknown";
    const key = data.media_key || `${mediaType}:${mediaId}`;
    const item = map.get(key) || {
      key,
      title: data.title || key,
      mediaType,
      count: 0,
    };

    item.count += 1;
    if (!item.title || item.title === key) {
      item.title = data.title || key;
    }
    map.set(key, item);
  });

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function ratingMediaFromDocs(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const map = new Map<string, { key: string; mediaType: string; count: number; total: number }>();

  docs.forEach((doc) => {
    const data = doc.data();
    const rating = Number(data.rating);
    if (Number.isNaN(rating)) return;

    const mediaType = data.media_type || "unknown";
    const mediaId = data.movie_id || data.tv_id || data.media_id || "unknown";
    const key = data.media_key || `${mediaType}:${mediaId}`;
    const item = map.get(key) || { key, mediaType, count: 0, total: 0 };

    item.count += 1;
    item.total += rating;
    map.set(key, item);
  });

  return Array.from(map.values())
    .map((item): RatingMediaItem => ({
      key: item.key,
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
  ] = await Promise.all([
    listAdminUsers(),
    listAdminLogs(),
    adminDb.collection("ratings").get(),
    adminDb.collection("reviews").get(),
    adminDb.collection("watchlists").get(),
    adminDb.collection("watch_history").get(),
    adminDb.collection("favorite_actors").get(),
    adminDb.collection("user_activity_logs").get(),
  ]);

  const ratings = ratingsSnapshot.docs.map((doc) => doc.data());
  const ratingValues = ratings
    .map((rating) => Number(rating.rating))
    .filter((rating) => !Number.isNaN(rating));
  const averageRating = ratingValues.length
    ? Number((ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(1))
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    label: `${rating} star`,
    count: ratingValues.filter((value) => value === rating).length,
  }));

  const dayLabels = lastDaysLabels(7);
  const activityDocs = [...userActivitySnapshot.docs, ...adminLogs.map((log) => ({ data: () => ({ created_at: log.created_at }) })) as any[]];
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

  return {
    totals: {
      users: users.length,
      activeUsers: users.filter((user) => user.isActive).length,
      inactiveUsers: users.filter((user) => !user.isActive).length,
      verifiedUsers: users.filter((user) => user.emailVerified).length,
      ratings: ratingsSnapshot.size,
      reviews: reviewsSnapshot.size,
      watchlistItems: watchlistsSnapshot.size,
      historyItems: historySnapshot.size,
      favoriteActors: favoriteActorsSnapshot.size,
      adminLogs: adminLogs.length,
      userActivities: userActivitySnapshot.size,
      averageRating,
    },
    usersByRole: toCountItems(countBy(users, (user) => user.role || "user")),
    usersByProvider: toCountItems(countBy(users, (user) => user.provider || "local")),
    ratingDistribution,
    activityByDay,
    topWatchlist: topMediaFromDocs(watchlistsSnapshot.docs),
    topHistory: topMediaFromDocs(historySnapshot.docs),
    topRatedMedia: ratingMediaFromDocs(ratingsSnapshot.docs),
    recentAdminLogs: adminLogs.slice(0, 6),
  };
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
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className="mt-2 text-xs text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DistributionCard({
  title,
  items,
  total,
}: {
  title: string;
  items: CountItem[];
  total: number;
}) {
  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-300">{item.label}</span>
                <span className="text-slate-400">{item.count}</span>
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
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Title</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
              <TableHead className="text-right text-slate-300">{countLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow key={item.key} className="border-slate-800">
                  <TableCell className="font-medium text-white">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">
                      {item.mediaType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-300">{item.count}</TableCell>
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
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  const totalActivities = data.totals.adminLogs + data.totals.userActivities;
  const highestDailyActivity = Math.max(...data.activityByDay.map((item) => item.count), 1);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-slate-400">Real-time Firestore metrics from the current app data.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Users"
          value={data.totals.users.toLocaleString()}
          detail={`${data.totals.activeUsers} active, ${data.totals.inactiveUsers} inactive`}
          icon={Users}
        />
        <MetricCard
          title="Engagement"
          value={totalActivities.toLocaleString()}
          detail={`${data.totals.userActivities} user events, ${data.totals.adminLogs} admin logs`}
          icon={Activity}
        />
        <MetricCard
          title="Ratings"
          value={data.totals.ratings.toLocaleString()}
          detail={`Average rating ${data.totals.averageRating || 0}/5`}
          icon={Star}
        />
        <MetricCard
          title="Reviews"
          value={data.totals.reviews.toLocaleString()}
          detail="Community reviews saved in Firestore"
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          icon={Clock}
        />
        <MetricCard
          title="Favorite Actors"
          value={data.totals.favoriteActors.toLocaleString()}
          detail="Actors saved by users"
          icon={Heart}
        />
        <MetricCard
          title="Verified Users"
          value={data.totals.verifiedUsers.toLocaleString()}
          detail={`${percentage(data.totals.verifiedUsers, data.totals.users)}% of all users`}
          icon={Shield}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DistributionCard title="Users By Role" items={data.usersByRole} total={data.totals.users} />
        <DistributionCard title="Users By Provider" items={data.usersByProvider} total={data.totals.users} />
        <DistributionCard title="Rating Distribution" items={data.ratingDistribution} total={data.totals.ratings} />
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Activity In The Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 items-end gap-3 h-48">
            {data.activityByDay.map((item) => {
              const height = Math.max(8, percentage(item.count, highestDailyActivity));
              return (
                <div key={item.label} className="flex h-full flex-col justify-end gap-2">
                  <div className="text-center text-xs text-slate-400">{item.count}</div>
                  <div
                    className="rounded-t-md bg-primary/80"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.count} activities`}
                  />
                  <div className="text-center text-xs text-slate-500">{item.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopMediaTable title="Most Saved Watchlist Items" items={data.topWatchlist} countLabel="Saves" />
        <TopMediaTable title="Most Watched Items" items={data.topHistory} countLabel="Views" />
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Most Rated Media</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Media</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-right text-slate-300">Ratings</TableHead>
                <TableHead className="text-right text-slate-300">Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topRatedMedia.length ? (
                data.topRatedMedia.map((item) => (
                  <TableRow key={item.key} className="border-slate-800">
                    <TableCell className="font-medium text-white">{item.key}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">
                        {item.mediaType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-300">{item.count}</TableCell>
                    <TableCell className="text-right text-slate-300">{item.average}/5</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
