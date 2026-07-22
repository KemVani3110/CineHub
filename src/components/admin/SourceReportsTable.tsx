"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Flag, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { authenticatedFetch } from "@/lib/firebase-auth-api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 5;

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

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  ...statusOptions,
];

const mediaFilterOptions = [
  { value: "all", label: "All media" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
];

const reasonLabels: Record<string, string> = {
  wrong_title: "Wrong movie/show",
  wrong_episode: "Wrong episode",
  not_working: "Not working",
  poor_quality: "Poor quality",
  other: "Other issue",
};

const reasonFilterOptions = [
  { value: "all", label: "All reasons" },
  ...Object.entries(reasonLabels).map(([value, label]) => ({ value, label })),
];

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

function escapeCsvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: SourceReport[]) {
  const headers = [
    "id",
    "media_type",
    "media_id",
    "season_number",
    "episode_number",
    "title",
    "source_name",
    "source_url",
    "reason",
    "status",
    "notes",
    "created_at",
    "updated_at",
  ];
  const csv = [
    headers.join(","),
    ...rows.map((report) =>
      headers
        .map((key) => escapeCsvValue(report[key as keyof SourceReport]))
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SourceReportsTable({ reports: initialReports }: { reports: SourceReport[] }) {
  const [reports, setReports] = useState(initialReports);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const reasonLabel = reasonLabels[report.reason] || reasonLabels.other;
      const searchableText = [
        report.title,
        report.source_name,
        report.source_url,
        report.notes,
        report.media_id,
        reasonLabel,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      const matchesMedia =
        mediaFilter === "all" || report.media_type === mediaFilter;
      const matchesReason =
        reasonFilter === "all" || report.reason === reasonFilter;

      return matchesSearch && matchesStatus && matchesMedia && matchesReason;
    });
  }, [mediaFilter, reasonFilter, reports, searchTerm, statusFilter]);

  const visibleOpenCount = filteredReports.filter((report) => report.status === "open").length;
  const visibleReviewingCount = filteredReports.filter((report) => report.status === "reviewing").length;
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedReports = filteredReports.slice(pageStart, pageStart + PAGE_SIZE);
  const affectedSourceCount = new Set(
    filteredReports.map((report) => `${report.media_type}:${report.media_id}:${report.source_name}`)
  ).size;
  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || mediaFilter !== "all" || reasonFilter !== "all";

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMediaFilter("all");
    setReasonFilter("all");
    setCurrentPage(1);
  };

  const setFilterPage = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

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
    <>
      <div className="space-y-4 border-b border-slate-800 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              {filteredReports.length} visible
            </Badge>
            <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-300">
              {visibleOpenCount} open
            </Badge>
            <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-300">
              {visibleReviewingCount} reviewing
            </Badge>
            <span className="text-xs text-slate-500">
              {affectedSourceCount} affected sources
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="min-h-10 w-full border-slate-700 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset filters
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadCsv("cinehub-source-reports.csv", filteredReports)}
            className="min-h-10 w-full border-slate-700 text-slate-200 hover:bg-slate-800 sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(150px,190px))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title, source, URL, note..."
              className="min-h-11 border-slate-700 bg-slate-950/70 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary/40"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setFilterPage(setStatusFilter, value)}>
            <SelectTrigger className="min-h-11 border-slate-700 bg-slate-950/70 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mediaFilter} onValueChange={(value) => setFilterPage(setMediaFilter, value)}>
            <SelectTrigger className="min-h-11 border-slate-700 bg-slate-950/70 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mediaFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={reasonFilter} onValueChange={(value) => setFilterPage(setReasonFilter, value)}>
            <SelectTrigger className="min-h-11 border-slate-700 bg-slate-950/70 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reasonFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-slate-800 p-4">
            <SlidersHorizontal className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">No reports match these filters</p>
            <p className="text-sm text-slate-400">
              Try clearing search, status, media, or reason filters.
            </p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid gap-4">
        {paginatedReports.map((report) => (
          <article
            key={report.id}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-semibold text-white">
                    {report.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
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
                <Badge variant="outline" className={statusClass(report.status)}>
                  {report.status}
                </Badge>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm">
                <div className="font-medium text-slate-200">{report.source_name}</div>
                <a
                  href={report.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate text-xs text-primary hover:underline"
                  title={report.source_url}
                >
                  {report.source_url}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-200">
                  {reasonLabels[report.reason] || reasonLabels.other}
                </Badge>
                <span className="text-xs text-slate-500">
                  {format(new Date(report.created_at), "MMM d, yyyy HH:mm")}
                </span>
              </div>

              {report.notes && (
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-300">
                  {report.notes}
                </div>
              )}

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Select
                  value={report.status}
                  disabled={pendingId === report.id}
                  onValueChange={(status) => updateStatus(report.id, status)}
                >
                  <SelectTrigger className="w-full border-slate-700 text-slate-200">
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
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  <Link href={mediaHref(report)}>
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open report media</span>
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
        </>
      )}
      {filteredReports.length > PAGE_SIZE && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 p-4 sm:flex-row">
          <p className="text-sm text-slate-400">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredReports.length)} of {filteredReports.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </Button>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {currentPage}/{totalPages}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
