"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Flag } from "lucide-react";
import { format } from "date-fns";
import { authenticatedFetch } from "@/lib/firebase-auth-api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SourceReport = {
  id: string;
  media_type: "movie" | "tv";
  media_id: number;
  season_number: number | null;
  episode_number: number | null;
  title: string;
  source_name: string;
  source_url: string;
  reason: string;
  status: string;
  user_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const reasonLabels: Record<string, string> = {
  wrong_title: "Wrong movie/show",
  wrong_episode: "Wrong episode",
  not_working: "Not working",
  poor_quality: "Poor quality",
  other: "Other issue",
};

function statusClass(status: string) {
  if (status === "resolved") return "border-green-500/40 bg-green-500/10 text-green-300";
  if (status === "reviewing") return "border-blue-500/40 bg-blue-500/10 text-blue-300";
  if (status === "dismissed") return "border-slate-500/40 bg-slate-500/10 text-slate-300";
  return "border-red-500/40 bg-red-500/10 text-red-300";
}

function mediaHref(report: SourceReport) {
  if (report.media_type === "movie") return `/watch-movie/${report.media_id}`;
  if (report.season_number && report.episode_number) {
    return `/watch-tv/${report.media_id}/season/${report.season_number}/episode/${report.episode_number}`;
  }
  return `/tv/${report.media_id}`;
}

export function SourceReportsTable({ reports: initialReports }: { reports: SourceReport[] }) {
  const [reports, setReports] = useState(initialReports);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const updateStatus = async (reportId: string, status: string) => {
    const previousReports = reports;

    setPendingId(reportId);
    setReports((current) =>
      current.map((report) =>
        report.id === reportId
          ? { ...report, status, updated_at: new Date().toISOString() }
          : report
      )
    );

    try {
      const response = await authenticatedFetch("/api/source-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, status }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update report");
      }

      toast({
        title: "Report updated",
        description: "Source report status has been saved.",
      });
      router.refresh();
    } catch (error) {
      setReports(previousReports);
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  if (!reports.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="rounded-full bg-slate-800 p-4">
          <Flag className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-white">No source reports yet</p>
          <p className="text-sm text-slate-400">
            Reports from movie and TV players will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 bg-slate-800/80">
            <TableHead className="min-w-[260px] text-slate-300">Media</TableHead>
            <TableHead className="min-w-[140px] text-slate-300">Source</TableHead>
            <TableHead className="min-w-[170px] text-slate-300">Reason</TableHead>
            <TableHead className="min-w-[160px] text-slate-300">Status</TableHead>
            <TableHead className="min-w-[160px] text-slate-300">Reported</TableHead>
            <TableHead className="min-w-[110px] text-right text-slate-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-white">{report.title}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">
                      {report.media_type}
                    </Badge>
                    <span>ID {report.media_id}</span>
                    {report.media_type === "tv" && report.season_number && report.episode_number && (
                      <span>
                        S{report.season_number}E{report.episode_number}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-slate-200">{report.source_name}</div>
                  <a
                    href={report.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block max-w-[220px] truncate text-xs text-primary hover:underline"
                    title={report.source_url}
                  >
                    {report.source_url}
                  </a>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-200">
                  {reasonLabels[report.reason] || reasonLabels.other}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusClass(report.status)}>
                    {report.status}
                  </Badge>
                  <Select
                    value={report.status}
                    disabled={pendingId === report.id}
                    onValueChange={(status) => updateStatus(report.id, status)}
                  >
                    <SelectTrigger className="h-8 w-[118px] border-slate-700 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-slate-200">
                  {format(new Date(report.created_at), "MMM d, yyyy")}
                </div>
                <div className="text-xs text-slate-500">
                  {format(new Date(report.created_at), "HH:mm")}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  <Link href={mediaHref(report)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
