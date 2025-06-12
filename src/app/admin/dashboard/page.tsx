import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Activity,
  Star,
  TrendingUp,
  BarChart3,
  Shield,
  Clock,
  Search,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Settings,
} from "lucide-react";
import pool from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | CineHub",
  description: "Admin dashboard for managing users and system",
};

async function getStats() {
  const connection = await pool.getConnection();
  try {
    const [users, activities, ratings, watchlist] = await Promise.all([
      connection.query("SELECT COUNT(*) as count FROM users"),
      connection.query("SELECT COUNT(*) as count FROM user_activity_logs"),
      connection.query("SELECT COUNT(*) as count FROM ratings"),
      connection.query("SELECT COUNT(*) as count FROM watchlist"),
    ]);

    return {
      totalUsers: (users as any)[0][0].count,
      totalActivities: (activities as any)[0][0].count,
      totalRatings: (ratings as any)[0][0].count,
      totalWatchlist: (watchlist as any)[0][0].count,
    };
  } catch (error) {
    console.error("Error in getStats:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function getUserStats() {
  const connection = await pool.getConnection();
  try {
    const [userStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderator_users
      FROM users
    `);

    return (userStats as any)[0];
  } catch (error) {
    console.error("Error in getUserStats:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function getRecentActivityLogs() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT 
        al.id,
        al.admin_id,
        al.action,
        al.target_user_id,
        al.description,
        al.metadata,
        al.ip_address,
        al.created_at,
        u.name as admin_name,
        u.email as admin_email,
        tu.name as target_user_name,
        tu.email as target_user_email
      FROM admin_activity_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      LEFT JOIN users tu ON al.target_user_id = tu.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    return rows;
  } catch (error) {
    console.error("Error in getRecentActivityLogs:", error);
    throw error;
  } finally {
    connection.release();
  }
}

function getActionBadgeVariant(action: string) {
  if (action.includes("delete")) return "destructive";
  if (action.includes("create")) return "default";
  if (action.includes("update")) return "secondary";
  return "outline";
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const [stats, userStats, recentLogs] = await Promise.all([
    getStats(),
    getUserStats(),
    getRecentActivityLogs(),
  ]);

  const activePercentage =
    userStats.total_users > 0
      ? Math.round((userStats.active_users / userStats.total_users) * 100)
      : 0;

  return (
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
            <CardHeader className="pb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-4xl font-bold tracking-tight">
                        Admin Dashboard
                      </CardTitle>
                      <p className="text-blue-100 text-lg mt-2">
                        Welcome back,{" "}
                        <span className="font-semibold">
                          {session?.user?.name}
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

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer backdrop-blur-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer backdrop-blur-sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/*  Main Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Users
              </CardTitle>
              <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                All registered users
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-2 flex-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-full"></div>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  100%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Active Users
              </CardTitle>
              <div className="p-3 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {userStats.active_users.toLocaleString()}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300"
                >
                  {activePercentage}%
                </Badge>
              </div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">
                Currently active
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-2 flex-1 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${activePercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {activePercentage}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Total Ratings
              </CardTitle>
              <div className="p-3 rounded-2xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                {stats.totalRatings.toLocaleString()}
              </div>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                User ratings given
              </p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-3 w-3 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-xs text-yellow-600/70 ml-2">
                  Average: 4.2
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Watchlist Items
              </CardTitle>
              <div className="p-3 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {stats.totalWatchlist.toLocaleString()}
              </div>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                Items in watchlists
              </p>
              <div className="flex items-center text-xs text-purple-600/70">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*  User Role Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-blue-100 text-sm font-medium">
                    Regular Users
                  </p>
                  <p className="text-3xl font-bold">
                    {(
                      userStats.total_users -
                      userStats.admin_users -
                      userStats.moderator_users
                    ).toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-xs">Standard access level</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-purple-100 text-sm font-medium">
                    Administrators
                  </p>
                  <p className="text-3xl font-bold">{userStats.admin_users}</p>
                  <p className="text-purple-200 text-xs">Full system access</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-orange-100 text-sm font-medium">
                    Moderators
                  </p>
                  <p className="text-3xl font-bold">
                    {userStats.moderator_users}
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
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <span>Recent Admin Activity</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest administrative actions and system changes
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    className="w-48 cursor-pointer"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-32 cursor-pointer">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">
                      Administrator
                    </TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Target User</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(recentLogs as any).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 rounded-full bg-muted">
                            <Activity className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-medium text-muted-foreground">
                              No recent activity
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Administrative actions will appear here when they
                              occur
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (recentLogs as any).map((log: any) => (
                      <TableRow
                        key={log.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {log.admin_name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2) || "AD"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {log.admin_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.admin_email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getActionBadgeVariant(log.action)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.target_user_name ? (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {log.target_user_name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">
                                  {log.target_user_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {log.target_user_email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No target
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div
                            className="text-sm truncate"
                            title={log.description}
                          >
                            {log.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {format(new Date(log.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "HH:mm:ss")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
