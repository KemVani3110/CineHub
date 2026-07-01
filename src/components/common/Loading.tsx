"use client";

import Image from "next/image";

interface LoadingProps {
  message?: string;
  showBackdrop?: boolean;
}

const Loading = ({ message = "Loading...", showBackdrop = true }: LoadingProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${
        showBackdrop
          ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          : ""
      } flex min-h-[300px] items-center justify-center`}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border-[6px] border-primary/30 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="CineHub Logo"
              width={60}
              height={60}
              priority={showBackdrop}
              className="h-[60px] w-[60px] rounded-full object-cover animate-pulse"
            />
          </div>
        </div>

        <p className="text-text-sub text-lg font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loading;
