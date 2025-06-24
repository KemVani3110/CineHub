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
  Smartphone,
  PictureInPicture,
  Download,
  Share2,
  BookOpen,
  Loader2,
  Tv,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useVideoPlayerStore } from "@/store/videoPlayer";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  duration?: number; // Duration in minutes from TMDB
  onTheaterModeChange?: (isTheaterMode: boolean) => void;
}

export function VideoPlayer({ videoUrl, posterUrl, title, duration, onTheaterModeChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for auto-progress simulation
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

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

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize video duration from TMDB
  useEffect(() => {
    if (duration) {
      setVideoDuration(duration * 60); // Convert minutes to seconds
    }
  }, [duration, setVideoDuration]);

  // Show controls by default when video is not playing
  useEffect(() => {
    if (!isPlaying && !isAutoPlaying) {
      setShowControls(true);
    }
  }, [isPlaying, isAutoPlaying, setShowControls]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      reset();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [reset]);

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
      setIsBuffering(false);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    const handleEnded = () => {
      setPlaying(false);
      setIsAutoPlaying(false);
      setIsEnded(true);
      setShowControls(true);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBufferedTime(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("progress", handleProgress);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("progress", handleProgress);
    };
  }, [duration, isAutoPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isEnded) {
        // Restart video from beginning
        restartVideo();
      } else {
        const shouldPlay = !isPlaying && !isAutoPlaying;
        
        if (shouldPlay) {
          // Start playing
          setPlaying(true);
          setIsAutoPlaying(true);
          videoRef.current.play().catch(() => {
            // If video can't play, just continue with simulation
          });
          
          // Hide controls after a delay when playing
          setTimeout(() => {
            if (isPlaying || isAutoPlaying) {
              setShowControls(false);
            }
          }, isMobile ? 3000 : 2000); // Longer delay for mobile touch
        } else {
          // Pause
          setPlaying(false);
          setIsAutoPlaying(false);
          videoRef.current.pause();
          setShowControls(true); // Always show controls when paused
          
          // Clear any pending hide timeout when paused
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
        }
      }
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      // Reset time to beginning
      setCurrentTime(0);
      setSimulatedTime(0);
      videoRef.current.currentTime = 0;
      
      // Reset ended state
      setIsEnded(false);
      
      // Start playing from beginning
      setPlaying(true);
      setIsAutoPlaying(true);
      videoRef.current.play().catch(() => {
        // If video can't play, just continue with simulation
      });
      
      // Hide controls after a delay when playing
      setTimeout(() => {
        if (!isEnded) {
          setShowControls(false);
        }
      }, isMobile ? 3000 : 2000);
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
    
    // Reset ended state if user seeks away from end
    if (isEnded && newTime < videoDuration) {
      setIsEnded(false);
    }
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, videoDuration));
    handleSeek([newTime]);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch((err) => {
        console.log("Fullscreen error:", err);
      });
    }
  };

  const toggleTheaterMode = () => {
    const newTheaterMode = !isTheaterMode;
    setIsTheaterMode(newTheaterMode);
    onTheaterModeChange?.(newTheaterMode);
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.log("Picture-in-Picture error:", error);
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
    // Only hide controls if video is playing
    if (isPlaying || isAutoPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying || isAutoPlaying) {
          setShowControls(false);
        }
      }, isFullscreen ? 5000 : isMobile ? 4000 : 3000); // Even longer timeout for fullscreen
    }
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
    // Only hide controls if video is playing
    if (isPlaying || isAutoPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying || isAutoPlaying) {
          setShowControls(false);
        }
      }, 3000); // Longer timeout for mobile touch interaction
    }
  };

  const handleMenuInteraction = () => {
    // Keep controls visible when interacting with menus
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const getProgressPercentage = () => {
    return videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;
  };

  const getBufferedPercentage = () => {
    return videoDuration > 0 ? (bufferedTime / videoDuration) * 100 : 0;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full group overflow-hidden",
        isFullscreen 
          ? "fixed inset-0 z-[9999] cursor-none border-none bg-black/95" 
          : isTheaterMode
          ? "rounded-lg border-2 border-slate-800/50 shadow-2xl bg-slate-950"
          : "rounded-lg border-none shadow-none bg-slate-950"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !isMobile && !isFullscreen && (isPlaying || isAutoPlaying) && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className={cn(
          "w-full h-full object-cover",
          isFullscreen ? "cursor-none bg-black" : "cursor-pointer bg-slate-950"
        )}
        onClick={togglePlay}
        playsInline
      />

      {/* Top Gradient Overlay */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-32 pointer-events-none z-10 transition-all duration-500",
          isFullscreen 
            ? "bg-gradient-to-b from-black/70 via-black/40 to-transparent"
            : "bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent",
          showControls ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Bottom Gradient Overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10 transition-all duration-500",
          isFullscreen 
            ? "bg-gradient-to-t from-black/80 via-black/50 to-transparent"
            : "bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-transparent",
          showControls ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Title Bar - Top */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-start justify-between z-20 transition-all duration-500",
          isFullscreen ? "p-8" : isMobile ? "p-2" : "p-3 md:p-4",
          !showControls && "opacity-0 -translate-y-4"
        )}
      >
        <div className="flex-1 min-w-0">
          {/* Title and Badges Row */}
          <div className="flex items-start justify-between mb-2 gap-3">
            <h1 className={cn(
              "font-bold text-white truncate drop-shadow-lg flex-1",
              isFullscreen ? "text-2xl md:text-3xl" : isMobile ? "text-base" : "text-lg md:text-xl"
            )}>
              {title}
            </h1>
            {/* Quality Badges - Mobile Optimized */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theater Mode Badge */}
              {isTheaterMode && (
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium border border-amber-400/30">
                  Theater
                </span>
              )}
              {/* HD Badge */}
              <span className="bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover text-slate-900 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                HD
              </span>
              {/* Quality Badge */}
              <span className="bg-slate-800/90 backdrop-blur-sm text-cinehub-accent px-2 py-0.5 rounded-full text-xs font-semibold border border-cinehub-accent/30">
                {quality}
              </span>
            </div>
          </div>
          
          {/* Additional Info Row - Clean */}
          <div className="flex items-center gap-3 text-sm">
            {/* Empty for now, can add other info if needed */}
          </div>
        </div>
        
        {/* Device indicator & Status */}
        <div className={cn(
          "flex items-center gap-2 text-slate-400",
          isMobile ? "ml-2" : "ml-4 gap-3"
        )}>
          {isBuffering && (
            <div className="flex items-center gap-1 text-cinehub-accent">
              <Loader2 className={cn("animate-spin", isMobile ? "w-3 h-3" : "w-4 h-4")} />
              {!isMobile && <span className="text-xs font-medium">Buffering</span>}
            </div>
          )}
          {isMobile ? (
            <Smartphone className="w-4 h-4" />
          ) : (
            <Monitor className="w-5 h-5" />
          )}
        </div>
      </div>

              {/* Main Controls Container - Bottom */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-20 transition-all duration-500",
            isFullscreen ? "p-8 pb-6" : isMobile ? "p-3 pb-2" : "p-3 md:p-4",
            !showControls && "opacity-0 translate-y-4"
          )}
        >
        {/* Progress Bar Container */}
        <div className={cn(
          "space-y-2",
          isMobile ? "mb-2" : "mb-3"
        )}>
          {/* Time Labels - Desktop only above progress */}
          {!isMobile && (
            <div className="flex justify-between items-center text-sm font-medium text-white mb-1.5">
              <span className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/50">
                {formatTime(currentTime)}
              </span>
              <span className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/50">
                {formatTime(videoDuration)}
              </span>
            </div>
          )}
          
          {/* Progress Track */}
          <div className="relative group/progress">
            <div className={cn(
              "relative bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm",
              isMobile ? "h-2.5" : "h-2"
            )}>
              {/* Buffered Track */}
              <div 
                className="absolute top-0 left-0 h-full bg-slate-600/70 rounded-full transition-all duration-200"
                style={{ width: `${getBufferedPercentage()}%` }}
              />
              
              {/* Progress Fill with Gradient */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cinehub-accent via-cinehub-accent to-cinehub-accent-hover rounded-full transition-all duration-200 shadow-lg"
                style={{ width: `${getProgressPercentage()}%` }}
              />
              
              {/* Progress Glow */}
              <div 
                className="absolute top-0 left-0 h-full bg-cinehub-accent/60 rounded-full blur-sm transition-all duration-200"
                style={{ width: `${getProgressPercentage()}%` }}
              />
              
              {/* Hover Handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-cinehub-accent rounded-full border-3 border-white shadow-xl opacity-0 group-hover/progress:opacity-100 transition-all duration-200 transform scale-0 group-hover/progress:scale-100"
                style={{ left: `calc(${getProgressPercentage()}% - 10px)` }}
              />
            </div>
            
            {/* Interactive Slider */}
            <Slider
              value={[currentTime]}
              max={videoDuration}
              step={1}
              onValueChange={handleSeek}
              className={cn(
                "absolute inset-0 opacity-0 cursor-pointer",
                isMobile ? "h-10 -mt-4" : "h-8 -mt-3"
              )}
            />
          </div>

          {/* Time Labels - Mobile below progress */}
          {isMobile && (
            <div className="flex justify-between items-center text-xs font-medium text-white/80 mt-1.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          )}
        </div>

                {/* Control Buttons */}
        {isMobile ? (
          /* Mobile Layout - Corner Controls */
          isFullscreen ? (
            /* Fullscreen Mobile - Same as Default Layout */
            <div className="flex items-end justify-between">
              {/* Left Side Controls */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-cinehub-accent hover:bg-slate-800/60 transition-all duration-200 rounded-full cursor-pointer w-12 h-12"
                  onClick={() => skipTime(-10)}
                >
                  <SkipBack className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-cinehub-accent/90 hover:bg-cinehub-accent backdrop-blur-sm transition-all duration-200 rounded-full hover:scale-105 shadow-lg cursor-pointer w-12 h-12"
                  onClick={togglePlay}
                >
                  {isEnded ? (
                    <RotateCcw className="w-6 h-6" />
                  ) : (isPlaying || isAutoPlaying) ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-cinehub-accent hover:bg-slate-800/60 transition-all duration-200 rounded-full cursor-pointer w-12 h-12"
                  onClick={() => skipTime(10)}
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center gap-3">
                {/* Settings Menu */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-cinehub-accent hover:bg-slate-800/60 transition-all duration-200 rounded-full cursor-pointer w-12 h-12"
                      onMouseEnter={handleMenuInteraction}
                      onFocus={handleMenuInteraction}
                    >
                      <Settings className="w-6 h-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="bg-black/95 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl min-w-[180px]"
                    style={{ zIndex: 9999999 }}
                    align="end"
                    side="top"
                    sideOffset={8}
                    onMouseEnter={handleMenuInteraction}
                  >
                    <div className="px-4 py-3 text-sm font-semibold text-white border-b border-white/10">
                      Video Settings
                    </div>
                    
                    {/* Quality Settings */}
                    <div className="px-2 py-1">
                      <div className="text-xs text-slate-400 px-2 py-1 font-medium">Quality</div>
                      {["1080p", "720p", "480p", "360p"].map((q) => (
                        <DropdownMenuItem
                          key={q}
                          className={cn(
                            "text-white hover:bg-cinehub-accent/20 hover:text-cinehub-accent cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg px-3 py-2",
                            quality === q && "text-cinehub-accent bg-cinehub-accent/10 border border-cinehub-accent/30"
                          )}
                          onClick={() => setQuality(q)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{q} {q === "1080p" || q === "720p" ? "HD" : "SD"}</span>
                            {quality === q && (
                              <div className="w-2 h-2 bg-cinehub-accent rounded-full"></div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>

                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    {/* Additional Options */}
                    <DropdownMenuItem 
                      className="text-white hover:bg-slate-800/60 cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg"
                      onClick={togglePictureInPicture}
                    >
                      <PictureInPicture className="w-4 h-4 mr-2" />
                      Picture-in-Picture
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-slate-800/60 cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download Video
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-slate-800/60 cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Video
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Fullscreen Exit Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-red-400 hover:bg-red-500/20 transition-all duration-200 rounded-full cursor-pointer w-12 h-12"
                  onClick={toggleFullscreen}
                >
                  <Minimize className="w-6 h-6" />
                </Button>
              </div>
            </div>
          ) : (
            /* Regular Mobile - Corner Controls Layout */
            <div className="flex items-end justify-between">
              {/* Left Side Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-cinehub-accent hover:bg-slate-800/60 transition-all duration-200 rounded-full cursor-pointer w-10 h-10"
                  onClick={() => skipTime(-10)}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-cinehub-accent/90 hover:bg-cinehub-accent backdrop-blur-sm transition-all duration-200 rounded-full hover:scale-105 shadow-lg cursor-pointer w-10 h-10"
                  onClick={togglePlay}
                >
                  {isEnded ? (
                    <RotateCcw className="w-5 h-5" />
                  ) : (isPlaying || isAutoPlaying) ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-cinehub-accent hover:bg-slate-800/60 transition-all duration-200 rounded-full cursor-pointer w-10 h-10"
                  onClick={() => skipTime(10)}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Right Side - Fullscreen Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-cinehub-accent hover:bg-slate-800/60 transition-all duration-200 rounded-full cursor-pointer w-10 h-10"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          )
        ) : (
          /* Desktop Layout - Full Featured */
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-1">
              {/* Skip Back */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:text-cinehub-accent hover:bg-slate-800/80 transition-all duration-200 rounded-full backdrop-blur-sm border border-slate-700/30 hover:border-cinehub-accent/50 cursor-pointer",
                  isFullscreen ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={() => skipTime(-10)}
              >
                <SkipBack className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
              </Button>

              {/* Play/Pause - Main Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:text-slate-900 bg-cinehub-accent/90 hover:bg-cinehub-accent backdrop-blur-sm border-2 border-cinehub-accent/50 hover:border-cinehub-accent transition-all duration-200 rounded-full hover:scale-105 shadow-lg hover:shadow-cinehub-accent/25 mx-2 cursor-pointer",
                  isFullscreen ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={togglePlay}
              >
                {isEnded ? (
                  <RotateCcw className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                ) : (isPlaying || isAutoPlaying) ? (
                  <Pause className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                ) : (
                  <Play className={cn(isFullscreen ? "w-6 h-6 ml-0.5" : "w-5 h-5 ml-0.5")} />
                )}
              </Button>

              {/* Skip Forward */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:text-cinehub-accent hover:bg-slate-800/80 transition-all duration-200 rounded-full backdrop-blur-sm border border-slate-700/30 hover:border-cinehub-accent/50 cursor-pointer",
                  isFullscreen ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={() => skipTime(10)}
              >
                <SkipForward className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-2 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-white hover:text-cinehub-accent hover:bg-slate-800/80 transition-all duration-200 rounded-full backdrop-blur-sm border border-slate-700/30 hover:border-cinehub-accent/50 cursor-pointer",
                    isFullscreen ? "w-12 h-12" : "w-10 h-10"
                  )}
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                  ) : (
                    <Volume2 className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                  )}
                </Button>
                
                <div className={cn(
                  "bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-3 border border-slate-700/50",
                  isFullscreen ? "w-32" : "w-24"
                )}>
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-full [&_[role=slider]]:bg-cinehub-accent [&_[role=slider]]:border-white [&_[role=slider]]:border-2"
                  />
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1">
              {/* Picture in Picture */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:text-cinehub-accent hover:bg-slate-800/80 transition-all duration-200 rounded-full backdrop-blur-sm border border-slate-700/30 hover:border-cinehub-accent/50 cursor-pointer",
                  isFullscreen ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={togglePictureInPicture}
              >
                <PictureInPicture className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
              </Button>

              {/* Theater Mode */}
              {!isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-white hover:text-cinehub-accent hover:bg-slate-800/80 transition-all duration-200 rounded-full backdrop-blur-sm border border-slate-700/30 hover:border-cinehub-accent/50 cursor-pointer",
                    isTheaterMode && "text-cinehub-accent bg-slate-800/80 border-cinehub-accent/50",
                    isFullscreen ? "w-12 h-12" : "w-10 h-10"
                  )}
                  onClick={toggleTheaterMode}
                >
                  <Tv className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                </Button>
              )}

              {/* Settings Menu */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:text-cinehub-accent hover:bg-slate-800/80 transition-all duration-200 rounded-full backdrop-blur-sm border border-slate-700/30 hover:border-cinehub-accent/50 cursor-pointer",
                      isFullscreen ? "w-12 h-12" : "w-10 h-10"
                    )}
                    onMouseEnter={handleMenuInteraction}
                    onFocus={handleMenuInteraction}
                  >
                    <Settings className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                  </Button>
                </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                    className={cn(
                      "backdrop-blur-xl shadow-2xl",
                      isFullscreen 
                        ? "bg-black/95 border-white/20 rounded-2xl min-w-[200px]" 
                        : "bg-slate-900/95 border-slate-700 rounded-xl min-w-[200px]"
                    )}
                    style={{ zIndex: 9999999 }}
                    align="end"
                    side="top"
                    sideOffset={8}
                    onMouseEnter={handleMenuInteraction}
                  >
                  <div className={cn(
                    "px-3 py-2 text-sm font-semibold border-b",
                    isFullscreen 
                      ? "text-white border-white/10" 
                      : "text-slate-300 border-slate-700"
                  )}>
                    Video Settings
                  </div>
                  
                  {/* Quality Settings */}
                  <div className="px-2 py-1">
                    <div className={cn(
                      "text-xs px-2 py-1 font-medium",
                      isFullscreen ? "text-slate-300" : "text-slate-400"
                    )}>Quality</div>
                    {["1080p", "720p", "480p", "360p"].map((q) => (
                      <DropdownMenuItem
                        key={q}
                        className={cn(
                          "text-white hover:bg-cinehub-accent/20 hover:text-cinehub-accent cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg px-3 py-2",
                          quality === q && "text-cinehub-accent bg-cinehub-accent/10 border border-cinehub-accent/30"
                        )}
                        onClick={() => setQuality(q)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{q} {q === "1080p" || q === "720p" ? "HD" : "SD"}</span>
                          {quality === q && (
                            <div className="w-2 h-2 bg-cinehub-accent rounded-full"></div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator className={isFullscreen ? "bg-white/10" : "bg-slate-700"} />
                  
                  {/* Additional Options - Same for both modes */}
                  <DropdownMenuItem 
                    className={cn(
                      "text-white cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg",
                      isFullscreen ? "hover:bg-slate-800/60" : "hover:bg-slate-800"
                    )}
                    onClick={togglePictureInPicture}
                  >
                    <PictureInPicture className="w-4 h-4 mr-2" />
                    Picture-in-Picture
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn(
                      "text-white cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg",
                      isFullscreen ? "hover:bg-slate-800/60" : "hover:bg-slate-800"
                    )}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn(
                      "text-white cursor-pointer transition-all duration-200 mx-1 my-1 rounded-lg",
                      isFullscreen ? "hover:bg-slate-800/60" : "hover:bg-slate-800"
                    )}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Video
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:text-cinehub-accent hover:bg-slate-800/80 transition-all duration-200 rounded-full backdrop-blur-sm border border-slate-700/30 hover:border-cinehub-accent/50 cursor-pointer",
                  isFullscreen ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                ) : (
                  <Maximize className={isFullscreen ? "w-6 h-6" : "w-5 h-5"} />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading/Buffering Overlay */}
      {(videoDuration === 0 || isBuffering) && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center backdrop-blur-sm z-30",
          isFullscreen ? "bg-black/85" : "bg-slate-950/90"
        )}>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-cinehub-accent rounded-full animate-spin"></div>
            <p className="text-white font-medium">
              {videoDuration === 0 ? "Loading video..." : "Loading buffer..."}
            </p>
          </div>
        </div>
      )}

             {/* Click to play/restart overlay when paused or ended - Only for Desktop */}
       {!isMobile && (!isPlaying && !isAutoPlaying || isEnded) && videoDuration > 0 && !isBuffering && showControls && (
         <div 
           className="absolute inset-0 flex items-center justify-center z-15 cursor-pointer group/play"
           onClick={togglePlay}
         >
           <div className="bg-slate-900/80 backdrop-blur-sm rounded-full border-2 border-cinehub-accent/50 group-hover/play:scale-110 group-hover/play:border-cinehub-accent transition-all duration-300 shadow-2xl p-4">
             {isEnded ? (
               <RotateCcw className="text-cinehub-accent w-12 h-12" />
             ) : (
               <Play className="text-cinehub-accent ml-0.5 w-12 h-12" fill="currentColor" />
             )}
           </div>
         </div>
       )}


    </div>
  );
}