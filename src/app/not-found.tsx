"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Film,
  ArrowLeft,
  Undo2,
  Home,
  Search,
  Play,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import "@/styles/animation.css";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isHovering, setIsHovering] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [progressValue, setProgressValue] = useState(100);
  const [isMounted, setIsMounted] = useState(false);
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    setIsMounted(true);

    // Generate sparkles for background
    const newSparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setSparkles(newSparkles);

    let countdownTimer = null;

    if (!isHovering && countdown > 0) {
      countdownTimer = setTimeout(() => {
        const newCountdown = countdown - 1;
        setCountdown(newCountdown);
        setProgressValue(newCountdown * 10);

        if (newCountdown === 0) {
          router.push("/home");
        }
      }, 1000);
    }

    let glitchInterval = null;
    if (isMounted) {
      glitchInterval = setInterval(() => {
        setShowGlitch(true);
        setTimeout(() => setShowGlitch(false), 150);
      }, 5000);
    }

    return () => {
      if (countdownTimer) clearTimeout(countdownTimer);
      if (glitchInterval) clearInterval(glitchInterval);
    };
  }, [router, countdown, isHovering, isMounted]);

  const handleHover = () => setIsHovering(true);
  const handleLeave = () => setIsHovering(false);

  const resetCountdown = () => {
    setCountdown(10);
    setProgressValue(100);
  };

  return (
    <div className="overflow-hidden">
      <div className="h-screen w-full flex items-center justify-center fixed inset-0 overflow-hidden p-4">
        {/*  Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-main via-slate-900 to-bg-main overflow-hidden">
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                     linear-gradient(rgba(79, 209, 197, 0.1) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(79, 209, 197, 0.1) 1px, transparent 1px)
                   `,
                backgroundSize: "50px 50px",
                animation: "slide-background 20s linear infinite",
              }}
            ></div>
          </div>

          {/* Floating sparkles */}
          {isMounted &&
            sparkles.map((sparkle) => (
              <div
                key={sparkle.id}
                className="absolute opacity-30"
                style={{
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                  animationDelay: `${sparkle.delay}s`,
                }}
              >
                <Sparkles
                  className="w-4 h-4 text-cinehub-accent animate-pulse"
                  style={{
                    animationDuration: `${2 + Math.random() * 3}s`,
                    filter: "drop-shadow(0 0 6px rgba(79, 209, 197, 0.5))",
                  }}
                />
              </div>
            ))}

          {/* Floating geometric shapes */}
          {isMounted &&
            Array.from({ length: 8 }).map((_, i) => {
              const size = 20 + (i % 4) * 10;
              const top = (i * 15) % 100;
              const left = (i * 23) % 100;
              const animDuration = 8 + (i % 6);

              return (
                <div
                  key={i}
                  className="absolute opacity-10"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    top: `${top}%`,
                    left: `${left}%`,
                    animationDuration: `${animDuration}s`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  {i % 3 === 0 ? (
                    <div
                      className="w-full h-full rounded-full bg-gradient-to-br from-cinehub-accent to-success animate-float"
                      style={{ filter: "blur(1px)" }}
                    />
                  ) : i % 3 === 1 ? (
                    <div
                      className="w-full h-full bg-gradient-to-br from-warning to-cinehub-accent animate-float transform rotate-45"
                      style={{ filter: "blur(1px)" }}
                    />
                  ) : (
                    <Star
                      className="w-full h-full text-cinehub-accent animate-float"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(79, 209, 197, 0.3))",
                      }}
                    />
                  )}
                </div>
              );
            })}

          {/* Ambient light effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cinehub-accent opacity-5 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success opacity-5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Main Content Card */}
        <Card
          className={`w-full max-w-sm z-10 backdrop-blur-lg bg-bg-card/60 border-border/30 shadow-2xl transition-all duration-500 hover:shadow-cinehub-accent/20 hover:scale-[1.02] animate-fade-in-up ${
            isHovering ? "shadow-lg shadow-cinehub-accent/30" : ""
          }`}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          <CardContent className="p-5 text-center space-y-3">
            {/* Status Badge */}
            <Badge
              variant="secondary"
              className={`transition-all duration-300 animate-scale-in px-3 py-1 text-xs font-semibold cursor-pointer ${
                isHovering
                  ? "bg-warning/20 text-warning border-warning/30 shadow-warning/20"
                  : "bg-cinehub-accent/20 text-cinehub-accent border-cinehub-accent/30 shadow-cinehub-accent/20"
              }`}
            >
              {isHovering ? (
                <>
                  <Zap className="w-3 h-3 mr-1.5" />
                  Paused
                </>
              ) : (
                <>
                  <Film className="w-3 h-3 mr-1.5 animate-spin" />
                  Redirecting...
                </>
              )}
            </Badge>

            {/* Cinema Icon with  Glow */}
            <div className="mb-3 relative">
              <div
                className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-cinehub-accent/20 to-success/10 flex items-center justify-center relative transition-all duration-300 cursor-pointer ${
                  showGlitch ? "animate-shake" : ""
                }`}
              >
                <div className="absolute inset-0 rounded-full animate-pulse bg-cinehub-accent/20 blur-sm"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cinehub-accent/10 to-transparent"></div>
                <Film
                  className={`w-7 h-7 text-cinehub-accent transition-all duration-300 z-10 ${
                    showGlitch ? "opacity-70" : "opacity-100"
                  }`}
                  style={{
                    filter: "drop-shadow(0 0 12px rgba(79, 209, 197, 0.6))",
                  }}
                />
              </div>
            </div>

            {/* 404 Title */}
            <div
              className={`relative mb-3 animate-zoom-in ${
                showGlitch ? "animate-shake" : ""
              }`}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-gradient-to-r from-cinehub-accent via-success to-cinehub-accent bg-clip-text flex items-center justify-center gap-2">
                4
                <div className="relative">
                  <Film
                    className="w-7 h-7 animate-spin text-cinehub-accent"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(79, 209, 197, 0.8))",
                    }}
                  />
                  {showGlitch && (
                    <Film className="absolute inset-0 w-7 h-7 text-danger opacity-70 animate-spin" />
                  )}
                </div>
                4
                {showGlitch && (
                  <span className="absolute inset-0 text-danger opacity-70 -translate-x-1 translate-y-0.5 blur-sm">
                    4<Film className="w-7 h-7 inline-block mx-2" />4
                  </span>
                )}
              </h1>
              <div className="h-0.5 w-12 mx-auto mt-2 bg-gradient-to-r from-transparent via-cinehub-accent to-transparent rounded-full animate-shimmer"></div>
            </div>

            <h2 className="text-base font-semibold mb-2 text-text-main animate-fade-in-down flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              Page Not Found
              <Star className="w-4 h-4 text-warning" />
            </h2>

            {/* Error Message */}
            <Card className="bg-danger/10 border-danger/20 animate-fade-in-left">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2 text-left">
                  <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0">
                    <Film className="w-4 h-4 text-danger" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-danger text-sm">
                      Page Not Found - 404
                    </h3>
                    <p className="text-xs text-text-sub leading-relaxed">
                      The page you're looking for doesn't exist or has been removed.
                      The link might be outdated or the content has been moved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Bar */}
            <div className="space-y-2 animate-fade-in-right">
              <Progress
                value={progressValue}
                className={`h-2 bg-bg-main/50 transition-all duration-1000 cursor-pointer ${
                  isHovering ? "opacity-50" : "opacity-100"
                }`}
              />
              <div className="flex items-center justify-between text-xs">
                <p className="text-text-sub">
                  {isHovering ? (
                    <span className="flex items-center gap-1.5 animate-fade-in text-warning">
                      <Zap className="w-3 h-3" />
                      <span className="font-medium">Paused</span>
                      <span className="hidden sm:inline text-xs">
                        - move mouse away to continue
                      </span>
                    </span>
                  ) : (
                    <span className="animate-pulse flex items-center gap-1.5">
                      <Film className="w-3 h-3 text-cinehub-accent" />
                      Redirecting to home in{" "}
                      <Badge
                        variant="outline"
                        className="text-cinehub-accent border-cinehub-accent/50 px-1.5 py-0"
                      >
                        {countdown}s
                      </Badge>
                    </span>
                  )}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-cinehub-accent hover:text-cinehub-accent-hover hover:bg-cinehub-accent/10 hover-scale cursor-pointer"
                  onClick={resetCountdown}
                  title="Reset countdown"
                >
                  <Undo2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2 animate-slide-in-up">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-cinehub-accent/50 text-cinehub-accent hover:bg-cinehub-accent/10 hover:border-cinehub-accent hover:text-cinehub-accent-hover hover-lift cursor-pointer transition-all duration-300"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-1.5 h-3 w-3" />
                Go Back
              </Button>

              <Link href="/home" className="flex-1">
                <Button
                  size="sm"
                  className="w-full bg-cinehub-accent hover:bg-cinehub-accent-hover text-bg-main font-semibold hover-lift shadow-cinehub-accent/20 cursor-pointer"
                >
                  <Home className="mr-1.5 h-3 w-3" />
                  Home
                </Button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center items-center gap-4 pt-2 border-t border-border/50 animate-fade-in">
              <Link href="/search">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-sub hover:text-cinehub-accent hover-scale cursor-pointer p-1"
                  title="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/movies">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-sub hover:text-cinehub-accent hover-scale cursor-pointer p-1"
                  title="Movie list"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </Link>

              <div className="text-xs text-text-sub flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Need help?{" "}
                <Link
                  href="/contact"
                  className="text-cinehub-accent hover:underline hover:text-cinehub-accent-hover transition-colors duration-200 font-medium cursor-pointer"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
