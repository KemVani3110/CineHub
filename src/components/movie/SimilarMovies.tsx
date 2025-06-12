import { TMDBMovie } from "@/types/tmdb";
import { MovieCard } from "@/components/common/MovieCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SimilarMoviesProps {
  movies: TMDBMovie[];
}

export default function SimilarMovies({ movies }: SimilarMoviesProps) {
  const [showAll, setShowAll] = useState(false);
  const displayMovies = showAll ? movies : movies.slice(0, 6);

  if (!movies.length) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No similar movies found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">
          Similar Movies ({movies.length})
        </h3>
        {movies.length > 6 && (
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 border-slate-600/50 text-slate-300 hover:border-cinehub-accent/50 hover:text-cinehub-accent hover:bg-cinehub-accent/10 transition-all duration-200 cursor-pointer"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                View All
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {displayMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}