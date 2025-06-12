"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface WatchButtonProps {
  mediaType: "movie" | "tv";
  movieId: number | null;
  tvId: number | null;
  title: string;
  posterPath: string;
  className?: string;
  isUpcoming?: boolean;
  isDetailView?: boolean;
}

export const WatchButton = ({
  mediaType,
  movieId,
  tvId,
  title,
  posterPath,
  className,
  isUpcoming = false,
  isDetailView = false,
}: WatchButtonProps) => {
  const { addToWatchHistory } = useHistory();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  // Hide button in detail view for upcoming content
  if (isDetailView && isUpcoming) {
    return null;
  }

  const handleWatch = async () => {
    try {
      // Only add to history if user is logged in
      if (user) {
        await addToWatchHistory(
          mediaType,
          movieId,
          tvId,
          title,
          posterPath
        );
      }
      // Navigate to watch page regardless of login status
      router.push(mediaType === "movie" ? `/watch-movie/${movieId}` : `/watch-tv/${tvId}/season/1/episode/1`);
    } catch (error) {
      console.error("Error adding to history:", error);
      toast({
        title: "Error",
        description: "Failed to update watch history",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleWatch}
      className={className ? className : "flex items-center space-x-2 bg-primary hover:bg-primary/90"}
    >
      <Play className="h-5 w-5" />
      <span>Watch Now</span>
    </Button>
  );
}; 