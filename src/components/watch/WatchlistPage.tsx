"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock3,
  Film,
  Grid3X3,
  Heart,
  ListFilter,
  Play,
  Search,
  Star,
  Trash2,
  Tv,
} from "lucide-react";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchMovieDetails, fetchTVShowDetails, getImageUrl } from "@/services/tmdb";
import BackToTop from "@/components/common/BackToTop";

type MediaType = "movie" | "tv";
type FilterType = "all" | MediaType;
type SortMode = "recent" | "rating" | "title" | "release";

interface WatchlistDetails {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string | null;
  rating: number;
  overview: string;
  genres: string[];
  runtimeLabel: string;
  status: string;
}

interface EnrichedWatchlistItem extends WatchlistDetails {
  addedAt: string;
}

const itemKey = (mediaType: MediaType, id: number) => `${mediaType}:${id}`;

function formatDate(date?: string | null) {
  if (!date) return "Unknown";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return format(parsed, "MMM d, yyyy");
}

function formatRuntime(minutes?: number | null) {
  if (!minutes) return "Runtime unknown";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function getStatus(releaseDate?: string | null, fallback?: string) {
  if (releaseDate && new Date(releaseDate).getTime() > Date.now()) {
    return "Upcoming";
  }
  return fallback || "Released";
}

function WatchlistSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 h-36 rounded-xl bg-slate-800/60 animate-pulse" />
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 rounded-lg bg-slate-800/50 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[420px] rounded-xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyWatchlist() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-[calc(100vh-92px)] max-w-3xl items-center justify-center px-4 py-16 text-center">
        <div>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <Heart className="h-9 w-9 text-cyan-300" />
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Your watchlist is empty</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Save movies and TV shows you want to watch later. Your newest saves will appear here with real release dates, ratings, and quick actions.
          </p>
          <Button asChild className="mt-8 bg-cyan-400 text-slate-950 hover:bg-cyan-300">
            <Link href="/explore">
              <Search className="mr-2 h-4 w-4" />
              Browse Explore
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Heart;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-cyan-300" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function WatchlistCard({
  item,
  onRemove,
}: {
  item: EnrichedWatchlistItem;
  onRemove: (item: EnrichedWatchlistItem) => void;
}) {
  const detailHref = item.mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
  const actionHref = item.mediaType === "movie" ? `/watch-movie/${item.id}` : `/tv/${item.id}`;
  const actionLabel = item.mediaType === "movie" ? "Watch" : "Episodes";
  const posterUrl = item.posterPath ? getImageUrl(item.posterPath, "w500") : "/images/no-poster.jpg";

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-950/75 shadow-lg shadow-black/20 transition-colors hover:border-cyan-400/40">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
          <Image
            src={posterUrl}
            alt={`${item.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="border border-white/10 bg-slate-950/80 text-white backdrop-blur">
              {item.mediaType === "movie" ? (
                <Film className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Tv className="mr-1.5 h-3.5 w-3.5" />
              )}
              {item.mediaType === "movie" ? "Movie" : "TV Show"}
            </Badge>
            {item.status && (
              <Badge className="border border-cyan-300/20 bg-cyan-300/15 text-cyan-100">
                {item.status}
              </Badge>
            )}
          </div>

          {item.rating > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/85 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {item.rating.toFixed(1)}
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <div>
          <Link href={detailHref} className="line-clamp-1 text-lg font-semibold text-white hover:text-cyan-200">
            {item.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(item.releaseDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {item.runtimeLabel}
            </span>
          </div>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
          {item.overview || "No overview is available yet."}
        </p>

        <div className="flex min-h-7 flex-wrap gap-2">
          {item.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="text-xs text-slate-500">Saved {formatDate(item.addedAt)}</div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button asChild className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
            <Link href={actionHref}>
              <Play className="mr-2 h-4 w-4" />
              {actionLabel}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-red-400/30 text-red-200 hover:bg-red-500/15 hover:text-red-100"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.title} from watchlist`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function WatchlistPage() {
  const { items, fetchWatchlist, removeFromWatchlist, isLoading } = useWatchlistStore();
  const { toast } = useToast();
  const [detailsByKey, setDetailsByKey] = useState<Record<string, WatchlistDetails>>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  useEffect(() => {
    const safeItems = Array.isArray(items) ? items : [];
    const missingItems = safeItems.filter((item) => !detailsByKey[itemKey(item.mediaType, item.id)]);

    if (missingItems.length === 0) return;

    let cancelled = false;
    setIsLoadingDetails(true);

    Promise.all(
      missingItems.map(async (item) => {
        try {
          if (item.mediaType === "movie") {
            const movie = await fetchMovieDetails(item.id);
            return {
              key: itemKey("movie", item.id),
              details: {
                id: item.id,
                mediaType: "movie" as const,
                title: movie.title || item.title,
                posterPath: movie.poster_path || item.posterPath,
                backdropPath: movie.backdrop_path || "",
                releaseDate: movie.release_date || null,
                rating: movie.vote_average || 0,
                overview: movie.overview || "",
                genres: Array.isArray(movie.genres) ? movie.genres.map((genre: { name: string }) => genre.name) : [],
                runtimeLabel: formatRuntime(movie.runtime),
                status: getStatus(movie.release_date, movie.status),
              },
            };
          }

          const show = await fetchTVShowDetails(item.id);
          return {
            key: itemKey("tv", item.id),
            details: {
              id: item.id,
              mediaType: "tv" as const,
              title: show.name || item.title,
              posterPath: show.poster_path || item.posterPath,
              backdropPath: show.backdrop_path || "",
              releaseDate: show.first_air_date || null,
              rating: show.vote_average || 0,
              overview: show.overview || "",
              genres: Array.isArray(show.genres) ? show.genres.map((genre: { name: string }) => genre.name) : [],
              runtimeLabel: show.number_of_seasons
                ? `${show.number_of_seasons} ${show.number_of_seasons === 1 ? "season" : "seasons"}`
                : formatRuntime(show.episode_run_time?.[0]),
              status: getStatus(show.first_air_date, show.status),
            },
          };
        } catch (error) {
          console.error(`Error loading ${item.mediaType} ${item.id}:`, error);
          return {
            key: itemKey(item.mediaType, item.id),
            details: {
              id: item.id,
              mediaType: item.mediaType,
              title: item.title,
              posterPath: item.posterPath,
              backdropPath: "",
              releaseDate: null,
              rating: 0,
              overview: "",
              genres: [],
              runtimeLabel: item.mediaType === "movie" ? "Runtime unknown" : "Seasons unknown",
              status: "Saved",
            },
          };
        }
      })
    )
      .then((results) => {
        if (cancelled) return;
        setDetailsByKey((current) => {
          const next = { ...current };
          results.forEach((result) => {
            next[result.key] = result.details;
          });
          return next;
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetails(false);
      });

    return () => {
      cancelled = true;
    };
  }, [detailsByKey, items]);

  const enrichedItems = useMemo<EnrichedWatchlistItem[]>(() => {
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.map((item) => {
      const details = detailsByKey[itemKey(item.mediaType, item.id)];
      return {
        id: item.id,
        mediaType: item.mediaType,
        title: details?.title || item.title,
        posterPath: details?.posterPath || item.posterPath,
        backdropPath: details?.backdropPath || "",
        releaseDate: details?.releaseDate || null,
        rating: details?.rating || 0,
        overview: details?.overview || "",
        genres: details?.genres || [],
        runtimeLabel: details?.runtimeLabel || (item.mediaType === "movie" ? "Runtime unknown" : "Seasons unknown"),
        status: details?.status || "Saved",
        addedAt: item.addedAt,
      };
    });
  }, [detailsByKey, items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return enrichedItems
      .filter((item) => filter === "all" || item.mediaType === filter)
      .filter((item) => {
        if (!normalizedQuery) return true;
        return item.title.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortMode === "rating") return b.rating - a.rating;
        if (sortMode === "title") return a.title.localeCompare(b.title);
        if (sortMode === "release") {
          return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
        }
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }, [enrichedItems, filter, query, sortMode]);

  const stats = useMemo(() => {
    const movies = enrichedItems.filter((item) => item.mediaType === "movie").length;
    const tvShows = enrichedItems.filter((item) => item.mediaType === "tv").length;
    const rated = enrichedItems.filter((item) => item.rating > 0);
    const average = rated.length
      ? (rated.reduce((sum, item) => sum + item.rating, 0) / rated.length).toFixed(1)
      : "0.0";

    return {
      total: enrichedItems.length,
      movies,
      tvShows,
      average,
    };
  }, [enrichedItems]);

  const handleRemove = async (item: EnrichedWatchlistItem) => {
    try {
      await removeFromWatchlist(item.id, item.mediaType);
      setDetailsByKey((current) => {
        const next = { ...current };
        delete next[itemKey(item.mediaType, item.id)];
        return next;
      });
      toast({
        title: "Removed from Watchlist",
        description: `${item.title} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && enrichedItems.length === 0) return <WatchlistSkeleton />;
  if (!isLoading && enrichedItems.length === 0) return <EmptyWatchlist />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80">
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-end lg:p-7">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                <Heart className="mr-2 h-4 w-4" />
                Personal Library
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Watchlist</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                A practical queue for saved movies and TV shows, sorted with real metadata from TMDB.
                {isLoadingDetails ? " Updating details..." : ""}
              </p>
            </div>

            <Button asChild variant="outline" className="border-cyan-300/30 text-cyan-100 hover:bg-cyan-300/10">
              <Link href="/explore">
                <Search className="mr-2 h-4 w-4" />
                Add More
              </Link>
            </Button>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Saved Titles" value={stats.total.toString()} icon={Heart} />
          <StatCard label="Movies" value={stats.movies.toString()} icon={Film} />
          <StatCard label="TV Shows" value={stats.tvShows.toString()} icon={Tv} />
          <StatCard label="Average Rating" value={stats.average} icon={Star} />
        </section>

        <section className="mb-8 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your watchlist"
                className="border-slate-700 bg-slate-900/80 pl-9 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
              {[
                { value: "all", label: "All" },
                { value: "movie", label: "Movies" },
                { value: "tv", label: "TV Shows" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value as FilterType)}
                  className={`rounded-md px-3 py-2 text-sm transition-colors ${
                    filter === option.value
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
              <ListFilter className="h-4 w-4 text-cyan-300" />
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="bg-transparent text-sm text-white outline-none"
              >
                <option className="bg-slate-950" value="recent">Recently saved</option>
                <option className="bg-slate-950" value="rating">Highest rated</option>
                <option className="bg-slate-950" value="title">Title A-Z</option>
                <option className="bg-slate-950" value="release">Newest release</option>
              </select>
            </label>
          </div>
        </section>

        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-10 text-center">
            <Grid3X3 className="mx-auto h-10 w-10 text-slate-500" />
            <h2 className="mt-4 text-xl font-semibold text-white">No titles match your filters</h2>
            <p className="mt-2 text-sm text-slate-400">Try clearing the search text or changing the media filter.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <WatchlistCard
                key={`${item.mediaType}-${item.id}-${item.addedAt}`}
                item={item}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        <BackToTop />
      </div>
    </div>
  );
}
