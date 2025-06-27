"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TVShowCard } from "@/components/common/TVShowCard";
import { fetchTrendingTVShows } from "@/services/tmdb";
import { TMDBTVShow } from "@/types/tmdb";

const HotTVShows = () => {
  const { data: page2Data, isLoading: isLoadingPage2 } = useQuery({
    queryKey: ["trendingTVShows", 2],
    queryFn: () => fetchTrendingTVShows(2), // Lấy từ page 2
  });

  const { data: page3Data, isLoading: isLoadingPage3 } = useQuery({
    queryKey: ["trendingTVShows", 3],
    queryFn: () => fetchTrendingTVShows(3), // Lấy từ page 3
  });

  const isLoading = isLoadingPage2 || isLoadingPage3;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-4 animate-pulse">
            <div className="skeleton aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-bg-card via-border to-bg-card" />
            <div className="space-y-3">
              <div className="skeleton h-5 w-3/4 rounded-lg bg-gradient-to-r from-bg-card to-border" />
              <div className="skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-bg-card to-border" />
              <div className="skeleton h-3 w-2/3 rounded-lg bg-gradient-to-r from-bg-card to-border" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!page2Data?.results || !page3Data?.results) {
    return null;
  }

  // Lấy tất cả 20 items từ page 2 và 4 items đầu tiên từ page 3
  const allShows = [...page2Data.results, ...page3Data.results.slice(0, 4)];

  // Filter out duplicates just in case
  const uniqueShows = Array.from(
    new Map(allShows.map((show) => [show.id, show])).values()
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {uniqueShows.map((show: TMDBTVShow) => (
        <TVShowCard key={show.id} show={show} />
      ))}
    </div>
  );
};

export default HotTVShows;
