"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Monitor,
  PictureInPicture,
  Tv,
  RotateCcw,
  ExternalLink,
  RefreshCw,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useVideoPlayerStore } from "@/store/videoPlayer";
import { authenticatedFetch } from "@/lib/firebase-auth-api";
import { useToast } from "@/components/ui/use-toast";

interface StreamingSource {
  name: string;
  url: string;
  quality: string;
  type: "iframe" | "video";
  embed: boolean;
  healthStatus?: "healthy" | "reported";
  reportCount?: number;
  reportReasons?: string[];
  healthMessage?: string | null;
}

interface VideoPlayerProps {
  videoUrl?: string;
  sources?: StreamingSource[];
  posterUrl?: string;
  title: string;
  duration?: number; // Duration in minutes from TMDB
  mediaType?: "movie" | "tv";
  mediaId?: number | string;
  seasonNumber?: number | string;
  episodeNumber?: number | string;
  onTheaterModeChange?: (isTheaterMode: boolean) => void;
}

export function VideoPlayer({
  videoUrl,
  sources = [],
  posterUrl,
  title,
  duration,
  mediaType,
  mediaId,
  seasonNumber,
  episodeNumber,
  onTheaterModeChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State for streaming
  const [selectedSource, setSelectedSource] = useState<StreamingSource | null>(
    null
  );
  const [isIframeMode, setIsIframeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for auto-progress simulation
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isReportingSource, setIsReportingSource] = useState(false);
  const [reportNote, setReportNote] = useState("");
  const { toast } = useToast();

  const {
    isPlaying,
    isMuted,
    currentTime,
    videoDuration,
    volume,
    showControls,
    quality,
    setPlaying,
    setMuted,
    setCurrentTime,
    setVideoDuration,
    setVolume,
    setShowControls,
    setQuality,
    reset,
  } = useVideoPlayerStore();

  // Initialize streaming source
  useEffect(() => {
    if (sources.length > 0 && !selectedSource) {
      // Prefer TMDB-explicit sources first to reduce wrong-title matches.
      const healthySources = sources.filter(
        (source) => source.healthStatus !== "reported"
      );
      const candidateSources = healthySources.length ? healthySources : sources;
      const stableSource =
        candidateSources.find((s) => s.name === "VidEasy") ||
        candidateSources.find((s) => s.name === "MultiEmbed") ||
        candidateSources.find((s) => s.name === "111Movies");
      const defaultSource = stableSource || candidateSources[0];
      setSelectedSource(defaultSource);
      setIsIframeMode(defaultSource.type === "iframe");
    }
  }, [sources, selectedSource]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Initialize video duration from TMDB
  useEffect(() => {
    if (duration) {
      setVideoDuration(duration * 60); // Convert minutes to seconds
    }
  }, [duration, setVideoDuration]);

  // Show controls and header by default when native video is not playing.
  // Iframe streams should keep the chrome hidden while playback is visible.
  useEffect(() => {
    if (!isIframeMode && !isPlaying && !isAutoPlaying) {
      setShowControls(true);
      setShowHeader(true);
    }
  }, [isIframeMode, isPlaying, isAutoPlaying, setShowControls]);

  useEffect(() => {
    if (!isIframeMode || !selectedSource) return;

    setShowHeader(true);

    const hideTimer = setTimeout(() => {
      if (!isSourceMenuOpen) {
        setShowHeader(false);
      }
    }, 1800);

    return () => clearTimeout(hideTimer);
  }, [isIframeMode, selectedSource, isSourceMenuOpen]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      reset();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [reset]);

  // Change streaming source
  const changeSource = (source: StreamingSource) => {
    setIsLoading(true);
    setSelectedSource(source);
    setIsIframeMode(source.type === "iframe");

    // Reset player state
    setCurrentTime(0);
    setIsEnded(false);
    setPlaying(false);

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Open external link
  const openExternal = () => {
    if (selectedSource) {
      window.open(selectedSource.url, "_blank");
    }
  };

  const reportReasons = [
    { value: "wrong_title", label: "Wrong movie/show" },
    { value: "wrong_episode", label: "Wrong episode" },
    { value: "not_working", label: "Not working" },
    { value: "poor_quality", label: "Poor quality" },
    { value: "other", label: "Other issue" },
  ];

  const reportSource = async (reason: string) => {
    if (!selectedSource || !mediaType || !mediaId) {
      toast({
        title: "Report unavailable",
        description: "Missing media or source information.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReportingSource(true);
      const response = await authenticatedFetch("/api/source-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaType,
          mediaId,
          seasonNumber,
          episodeNumber,
          title,
          sourceName: selectedSource.name,
          sourceUrl: selectedSource.url,
          reason,
          notes: reportNote.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit report");
      }

      toast({
        title: "Report sent",
        description: "Thanks. Admin will review this source.",
      });
      setReportNote("");
    } catch (error) {
      toast({
        title: "Report failed",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsReportingSource(false);
    }
  };

  // Use refs to avoid dependency issues
  const currentTimeRef = useRef(currentTime);
  const videoDurationRef = useRef(videoDuration);

  // Update refs when values change
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    videoDurationRef.current = videoDuration;
  }, [videoDuration]);

  // Auto-progress simulation effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoPlaying && videoDurationRef.current > 0) {
      intervalId = setInterval(() => {
        const newTime = currentTimeRef.current + 1;

        if (newTime >= videoDurationRef.current) {
          setCurrentTime(videoDurationRef.current);
          setSimulatedTime(videoDurationRef.current);
          setIsAutoPlaying(false);
          setPlaying(false);
          setIsEnded(true);
          setShowControls(true);
          setShowHeader(true);
        } else {
          setCurrentTime(newTime);
          setSimulatedTime(newTime);
          currentTimeRef.current = newTime;
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying]);

  // Handle video events (only for non-iframe mode)
  useEffect(() => {
    if (isIframeMode) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isAutoPlaying) {
        setCurrentTime(video.currentTime);
        setSimulatedTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (!duration) {
        setVideoDuration(video.duration);
      }
    };

    const handlePlay = () => {
      setPlaying(true);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    const handleEnded = () => {
      setPlaying(false);
      setIsAutoPlaying(false);
      setIsEnded(true);
      setShowControls(true);
      setShowHeader(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [
    isIframeMode,
    isAutoPlaying,
    duration,
    setCurrentTime,
    setVideoDuration,
    setPlaying,
    setShowControls,
  ]);

  const togglePlay = () => {
    if (isIframeMode) {
      // For iframe mode, simulate play/pause
      if (isPlaying) {
        setPlaying(false);
        setIsAutoPlaying(false);
      } else {
        setPlaying(true);
        setIsAutoPlaying(true);
      }
    } else {
      const video = videoRef.current;
      if (!video) return;

      if (isEnded) {
        restartVideo();
        return;
      }

      if (video.paused) {
        video.play().catch((error) => {
          console.error("Error playing video:", error);
          // Fallback to auto-play simulation
          setIsAutoPlaying(true);
          setPlaying(true);
        });
      } else {
        video.pause();
      }
    }
  };

  const restartVideo = () => {
    if (isIframeMode) {
      setCurrentTime(0);
      setSimulatedTime(0);
      setIsEnded(false);
      setPlaying(true);
      setIsAutoPlaying(true);
    } else {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        setCurrentTime(0);
        setSimulatedTime(0);
        setIsEnded(false);
        video.play().catch(() => {
          setIsAutoPlaying(true);
          setPlaying(true);
        });
      }
    }
  };

  const toggleMute = () => {
    if (isIframeMode) {
      setMuted(!isMuted);
    } else {
      const video = videoRef.current;
      if (video) {
        video.muted = !video.muted;
        setMuted(video.muted);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (!isIframeMode) {
      const video = videoRef.current;
      if (video) {
        video.volume = newVolume / 100;
        video.muted = newVolume === 0;
        setMuted(newVolume === 0);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    setSimulatedTime(newTime);

    if (!isIframeMode) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = newTime;
      }
    }

    if (isEnded && newTime < videoDuration) {
      setIsEnded(false);
    }
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(videoDuration, currentTime + seconds));
    handleSeek([newTime]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleTheaterMode = () => {
    const newTheaterMode = !isTheaterMode;
    setIsTheaterMode(newTheaterMode);
    onTheaterModeChange?.(newTheaterMode);
  };

  const togglePictureInPicture = async () => {
    if (isIframeMode) return; // Not supported for iframe

    try {
      const video = videoRef.current;
      if (video && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error("Picture-in-picture error:", error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    setShowHeader(true);

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Auto-hide stream chrome once playback is visible.
    if (isIframeMode || isPlaying || isAutoPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isSourceMenuOpen) {
          setShowControls(false);
          setShowHeader(false);
        }
      }, isIframeMode ? 1800 : 3000);
    }
  };

  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Hide controls and header faster when mouse leaves
    if (isIframeMode || isPlaying || isAutoPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isSourceMenuOpen) {
          setShowControls(false);
          setShowHeader(false);
        }
      }, isIframeMode ? 300 : 1000); // Shorter delay when mouse leaves
    }
  };

  const handleTouchStart = () => {
    setShowControls(true);
    setShowHeader(true);

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleTouchEnd = () => {
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Auto-hide after touch ends on mobile
    if (isIframeMode || isPlaying || isAutoPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isSourceMenuOpen) {
          setShowControls(false);
          setShowHeader(false);
        }
      }, 4000); // Longer timeout for mobile
    }
  };

  const handleVideoClick = () => {
    if (isIframeMode) {
      setShowHeader((current) => !current);
      return;
    }

    // On mobile, single tap toggles controls, double tap toggles play
    if (isMobile) {
      setShowControls(!showControls);
    } else {
      togglePlay();
    }
  };

  const handleMenuInteraction = (open: boolean) => {
    setIsSourceMenuOpen(open);
    setShowControls(true);
    setShowHeader(true);

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Keep controls visible while interacting with menus.
    if (!open && (isIframeMode || isPlaying || isAutoPlaying)) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowHeader(false);
      }, 5000); // Longer timeout for menu interactions
    }
  };

  const getProgressPercentage = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  const renderPlayer = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-teal-400 rounded-full animate-spin"></div>
              <RefreshCw className="w-8 h-8 text-cinehub-accent absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-white text-lg font-semibold">Loading Stream</p>
              <p className="text-slate-300 text-sm">Please wait a moment...</p>
            </div>
          </div>
        </div>
      );
    }

    if (isIframeMode && selectedSource) {
      return (
        <iframe
          ref={iframeRef}
          src={selectedSource.url}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={`${title} - ${selectedSource.name}`}
        />
      );
    }

    return (
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={posterUrl}
        preload="metadata"
      >
        {(videoUrl || selectedSource?.url) && (
          <source src={videoUrl || selectedSource?.url} type="video/mp4" />
        )}
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden group cursor-pointer",
        isTheaterMode ? "theater-mode" : "",
        isFullscreen ? "fullscreen" : ""
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleVideoClick}
    >
      {renderPlayer()}

      {isIframeMode && (
        <div
          className="absolute left-0 right-0 top-0 z-40 h-14 md:h-16"
          onMouseEnter={handleMouseMove}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          aria-hidden="true"
        />
      )}

      {/* Loading overlay */}
      {!selectedSource && sources.length === 0 && !videoUrl && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-600 border-t-teal-400 rounded-full mx-auto animate-spin"></div>
              <Tv className="w-10 h-10 text-cinehub-accent absolute inset-0 m-auto" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-white">
                No Streaming Sources Available
              </p>
              <p className="text-slate-300">
                Please try again later or contact support
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unified Header - Works for both iframe and non-iframe modes */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-50 transition-all duration-300",
          isIframeMode
            ? "bg-transparent"
            : "bg-gradient-to-b from-black/80 via-black/35 to-transparent",
          isMobile ? "px-3 py-3" : "px-4 py-4",
          showHeader
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            "flex items-start gap-3",
            isIframeMode ? "justify-end" : "justify-between"
          )}
        >
          {/* Movie Title & Info */}
          {!isIframeMode && (
            <div className="min-w-0 flex-1">
              <h1
                className={cn(
                  "line-clamp-2 text-white font-bold leading-tight drop-shadow-2xl transition-all duration-300",
                  isMobile ? "text-lg" : "text-2xl lg:text-3xl"
                )}
              >
                {title}
              </h1>
              {selectedSource && (
                <div
                  className={cn(
                    "mt-3 flex flex-wrap items-center gap-2 sm:gap-3",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border border-cinehub-accent/45 bg-cinehub-accent/15 backdrop-blur-md shadow-lg",
                      isMobile ? "px-3 py-1.5" : "px-4 py-2"
                    )}
                  >
                    <div className="w-2.5 h-2.5 bg-cinehub-accent rounded-full animate-pulse shadow-lg shadow-cinehub-accent/50"></div>
                    <span className="text-cinehub-accent font-semibold">
                      {selectedSource.name}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border border-slate-400/35 bg-slate-700/80 backdrop-blur-md shadow-lg",
                      isMobile ? "px-3 py-1.5" : "px-4 py-2"
                    )}
                  >
                    <span className="text-slate-100 font-semibold text-xs uppercase tracking-wider">
                      {selectedSource.quality}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Unified Action Buttons */}
          <div className="pointer-events-auto flex shrink-0 items-center gap-2">
            {/* Theater Mode Button */}
            <Button
              onClick={toggleTheaterMode}
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-2xl border border-slate-400/35 bg-slate-700/80 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-slate-600/90 cursor-pointer",
                isMobile
                  ? "h-10 min-w-10 px-3 active:scale-95"
                  : "h-11 px-4",
                isTheaterMode &&
                  "border-cinehub-accent/50 bg-cinehub-accent/25 hover:bg-cinehub-accent/35"
              )}
              title={isTheaterMode ? "Exit Theater Mode" : "Enter Theater Mode"}
            >
              <Monitor
                className={cn(
                  isMobile ? "w-4 h-4" : "w-4 h-4",
                  !isMobile && "mr-2"
                )}
              />
              <span className="hidden sm:inline font-semibold">
                {isTheaterMode ? "Exit" : "Theater"}
              </span>
            </Button>

            {/* Unified Source Selector */}
            {sources.length > 1 && (
              <DropdownMenu onOpenChange={handleMenuInteraction}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-2xl border border-slate-400/35 bg-slate-700/80 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-slate-600/90 cursor-pointer",
                      isMobile
                        ? "h-10 min-w-10 px-3 active:scale-95"
                        : "h-11 px-4"
                    )}
                  >
                    <Settings
                      className={cn(
                        isMobile ? "w-4 h-4" : "w-4 h-4",
                        !isMobile && "mr-2"
                      )}
                    />
                    <span className="hidden sm:inline font-semibold">
                      Sources
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    "bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-slate-600/40 shadow-2xl rounded-2xl",
                    isMobile ? "min-w-[180px]" : "min-w-[220px]"
                  )}
                >
                  <div className={cn(isMobile ? "p-2" : "p-3")}>
                    <h4
                      className={cn(
                        "text-slate-300 font-bold mb-3 px-3 uppercase tracking-wider",
                        isMobile ? "text-xs" : "text-xs"
                      )}
                    >
                      Available Sources
                    </h4>
                    {sources.map((source, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => changeSource(source)}
                        className={cn(
                          "text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 cursor-pointer rounded-xl p-4 mb-2 transition-all duration-300 hover:scale-105",
                          selectedSource?.name === source.name &&
                            "bg-gradient-to-r from-cinehub-accent/20 to-cinehub-accent-hover/20 border border-cinehub-accent/40 shadow-lg"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            {selectedSource?.name === source.name && (
                              <div className="w-2.5 h-2.5 bg-cinehub-accent rounded-full shadow-lg shadow-cinehub-accent/50"></div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold">{source.name}</span>
                              {source.healthStatus === "reported" && (
                                <span className="text-[11px] font-medium text-amber-300">
                                  {source.healthMessage || "Reported by users"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {source.healthStatus === "reported" && (
                              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                                Reported
                              </span>
                            )}
                            <span className="text-xs text-slate-300 bg-slate-700/60 px-3 py-1 rounded-full font-medium">
                              {source.quality}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  {selectedSource && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-600/40 my-2" />
                      <DropdownMenuItem
                        onClick={openExternal}
                        className="text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 cursor-pointer rounded-xl p-4 m-3 transition-all duration-300 hover:scale-105"
                      >
                        <ExternalLink className="w-4 h-4 mr-3" />
                        <span className="font-semibold">Open in New Tab</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {selectedSource && mediaType && mediaId && (
              <DropdownMenu onOpenChange={handleMenuInteraction}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isReportingSource}
                    className={cn(
                      "rounded-2xl border border-slate-400/35 bg-slate-700/80 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-slate-600/90 cursor-pointer disabled:opacity-60",
                      isMobile
                        ? "h-10 min-w-10 px-3 active:scale-95"
                        : "h-11 px-4"
                    )}
                    title="Report current source"
                  >
                    <Flag
                      className={cn(
                        isMobile ? "w-4 h-4" : "w-4 h-4",
                        !isMobile && "mr-2"
                      )}
                    />
                    <span className="hidden sm:inline font-semibold">
                      Report
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={cn(
                    "bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-slate-600/40 shadow-2xl rounded-2xl",
                    isMobile ? "min-w-[190px]" : "min-w-[230px]"
                  )}
                >
                  <div className={cn(isMobile ? "p-2" : "p-3")}>
                    <h4 className="text-slate-300 font-bold mb-3 px-3 text-xs uppercase tracking-wider">
                      Report Source
                    </h4>
                    <div
                      className="mb-3 px-1"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Textarea
                        value={reportNote}
                        onChange={(event) =>
                          setReportNote(event.target.value.slice(0, 240))
                        }
                        placeholder="Optional note for admin..."
                        className="min-h-20 resize-none rounded-xl border-slate-600/60 bg-slate-950/70 text-sm text-white placeholder:text-slate-500 focus-visible:ring-primary/40"
                      />
                      <div className="mt-1 text-right text-[11px] text-slate-500">
                        {reportNote.length}/240
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-700/70" />
                    {reportReasons.map((reason) => (
                      <DropdownMenuItem
                        key={reason.value}
                        onClick={() => reportSource(reason.value)}
                        className="text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 cursor-pointer rounded-xl p-3 mb-1 transition-all duration-300"
                      >
                        <Flag className="w-4 h-4 mr-3 text-amber-300" />
                        <span className="font-medium">{reason.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Controls overlay - Only for non-iframe mode */}
      {!isIframeMode && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            showControls || !isPlaying
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          )}
        >
          {/* Center play button */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            {!isPlaying && !isAutoPlaying && (
              <Button
                onClick={togglePlay}
                size="lg"
                className={cn(
                  "bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover hover:from-cinehub-accent-hover hover:to-cinehub-accent text-slate-950 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 cursor-pointer border-4 border-white/20",
                  isMobile
                    ? "p-6 sm:p-8 min-w-[72px] min-h-[72px] sm:min-w-[96px] sm:min-h-[96px] active:scale-95"
                    : "p-8"
                )}
              >
                {isEnded ? (
                  <RotateCcw
                    className={cn(
                      "ml-0",
                      isMobile ? "w-8 h-8 sm:w-10 sm:h-10" : "w-10 h-10"
                    )}
                  />
                ) : (
                  <Play
                    className={cn(
                      "ml-1",
                      isMobile ? "w-8 h-8 sm:w-10 sm:h-10" : "w-10 h-10"
                    )}
                  />
                )}
              </Button>
            )}
          </div>

          {/* Bottom controls */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 z-20 space-y-3 sm:space-y-4",
              isMobile ? "p-4 pb-6" : "p-6"
            )}
          >
            {/* Progress bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={videoDuration}
                step={1}
                onValueChange={handleSeek}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-sm text-slate-300 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(videoDuration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex items-center",
                  isMobile ? "space-x-2" : "space-x-3"
                )}
              >
                <Button
                  onClick={togglePlay}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110",
                    isMobile
                      ? "p-2.5 min-w-[44px] min-h-[44px] active:scale-95"
                      : "p-3"
                  )}
                >
                  {isPlaying || isAutoPlaying ? (
                    <Pause className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
                  ) : isEnded ? (
                    <RotateCcw
                      className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")}
                    />
                  ) : (
                    <Play className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
                  )}
                </Button>

                <Button
                  onClick={() => skipTime(-10)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110",
                    isMobile
                      ? "p-2.5 min-w-[44px] min-h-[44px] active:scale-95"
                      : "p-3"
                  )}
                >
                  <SkipBack className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
                </Button>

                <Button
                  onClick={() => skipTime(10)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110",
                    isMobile
                      ? "p-2.5 min-w-[44px] min-h-[44px] active:scale-95"
                      : "p-3"
                  )}
                >
                  <SkipForward
                    className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")}
                  />
                </Button>

                {/* Volume controls */}
                <div
                  className={cn(
                    "flex items-center",
                    isMobile ? "space-x-2" : "space-x-3"
                  )}
                >
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-white hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110",
                      isMobile
                        ? "p-2.5 min-w-[44px] min-h-[44px] active:scale-95"
                        : "p-3"
                    )}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX
                        className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")}
                      />
                    ) : (
                      <Volume2
                        className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")}
                      />
                    )}
                  </Button>

                  {!isMobile && (
                    <div className="w-20 sm:w-24">
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="w-full cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "flex items-center",
                  isMobile ? "space-x-1.5" : "space-x-3"
                )}
              >
                {!isMobile && (
                  <Button
                    onClick={togglePictureInPicture}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110"
                  >
                    <PictureInPicture className="w-5 h-5" />
                  </Button>
                )}

                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110",
                    isMobile
                      ? "p-2.5 min-w-[44px] min-h-[44px] active:scale-95"
                      : "p-3"
                  )}
                >
                  {isFullscreen ? (
                    <Minimize
                      className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")}
                    />
                  ) : (
                    <Maximize
                      className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")}
                    />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
