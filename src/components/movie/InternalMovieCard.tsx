import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, Play} from "lucide-react";
import { format } from "date-fns";

interface InternalMovieCardProps {
  id: number;
  title: string;
  shortDescription: string;
  posterUrl: string;
  releaseDate: string;
  durationMinutes: number;
  genres: string[];
  status: "coming_soon" | "now_showing" | "stopped";
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
      color: "bg-gradient-to-r from-warning to-warning/80",
      textColor: "text-white",
      label: "Coming Soon",
    },
    now_showing: {
      color: "bg-gradient-to-r from-success to-success/80",
      textColor: "text-white",
      label: "Now Showing",
    },
    stopped: {
      color: "bg-gradient-to-r from-danger to-danger/80",
      textColor: "text-white",
      label: "Stopped",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="group relative w-full h-full">
      {/* Glow Effect Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cinehub-accent/20 via-success/10 to-cinehub-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

      <Link href={`/movie/internal/${id}`} className="block relative h-full">
        <Card className="relative h-full cursor-pointer overflow-hidden bg-gradient-to-br from-bg-card to-bg-card/80 border border-border/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cinehub-accent/10 hover:border-cinehub-accent/30 rounded-2xl backdrop-blur-sm flex flex-col">
          {/* Poster Section */}
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-2xl flex-shrink-0">
            <Image
              src={posterUrl || "/images/placeholder-movie.jpg"}
              alt={title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />

            {/* Dynamic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main/90 via-bg-main/20 to-transparent opacity-80 group-hover:opacity-60 transition-all duration-500" />

            {/* Top Actions Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              {/* Rating Badge */}
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-sm font-semibold font-inter">
                  {rating}
                </span>
              </div>
              {/* Status Badge */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge
                  className={`${currentStatus.color} ${currentStatus.textColor} border-0 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-lg font-inter backdrop-blur-sm`}
                >
                  {currentStatus.label}
                </Badge>
              </div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-cinehub-accent/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-cinehub-accent to-cinehub-accent-hover backdrop-blur-sm rounded-full p-3 transform transition-all duration-300 hover:scale-110 shadow-2xl border border-white/20">
                  <Play className="h-6 w-6 text-white fill-white translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg-main/95 to-transparent">
              <div className="space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 transform translate-y-4 group-hover:translate-y-0">
                <h3 className="text-white text-base font-bold font-poppins line-clamp-1">
                  {title}
                </h3>
                <p className="text-text-sub text-sm line-clamp-2 leading-relaxed font-inter">
                  {shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-4 bg-gradient-to-br from-bg-card to-bg-card/50 space-y-3 flex-grow flex flex-col">
            {/* Title (visible when not hovering) */}
            <div className="group-hover:opacity-0 transition-opacity duration-300 flex-shrink-0">
              <h3 className="text-white text-base font-bold font-poppins line-clamp-1 mb-2">
                {title}
              </h3>
              <p className="text-text-sub text-sm line-clamp-2 leading-relaxed font-inter">
                {shortDescription}
              </p>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {genres.slice(0, 2).map((genre, index) => (
                <Badge
                  key={genre}
                  className={`bg-gradient-to-r from-border/50 to-border/30 text-text-sub hover:from-cinehub-accent/20 hover:to-cinehub-accent/10 hover:text-cinehub-accent transition-all duration-300 px-2.5 py-1 text-xs font-medium rounded-lg border border-border/30 hover:border-cinehub-accent/30 font-inter`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {genre}
                </Badge>
              ))}
              {genres.length > 2 && (
                <Badge className="bg-gradient-to-r from-text-sub/20 to-text-sub/10 text-text-sub px-2.5 py-1 text-xs font-medium rounded-lg border border-border/30 font-inter">
                  +{genres.length - 2}
                </Badge>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Movie Details */}
            <div className="flex items-center justify-between pt-3 border-t border-border/30 flex-shrink-0">
              <div className="flex items-center gap-2 text-text-sub group-hover:text-cinehub-accent transition-colors duration-300">
                <div className="bg-border/30 rounded-lg p-1">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium font-inter">
                  {format(new Date(releaseDate), "MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-sub group-hover:text-cinehub-accent transition-colors duration-300">
                <div className="bg-border/30 rounded-lg p-1">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium font-inter">
                  {durationMinutes}m
                </span>
              </div>
            </div>

            {/* Additional Info Bar */}
            <div className="flex items-center justify-between text-xs text-text-sub flex-shrink-0">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-cinehub-accent animate-pulse"></div>
                <span className="font-inter">CineHub Original</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-inter">HD</span>
                <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
              </div>
            </div>
          </CardContent>

          {/* Animated Border Effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border-2 border-cinehub-accent/30 animate-pulse"></div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute -top-2 -left-2 h-6 w-6 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"></div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
