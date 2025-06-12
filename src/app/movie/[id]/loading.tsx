import { Skeleton } from "@/components/ui/skeleton";

export default function MovieDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section Skeleton */}
      <div className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] overflow-hidden pt-4 pb-4">
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-end sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 lg:gap-12 w-full max-w-7xl pb-6 sm:pb-0">
            {/* Poster Skeleton */}
            <div className="flex-shrink-0 mx-auto sm:mx-0 mt-4 sm:mt-0">
              <Skeleton className="w-40 sm:w-56 lg:w-80 h-60 sm:h-84 lg:h-[480px] rounded-xl lg:rounded-2xl" />
            </div>
            
            {/* Info Skeleton */}
            <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="space-y-2 sm:space-y-3">
                <Skeleton className="h-8 sm:h-12 lg:h-16 w-3/4" />
                <Skeleton className="h-4 sm:h-6 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 