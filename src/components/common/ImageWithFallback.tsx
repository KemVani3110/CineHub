"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  iconSize?: "sm" | "md" | "lg" | "xl";
  fallbackClassName?: string;
}

const iconSizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes,
  loading = "lazy",
  iconSize = "md",
  fallbackClassName = "bg-gradient-to-br from-slate-700 to-slate-800",
}: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false);

  if (error || !src) {
    if (fill) {
      return (
        <div
          className={`absolute inset-0 ${fallbackClassName} flex items-center justify-center ${className}`}
        >
          <User className={`${iconSizeMap[iconSize]} text-slate-400`} />
        </div>
      );
    }

    return (
      <div
        className={`${fallbackClassName} flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <User className={`${iconSizeMap[iconSize]} text-slate-400`} />
      </div>
    );
  }

  const imageProps = {
    src,
    className,
    loading,
    onError: () => setError(true),
    ...(fill ? { fill: true, sizes } : { width, height }),
  };

  return <Image {...imageProps} alt={alt} />;
}
