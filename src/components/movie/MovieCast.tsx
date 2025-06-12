import { TMDBCredits } from "@/types/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Camera,
  Award,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface MovieCastProps {
  credits: TMDBCredits | null;
  isLoading?: boolean;
}

export default function MovieCast({
  credits,
  isLoading = false,
}: MovieCastProps) {
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllCrew, setShowAllCrew] = useState(false);

  if (isLoading) {
    return <CastSkeleton />;
  }

  if (!credits) {
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

  const displayCast = showAllCast ? credits.cast : credits.cast.slice(0, 12);
  const keyCrewRoles = [
    "Director",
    "Producer",
    "Executive Producer",
    "Screenplay",
    "Writer",
    "Cinematography",
    "Music",
    "Editor",
  ];
  const keyCrew = credits.crew.filter((person) =>
    keyCrewRoles.includes(person.job)
  );
  const displayCrew = showAllCrew ? keyCrew : keyCrew.slice(0, 8);

  const CastCard = ({ person }: { person: (typeof credits.cast)[0] }) => (
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
            {person.character}
          </p>
          {person.popularity && (
            <div className="flex items-center gap-1.5 pt-1">
              <Star className="w-3 h-3 text-warning fill-current" />
              <span className="text-xs text-text-sub/80 font-medium">
                {person.popularity.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CrewCard = ({ person }: { person: (typeof credits.crew)[0] }) => (
    <div className="group cursor-pointer">
      <Card className="bg-gradient-to-br from-bg-card to-bg-card/50 border-border hover:border-cinehub-accent/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cinehub-accent/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Profile Image */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex-shrink-0 border-2 border-transparent group-hover:border-cinehub-accent/30 transition-all duration-300">
              <img
                src={
                  person.profile_path
                    ? getImageUrl(person.profile_path, "w500")
                    : "/images/no-profile.jpg"
                }
                alt={person.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              {/* Ring effect */}
              <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-cinehub-accent/20 transition-all duration-300" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <h4 className="font-semibold text-text-main text-base leading-tight group-hover:text-cinehub-accent transition-colors duration-300">
                {person.name}
              </h4>
              <Badge
                variant="outline"
                className="border-cinehub-accent/40 text-cinehub-accent text-xs bg-cinehub-accent/10 hover:bg-cinehub-accent/20 transition-colors duration-300"
              >
                {person.job}
              </Badge>
              {person.department && person.department !== person.job && (
                <p className="text-text-sub text-xs">{person.department}</p>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <ChevronRight className="w-4 h-4 text-cinehub-accent" />
            </div>
          </div>
        </CardContent>
      </Card>
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
                  {credits.cast.length} members
                </Badge>
              </h3>
              <p className="text-text-sub text-sm">
                Meet the talented actors bringing this story to life
              </p>
            </div>

            {credits.cast.length > 12 && (
              <Button
                variant="ghost"
                onClick={() => setShowAllCast(!showAllCast)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group self-start sm:self-auto"
              >
                {showAllCast
                  ? "Show Less"
                  : `Show All (${credits.cast.length})`}
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

      {/* Crew Section */}
      <Card className="bg-gradient-to-br from-bg-card/80 to-bg-card/40 border-border backdrop-blur-sm shadow-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-text-main flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                Key Crew
                <Badge
                  variant="secondary"
                  className="bg-orange-500/20 text-orange-400 border-orange-500/30 hidden sm:inline-flex"
                >
                  {keyCrew.length} professionals
                </Badge>
              </h3>
              <p className="text-text-sub text-sm">
                The creative minds behind the scenes
              </p>
            </div>

            {keyCrew.length > 8 && (
              <Button
                variant="ghost"
                onClick={() => setShowAllCrew(!showAllCrew)}
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 cursor-pointer group self-start sm:self-auto"
              >
                {showAllCrew ? "Show Less" : `Show All (${keyCrew.length})`}
                <ChevronRight
                  className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                    showAllCrew ? "rotate-90" : "group-hover:translate-x-1"
                  }`}
                />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayCrew.map((person) => (
              <CrewCard key={person.credit_id} person={person} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Crew by Department */}
      {credits.crew.length > keyCrew.length && (
        <Card className="bg-gradient-to-br from-bg-card/80 to-bg-card/40 border-border backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-text-main flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                Crew by Department
              </h3>
              <p className="text-text-sub text-sm">
                Complete crew organized by their expertise
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {Array.from(
                new Set(credits.crew.map((person) => person.department))
              ).map((department) => {
                const departmentCrew = credits.crew.filter(
                  (person) => person.department === department
                );
                return (
                  <div key={department} className="group cursor-pointer">
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-5 space-y-4 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                          {department}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-400"
                        >
                          {departmentCrew.length}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {departmentCrew.slice(0, 5).map((person) => (
                          <div
                            key={person.credit_id}
                            className="flex justify-between items-center text-sm py-2 px-3 rounded-lg bg-bg-main/30 hover:bg-bg-main/50 transition-colors duration-200 cursor-pointer"
                          >
                            <span className="text-text-main font-medium">
                              {person.name}
                            </span>
                            <span className="text-text-sub text-xs bg-bg-card/50 px-2 py-1 rounded-md">
                              {person.job}
                            </span>
                          </div>
                        ))}
                        {departmentCrew.length > 5 && (
                          <div className="text-center py-2">
                            <span className="text-xs text-text-sub/70 italic bg-bg-main/20 px-3 py-1 rounded-full">
                              +{departmentCrew.length - 5} more professionals
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
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
