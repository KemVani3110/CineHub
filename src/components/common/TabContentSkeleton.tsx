"use client";

import { Skeleton } from "@/components/ui/skeleton";

const TabContentSkeleton = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48 bg-slate-700" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-5/6 bg-slate-800" />
          <Skeleton className="h-4 w-4/5 bg-slate-800" />
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg bg-gradient-to-br from-slate-700 to-slate-800" />
            <Skeleton className="h-4 w-3/4 bg-slate-700" />
            <Skeleton className="h-3 w-1/2 bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabContentSkeleton;
