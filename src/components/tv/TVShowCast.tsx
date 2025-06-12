"use client";

import { TMDBTVDetails, TMDBCastMember } from "@/types/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Award,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface TVShowCastProps {
  tvShow: TMDBTVDetails;
  isLoading?: boolean;
}

interface CastMember extends TMDBCastMember {
  episode_count?: number;
}

export default function TVShowCast({
  tvShow,
  isLoading = false,
}: TVShowCastProps) {
  const [showAllCast, setShowAllCast] = useState(false);
  const cast = (tvShow.credits?.cast || []) as CastMember[];
  const displayCast = showAllCast ? cast : cast.slice(0, 12);

  if (isLoading) {
    return <CastSkeleton />;
  }

  if (!cast.length) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-text-sub text-lg">No cast information available</p>
          <p className="text-text-sub/70 text-sm">
            Cast details will appear here when available
          </p>
        </div>
      </div>
    );
  }

  const CastCard = ({ person }: { person: CastMember }) => (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-bg-card to-bg-card/80 border border-border hover:border-cinehub-accent/30 transition-all duration-300">
        {/* Profile Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={
              person.profile_path
                ? getImageUrl(person.profile_path, "w500")
                : "/images/no-profile.jpg"
            }
            alt={person.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-main/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover Effect Icon */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="w-8 h-8 rounded-full bg-cinehub-accent/20 backdrop-blur-sm border border-cinehub-accent/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cinehub-accent" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h4 className="font-semibold text-text-main text-sm leading-tight group-hover:text-cinehub-accent transition-colors duration-300">
            {person.name}
          </h4>
          <p className="text-text-sub text-xs leading-tight line-clamp-2">
            {person.character || "Unknown Character"}
          </p>
          <div className="flex items-center gap-2 pt-1">
            {person.popularity && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-current" />
                <span className="text-xs text-text-sub/80 font-medium">
                  {person.popularity.toFixed(1)}
                </span>
              </div>
            )}
            {person.episode_count && (
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-cinehub-accent" />
                <span className="text-xs text-text-sub/80 font-medium">
                  {person.episode_count} Episodes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Cast Section */}
      <Card className="bg-gradient-to-br from-bg-card/80 to-bg-card/40 border-border backdrop-blur-sm shadow-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-text-main flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Main Cast
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-400 border-blue-500/30 hidden sm:inline-flex"
                >
                  {cast.length} members
                </Badge>
              </h3>
              <p className="text-text-sub text-sm">
                Meet the talented actors bringing this story to life
              </p>
            </div>

            {cast.length > 12 && (
              <Button
                variant="ghost"
                onClick={() => setShowAllCast(!showAllCast)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group self-start sm:self-auto"
              >
                {showAllCast ? "Show Less" : `Show All (${cast.length})`}
                <ChevronRight
                  className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                    showAllCast ? "rotate-90" : "group-hover:translate-x-1"
                  }`}
                />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {displayCast.map((person) => (
              <CastCard key={person.id} person={person} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CastSkeleton() {
  return (
    <div className="space-y-10">
      <Card className="bg-gradient-to-br from-bg-card/80 to-bg-card/40 border-border backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl bg-slate-700/50" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32 bg-slate-700/50" />
                <Skeleton className="h-4 w-48 bg-slate-700/30" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 bg-slate-700/30" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-xl bg-slate-700/50" />
                <Skeleton className="h-4 w-3/4 bg-slate-700/30" />
                <Skeleton className="h-3 w-1/2 bg-slate-700/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
