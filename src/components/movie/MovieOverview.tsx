import { TMDBMovieDetails } from "@/types/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Building2, Calendar, Globe, Clock, Star, Users, TrendingUp } from "lucide-react";

interface MovieOverviewProps {
  movie: TMDBMovieDetails;
}

const statCardClass =
  "group relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/80 to-slate-950/95 border-slate-700/50 hover:border-cinehub-accent/45 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cinehub-accent/10";
const statGlowClass =
  "absolute inset-0 bg-gradient-to-br from-cinehub-accent/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300";
const statIconWrapClass =
  "absolute inset-0 bg-cinehub-accent/15 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500";
const statIconClass = "w-10 h-10 text-cinehub-accent mx-auto relative z-10";
const statValueClass =
  "font-bold text-white mb-2 group-hover:text-cinehub-accent transition-colors";

export default function MovieOverview({ movie }: MovieOverviewProps) {
  return (
    <div className="space-y-10">
      {/* Hero Synopsis Section */}
      <div className="relative overflow-hidden">
        <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/10 rounded-full">
                <Users className="w-7 h-7 text-cinehub-accent" />
              </div>
              <h3 className="text-3xl font-bold text-white">Synopsis</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-none">
              {movie.overview}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Rating Card */}
        <Card className={statCardClass}>
          <div className={statGlowClass} />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-cinehub-accent/15 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Star className="w-10 h-10 text-cinehub-accent mx-auto fill-current relative z-10" />
            </div>
            <div className={`text-4xl ${statValueClass}`}>
              {movie.vote_average.toFixed(1)}
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
              Rating ({movie.vote_count.toLocaleString()} votes)
            </div>
          </CardContent>
        </Card>

        {/* Runtime Card */}
        <Card className={statCardClass}>
          <div className={statGlowClass} />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className={statIconWrapClass} />
              <Clock className={statIconClass} />
            </div>
            <div className={`text-4xl ${statValueClass}`}>
              {movie.runtime ? Math.floor(movie.runtime / 60) : 0}h{" "}
              {movie.runtime ? movie.runtime % 60 : 0}m
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Duration</div>
          </CardContent>
        </Card>

        {/* Release Date Card */}
        <Card className={statCardClass}>
          <div className={statGlowClass} />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className={statIconWrapClass} />
              <Calendar className={statIconClass} />
            </div>
            <div className={`text-3xl ${statValueClass}`}>
              {new Date(movie.release_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Release Date</div>
          </CardContent>
        </Card>

        {/* Language Card */}
        <Card className={statCardClass}>
          <div className={statGlowClass} />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className={statIconWrapClass} />
              <Globe className={statIconClass} />
            </div>
            <div className={`text-2xl ${statValueClass}`}>
              {movie.spoken_languages?.[0]?.english_name || 'English'}
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Primary Language</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Movie Details */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/10 rounded-full">
                <Calendar className="w-7 h-7 text-cinehub-accent" />
              </div>
              <h3 className="text-3xl font-bold text-white">Movie Details</h3>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Status</span>
                <Badge variant="outline" className="border-cinehub-accent/40 text-cinehub-accent bg-cinehub-accent/10 px-3 py-1">
                  {movie.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Original Title</span>
                <span className="text-white font-medium text-right max-w-[250px] truncate">
                  {movie.original_title}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Original Language</span>
                <span className="text-white font-medium">
                  {movie.spoken_languages.find(
                    (lang) => lang.iso_639_1 === movie.original_language
                  )?.english_name || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between items-start py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Genres</span>
                <div className="flex flex-wrap gap-2 max-w-[250px] justify-end">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className="bg-slate-700/50 text-slate-200 text-xs hover:bg-slate-600/50 transition-colors border border-slate-600/30"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {movie.tagline && (
                <div className="flex justify-between items-start py-4">
                  <span className="text-slate-400 font-semibold">Tagline</span>
                  <span className="text-slate-300 italic text-right max-w-[250px] leading-relaxed">
                    "{movie.tagline}"
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial & Production */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/10 rounded-full">
                <Building2 className="w-7 h-7 text-cinehub-accent" />
              </div>
              <h3 className="text-3xl font-bold text-white">Production & Finance</h3>
            </div>
            <div className="space-y-6">
              {movie.budget > 0 && (
                <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                  <span className="text-slate-400 font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-cinehub-accent" />
                    Budget
                  </span>
                  <span className="text-cinehub-accent font-bold text-lg">
                    ${movie.budget.toLocaleString()}
                  </span>
                </div>
              )}

              {movie.revenue > 0 && (
                <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                  <span className="text-slate-400 font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cinehub-accent" />
                    Revenue
                  </span>
                  <span className="text-cinehub-accent font-bold text-lg">
                    ${movie.revenue.toLocaleString()}
                  </span>
                </div>
              )}

              {movie.budget > 0 && movie.revenue > 0 && (
                <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                  <span className="text-slate-400 font-semibold">Profit</span>
                  <span className={`font-bold text-lg ${
                    movie.revenue - movie.budget > 0 ? 'text-cinehub-accent' : 'text-red-400'
                  }`}>
                    ${(movie.revenue - movie.budget).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="space-y-4 pt-6">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cinehub-accent" />
                  Production Companies
                </h4>
                <div className="space-y-3">
                  {movie.production_companies.slice(0, 4).map((company) => (
                    <div key={company.id} className="flex justify-between items-center py-2 px-4 bg-slate-800/30 rounded-lg border border-slate-700/20 hover:border-slate-600/40 transition-colors">
                      <span className="text-slate-300 font-medium">{company.name}</span>
                      {company.origin_country && (
                        <Badge variant="outline" className="border-slate-600/50 text-slate-400 text-xs bg-slate-700/30">
                          {company.origin_country}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {movie.production_countries.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-700/30">
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cinehub-accent" />
                    Production Countries
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {movie.production_countries.map((country) => (
                      <Badge
                        key={country.iso_3166_1}
                        variant="secondary"
                        className="bg-slate-700/50 text-slate-200 border border-slate-600/30 hover:bg-slate-600/50 transition-colors px-3 py-1"
                      >
                        {country.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
