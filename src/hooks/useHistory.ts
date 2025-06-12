import { useEffect } from "react";
import { useHistoryStore, HistoryItem } from "@/store/historyStore";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { fetchMovieDetails, fetchTVShowDetails } from "@/services/tmdb";

export const useHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { items, addToHistory, removeFromHistory, clearHistory, getRecentHistory, setHistory } = useHistoryStore();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      
      // Lấy thông tin chi tiết từ TMDB API
      const formattedData = await Promise.all(
        data.map(async (item: any) => {
          let details;
          if (item.media_type === "movie" && item.movie_id) {
            details = await fetchMovieDetails(item.movie_id);
          } else if (item.media_type === "tv" && item.tv_id) {
            details = await fetchTVShowDetails(item.tv_id);
          }

          return {
            id: item.id,
            mediaType: item.media_type,
            movieId: item.movie_id,
            tvId: item.tv_id,
            title: details?.title || details?.name || item.title || "",
            posterPath: details?.poster_path || item.poster_path || "",
            watchedAt: item.watched_at,
            vote_average: details?.vote_average || 0,
          };
        })
      );
      
      // Check for duplicates based on id
      const uniqueData = formattedData.filter((item, index, self) => 
        index === self.findIndex((t) => t.id === item.id)
      );
      
      setHistory(uniqueData);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch watch history",
        variant: "destructive",
      });
    }
  };

  const addToWatchHistory = async (mediaType: 'movie' | 'tv', movieId: number | null, tvId: number | null, title: string, posterPath: string) => {
    try {
      // Check if item already exists in history
      const existingItem = items.find(
        (item) =>
          item.mediaType === mediaType &&
          ((mediaType === 'movie' && item.movieId === movieId) ||
           (mediaType === 'tv' && item.tvId === tvId))
      );

      const response = await fetch('/api/history', {
        method: existingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType,
          movieId,
          tvId,
          title,
          posterPath,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          // If record exists, try updating it
          const updateResponse = await fetch('/api/history', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mediaType,
              movieId,
              tvId,
              title,
              posterPath,
            }),
          });
          
          if (!updateResponse.ok) {
            throw new Error('Failed to update history');
          }
        } else {
          throw new Error(existingItem ? 'Failed to update history' : 'Failed to add to history');
        }
      }

      // Refresh history after adding/updating
      await fetchHistory();
    } catch (error) {
      console.error('Error adding to history:', error);
      toast({
        title: "Error",
        description: "Failed to update watch history",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeFromWatchHistory = async (id: number) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove from history");

      removeFromHistory(id);
      toast({
        title: "Success",
        description: "Removed from watch history",
      });
    } catch (error) {
      console.error("Error removing from history:", error);
      toast({
        title: "Error",
        description: "Failed to remove from watch history",
        variant: "destructive",
      });
    }
  };

  const clearWatchHistory = async () => {
    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to clear history");

      clearHistory();
      toast({
        title: "Success",
        description: "Watch history cleared",
      });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        title: "Error",
        description: "Failed to clear watch history",
        variant: "destructive",
      });
    }
  };

  return {
    history: items,
    addToWatchHistory,
    removeFromWatchHistory,
    clearWatchHistory,
    getRecentHistory,
  };
}; 