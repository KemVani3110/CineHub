"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
}

interface CalendarState {
  currentMonth: Date;
  hoveredDate?: Date;
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  fromDate,
  toDate,
  className,
}: CalendarProps) {
  const [state, setState] = React.useState<CalendarState>({
    currentMonth: new Date(),
  });

  const [showYearPicker, setShowYearPicker] = React.useState(false);
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);

  const today = new Date();
  const currentDate = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), 1);

  // Get days in month
  const daysInMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), 1).getDay();
  
  // Generate calendar days
  const days = [];
  
  // Previous month days
  const prevMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1, 0);
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i),
      isCurrentMonth: false,
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), day),
      isCurrentMonth: true,
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, day),
      isCurrentMonth: false,
    });
  }

  const isDateSelected = (date: Date) => {
    if (mode === "single") {
      return selected instanceof Date && isSameDay(date, selected);
    } else {
      const range = selected as { from?: Date; to?: Date };
      return (
        (range?.from && isSameDay(date, range.from)) ||
        (range?.to && isSameDay(date, range.to)) ||
        (range?.from && range?.to && date >= range.from && date <= range.to)
      );
    }
  };

  const isDateDisabled = (date: Date) => {
    if (disabled?.(date)) return true;
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (mode !== "range") return false;
    const range = selected as { from?: Date; to?: Date };
    return range?.from && range?.to && date > range.from && date < range.to;
  };

  const isDateRangeStart = (date: Date) => {
    if (mode !== "range") return false;
    const range = selected as { from?: Date; to?: Date };
    return range?.from && isSameDay(date, range.from);
  };

  const isDateRangeEnd = (date: Date) => {
    if (mode !== "range") return false;
    const range = selected as { from?: Date; to?: Date };
    return range?.to && isSameDay(date, range.to);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (mode === "single") {
      onSelect?.(date);
    } else {
      const range = selected as { from?: Date; to?: Date } || {};
      
      if (!range.from || (range.from && range.to)) {
        // Start new range
        onSelect?.({ from: date, to: undefined });
      } else if (range.from && !range.to) {
        // Complete range
        if (date < range.from) {
          onSelect?.({ from: date, to: range.from });
        } else {
          onSelect?.({ from: range.from, to: date });
        }
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setState(prev => ({
      ...prev,
      currentMonth: new Date(
        prev.currentMonth.getFullYear(),
        prev.currentMonth.getMonth() + (direction === "next" ? 1 : -1),
        1
      ),
    }));
  };

  const selectYear = (year: number) => {
    setState(prev => ({
      ...prev,
      currentMonth: new Date(year, prev.currentMonth.getMonth(), 1),
    }));
    setShowYearPicker(false);
  };

  const selectMonth = (month: number) => {
    setState(prev => ({
      ...prev,
      currentMonth: new Date(prev.currentMonth.getFullYear(), month, 1),
    }));
    setShowMonthPicker(false);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years for year picker (current year ± 50 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  if (showYearPicker) {
    return (
      <div className={cn("bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-xl", className)}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowYearPicker(false)}
            className="h-8 px-3 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            ← Back
          </Button>
          <h3 className="text-lg font-semibold text-white">Select Year</h3>
          <div className="w-16"></div> {/* Spacer */}
        </div>
        
        <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto scrollbar-thin">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => selectYear(year)}
              className={cn(
                "h-10 text-sm rounded-lg transition-all duration-200",
                "hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                year === state.currentMonth.getFullYear()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-slate-200 hover:bg-slate-700",
                year === currentYear && "font-bold text-blue-400"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showMonthPicker) {
    return (
      <div className={cn("bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-xl", className)}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMonthPicker(false)}
            className="h-8 px-3 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            ← Back
          </Button>
          <h3 className="text-lg font-semibold text-white">{state.currentMonth.getFullYear()}</h3>
          <div className="w-16"></div> {/* Spacer */}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {monthNames.map((month, index) => (
            <button
              key={month}
              onClick={() => selectMonth(index)}
              className={cn(
                "h-10 text-sm rounded-lg transition-all duration-200",
                "hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                index === state.currentMonth.getMonth()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-slate-200 hover:bg-slate-700"
              )}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="h-8 w-8 p-0 hover:bg-slate-700 text-slate-300 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMonthPicker(true)}
            className="text-lg font-semibold text-white hover:text-blue-400 transition-colors cursor-pointer"
          >
            {monthNames[state.currentMonth.getMonth()]}
          </button>
          <button
            onClick={() => setShowYearPicker(true)}
            className="text-lg font-semibold text-white hover:text-blue-400 transition-colors cursor-pointer"
          >
            {state.currentMonth.getFullYear()}
          </button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="h-8 w-8 p-0 hover:bg-slate-700 text-slate-300 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayInfo, index) => {
          const { date, isCurrentMonth } = dayInfo;
          const isSelected = isDateSelected(date);
          const isDisabled = isDateDisabled(date);
          const isToday = isSameDay(date, today);
          const inRange = isDateInRange(date);
          const rangeStart = isDateRangeStart(date);
          const rangeEnd = isDateRangeEnd(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={cn(
                "h-8 w-8 text-sm rounded-lg transition-all duration-200 relative",
                "hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                !isCurrentMonth && "text-slate-500",
                isCurrentMonth && "text-slate-200",
                isToday && "font-bold text-blue-400",
                isSelected && mode === "single" && "bg-blue-600 text-white hover:bg-blue-700",
                (rangeStart || rangeEnd) && "bg-blue-600 text-white hover:bg-blue-700",
                inRange && "bg-blue-600/30 text-blue-100",
                isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                !isDisabled && !isSelected && !inRange && !rangeStart && !rangeEnd && "hover:bg-slate-700"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
} 