'use client';

import { TMDBTVDetails } from '@/types/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Globe, Star, Users, Tv, Building2 } from 'lucide-react';

interface TVShowOverviewProps {
  tvShow: TMDBTVDetails;
}

export default function TVShowOverview({ tvShow }: TVShowOverviewProps) {
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
              {tvShow.overview}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Rating Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-900/30 via-yellow-900/20 to-amber-800/30 border-amber-700/40 hover:border-amber-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Star className="w-10 h-10 text-yellow-400 mx-auto fill-current relative z-10" />
            </div>
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors">
              {tvShow.vote_average.toFixed(1)}
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
              Rating ({tvShow.vote_count.toLocaleString()} votes)
            </div>
          </CardContent>
        </Card>

        {/* Episodes Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-violet-900/20 to-purple-800/30 border-purple-700/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Tv className="w-10 h-10 text-purple-400 mx-auto relative z-10" />
            </div>
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-purple-100 transition-colors">
              {tvShow.number_of_episodes}
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Total Episodes</div>
          </CardContent>
        </Card>

        {/* Seasons Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-green-900/20 to-emerald-800/30 border-emerald-700/40 hover:border-emerald-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Calendar className="w-10 h-10 text-emerald-400 mx-auto relative z-10" />
            </div>
            <div className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-100 transition-colors">
              {tvShow.number_of_seasons}
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Total Seasons</div>
          </CardContent>
        </Card>

        {/* Language Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-900/30 via-red-900/20 to-orange-800/30 border-orange-700/40 hover:border-orange-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Globe className="w-10 h-10 text-orange-400 mx-auto relative z-10" />
            </div>
            <div className="text-2xl font-bold text-white mb-2 group-hover:text-orange-100 transition-colors">
              {tvShow.spoken_languages?.[0]?.english_name || 'English'}
            </div>
            <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Primary Language</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* TV Show Details */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/10 rounded-full">
                <Calendar className="w-7 h-7 text-cinehub-accent" />
              </div>
              <h3 className="text-3xl font-bold text-white">Show Details</h3>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Status</span>
                <Badge variant="outline" className="border-success/40 text-success bg-success/10 px-3 py-1">
                  {tvShow.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Original Title</span>
                <span className="text-white font-medium text-right max-w-[250px] truncate">
                  {tvShow.original_name}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Original Language</span>
                <span className="text-white font-medium">
                  {tvShow.spoken_languages.find(
                    (lang) => lang.iso_639_1 === tvShow.original_language
                  )?.english_name || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between items-start py-4 border-b border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <span className="text-slate-400 font-semibold">Genres</span>
                <div className="flex flex-wrap gap-2 max-w-[250px] justify-end">
                  {tvShow.genres.slice(0, 3).map((genre) => (
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

              {tvShow.tagline && (
                <div className="flex justify-between items-start py-4">
                  <span className="text-slate-400 font-semibold">Tagline</span>
                  <span className="text-slate-300 italic text-right max-w-[250px] leading-relaxed">
                    "{tvShow.tagline}"
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Networks & Production */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-cinehub-accent/20 to-cinehub-accent/10 rounded-full">
                <Building2 className="w-7 h-7 text-cinehub-accent" />
              </div>
              <h3 className="text-3xl font-bold text-white">Networks & Production</h3>
            </div>
            <div className="space-y-6">
              {tvShow.networks.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Tv className="w-5 h-5 text-cinehub-accent" />
                    Networks
                  </h4>
                  <div className="space-y-3">
                    {tvShow.networks.map((network) => (
                      <div key={network.id} className="flex justify-between items-center py-2 px-4 bg-slate-800/30 rounded-lg border border-slate-700/20 hover:border-slate-600/40 transition-colors">
                        <span className="text-slate-300 font-medium">{network.name}</span>
                        {network.origin_country && (
                          <Badge variant="outline" className="border-slate-600/50 text-slate-400 text-xs bg-slate-700/30">
                            {network.origin_country}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tvShow.production_companies.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-700/30">
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cinehub-accent" />
                    Production Companies
                  </h4>
                  <div className="space-y-3">
                    {tvShow.production_companies.slice(0, 4).map((company) => (
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
              )}

              {tvShow.production_countries.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-700/30">
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cinehub-accent" />
                    Production Countries
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {tvShow.production_countries.map((country) => (
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