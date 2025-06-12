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
import { ChevronDown } from 'lucide-react';

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

  // Accordion states
  const [openSections, setOpenSections] = useState({
    sort: false,
    genres: false,
    year: false,
    runtime: false,
    dateRange: false
  });

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
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/40">
      <div className="space-y-4">
        {/* Sort Section */}
        <div className="border-b border-border/40 pb-4">
          <button
            onClick={() => toggleSection('sort')}
            className="flex items-center justify-between w-full mb-2 cursor-pointer hover:text-primary transition-colors"
          >
            <span className="text-sm font-medium">Sort By</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              openSections.sort ? "transform rotate-180" : ""
            )} />
          </button>
          {openSections.sort && (
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="cursor-pointer hover:bg-accent/50 transition-colors">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity-desc" className="cursor-pointer hover:bg-accent/50 transition-colors">Popularity (High to Low)</SelectItem>
                <SelectItem value="popularity-asc" className="cursor-pointer hover:bg-accent/50 transition-colors">Popularity (Low to High)</SelectItem>
                <SelectItem value="rating-desc" className="cursor-pointer hover:bg-accent/50 transition-colors">Rating (High to Low)</SelectItem>
                <SelectItem value="rating-asc" className="cursor-pointer hover:bg-accent/50 transition-colors">Rating (Low to High)</SelectItem>
                <SelectItem value="date-desc" className="cursor-pointer hover:bg-accent/50 transition-colors">Release Date (Newest)</SelectItem>
                <SelectItem value="date-asc" className="cursor-pointer hover:bg-accent/50 transition-colors">Release Date (Oldest)</SelectItem>
                <SelectItem value="title-asc" className="cursor-pointer hover:bg-accent/50 transition-colors">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc" className="cursor-pointer hover:bg-accent/50 transition-colors">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Genres Section */}
        <div className="border-b border-border/40 pb-4">
          <button
            onClick={() => toggleSection('genres')}
            className="flex items-center justify-between w-full mb-2 cursor-pointer hover:text-primary transition-colors"
          >
            <span className="text-sm font-medium">Genres</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              openSections.genres ? "transform rotate-180" : ""
            )} />
          </button>
          {openSections.genres && (
            <div className="flex flex-wrap gap-2">
              {genres.length === 0 ? (
                <div className="w-full space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20" />
                  ))}
                </div>
              ) : (
                genres.map((genre) => (
                  <Badge
                    key={genre.id}
                    variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      selectedGenres.includes(genre.id)
                        ? "hover:bg-primary/90"
                        : "hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                    onClick={() => handleGenreToggle(genre.id)}
                  >
                    {genre.name}
                  </Badge>
                ))
              )}
            </div>
          )}
        </div>

        {/* Year Section */}
        <div className="border-b border-border/40 pb-4">
          <button
            onClick={() => toggleSection('year')}
            className="flex items-center justify-between w-full mb-2 cursor-pointer hover:text-primary transition-colors"
          >
            <span className="text-sm font-medium">Year</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              openSections.year ? "transform rotate-180" : ""
            )} />
          </button>
          {openSections.year && (
            <>
              <div className="flex items-center gap-4">
                <Slider
                  value={[yearValue]}
                  onValueChange={handleYearChange}
                  min={1900}
                  max={new Date().getFullYear()}
                  step={1}
                  className="flex-1 cursor-pointer"
                />
                <div className="relative">
                  <Input
                    type="year"
                    value={yearInput}
                    onChange={handleYearInputChange}
                    min={1900}
                    max={new Date().getFullYear()}
                    className={cn(
                      "w-20 cursor-text hover:bg-accent/50 transition-colors",
                      yearError && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {yearError && (
                    <div className="absolute -bottom-6 left-0 text-xs text-destructive">
                      {yearError}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {yearValue || 'Any'}
              </div>
            </>
          )}
        </div>

        {/* Runtime Section */}
        <div className="border-b border-border/40 pb-4">
          <button
            onClick={() => toggleSection('runtime')}
            className="flex items-center justify-between w-full mb-2 cursor-pointer hover:text-primary transition-colors"
          >
            <span className="text-sm font-medium">Runtime (minutes)</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              openSections.runtime ? "transform rotate-180" : ""
            )} />
          </button>
          {openSections.runtime && (
            <>
              <div className="flex items-center gap-4">
                <Slider
                  value={[runtimeValue]}
                  onValueChange={handleRuntimeChange}
                  min={0}
                  max={240}
                  step={5}
                  className="flex-1 cursor-pointer"
                />
                <div className="relative">
                  <Input
                    type="minute"
                    value={runtimeInput}
                    onChange={handleRuntimeInputChange}
                    min={0}
                    max={240}
                    className={cn(
                      "w-20 cursor-text hover:bg-accent/50 transition-colors",
                      runtimeError && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {runtimeError && (
                    <div className="absolute -bottom-6 left-0 text-xs text-destructive">
                      {runtimeError}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {runtimeValue ? `${runtimeValue} min` : 'Any'}
              </div>
            </>
          )}
        </div>

        {/* Release Date Range Section */}
        <div>
          <button
            onClick={() => toggleSection('dateRange')}
            className="flex items-center justify-between w-full mb-2 cursor-pointer hover:text-primary transition-colors"
          >
            <span className="text-sm font-medium">Release Date Range</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              openSections.dateRange ? "transform rotate-180" : ""
            )} />
          </button>
          {openSections.dateRange && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                max={dateRange.to || undefined}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
              />
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                min={dateRange.from || undefined}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 