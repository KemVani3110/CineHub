"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Flag,
  Shield,
  FileText,
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Eye,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Report {
  id: number;
  type: "user" | "content" | "comment" | "rating";
  title: string;
  description: string;
  reportedBy: string;
  reportedUser?: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
}

interface SystemReport {
  id: number;
  name: string;
  description: string;
  category: "performance" | "security" | "usage" | "error";
  status: "scheduled" | "running" | "completed" | "failed";
  lastRun: string;
  nextRun: string;
  size?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [systemReports, setSystemReports] = useState<SystemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReports([
        {
          id: 1,
          type: "comment",
          title: "Inappropriate Comment",
          description: "User posted offensive language in movie review",
          reportedBy: "john.doe@example.com",
          reportedUser: "baduser@example.com",
          reason: "Hate Speech",
          status: "pending",
          priority: "high",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          type: "user",
          title: "Spam Account",
          description: "User creating multiple fake reviews",
          reportedBy: "admin@cinehub.com",
          reportedUser: "spammer@example.com",
          reason: "Spam",
          status: "reviewed",
          priority: "medium",
          createdAt: "2024-01-14T15:45:00Z",
          updatedAt: "2024-01-15T09:20:00Z",
          reviewedBy: "admin@cinehub.com",
        },
        {
          id: 3,
          type: "content",
          title: "Copyright Violation",
          description: "Movie content reported for copyright infringement",
          reportedBy: "legal@studio.com",
          reason: "Copyright",
          status: "resolved",
          priority: "critical",
          createdAt: "2024-01-13T08:15:00Z",
          updatedAt: "2024-01-14T16:30:00Z",
          reviewedBy: "admin@cinehub.com",
        },
        {
          id: 4,
          type: "rating",
          title: "Fake Ratings",
          description: "Suspicious rating patterns detected",
          reportedBy: "system@cinehub.com",
          reportedUser: "fakereviewer@example.com",
          reason: "Manipulation",
          status: "pending",
          priority: "medium",
          createdAt: "2024-01-12T12:00:00Z",
          updatedAt: "2024-01-12T12:00:00Z",
        },
      ]);

      setSystemReports([
        {
          id: 1,
          name: "User Activity Report",
          description: "Daily user engagement and activity metrics",
          category: "usage",
          status: "completed",
          lastRun: "2024-01-15T06:00:00Z",
          nextRun: "2024-01-16T06:00:00Z",
          size: "2.5 MB",
        },
        {
          id: 2,
          name: "Security Audit Log",
          description: "Security events and authentication logs",
          category: "security",
          status: "running",
          lastRun: "2024-01-15T12:00:00Z",
          nextRun: "2024-01-15T18:00:00Z",
          size: "15.8 MB",
        },
        {
          id: 3,
          name: "Performance Metrics",
          description: "System performance and response time analysis",
          category: "performance",
          status: "scheduled",
          lastRun: "2024-01-14T23:59:00Z",
          nextRun: "2024-01-15T23:59:00Z",
          size: "8.2 MB",
        },
        {
          id: 4,
          name: "Error Tracking Report",
          description: "Application errors and system failures",
          category: "error",
          status: "failed",
          lastRun: "2024-01-15T04:00:00Z",
          nextRun: "2024-01-15T16:00:00Z",
          size: "1.1 MB",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "dismissed":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "running":
        return <Clock className="h-4 w-4 text-blue-400 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "scheduled":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Reports & Monitoring</h1>
            <p className="text-slate-400">Manage user reports and system monitoring</p>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{reports.filter(r => r.status === "pending").length}</div>
              <p className="text-xs text-slate-400 mt-2">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">High Priority</CardTitle>
              <Flag className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{reports.filter(r => r.priority === "high" || r.priority === "critical").length}</div>
              <p className="text-xs text-slate-400 mt-2">Critical issues</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Resolved Today</CardTitle>
              <Shield className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{reports.filter(r => r.status === "resolved").length}</div>
              <p className="text-xs text-slate-400 mt-2">Successfully handled</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">System Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemReports.length}</div>
              <p className="text-xs text-slate-400 mt-2">Automated reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="user-reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="user-reports" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              User Reports
            </TabsTrigger>
            <TabsTrigger value="system-reports" className="cursor-pointer text-slate-300 data-[state=active]:bg-primary data-[state=active]:text-white">
              System Reports
            </TabsTrigger>
          </TabsList>

          {/* User Reports Tab */}
          <TabsContent value="user-reports" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all" className="cursor-pointer hover:bg-primary/10">All Status</SelectItem>
                      <SelectItem value="pending" className="cursor-pointer hover:bg-primary/10">Pending</SelectItem>
                      <SelectItem value="reviewed" className="cursor-pointer hover:bg-primary/10">Reviewed</SelectItem>
                      <SelectItem value="resolved" className="cursor-pointer hover:bg-primary/10">Resolved</SelectItem>
                      <SelectItem value="dismissed" className="cursor-pointer hover:bg-primary/10">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all" className="cursor-pointer hover:bg-primary/10">All Types</SelectItem>
                      <SelectItem value="user" className="cursor-pointer hover:bg-primary/10">User</SelectItem>
                      <SelectItem value="content" className="cursor-pointer hover:bg-primary/10">Content</SelectItem>
                      <SelectItem value="comment" className="cursor-pointer hover:bg-primary/10">Comment</SelectItem>
                      <SelectItem value="rating" className="cursor-pointer hover:bg-primary/10">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all" className="cursor-pointer hover:bg-primary/10">All Priorities</SelectItem>
                      <SelectItem value="critical" className="cursor-pointer hover:bg-primary/10">Critical</SelectItem>
                      <SelectItem value="high" className="cursor-pointer hover:bg-primary/10">High</SelectItem>
                      <SelectItem value="medium" className="cursor-pointer hover:bg-primary/10">Medium</SelectItem>
                      <SelectItem value="low" className="cursor-pointer hover:bg-primary/10">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="text-slate-300">Report</TableHead>
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Priority</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Reported By</TableHead>
                      <TableHead className="text-slate-300">Date</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} className="border-slate-700 hover:bg-slate-700/30 cursor-pointer">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{report.title}</div>
                            <div className="text-sm text-slate-400 max-w-xs truncate">{report.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                            {report.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">{report.reportedBy}</TableCell>
                        <TableCell className="text-slate-400">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer hover:bg-green-500/10 hover:text-green-400"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Reports Tab */}
          <TabsContent value="system-reports" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Automated System Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(report.status)}
                        <div>
                          <div className="font-medium text-white">{report.name}</div>
                          <div className="text-sm text-slate-400">{report.description}</div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>Last run: {new Date(report.lastRun).toLocaleString()}</span>
                            <span>Next run: {new Date(report.nextRun).toLocaleString()}</span>
                            {report.size && <span>Size: {report.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                          {report.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 