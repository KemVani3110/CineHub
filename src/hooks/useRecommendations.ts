import { useState, useEffect, useCallback } from "react";
import { TMDBMovie, TMDBTV, TMDBTVShow } from "@/types/tmdb";
import {
  fetchMovieDetails,
  fetchTVShowDetails,
  fetchTrendingMovies,
  fetchTrendingTVShows,
} from "@/services/tmdb";
import { useWatchlistWithUser } from "@/store/watchlistStore";
import { useHistory } from "@/hooks/useHistory";
import { useAuth } from "@/hooks/useAuth";

type MediaType = "movie" | "tv";
type RecommendationMode = "personalized" | "fallback" | "empty" | "guest";
const RECOMMENDATION_REFRESH_MS = 10 * 60 * 1000;
const AUTO_ROTATION_BONUS = 8;
const MANUAL_RANDOM_BONUS = 90;

interface Recommendation {
  movie?: TMDBMovie;
  tvShow?: TMDBTVShow;
  reason: string;
}

interface ScoredRecommendation extends Recommendation {
  mediaType: MediaType;
  id: number;
  score: number;
}

interface RefreshRecommendationsOptions {
  randomize?: boolean;
}

interface WatchlistSeed {
  id: number;
  mediaType: MediaType;
  title: string;
  addedAt: string;
}

interface HistorySeed {
  id: number;
  mediaType: MediaType;
  title: string;
  watchedAt: string;
}

const mediaKey = (mediaType: MediaType, id: number) => `${mediaType}:${id}`;

const scoreRating = (rating?: number) => (rating || 0) * 10;

const stableRotationBonus = (key: string, seed: number, maxBonus: number) => {
  let hash = 0;
  const input = `${key}:${seed}`;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 9973;
  }

  return hash % maxBonus;
};

const normalizeTVShow = (tvShow: TMDBTV): TMDBTVShow => ({
  ...tvShow,
  poster_path: tvShow.poster_path || null,
  backdrop_path: tvShow.backdrop_path || null,
}) as TMDBTVShow;

export function useRecommendations() {
  const { user } = useAuth();
  const { items: watchlistItems } = useWatchlistWithUser();
  const { history } = useHistory();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RecommendationMode>("guest");

  const fetchRecommendations = useCallback(async (options?: RefreshRecommendationsOptions) => {
    if (!user) {
      setRecommendations([]);
      setMode("guest");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const watchlistSeeds: WatchlistSeed[] = [...watchlistItems]
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          addedAt: item.addedAt,
        }));

      const historySeeds: HistorySeed[] = [...history]
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
        .slice(0, 6)
        .map((item) => ({
          id: item.mediaType === "movie" ? Number(item.movieId) : Number(item.tvId),
          mediaType: item.mediaType,
          title: item.title,
          watchedAt: item.watchedAt,
        }))
        .filter((item) => Boolean(item.id));

      const excludedKeys = new Set<string>([
        ...watchlistSeeds.map((item) => mediaKey(item.mediaType, item.id)),
        ...historySeeds.map((item) => mediaKey(item.mediaType, item.id)),
      ]);
      const rotationSeed = options?.randomize
        ? Date.now() + Math.floor(Math.random() * 1_000_000)
        : Math.floor(Date.now() / RECOMMENDATION_REFRESH_MS);
      const rotationBonus = options?.randomize
        ? MANUAL_RANDOM_BONUS
        : AUTO_ROTATION_BONUS;

      const candidateMap = new Map<string, ScoredRecommendation>();

      const addCandidate = (candidate: ScoredRecommendation) => {
        if (excludedKeys.has(mediaKey(candidate.mediaType, candidate.id))) return;

        const key = mediaKey(candidate.mediaType, candidate.id);
        const existing = candidateMap.get(key);
        const rotatedCandidate = {
          ...candidate,
          score: candidate.score + stableRotationBonus(key, rotationSeed, rotationBonus),
        };

        if (!existing || rotatedCandidate.score > existing.score) {
          candidateMap.set(key, rotatedCandidate);
        }
      };

      await Promise.all([
        ...watchlistSeeds.map(async (seed, index) => {
          try {
            if (seed.mediaType === "movie") {
              const details = await fetchMovieDetails(seed.id);
              const similarMovies = details.similar?.slice(0, 8) || [];

              similarMovies.forEach((movie: TMDBMovie) => {
                if (!movie.poster_path) return;
                addCandidate({
                  movie,
                  mediaType: "movie",
                  id: movie.id,
                  reason: `Similar to ${seed.title} in your watchlist`,
                  score: 80 - index * 2 + scoreRating(movie.vote_average),
                });
              });
            } else {
              const details = await fetchTVShowDetails(seed.id);
              const similarTVShows = details.similar?.slice(0, 8) || [];

              similarTVShows.forEach((tvShow: TMDBTV) => {
                if (!tvShow.poster_path) return;
                addCandidate({
                  tvShow: normalizeTVShow(tvShow),
                  mediaType: "tv",
                  id: tvShow.id,
                  reason: `Similar to ${seed.title} in your watchlist`,
                  score: 78 - index * 2 + scoreRating(tvShow.vote_average),
                });
              });
            }
          } catch (error) {
            console.error(`Error fetching watchlist recommendations for ${seed.title}:`, error);
          }
        }),
        ...historySeeds.map(async (seed, index) => {
          try {
            if (seed.mediaType === "movie") {
              const details = await fetchMovieDetails(seed.id);
              const similarMovies = details.similar?.slice(0, 6) || [];

              similarMovies.forEach((movie: TMDBMovie) => {
                if (!movie.poster_path) return;
                addCandidate({
                  movie,
                  mediaType: "movie",
                  id: movie.id,
                  reason: `Because you recently watched ${seed.title}`,
                  score: 62 - index * 2 + scoreRating(movie.vote_average),
                });
              });
            } else {
              const details = await fetchTVShowDetails(seed.id);
              const similarTVShows = details.similar?.slice(0, 6) || [];

              similarTVShows.forEach((tvShow: TMDBTV) => {
                if (!tvShow.poster_path) return;
                addCandidate({
                  tvShow: normalizeTVShow(tvShow),
                  mediaType: "tv",
                  id: tvShow.id,
                  reason: `Because you recently watched ${seed.title}`,
                  score: 60 - index * 2 + scoreRating(tvShow.vote_average),
                });
              });
            }
          } catch (error) {
            console.error(`Error fetching history recommendations for ${seed.title}:`, error);
          }
        }),
      ]);

      if (candidateMap.size < 8) {
        const [trendingMovies, trendingTVShows] = await Promise.all([
          fetchTrendingMovies(1),
          fetchTrendingTVShows(1),
        ]);

        trendingMovies.results?.slice(0, 10).forEach((movie) => {
          if (!movie.poster_path) return;
          addCandidate({
            movie,
            mediaType: "movie",
            id: movie.id,
            reason:
              watchlistSeeds.length || historySeeds.length
                ? "Trending now, added to round out your picks"
                : "Trending now on CineHub",
            score: 35 + scoreRating(movie.vote_average),
          });
        });

        trendingTVShows.results?.slice(0, 10).forEach((tvShow) => {
          if (!tvShow.poster_path) return;
          addCandidate({
            tvShow,
            mediaType: "tv",
            id: tvShow.id,
            reason:
              watchlistSeeds.length || historySeeds.length
                ? "Trending now, added to round out your picks"
                : "Trending now on CineHub",
            score: 34 + scoreRating(tvShow.vote_average),
          });
        });
      }

      const nextRecommendations = Array.from(candidateMap.values())
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.id - b.id;
        })
        .slice(0, 10)
        .map(({ movie, tvShow, reason }) => ({ movie, tvShow, reason }));

      setRecommendations(nextRecommendations);

      if (watchlistSeeds.length || historySeeds.length) {
        setMode(nextRecommendations.length ? "personalized" : "empty");
      } else {
        setMode(nextRecommendations.length ? "fallback" : "empty");
      }
    } catch (error) {
      console.error("Error in fetchRecommendations:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch recommendations");
    } finally {
      setIsLoading(false);
    }
  }, [history, user, watchlistItems]);

  useEffect(() => {
    setRecommendations([]);
    setError(null);
    setMode(user ? "empty" : "guest");
  }, [user?.email]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    mode,
    refreshRecommendations: fetchRecommendations,
  };
}
