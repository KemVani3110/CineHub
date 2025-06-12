'use client';

import { TMDBVideos } from "@/types/tmdb";
import { Play, Film, Video, Clock, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MovieMediaProps {
  videos: TMDBVideos;
  movieTitle?: string;
}

export default function MovieMedia({ videos, movieTitle }: MovieMediaProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const trailers = videos.results.filter(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );
  const teasers = videos.results.filter(
    (video) => video.type === "Teaser" && video.site === "YouTube"
  );
  const clips = videos.results.filter(
    (video) => video.type === "Clip" && video.site === "YouTube"
  );

  if (!videos.results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-bg-card to-border rounded-full flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-text-sub" />
        </div>
        <h3 className="text-lg font-semibold text-text-main mb-2">
          No Videos Available
        </h3>
        <p className="text-text-sub text-center max-w-sm">
          There are currently no trailers, teasers, or clips available for this
          movie.
        </p>
      </div>
    );
  }

  const VideoCard = ({ video }: { video: (typeof videos.results)[0] }) => (
    <div
      className="group relative overflow-hidden rounded-xl bg-bg-card shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-border"
      onClick={() => setSelectedVideo(video.key)}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
          alt={video.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cinehub-accent rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 sm:w-6 sm:h-6 text-bg-main ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Video Type Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span className="px-2 py-1 bg-black/70 text-text-main text-xs font-medium rounded-full backdrop-blur-sm">
            {video.type}
          </span>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-3 sm:p-4 bg-bg-card">
        <h4 className="font-semibold text-text-main mb-1 line-clamp-2 group-hover:text-cinehub-accent transition-colors text-sm sm:text-base">
          {video.name}
        </h4>
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-sub">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>YouTube</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>HD</span>
          </div>
        </div>
      </div>
    </div>
  );

  const getTabIcon = (type: string) => {
    switch (type) {
      case "trailers":
        return <Film className="w-4 h-4" />;
      case "teasers":
        return <Video className="w-4 h-4" />;
      case "clips":
        return <Play className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const getTabData = (type: string) => {
    switch (type) {
      case "trailers":
        return { videos: trailers, label: "Trailers", count: trailers.length };
      case "teasers":
        return { videos: teasers, label: "Teasers", count: teasers.length };
      case "clips":
        return { videos: clips, label: "Clips", count: clips.length };
      default:
        return { videos: [], label: "", count: 0 };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-2 sm:mb-3">
          Videos & Trailers
        </h2>
        <p className="text-sm sm:text-base text-text-sub max-w-2xl mx-auto">
          Watch trailers, teasers, and exclusive clips from{" "}
          {movieTitle || "this movie"}
        </p>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="trailers" className="w-full">
        {/* Custom Tab Navigation */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <TabsList className="inline-flex bg-bg-card border border-border p-1 rounded-xl shadow-sm overflow-x-auto">
            {["trailers", "teasers", "clips"].map((tab) => {
              const { label, count } = getTabData(tab);
              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 data-[state=active]:bg-cinehub-accent data-[state=active]:text-bg-main data-[state=active]:shadow-sm text-text-sub hover:text-text-main whitespace-nowrap"
                >
                  {getTabIcon(tab)}
                  <span>{label}</span>
                  <span className="bg-border data-[state=active]:bg-cinehub-accent-hover px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        {["trailers", "teasers", "clips"].map((tab) => {
          const { videos } = getTabData(tab);
          return (
            <TabsContent key={tab} value={tab} className="focus:outline-none">
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-bg-card border border-border rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <div className="text-text-sub">{getTabIcon(tab)}</div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-text-main mb-2">
                    No {getTabData(tab).label} Available
                  </h3>
                  <p className="text-sm sm:text-base text-text-sub">
                    There are no {getTabData(tab).label.toLowerCase()} available
                    for this movie yet.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full p-0 bg-black rounded-xl overflow-hidden">
          <DialogTitle className="sr-only">
            {movieTitle} - {selectedVideo ? "Video Player" : ""}
          </DialogTitle>
          {selectedVideo && (
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0&modestbranding=1`}
                title={`${movieTitle} - Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
