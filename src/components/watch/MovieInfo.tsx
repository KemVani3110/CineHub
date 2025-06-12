import { TMDBMovieDetails } from "@/types/tmdb";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Calendar } from "lucide-react";

interface MovieInfoProps {
  movie: TMDBMovieDetails;
}

export function MovieInfo({ movie }: MovieInfoProps) {
  return (
    <div className="space-y-6">
      {/* Title and Info */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{movie.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{movie.vote_average.toFixed(1)}/10</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(movie.release_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{movie.runtime} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-700">
              {movie.original_language.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Overview</h2>
        <p className="text-slate-400 text-lg leading-relaxed">{movie.overview}</p>
      </div>

      {/* Genres */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
            <Badge
              key={genre.id}
              variant="secondary"
              className="bg-[#4fd1c5]/10 text-[#4fd1c5] hover:bg-[#4fd1c5]/20 cursor-pointer"
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
} 