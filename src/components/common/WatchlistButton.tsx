import { Button } from "@/components/ui/button";
import { useWatchlistStore } from "@/store/watchlistStore";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface WatchlistButtonProps {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
}

export function WatchlistButton({ id, mediaType, title, posterPath }: WatchlistButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoading, resetWatchlist, fetchWatchlist } = useWatchlistStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  // Handle user state changes
  useEffect(() => {
    if (user) {
      // Fetch watchlist when user logs in
      fetchWatchlist();
    } else {
      // Reset watchlist when user logs out
      resetWatchlist();
    }
  }, [user, fetchWatchlist, resetWatchlist]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your watchlist",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      if (isInWatchlist(id, mediaType)) {
        await removeFromWatchlist(id, mediaType);
        toast({
          title: "Removed from Watchlist",
          description: `${title} has been removed from your watchlist.`,
          variant: "default",
        });
      } else {
        await addToWatchlist({ id, mediaType, title, posterPath });
        toast({
          title: "Added to Watchlist",
          description: `${title} has been added to your watchlist.`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleWatchlistToggle}
      disabled={isLoading}
      variant="outline"
      size="default"
      className="border-[#2e3c51] text-[#e0e6ed] hover:bg-[#1b263b] hover:border-[#4fd1c5] hover:text-[#4fd1c5] px-4 sm:px-6 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 flex-1 sm:flex-none"
    >
      {isInWatchlist(id, mediaType) ? (
        <>
          <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">In Watchlist</span>
        </>
      ) : (
        <>
          <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add to Watchlist</span>
        </>
      )}
    </Button>
  );
} 