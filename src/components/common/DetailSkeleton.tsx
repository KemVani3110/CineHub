"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface DetailSkeletonProps {
  type?: "movie" | "tv";
}

const DetailSkeleton = ({ type = "movie" }: DetailSkeletonProps) => {
  const icon = type === "movie" ? "🎬" : "📺";
  const tabs =
    type === "movie"
      ? [
          "Overview",
          "Cast & Crew",
          "Reviews",
          "Photos & Videos",
          "Similar Movies",
        ]
      : [
          "Overview",
          "Cast & Crew",
          "Seasons",
          "Reviews",
          "Photos & Videos",
          "Similar Shows",
        ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section Skeleton */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Skeleton */}
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-7xl py-20">
            {/* Poster Skeleton */}
            <div className="lg:col-span-4 xl:col-span-3 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl blur opacity-25 animate-pulse" />
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800">
                  <Skeleton className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl text-slate-600 animate-pulse">
                      {icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Skeleton */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8 text-center lg:text-left">
              {/* Title Skeleton */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-12 sm:h-16 md:h-20 w-full max-w-4xl bg-gradient-to-r from-slate-800 to-slate-700" />
                  <Skeleton className="h-6 sm:h-8 w-2/3 max-w-2xl bg-gradient-to-r from-slate-700 to-slate-600" />
                </div>

                {/* Meta Info Skeleton */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded-full bg-slate-600" />
                      <Skeleton className="h-5 w-12 bg-slate-700" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Genre Tags Skeleton */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-600"
                  />
                ))}
              </div>

              {/* Rating Section Skeleton */}
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32 bg-slate-700" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-slate-600" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full max-w-xs bg-slate-700" />
                      <Skeleton className="h-3 w-3/4 max-w-sm bg-slate-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-14 w-full sm:w-52 rounded-full bg-gradient-to-r from-slate-600 to-slate-700"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="relative z-10 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-16">
          {/* Tabs Skeleton */}
          <div className="mb-8">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2 flex gap-2 overflow-x-auto">
              {tabs.map((tab, i) => (
                <Skeleton
                  key={i}
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 whitespace-nowrap"
                >
                  <span className="opacity-0">{tab}</span>
                </Skeleton>
              ))}
            </div>
          </div>

          {/* Tab Content Skeleton */}
          <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-6">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48 bg-slate-700" />

              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-4 w-full bg-slate-800"
                    style={{
                      width: `${100 - i * 10}%`,
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-32 w-full rounded-lg bg-gradient-to-br from-slate-700 to-slate-800" />
                    <Skeleton className="h-4 w-3/4 bg-slate-700" />
                    <Skeleton className="h-3 w-1/2 bg-slate-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSkeleton;
