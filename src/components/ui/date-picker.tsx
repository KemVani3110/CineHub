"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  label,
  disabled,
  className,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleSelect = (date: Date | { from?: Date; to?: Date } | undefined) => {
    if (date instanceof Date) {
      setSelectedDate(date);
      onChange?.(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    onChange?.("");
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-xs text-slate-400 font-medium">{label}</label>
      )}
      
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-slate-800/70 border-slate-600/50 text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/50 focus:border-cyan-400/50 transition-all duration-200 h-10 w-full",
                !selectedDate && "text-slate-400",
                selectedDate && "pr-10"
              )}
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-cyan-400" />
                {selectedDate ? (
                  format(selectedDate, "MMM dd, yyyy")
                ) : (
                  <span>{placeholder}</span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={(date) =>
                !!(fromDate && date < fromDate) || !!(toDate && date > toDate)
              }
              fromDate={fromDate}
              toDate={toDate}
            />
          </PopoverContent>
        </Popover>
        
        {selectedDate && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
               </div>
      </div>
  );
}

interface DateRangePickerProps {
  value?: { from?: string; to?: string };
  onChange?: (value: { from?: string; to?: string }) => void;
  fromLabel?: string;
  toLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  fromLabel = "From",
  toLabel = "To",
  disabled,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<{
    from?: Date;
    to?: Date;
  }>({
    from: value?.from ? new Date(value.from) : undefined,
    to: value?.to ? new Date(value.to) : undefined,
  });

  const handleSelect = (range: Date | { from?: Date; to?: Date } | undefined) => {
    if (range && typeof range === 'object' && 'from' in range) {
      setDateRange(range || {});
      
      if (range?.from && range?.to) {
        onChange?.({
          from: format(range.from, "yyyy-MM-dd"),
          to: format(range.to, "yyyy-MM-dd"),
        });
        setOpen(false);
      } else if (range?.from) {
        onChange?.({
          from: format(range.from, "yyyy-MM-dd"),
          to: undefined,
        });
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange({});
    onChange?.({ from: undefined, to: undefined });
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    } else if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM dd, yyyy")}`;
    }
    return "Select date range";
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-slate-800/70 border-slate-600/50 text-slate-200 hover:bg-slate-700/70 hover:border-slate-500/50 focus:border-cyan-400/50 transition-all duration-200 h-10 w-full",
                !dateRange.from && !dateRange.to && "text-slate-400",
                (dateRange.from || dateRange.to) && "pr-10"
              )}
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-cyan-400" />
                <span>{formatDateRange()}</span>
              </div>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleSelect}
              toDate={new Date()}
            />
          </PopoverContent>
        </Popover>
        
        {(dateRange.from || dateRange.to) && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
} 