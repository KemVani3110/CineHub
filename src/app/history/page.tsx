"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Film,
  History,
  ListFilter,
  Play,
  Search,
  Trash2,
  Tv,
} from "lucide-react";
import Header from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import { HistoryItem } from "@/store/historyStore";

const ITEMS_PER_PAGE = 12;

function getPosterUrl(path?: string) {
  return path ? `https://image.tmdb.org/t/p/w342${path}` : null;
}

function getWatchedTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isSameDay(value: string) {
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isThisWeek(value: string) {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return false;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return date >= weekAgo;
}

function getWatchPath(item: HistoryItem) {
  if (item.mediaType === "movie") return `/watch-movie/${item.movieId}`;

  const season = item.currentSeason || 1;
  const episode = item.currentEpisode || 1;
  return `/watch-tv/${item.tvId}/season/${season}/episode/${episode}`;
}

function getDetailPath(item: HistoryItem) {
  return item.mediaType === "movie"
    ? `/movie/${item.movieId}`
    : `/tv/${item.tvId}`;
}

function getEpisodeLabel(item: HistoryItem) {
  if (item.mediaType !== "tv" || !item.currentSeason || !item.currentEpisode) {
    return null;
  }

  return `S${item.currentSeason}E${item.currentEpisode}`;
}

function getActivityBucket(value: string) {
  if (isSameDay(value)) return "Today";
  if (isThisWeek(value)) return "This week";
  return "Earlier";
}

function getProgressValue(item: HistoryItem) {
  if (typeof item.progress === "number" && Number.isFinite(item.progress)) {
    return Math.min(100, Math.max(0, item.progress));
  }

  return item.mediaType === "movie" ? 12 : 18;
}

function HistoryPoster({ item, priority = false }: { item: HistoryItem; priority?: boolean }) {
  const poster = getPosterUrl(item.posterPath);

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900">
      {poster ? (
        <Image
          src={poster}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 40vw, 180px"
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-500">
          {item.mediaType === "movie" ? (
            <Film className="h-10 w-10" />
          ) : (
            <Tv className="h-10 w-10" />
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { history, removeFromWatchHistory, clearWatchHistory } = useHistory();
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title">("recent");

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading, router]);

  const sortedHistory = useMemo(() => {
    const items = [...history];

    return items.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      const aTime = new Date(a.watchedAt).getTime();
      const bTime = new Date(b.watchedAt).getTime();
      return sortBy === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [history, sortBy]);

  const filteredHistory = useMemo(
    () => {
      const normalizedQuery = query.trim().toLowerCase();

      return sortedHistory.filter((item) => {
        const matchesType = filter === "all" || item.mediaType === filter;
        const matchesQuery =
          !normalizedQuery ||
          item.title.toLowerCase().includes(normalizedQuery) ||
          getEpisodeLabel(item)?.toLowerCase().includes(normalizedQuery);

        return matchesType && matchesQuery;
      });
    },
    [filter, query, sortedHistory]
  );

  const latestItem = sortedHistory[0];
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, query, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(
    () => ({
      total: sortedHistory.length,
      movies: sortedHistory.filter((item) => item.mediaType === "movie").length,
      tv: sortedHistory.filter((item) => item.mediaType === "tv").length,
      today: sortedHistory.filter((item) => isSameDay(item.watchedAt)).length,
      thisWeek: sortedHistory.filter((item) => isThisWeek(item.watchedAt)).length,
      resumeReady: sortedHistory.filter((item) => getProgressValue(item) > 0).length,
    }),
    [sortedHistory]
  );

  const bucketCounts = useMemo(
    () =>
      filteredHistory.reduce<Record<string, number>>((acc, item) => {
        const bucket = getActivityBucket(item.watchedAt);
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
      }, {}),
    [filteredHistory]
  );

  const handleRemove = async (id?: number) => {
    if (!id) return;
    await removeFromWatchHistory(id);
  };

  const handleClear = async () => {
    await clearWatchHistory();
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-main">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-6 h-36 rounded-2xl bg-card-custom" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-2xl bg-card-custom" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8 rounded-2xl border border-custom/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-5 shadow-2xl sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
                <History className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Watch History</h1>
                <p className="mt-1 text-sm text-sub">
                  Real playback history ordered by your latest watch activity.
                </p>
              </div>
            </div>

            {stats.total > 0 && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full border-red-500/40 bg-red-500/5 text-red-300 hover:bg-red-500 hover:text-white sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            )}
          </div>

          {stats.total > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Total", value: stats.total, icon: Clock },
                { label: "Movies", value: stats.movies, icon: Film },
                { label: "TV Shows", value: stats.tv, icon: Tv },
                { label: "Today", value: stats.today, icon: Calendar },
                { label: "Last 7 Days", value: stats.thisWeek, icon: Play },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-custom/20 bg-card-custom/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-sub">
                        {item.label}
                      </span>
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {stats.total === 0 ? (
          <section className="flex flex-col items-center justify-center rounded-2xl border border-custom/30 bg-card-custom/30 px-4 py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
              <Search className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold">No Watch History Yet</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-sub">
              Start a movie or TV episode and CineHub will keep the latest
              watched title here so you can resume faster.
            </p>
            <Button
              onClick={() => router.push("/home")}
              className="mt-7 bg-accent text-slate-950 hover:bg-accent/90"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Start Watching
            </Button>
          </section>
        ) : (
          <div className="space-y-8">
            {latestItem && (
              <section className="grid gap-5 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 via-card-custom/60 to-card-custom/30 p-4 md:grid-cols-[150px_1fr] md:p-5">
                <HistoryPoster item={latestItem} priority />
                <div className="flex flex-col justify-center">
                  <Badge className="mb-3 w-fit border-accent/30 bg-accent/10 text-accent hover:bg-accent/10">
                    Continue Watching
                  </Badge>
                  <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                    {latestItem.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-sub">
                    <span className="flex items-center gap-2">
                      {latestItem.mediaType === "movie" ? (
                        <Film className="h-4 w-4 text-accent" />
                      ) : (
                        <Tv className="h-4 w-4 text-accent" />
                      )}
                      {latestItem.mediaType === "movie" ? "Movie" : "TV Show"}
                    </span>
                    {getEpisodeLabel(latestItem) && (
                      <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-accent">
                        {getEpisodeLabel(latestItem)}
                      </span>
                    )}
                    <span>{getWatchedTime(latestItem.watchedAt)}</span>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => router.push(getWatchPath(latestItem))}
                      className="bg-accent text-slate-950 hover:bg-accent/90"
                    >
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      Resume
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(getDetailPath(latestItem))}
                      className="border-slate-600 bg-slate-900/40 text-white hover:border-accent hover:text-accent"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Recently Watched</h2>
                  <p className="mt-1 text-sm text-sub">
                    Showing {filteredHistory.length} item
                    {filteredHistory.length === 1 ? "" : "s"}.
                  </p>
                </div>

                <div className="flex rounded-xl border border-custom/30 bg-card-custom/40 p-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "movie", label: "Movies" },
                    { key: "tv", label: "TV" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFilter(item.key as typeof filter)}
                      className={`min-h-10 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        filter === item.key
                          ? "bg-accent text-slate-950"
                          : "text-sub hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-custom/30 bg-card-custom/35 p-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search your watch history"
                    className="h-11 rounded-xl border-custom/40 bg-slate-950/40 pl-10 text-white"
                  />
                </label>
                <label className="relative block">
                  <ListFilter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as typeof sortBy)
                    }
                    className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-custom/40 bg-slate-950/40 px-10 text-sm font-semibold text-white outline-none transition-colors hover:border-accent/50 focus:border-accent"
                  >
                    <option value="recent">Recently watched</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Today", "This week", "Earlier"].map((bucket) => (
                  <Badge
                    key={bucket}
                    variant="outline"
                    className="min-h-8 border-custom/35 bg-card-custom/45 px-3 text-sub"
                  >
                    {bucket}: {bucketCounts[bucket] || 0}
                  </Badge>
                ))}
              </div>

              {currentItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-custom/40 bg-card-custom/25 px-4 py-12 text-center">
                  <Search className="mx-auto mb-3 h-9 w-9 text-accent" />
                  <h3 className="text-lg font-semibold text-white">
                    No matching history
                  </h3>
                  <p className="mt-2 text-sm text-sub">
                    Try another title, episode, or filter.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                {currentItems.map((item) => (
                  <article
                    key={`${item.mediaType}-${item.movieId || item.tvId}`}
                    className="group grid grid-cols-[92px_1fr] gap-4 rounded-2xl border border-custom/30 bg-card-custom/40 p-3 transition-colors hover:border-accent/40 sm:grid-cols-[112px_1fr]"
                  >
                    <HistoryPoster item={item} />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-accent/30 bg-accent/10 text-accent"
                            >
                              {item.mediaType === "movie" ? "Movie" : "TV"}
                            </Badge>
                            {getEpisodeLabel(item) && (
                              <Badge
                                variant="outline"
                                className="border-slate-600 text-slate-300"
                              >
                                {getEpisodeLabel(item)}
                              </Badge>
                            )}
                          </div>
                          <h3 className="line-clamp-2 text-base font-bold text-white sm:text-lg">
                            {item.title}
                          </h3>
                          <p className="mt-2 flex items-center gap-2 text-sm text-sub">
                            <Clock className="h-4 w-4 text-accent" />
                            {getWatchedTime(item.watchedAt)}
                          </p>
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-xs text-sub">
                              <span>Resume progress</span>
                              <span>{getProgressValue(item)}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${getProgressValue(item)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.id)}
                          className="h-9 w-9 shrink-0 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button
                          onClick={() => router.push(getWatchPath(item))}
                          className="h-10 bg-accent text-slate-950 hover:bg-accent/90"
                        >
                          <Play className="mr-2 h-4 w-4 fill-current" />
                          Resume
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push(getDetailPath(item))}
                          className="h-10 border-slate-600 bg-slate-900/40 text-white hover:border-accent hover:text-accent"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
                </div>
              )}

              {totalPages > 1 && currentItems.length > 0 && (
                <div className="flex justify-center pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
