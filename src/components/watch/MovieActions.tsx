import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { WatchlistButton } from "@/components/common/WatchlistButton";

interface MovieActionsProps {
  title: string;
  onShare: () => void;
  id: number;
  posterPath: string;
}

export function MovieActions({ title, onShare, id, posterPath }: MovieActionsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="outline"
        className="border-[#2e3c51] text-[#e0e6ed] hover:bg-[#1b263b] hover:border-[#4fd1c5] hover:text-[#4fd1c5] cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={onShare}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <WatchlistButton
        id={id}
        mediaType="movie"
        title={title}
        posterPath={posterPath}
      />
    </div>
  );
} 