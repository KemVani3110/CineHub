"use client";

import { useState } from "react";
import { Play, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { selectBestTrailer } from "@/lib/trailer-utils";
import { TMDBVideos } from "@/types/tmdb";

interface TrailerActionButtonProps {
  videos?: TMDBVideos | null;
  title: string;
  className?: string;
}

export function TrailerActionButton({
  videos,
  title,
  className,
}: TrailerActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const trailer = selectBestTrailer(videos);

  if (!trailer) {
    return (
      <Button
        disabled
        className={cn(
          "flex h-14 w-full items-center justify-center rounded-full px-6 text-base font-bold sm:w-[210px]",
          "border border-slate-600 bg-slate-900/40 text-slate-500",
          "disabled:cursor-not-allowed disabled:opacity-70",
          className
        )}
      >
        <Video className="mr-2 h-5 w-5" />
        <span>No Trailer Yet</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex h-14 w-full items-center justify-center rounded-full px-6 text-base font-bold sm:w-[210px]",
          "border-none bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] text-slate-950 shadow-none",
          "transition-all duration-300 hover:from-[#38b2ac] hover:to-[#319795]",
          className
        )}
      >
        <Play className="mr-2 h-5 w-5 fill-current" />
        <span>Play Trailer</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-5xl overflow-hidden rounded-2xl border-slate-700 bg-black p-0">
          <DialogTitle className="sr-only">
            {title} - {trailer.name || "Trailer"}
          </DialogTitle>
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
