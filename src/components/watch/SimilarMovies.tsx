import { TMDBMovie } from "@/types/tmdb";
import { MovieCard } from "@/components/common/MovieCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SimilarMoviesProps {
  movies: TMDBMovie[];
}

export function SimilarMovies({ movies }: SimilarMoviesProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Similar Movies</h2>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {movies.slice(0, 10).map((movie) => (
            <div key={movie.id} className="w-[200px] flex-shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
} 