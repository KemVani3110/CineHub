"use client";

import { useCallback, useState, useEffect } from 'react';
import { useExploreStore } from '@/store/exploreStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TMDBGenre } from '@/types/tmdb';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { ChevronDown, Calendar, Clock, Filter, Star } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-picker';

interface ExploreFiltersProps {
  genres: TMDBGenre[];
}

export function ExploreFilters({ genres }: ExploreFiltersProps) {
  const { filters, setFilters, activeTab } = useExploreStore();
  
  // Local states for all filters
  const [runtimeValue, setRuntimeValue] = useState(filters.runtime.min || 0);
  const [yearValue, setYearValue] = useState(filters.year || new Date().getFullYear());
  const [selectedGenres, setSelectedGenres] = useState<number[]>(filters.genres);
  const [dateRange, setDateRange] = useState({
    from: filters.releaseDate.from || '',
    to: filters.releaseDate.to || ''
  });

  // Accordion states - ensure all sections are closed by default
  const [openSections, setOpenSections] = useState({
    sort: false,
    genres: false,
    year: false,
    runtime: false,
    dateRange: false
  });

  // Reset openSections when component mounts or when activeTab changes
  useEffect(() => {
    setOpenSections({
      sort: false,
      genres: false,
      year: false,
      runtime: false,
      dateRange: false
    });
  }, [activeTab]);

  // Input states
  const [runtimeInput, setRuntimeInput] = useState(runtimeValue.toString());
  const [yearInput, setYearInput] = useState(yearValue.toString());

  // Error states
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);

  // Debounced values
  const debouncedRuntime = useDebounce(runtimeValue, 500);
  const debouncedYear = useDebounce(yearValue, 500);
  const debouncedGenres = useDebounce(selectedGenres, 500);
  const debouncedDateRange = useDebounce(dateRange, 500);

  // Update filters when debounced values change
  useEffect(() => {
    if (debouncedRuntime !== filters.runtime.min) {
      setFilters({ runtime: { min: debouncedRuntime, max: null } });
    }
  }, [debouncedRuntime, setFilters]);

  useEffect(() => {
    if (debouncedYear !== filters.year) {
      setFilters({ year: debouncedYear });
    }
  }, [debouncedYear, setFilters]);

  useEffect(() => {
    if (JSON.stringify(debouncedGenres) !== JSON.stringify(filters.genres)) {
      setFilters({ genres: debouncedGenres });
    }
  }, [debouncedGenres, setFilters]);

  useEffect(() => {
    if (
      debouncedDateRange.from !== filters.releaseDate.from ||
      debouncedDateRange.to !== filters.releaseDate.to
    ) {
      setFilters({
        releaseDate: {
          from: debouncedDateRange.from || null,
          to: debouncedDateRange.to || null
        }
      });
    }
  }, [debouncedDateRange, setFilters]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split('-');
    setFilters({
      sortBy: field as 'popularity' | 'rating' | 'date' | 'title',
      sortOrder: order as 'asc' | 'desc'
    });
  }, [setFilters]);

  const validateYear = useCallback((value: string): boolean => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setYearError('Please enter a valid number');
      return false;
    }
    if (numValue < 1900 || numValue > new Date().getFullYear()) {
      setYearError(`Year must be between 1900 and ${new Date().getFullYear()}`);
      return false;
    }
    setYearError(null);
    return true;
  }, []);

  const validateRuntime = useCallback((value: string): boolean => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setRuntimeError('Please enter a valid number');
      return false;
    }
    if (numValue < 0 || numValue > 240) {
      setRuntimeError('Runtime must be between 0 and 240 minutes');
      return false;
    }
    setRuntimeError(null);
    return true;
  }, []);

  const handleYearChange = useCallback((value: number[]) => {
    setYearValue(value[0]);
    setYearInput(value[0].toString());
  }, []);

  const handleYearInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYearInput(value);
    
    if (validateYear(value)) {
      setYearValue(parseInt(value));
    }
  }, [validateYear]);

  const handleRuntimeChange = useCallback((value: number[]) => {
    setRuntimeValue(value[0]);
    setRuntimeInput(value[0].toString());
  }, []);

  const handleRuntimeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRuntimeInput(value);
    
    if (validateRuntime(value)) {
      setRuntimeValue(parseInt(value));
    }
  }, [validateRuntime]);

  const handleGenreToggle = useCallback((genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  }, []);

  const handleDateRangeChange = useCallback((field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl max-h-[85vh] flex flex-col sticky top-4">
      <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin scroll-smooth">
        {/* Sort Section */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('sort')}
            className="group flex items-center justify-between w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-slate-200">Sort By</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-slate-200",
              openSections.sort ? "transform rotate-180 text-blue-400" : ""
            )} />
          </button>
          
          {openSections.sort && (
            <div className="pl-4 animate-in slide-in-from-top-2 duration-300">
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="bg-slate-800/70 border-slate-600/50 text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/50 transition-all duration-200">
                  <SelectValue placeholder="Choose sorting method" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="popularity-desc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">🔥 Most Popular</SelectItem>
                  <SelectItem value="popularity-asc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">📈 Least Popular</SelectItem>
                  <SelectItem value="rating-desc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">⭐ Highest Rated</SelectItem>
                  <SelectItem value="rating-asc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">📉 Lowest Rated</SelectItem>
                  <SelectItem value="date-desc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">🆕 Newest First</SelectItem>
                  <SelectItem value="date-asc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">📅 Oldest First</SelectItem>
                  <SelectItem value="title-asc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">🔤 A to Z</SelectItem>
                  <SelectItem value="title-desc" className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">🔤 Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Genres Section */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('genres')}
            className="group flex items-center justify-between w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <span className="font-medium text-slate-200">Genres</span>
              {selectedGenres.length > 0 && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                  {selectedGenres.length}
                </span>
              )}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-slate-200",
              openSections.genres ? "transform rotate-180 text-purple-400" : ""
            )} />
          </button>
          
          {openSections.genres && (
            <div className="pl-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-wrap gap-2">
                {genres.length === 0 ? (
                  <div className="w-full space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-20 bg-slate-700/50" />
                    ))}
                  </div>
                ) : (
                  genres.map((genre) => (
                    <Badge
                      key={genre.id}
                      variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                      className={cn(
                        "px-3 py-1.5 cursor-pointer transition-all duration-200 border",
                        selectedGenres.includes(genre.id)
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400/50 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                          : "bg-slate-800/70 border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:border-slate-500/50 hover:text-white"
                      )}
                      onClick={() => handleGenreToggle(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Year Section */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('year')}
            className="group flex items-center justify-between w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="font-medium text-slate-200">Year</span>
              {yearValue && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                  {yearValue}
                </span>
              )}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-slate-200",
              openSections.year ? "transform rotate-180 text-green-400" : ""
            )} />
          </button>
          
          {openSections.year && (
            <div className="pl-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4">
                <Slider
                  value={[yearValue]}
                  onValueChange={handleYearChange}
                  min={1900}
                  max={new Date().getFullYear()}
                  step={1}
                  className="flex-1"
                />
                <div className="relative">
                  <Input
                    type="number"
                    value={yearInput}
                    onChange={handleYearInputChange}
                    min={1900}
                    max={new Date().getFullYear()}
                    className={cn(
                      "w-20 bg-slate-800/70 border-slate-600/50 text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/50 focus:border-green-400/50 transition-all duration-200",
                      yearError && "border-red-400/50 focus:border-red-400/50"
                    )}
                  />
                  {yearError && (
                    <div className="absolute -bottom-6 left-0 text-xs text-red-400">
                      {yearError}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-slate-400">
                Selected: <span className="text-green-400 font-medium">{yearValue}</span>
              </div>
            </div>
          )}
        </div>

        {/* Runtime Section */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('runtime')}
            className="group flex items-center justify-between w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="font-medium text-slate-200">Runtime</span>
              {runtimeValue > 0 && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                  {runtimeValue}m
                </span>
              )}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-slate-200",
              openSections.runtime ? "transform rotate-180 text-orange-400" : ""
            )} />
          </button>
          
          {openSections.runtime && (
            <div className="pl-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4">
                <Slider
                  value={[runtimeValue]}
                  onValueChange={handleRuntimeChange}
                  min={0}
                  max={240}
                  step={5}
                  className="flex-1"
                />
                <div className="relative">
                  <Input
                    type="number"
                    value={runtimeInput}
                    onChange={handleRuntimeInputChange}
                    min={0}
                    max={240}
                    className={cn(
                      "w-20 bg-slate-800/70 border-slate-600/50 text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/50 focus:border-orange-400/50 transition-all duration-200",
                      runtimeError && "border-red-400/50 focus:border-red-400/50"
                    )}
                  />
                  {runtimeError && (
                    <div className="absolute -bottom-6 left-0 text-xs text-red-400">
                      {runtimeError}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-slate-400">
                Duration: <span className="text-orange-400 font-medium">
                  {runtimeValue ? `${runtimeValue} minutes` : 'Any length'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Release Date Range Section */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('dateRange')}
            className="group flex items-center justify-between w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-slate-200">Date Range</span>
              {(dateRange.from || dateRange.to) && (
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                  Set
                </span>
              )}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-slate-200",
              openSections.dateRange ? "transform rotate-180 text-cyan-400" : ""
            )} />
          </button>
          
          {openSections.dateRange && (
            <div className="pl-4 animate-in slide-in-from-top-2 duration-300">
              <DateRangePicker
                value={{
                  from: dateRange.from || undefined,
                  to: dateRange.to || undefined
                }}
                onChange={(newRange) => {
                  setDateRange({
                    from: newRange.from || '',
                    to: newRange.to || ''
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 