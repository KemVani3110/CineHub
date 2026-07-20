import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Activity,
  Star,
  TrendingUp,
  BarChart3,
  Shield,
  Clock,
  Eye,
  Flag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Metadata } from "next";
import { DashboardPaginationComponent } from "@/components/admin/DashboardPagination";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { listAdminLogs, listAdminUsers } from "@/lib/admin-firestore";

export const metadata: Metadata = {
  title: "Admin Dashboard | CineHub",
  description: "Admin dashboard for managing users and system",
};

const DASHBOARD_ITEMS_PER_PAGE = 5;

async function getStats() {
  try {
    const [
      users,
      logs,
      ratingsSnapshot,
      watchlistSnapshot,
      sourceReportsSnapshot,
    ] = await Promise.all([
      listAdminUsers(),
      listAdminLogs(),
      adminDb.collection("ratings").get(),
      adminDb.collection("watchlists").get(),
      adminDb.collection("source_reports").get(),
    ]);

    const ratingValues = ratingsSnapshot.docs
      .map((doc) => Number(doc.data().rating))
      .filter((rating) => !Number.isNaN(rating));

    return {
      totalUsers: users.length,
      totalActivities: logs.length,
      totalRatings: ratingsSnapshot.size,
      totalWatchlist: watchlistSnapshot.size,
      totalSourceReports: sourceReportsSnapshot.size,
      openSourceReports: sourceReportsSnapshot.docs.filter(
        (doc) => (doc.data().status || "open") === "open"
      ).length,
      averageRating: ratingValues.length
        ? Number(
            (
              ratingValues.reduce((sum, rating) => sum + rating, 0) /
              ratingValues.length
            ).toFixed(1)
          )
        : 0,
    };
  } catch (error) {
    console.error("Error in getStats:", error);
    return {
      totalUsers: 0,
      totalActivities: 0,
      totalRatings: 0,
      totalWatchlist: 0,
      totalSourceReports: 0,
      openSourceReports: 0,
      averageRating: 0,
    };
  }
}

async function getUserStats() {
  try {
    const users = await listAdminUsers();
    return {
      total_users: users.length,
      active_users: users.filter((user) => user.isActive).length,
      admin_users: users.filter((user) => user.role === "admin").length,
      moderator_users: users.filter((user) => user.role === "moderator").length,
    };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return {
      total_users: 0,
      active_users: 0,
      admin_users: 0,
      moderator_users: 0,
    };
  }
}

async function getRecentActivityLogs(page: number = 1) {
  try {
    const offset = (page - 1) * DASHBOARD_ITEMS_PER_PAGE;
    const logs = await listAdminLogs();
    const total = logs.length;
    const totalPages = Math.ceil(total / DASHBOARD_ITEMS_PER_PAGE);

    return {
      logs: logs.slice(offset, offset + DASHBOARD_ITEMS_PER_PAGE),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: DASHBOARD_ITEMS_PER_PAGE,
      },
    };
  } catch (error) {
    console.error("Error in getRecentActivityLogs:", error);
    return {
      logs: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: DASHBOARD_ITEMS_PER_PAGE,
      },
    };
  }
}

async function getCurrentAdminName() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) return "Admin";

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const doc = await adminDb.collection("users").doc(decoded.uid).get();
    return doc.data()?.name || decoded.name || "Admin";
  } catch {
    return "Admin";
  }
}

function getActionBadgeVariant(action: string) {
  if (action.includes("delete")) return "destructive";
  if (action.includes("create")) return "default";
  if (action.includes("update")) return "secondary";
  return "outline";
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ activityPage?: string }>;
}) {
  const params = await searchParams;
  const activityPage = parseInt(params.activityPage || "1", 10);

  const [stats, userStats, recentLogsData, adminName] = await Promise.all([
    getStats(),
    getUserStats(),
    getRecentActivityLogs(activityPage),
    getCurrentAdminName(),
  ]);

  const activePercentage =
    userStats?.total_users > 0
      ? Math.round(
          ((userStats?.active_users || 0) / userStats.total_users) * 100
        )
      : 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
          <CardHeader className="pb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-primary/20 backdrop-blur-sm">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-bold tracking-tight text-white">
                      Admin Dashboard
                    </CardTitle>
                    <p className="text-slate-300 text-lg mt-2">
                      Welcome back,{" "}
                      <span className="font-semibold text-primary">
                        {adminName}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last updated: {format(new Date(), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                    <User className="w-4 h-4" />
                    <span>System Administrator</span>
                  </div>
                </div>
              </div>

            </div>
          </CardHeader>
        </Card>
      </div>

      {/*  Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-primary/20 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Users
            </CardTitle>
            <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-white">
              {(
                userStats?.total_users ||
                stats?.totalUsers ||
                0
              ).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">All registered users</p>
            <div className="flex items-center space-x-2">
              <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-full"></div>
              </div>
              <span className="text-xs text-primary">100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-primary/20 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Users
            </CardTitle>
            <div className="p-3 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-white">
                {(userStats?.active_users || 0).toLocaleString()}
              </div>
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30"
              >
                {activePercentage}%
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Currently active</p>
            <div className="flex items-center space-x-2">
              <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${activePercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-green-400">
                {activePercentage}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-primary/20 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Ratings
            </CardTitle>
            <div className="p-3 rounded-2xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-white">
              {stats.totalRatings.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">User ratings given</p>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-xs text-slate-400 ml-2">
                Average: {stats?.averageRating || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-primary/20 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Watchlist Items
            </CardTitle>
            <div className="p-3 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-white">
              {stats.totalWatchlist.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">Items in watchlists</p>
            <div className="flex items-center text-xs text-purple-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Movies & TV shows saved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-primary/20 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Source Reports
            </CardTitle>
            <div className="p-3 rounded-2xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <Flag className="h-6 w-6 text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-white">
                {stats.totalSourceReports.toLocaleString()}
              </div>
              <Badge
                variant="secondary"
                className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/30"
              >
                {stats.openSourceReports} open
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Playback issues reported by users</p>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer border-slate-600 text-slate-300 hover:bg-slate-700"
              asChild
            >
              <Link href="/admin/source-reports">
                <Eye className="h-4 w-4 mr-2" />
                Review Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/*  User Role Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-primary-foreground/80 text-sm font-medium">
                  Regular Users
                </p>
                <p className="text-3xl font-bold">
                  {(
                    (userStats?.total_users || 0) -
                    (userStats?.admin_users || 0) -
                    (userStats?.moderator_users || 0)
                  ).toLocaleString()}
                </p>
                <p className="text-primary-foreground/70 text-xs">
                  Standard access level
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-purple-100 text-sm font-medium">
                  Administrators
                </p>
                <p className="text-3xl font-bold">
                  {(userStats?.admin_users || 0).toLocaleString()}
                </p>
                <p className="text-purple-200 text-xs">Full system access</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-orange-100 text-sm font-medium">
                  Moderators
                </p>
                <p className="text-3xl font-bold">
                  {(userStats?.moderator_users || 0).toLocaleString()}
                </p>
                <p className="text-orange-200 text-xs">Content moderation</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/*  Recent Activity Section */}
      <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-3 text-xl text-white">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <span>Recent Admin Activity</span>
              </CardTitle>
              <p className="text-sm text-slate-400">
                Latest administrative actions and system changes (Page{" "}
                {recentLogsData.pagination.currentPage} of{" "}
                {recentLogsData.pagination.totalPages})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-slate-600 text-slate-300 hover:bg-slate-700"
                asChild
              >
                <Link href="/admin/activity-logs">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {(recentLogsData.logs as any).length === 0 ? (
            <div className="flex flex-col items-center space-y-4 py-12 text-center">
              <div className="p-4 rounded-full bg-slate-700">
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-slate-300">
                  No recent activity
                </p>
                <p className="text-sm text-slate-400">
                  Administrative actions will appear here when they occur
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {(recentLogsData.logs as any).map((log: any) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950/35 p-4 transition-colors hover:border-primary/40 hover:bg-slate-800/70"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_auto_minmax(190px,0.9fr)_minmax(260px,1.2fr)_minmax(120px,auto)] lg:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {log.admin_avatar && (
                          <AvatarImage
                            src={log.admin_avatar}
                            alt={log.admin_name || "Admin"}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {log.admin_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2) || "AD"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {log.admin_name || "Unknown Admin"}
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          {log.admin_email}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={getActionBadgeVariant(log.action)}
                      className="h-8 w-fit cursor-pointer px-3 hover:opacity-80"
                    >
                      {log.action}
                    </Badge>

                    <div className="min-w-0 rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2">
                      {log.target_user_name ? (
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-7 w-7">
                            {log.target_user_avatar && (
                              <AvatarImage
                                src={log.target_user_avatar}
                                alt={log.target_user_name || "User"}
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback className="bg-slate-600 text-slate-300 text-xs">
                              {log.target_user_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              {log.target_user_name}
                            </div>
                            <div className="truncate text-xs text-slate-400">
                              {log.target_user_email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <User className="h-4 w-4" />
                          <span>No target</span>
                        </div>
                      )}
                    </div>

                    <p className="min-w-0 text-sm leading-6 text-slate-300 lg:line-clamp-2">
                      {log.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-slate-300 lg:justify-end">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div className="leading-tight">
                        <div className="font-medium text-white">
                          {format(new Date(log.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-400">
                          {format(new Date(log.created_at), "HH:mm:ss")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <DashboardPaginationComponent
            currentPage={recentLogsData.pagination.currentPage}
            totalPages={recentLogsData.pagination.totalPages}
            totalItems={recentLogsData.pagination.totalItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}
