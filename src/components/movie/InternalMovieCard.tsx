import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Star, Play } from 'lucide-react';
import { format } from 'date-fns';

interface InternalMovieCardProps {
  id: number;
  title: string;
  shortDescription: string;
  posterUrl: string;
  releaseDate: string;
  durationMinutes: number;
  genres: string[];
  status: 'coming_soon' | 'now_showing' | 'stopped';
  rating?: number; // Optional rating out of 10
}

export function InternalMovieCard({
  id,
  title,
  shortDescription,
  durationMinutes,
  genres,
  status,
  posterUrl,
  releaseDate,
  rating = 8.5,
}: InternalMovieCardProps) {
  const statusConfig = {
    coming_soon: {
      color: 'bg-warning',
      textColor: 'text-white',
      label: 'Coming Soon',
    },
    now_showing: {
      color: 'bg-success',
      textColor: 'text-white',
      label: 'Now Showing',
    },
    stopped: {
      color: 'bg-danger',
      textColor: 'text-white',
      label: 'Stopped',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <Link href={`/movie/internal/${id}`} className="block group w-[300px]">
      <Card className="movie-card relative h-full cursor-pointer overflow-hidden bg-card border-border transition-all duration-300 hover:shadow-lg">
        {/* Poster Section */}
        <div className="relative h-[380px] w-full overflow-hidden rounded-t-lg">
          <Image
            src={posterUrl || '/images/placeholder-movie.jpg'}
            alt={title}
            fill
            className="object-cover transition-all duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
          
          {/* Status Badge */}
          <Badge
            className={`absolute right-2 top-2 ${currentStatus.color} ${currentStatus.textColor} border-0 px-2 py-1 text-xs font-medium`}
          >
            {currentStatus.label}
          </Badge>

          {/* Rating Badge */}
          <div className="absolute left-2 top-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-xs font-medium">{rating}</span>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-primary/80 backdrop-blur-sm rounded-full p-2 transform transition-transform duration-300">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-3 bg-card">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors duration-300">
              {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
              {shortDescription}
            </p>

            {/* Genres */}
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 3).map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="bg-muted text-muted-foreground hover:bg-accent/20 hover:text-accent transition-colors duration-300 px-1.5 py-0.5 text-xs"
                >
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Movie Details */}
            <div className="flex items-center justify-between pt-1.5 border-t border-border">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  {format(new Date(releaseDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{durationMinutes} min</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-lg border-2 border-accent/50" />
        </div>
      </Card>
    </Link>
  );
}