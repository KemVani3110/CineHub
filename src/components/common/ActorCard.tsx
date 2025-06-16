"use client";

import React from "react";
import Image from "next/image";
import { Star, User, Sparkles } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useRouter } from "next/navigation";

interface ActorCardProps {
  actor: {
    id: number;
    name: string;
    profile_path: string | null;
    popularity?: number;
    known_for_department?: string;
  };
  showRating?: boolean;
}

const ImageWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = React.useState(false);

  if (error) {
    return null;
  }

  return (
    <div className="relative aspect-[2/3] w-full">
      <div className="absolute inset-0 bg-[#1B263B]" />
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 60vw, (max-width: 1200px) 40vw, 30vw"
        className="object-cover transition-transform duration-300 group-hover:scale-110"
        onError={() => setError(true)}
      />
    </div>
  );
};

export function ActorCard({ actor, showRating = true }: ActorCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/actor/${actor.id}`);
  };

  return (
    <div onClick={handleClick} className="group relative cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl">
        <ImageWithFallback
          src={
            actor.profile_path
              ? getImageUrl(actor.profile_path, "w500")
              : "/images/no-profile.jpg"
          }
          alt={actor.name || "Actor profile"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {showRating && actor.popularity && (
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{actor.popularity.toFixed(1)}</span>
            </div>
          )}
          <button className="w-full bg-[#4FD1C5] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4FD1C5]/90 transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4" />
            <span>View Profile</span>
          </button>
        </div>
      </div>
      <div className="mt-3 px-2">
        <h3 className="font-semibold text-white line-clamp-1">{actor.name}</h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <User className="w-4 h-4" />
          <span>{actor.known_for_department || "Actor"}</span>
        </div>
      </div>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#4FD1C5]/0 to-[#4FD1C5]/0 group-hover:from-[#4FD1C5]/10 group-hover:to-[#38B2AC]/10 transition-all duration-500 -z-10 blur-xl" />
    </div>
  );
} 