"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useVideoPlayerStore } from "@/store/videoPlayer";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  duration?: number; // Duration in minutes from TMDB
}

export function VideoPlayer({ videoUrl, posterUrl, title, duration }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for auto-progress simulation
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize video duration from TMDB
  useEffect(() => {
    if (duration) {
      setVideoDuration(duration * 60); // Convert minutes to seconds
    }
  }, [duration, setVideoDuration]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      reset();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [reset]);

  // Auto-progress simulation effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoPlaying && videoDuration > 0) {
      intervalId = setInterval(() => {
        setSimulatedTime((prev: number) => {
          const newTime = prev + 1;
          if (newTime >= videoDuration) {
            setIsAutoPlaying(false);
            return videoDuration;
          }
          return newTime;
        });
        
        // Use direct value instead of function updater
        const newTime = currentTime + 1;
        setCurrentTime(newTime >= videoDuration ? videoDuration : newTime);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, videoDuration, setCurrentTime, currentTime]);

  useEffect(() => {
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

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [duration, setCurrentTime, setVideoDuration, setPlaying, isAutoPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying || isAutoPlaying) {
        videoRef.current.pause();
        setIsAutoPlaying(false);
        setShowControls(true); // Show controls when paused
      } else {
        // Start auto-playing simulation
        setIsAutoPlaying(true);
        videoRef.current.play().catch(() => {
          // If video can't play, just continue with simulation
        });
        // Hide controls after a short delay when playing
        setTimeout(() => {
          if (isPlaying || isAutoPlaying) {
            setShowControls(false);
          }
        }, 200);
      }
      setPlaying(!isPlaying && !isAutoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    setSimulatedTime(newTime);
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, videoDuration));
    handleSeek([newTime]);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying || isAutoPlaying) {
        setShowControls(false);
      }
    }, isMobile ? 5000 : 3000); // Longer timeout on mobile
  };

  const handleTouchStart = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleTouchEnd = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying || isAutoPlaying) {
        setShowControls(false);
      }
    }, 3000); // Reduced timeout for better mobile experience
  };

  const getProgressPercentage = () => {
    return videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;
  };

  return (
    <div
      className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 group rounded-lg overflow-hidden shadow-2xl border border-[#2e3c51]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !isMobile && (isPlaying || isAutoPlaying) && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline // Important for mobile
      />

      {/*  Overlay with gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-all duration-500 ease-out",
          showControls && "opacity-100"
        )}
      />

      {/* Mobile-only: Title at top - Fixed z-index and positioning */}
      {isMobile && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 transition-all duration-500 ease-out pointer-events-none z-10",
            "p-3 pb-0", // Remove bottom padding to avoid overlap
            !showControls && "opacity-0 translate-y-[-10px]"
          )}
        >
          <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm rounded-t-lg p-3 border-b border-white/5">
            <h1 className="text-sm font-semibold text-white/90 truncate">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#4fd1c5]/20 text-[#4fd1c5] px-1.5 py-0.5 rounded text-xs font-medium">
                {quality}
              </span>
              <span className="text-xs text-white/60">{formatTime(videoDuration)}</span>
            </div>
          </div>
        </div>
      )}

      {/*  Controls - Fixed mobile spacing */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out backdrop-blur-sm z-20",
          // Mobile: adjusted spacing to prevent overlap
          isMobile ? "p-3 space-y-3" : "p-6 space-y-4",
          !showControls && "translate-y-full opacity-0"
        )}
      >
        {/*  Progress Bar - Mobile: moved higher to avoid header overlap */}
        <div className={cn(
          "relative space-y-1 md:space-y-2",
          // Mobile: add margin top to create space from header
          isMobile ? "mt-2" : ""
        )}>
          <div className={cn(
            "relative bg-white/20 rounded-full overflow-hidden",
            // Mobile: taller progress bar for easier touch
            "h-3 md:h-2"
          )}>
            {/* Background track */}
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            
            {/* Progress bar with gradient */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${getProgressPercentage()}%` }}
            />
            
            {/* Glow effect */}
            <div 
              className="absolute top-0 left-0 h-full bg-[#4fd1c5] rounded-full opacity-30 blur-sm transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          
          {/*  Slider (invisible but functional) */}
          <div className={cn(
            "absolute left-0 right-0",
            // Mobile: larger touch area
            "-top-3 md:-top-2"
          )}>
            <Slider
              value={[currentTime]}
              max={videoDuration}
              step={1}
              onValueChange={handleSeek}
              className={cn(
                "w-full opacity-0 cursor-pointer",
                // Mobile: larger touch area
                "h-8 md:h-6"
              )}
            />
          </div>
          
          {/* Time display */}
          <div className="flex justify-between text-xs md:text-sm font-medium">
            <span className="text-white/90 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              {formatTime(currentTime)}
            </span>
            <span className="text-white/70 bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
              {formatTime(videoDuration)}
            </span>
          </div>
        </div>

        {/*  Control Buttons - Mobile Responsive Layout */}
        <div className={cn(
          "flex items-center justify-between",
          // Mobile: different layout approach
          isMobile ? "flex-col space-y-3" : ""
        )}>
          
          {/* Primary Controls Row */}
          <div className={cn(
            "flex items-center justify-center",
            // Mobile: full width with proper spacing
            isMobile ? "w-full gap-6" : "gap-3"
          )}>
            {/* Skip backward */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/90 hover:text-[#4fd1c5] hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110 rounded-full",
                // Mobile: larger touch targets
                isMobile ? "w-12 h-12" : "w-10 h-10"
              )}
              onClick={() => skipTime(-10)}
            >
              <SkipBack className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
            </Button>

            {/* Main play/pause button -  */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white hover:text-[#4fd1c5] hover:bg-[#4fd1c5]/20 cursor-pointer transition-all duration-300 hover:scale-110 rounded-full bg-white/10 backdrop-blur-sm border border-white/20",
                // Mobile: larger main button
                isMobile ? "w-16 h-16" : "w-12 h-12"
              )}
              onClick={togglePlay}
            >
              {(isPlaying || isAutoPlaying) ? (
                <Pause className={isMobile ? "h-8 w-8" : "h-6 w-6"} />
              ) : (
                <Play className={cn(isMobile ? "h-8 w-8 ml-1" : "h-6 w-6 ml-1")} />
              )}
            </Button>

            {/* Skip forward */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/90 hover:text-[#4fd1c5] hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110 rounded-full",
                // Mobile: larger touch targets
                isMobile ? "w-12 h-12" : "w-10 h-10"
              )}
              onClick={() => skipTime(10)}
            >
              <SkipForward className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
            </Button>
          </div>

          {/* Secondary Controls Row */}
          <div className={cn(
            "flex items-center",
            // Mobile: full width with space between
            isMobile ? "w-full justify-between px-4" : "gap-2"
          )}>
            
            {/* Volume Controls - Mobile: Simplified */}
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/90 hover:text-[#4fd1c5] hover:bg-white/10 cursor-pointer transition-all duration-300 rounded-full w-10 h-10 bg-black/20 backdrop-blur-sm border border-white/10"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-3 bg-black/20 rounded-full px-3 py-2 backdrop-blur-sm border border-white/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/90 hover:text-[#4fd1c5] hover:bg-white/10 cursor-pointer transition-all duration-300 rounded-full w-8 h-8"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-full [&_.slider-track]:bg-white/20 [&_.slider-range]:bg-[#4fd1c5] [&_.slider-thumb]:bg-[#4fd1c5] [&_.slider-thumb]:border-white/20"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Settings Menu - Mobile: Simplified */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white/90 hover:text-[#4fd1c5] hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110 rounded-full bg-black/20 backdrop-blur-sm border border-white/10",
                      isMobile ? "w-10 h-10" : ""
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={cn(
                  "bg-[#1b263b]/95 border-[#2e3c51] backdrop-blur-md rounded-lg shadow-xl",
                  // Mobile: better positioning and sizing
                  isMobile ? "mb-2 mr-2" : ""
                )}>
                  <div className="px-2 py-1 text-xs font-medium text-white/70 border-b border-white/10">
                    Video Quality
                  </div>
                  <DropdownMenuItem
                    className={cn(
                      "text-white/90 hover:bg-[#4fd1c5]/20 cursor-pointer transition-all duration-200 rounded-md mx-1 my-1",
                      // Mobile: larger touch targets
                      isMobile ? "py-3" : "",
                      quality === "1080p" && "text-[#4fd1c5] bg-[#4fd1c5]/10"
                    )}
                    onClick={() => setQuality("1080p")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>1080p HD</span>
                      {quality === "1080p" && (
                        <span className="text-[#4fd1c5] text-xs">Current</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      "text-white/90 hover:bg-[#4fd1c5]/20 cursor-pointer transition-all duration-200 rounded-md mx-1 my-1",
                      isMobile ? "py-3" : "",
                      quality === "720p" && "text-[#4fd1c5] bg-[#4fd1c5]/10"
                    )}
                    onClick={() => setQuality("720p")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>720p HD</span>
                      {quality === "720p" && (
                        <span className="text-[#4fd1c5] text-xs">Current</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      "text-white/90 hover:bg-[#4fd1c5]/20 cursor-pointer transition-all duration-200 rounded-md mx-1 my-1",
                      isMobile ? "py-3" : "",
                      quality === "480p" && "text-[#4fd1c5] bg-[#4fd1c5]/10"
                    )}
                    onClick={() => setQuality("480p")}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>480p SD</span>
                      {quality === "480p" && (
                        <span className="text-[#4fd1c5] text-xs">Current</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white/90 hover:text-[#4fd1c5] hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-110 rounded-full bg-black/20 backdrop-blur-sm border border-white/10",
                  isMobile ? "w-10 h-10" : ""
                )}
                onClick={toggleFullscreen}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/*  Title Overlay - Desktop only */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 transition-all duration-500 ease-out",
          // Desktop only
          "hidden md:block p-6 z-10",
          !showControls && "opacity-0 translate-y-[-20px]"
        )}
      >
        <div className="bg-gradient-to-r from-black/60 via-black/40 to-transparent backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span className="bg-[#4fd1c5]/20 text-[#4fd1c5] px-2 py-1 rounded-full text-xs font-medium">
              {quality}
            </span>
            <span>{formatTime(videoDuration)}</span>
          </div>
        </div>
      </div>

      {/* Loading overlay when video is not ready */}
      {videoDuration === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm z-30">
          <div className="text-center space-y-4">
            <div className={cn(
              "border-4 border-[#4fd1c5]/30 border-t-[#4fd1c5] rounded-full animate-spin",
              // Mobile: responsive spinner size
              "w-10 h-10 md:w-12 md:h-12"
            )}></div>
            <p className="text-white/70 font-medium text-sm md:text-base">Đang tải video...</p>
          </div>
        </div>
      )}
    </div>
  );
}