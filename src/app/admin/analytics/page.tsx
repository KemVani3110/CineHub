"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Calendar,
  Activity,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Film,
  Tv,
  UserPlus,
  Clock,
} from "lucide-react";

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  content: {
    totalMovies: number;
    totalTVShows: number;
    totalViews: number;
    totalRatings: number;
  };
  activity: {
    dailyActiveUsers: number;
    avgSessionTime: number;
    topGenres: Array<{ name: string; count: number; percentage: number }>;
    recentActivities: Array<{
      id: number;
      user: string;
      action: string;
      timestamp: string;
    }>;
  };
  engagement: {
    totalWatchlist: number;
    totalFavorites: number;
    avgRating: number;
    totalComments: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData({
        users: {
          total: 12450,
          active: 8230,
          newThisMonth: 892,
          growth: 12.5,
        },
        content: {
          totalMovies: 15420,
          totalTVShows: 8950,
          totalViews: 245680,
          totalRatings: 89430,
        },
        activity: {
          dailyActiveUsers: 3420,
          avgSessionTime: 24,
          topGenres: [
            { name: "Action", count: 4520, percentage: 28 },
            { name: "Drama", count: 3890, percentage: 24 },
            { name: "Comedy", count: 3210, percentage: 20 },
            { name: "Thriller", count: 2340, percentage: 15 },
            { name: "Horror", count: 2040, percentage: 13 },
          ],
          recentActivities: [
            { id: 1, user: "John Doe", action: "Added movie to watchlist", timestamp: "2 minutes ago" },
            { id: 2, user: "Jane Smith", action: "Rated a movie 5 stars", timestamp: "5 minutes ago" },
            { id: 3, user: "Mike Johnson", action: "Left a review", timestamp: "8 minutes ago" },
            { id: 4, user: "Sarah Wilson", action: "Started watching TV show", timestamp: "12 minutes ago" },
            { id: 5, user: "Tom Brown", action: "Updated profile", timestamp: "15 minutes ago" },
          ],
        },
        engagement: {
          totalWatchlist: 45230,
          totalFavorites: 23890,
          avgRating: 4.2,
          totalComments: 12340,
        },
      });
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">Comprehensive insights into your platform performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-slate-800 border-slate-700">
            <TabsTrigger value="1d" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              1 Day
            </TabsTrigger>
            <TabsTrigger value="7d" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              7 Days
            </TabsTrigger>
            <TabsTrigger value="30d" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              30 Days
            </TabsTrigger>
            <TabsTrigger value="90d" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              90 Days
            </TabsTrigger>
          </TabsList>

          <TabsContent value={timeRange} className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{data?.users.total.toLocaleString()}</div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+{data?.users.growth}%</span>
                    <span className="text-xs text-slate-400 ml-2">from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{data?.users.active.toLocaleString()}</div>
                  <div className="flex items-center mt-2">
                    <Progress value={66} className="flex-1 mr-2" />
                    <span className="text-xs text-slate-400">66% active</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{data?.content.totalViews.toLocaleString()}</div>
                  <div className="flex items-center mt-2">
                    <Clock className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-slate-400">Avg {data?.activity.avgSessionTime}m session</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{data?.engagement.avgRating}/5.0</div>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-slate-400">{data?.content.totalRatings.toLocaleString()} total ratings</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content & Engagement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Content Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <Film className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{data?.content.totalMovies.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">Movies</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <Tv className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{data?.content.totalTVShows.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">TV Shows</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{data?.engagement.totalFavorites.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">Favorites</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{data?.engagement.totalWatchlist.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">Watchlist Items</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Top Genres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.activity.topGenres.map((genre, index) => (
                      <div key={genre.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 font-medium">{genre.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">{genre.count.toLocaleString()}</span>
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                              {genre.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={genre.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Activity Chart */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  User Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Activity Chart */}
                  <div className="w-full h-64 p-4">
                    <div className="grid grid-cols-7 gap-3 h-full">
                      {[
                        { day: 'Mon', value: 85, label: '1.2k' },
                        { day: 'Tue', value: 72, label: '980' },
                        { day: 'Wed', value: 95, label: '1.4k' },
                        { day: 'Thu', value: 68, label: '890' },
                        { day: 'Fri', value: 88, label: '1.3k' },
                        { day: 'Sat', value: 92, label: '1.5k' },
                        { day: 'Sun', value: 78, label: '1.1k' },
                      ].map((item, index) => (
                        <div key={item.day} className="flex flex-col items-center h-full">
                          <div className="flex flex-col justify-end h-48 w-full mb-2">
                            <div className="relative group cursor-pointer w-full">
                              <div 
                                className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-md transition-all duration-300 hover:from-primary hover:to-primary/90 hover:scale-105 min-h-[8px]"
                                style={{ height: `${(item.value / 100) * 192}px` }}
                              ></div>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                {item.label} users
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center mb-2">
                        <UserPlus className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-slate-300 font-medium">New Users</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {data?.users.newThisMonth.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">This month</div>
                    </div>

                    <div className="text-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm text-slate-300 font-medium">Daily Active</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {data?.activity.dailyActiveUsers.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">Today</div>
                    </div>

                    <div className="text-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm text-slate-300 font-medium">Avg Session</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {data?.activity.avgSessionTime}m
                      </div>
                      <div className="text-xs text-slate-400">Duration</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 