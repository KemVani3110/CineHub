"use client";

import { TMDBTVDetails, TMDBCastMember } from "@/types/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Award, Star, ChevronRight, Sparkles } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

  const CastCard = ({ person }: { person: CastMember }) => {
    const router = useRouter();

    const handleClick = () => {
      router.push(`/actor/${person.id}`);
    };

    return (
      <div className="group cursor-pointer" onClick={handleClick}>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-card/80 transition-all duration-300 hover:border-cinehub-accent/35 hover:bg-bg-card">
          {/* Profile Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
            {person.profile_path ? (
              <Image
                src={getImageUrl(person.profile_path, "w500")}
                alt={person.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <User className="w-12 h-12 text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main/80 via-transparent to-transparent opacity-70" />

            <div className="absolute right-2 top-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cinehub-accent/30 bg-slate-950/70 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-cinehub-accent" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-1.5 p-3">
            <h4 className="line-clamp-1 text-sm font-semibold leading-tight text-text-main transition-colors duration-300 group-hover:text-cinehub-accent">
              {person.name}
            </h4>
            <p className="text-text-sub text-xs leading-tight line-clamp-2">
              {person.character || "Unknown Character"}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {person.popularity && (
                <div className="flex items-center gap-1 rounded-full border border-cinehub-accent/20 bg-cinehub-accent/10 px-2 py-1">
                  <Star className="w-3 h-3 text-cinehub-accent fill-current" />
                  <span className="text-xs text-text-sub/80 font-medium">
                    {person.popularity.toFixed(1)}
                  </span>
                </div>
              )}
              {person.episode_count && (
                <div className="flex items-center gap-1 rounded-full border border-border bg-bg-main/40 px-2 py-1">
                  <Award className="w-3 h-3 text-cinehub-accent" />
                  <span className="text-xs text-text-sub/80 font-medium">
                    {person.episode_count} eps
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Cast Section */}
      <Card className="bg-gradient-to-br from-bg-card/80 to-bg-card/40 border-border backdrop-blur-sm shadow-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-text-main flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cinehub-accent/25 to-cinehub-accent/10 border border-cinehub-accent/25 flex items-center justify-center shadow-lg shadow-cinehub-accent/10">
                  <Users className="w-5 h-5 text-cinehub-accent" />
                </div>
                Main Cast
                <Badge
                  variant="secondary"
                  className="bg-cinehub-accent/10 text-cinehub-accent border-cinehub-accent/30 hidden sm:inline-flex"
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
                className="text-cinehub-accent hover:text-cinehub-accent-hover hover:bg-cinehub-accent/10 border border-cinehub-accent/20 hover:border-cinehub-accent/40 transition-all duration-300 cursor-pointer group self-start sm:self-auto"
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
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
              <div className="skeleton w-10 h-10 rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card animate-pulse" />
              <div className="space-y-2">
                <div className="skeleton h-8 w-32 rounded-lg bg-gradient-to-r from-bg-card to-border" />
                <div className="skeleton h-4 w-48 rounded-lg bg-gradient-to-r from-bg-card to-border" />
              </div>
            </div>
            <div className="skeleton h-10 w-32 rounded-lg bg-gradient-to-r from-bg-card to-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="space-y-4 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="skeleton aspect-[3/4] w-full rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card" />
                <div className="skeleton h-4 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
                <div className="skeleton h-3 w-1/2 rounded-lg bg-gradient-to-r from-bg-card to-border" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
