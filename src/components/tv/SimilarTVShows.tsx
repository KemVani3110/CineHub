'use client';

import { TMDBTVDetails, TMDBTV, TMDBTVShow } from '@/types/tmdb';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TVShowCard } from '@/components/common/TVShowCard';

interface SimilarTVShowsProps {
  tvShow: TMDBTVDetails;
}

export default function SimilarTVShows({ tvShow }: SimilarTVShowsProps) {
  const [showAll, setShowAll] = useState(false);
  const similarShows = tvShow.similar || [];
  const displayShows = showAll ? similarShows : similarShows.slice(0, 6);

  if (!similarShows.length) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No similar TV shows found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">
          Similar TV Shows ({similarShows.length})
        </h3>
        {similarShows.length > 6 && (
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
        {displayShows.map((show) => {
          // Convert TMDBTV to TMDBTVShow
          const tvShow: TMDBTVShow = {
            id: show.id,
            name: show.name,
            poster_path: show.poster_path || null,
            backdrop_path: show.backdrop_path || null,
            overview: show.overview,
            first_air_date: show.first_air_date,
            vote_average: show.vote_average,
            vote_count: show.vote_count,
            genre_ids: show.genre_ids
          };
          return <TVShowCard key={show.id} show={tvShow} />;
        })}
      </div>
    </div>
  );
} 