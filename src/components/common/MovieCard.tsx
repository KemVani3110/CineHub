"use client";

import React from "react";
import Image from "next/image";
import { Star, Play, Calendar, Film } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface MovieCardProps {
  movie: any; // Replace with proper TMDB type
  showRating?: boolean;
  showCharacter?: boolean;
}

const ImageWithFallback = ({
  src,
  alt,
  hasImage,
}: {
  src: string;
  alt: string;
  hasImage: boolean;
}) => {
  const [error, setError] = React.useState(false);

  if (error || !hasImage) {
    return (
      <div className="relative aspect-[2/3] w-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
        <Film className="w-16 h-16 text-slate-400" />
      </div>
    );
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

export function MovieCard({
  movie,
  showRating = true,
  showCharacter = false,
}: MovieCardProps) {
  const router = useRouter();
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";
  const rating = movie.vote_average;

  const handleClick = () => {
    router.push(`/movie/${movie.id}`);
  };

  return (
    <div onClick={handleClick} className="group relative cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl">
        <ImageWithFallback
          src={movie.poster_path ? getImageUrl(movie.poster_path, "w500") : ""}
          alt={title || "Movie poster"}
          hasImage={!!movie.poster_path}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {showRating && (
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
          {releaseDate && (
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(releaseDate), "MMM d, yyyy")}</span>
            </div>
          )}
          <button className="w-full bg-[#4FD1C5] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4FD1C5]/90 transition-colors cursor-pointer">
            <Play className="w-4 h-4" />
            <span>Watch Now</span>
          </button>
        </div>
      </div>
      <div className="mt-3 px-2">
        <h3 className="font-semibold text-white line-clamp-1">{title}</h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Film className="w-4 h-4" />
          <span>Movie</span>
        </div>
      </div>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#4FD1C5]/0 to-[#4FD1C5]/0 group-hover:from-[#4FD1C5]/10 group-hover:to-[#38B2AC]/10 transition-all duration-500 -z-10 blur-xl" />
    </div>
  );
}
