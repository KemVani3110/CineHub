"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TVShowCard } from "@/components/common/TVShowCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTVShows } from "@/services/tmdb";
import { TMDBTVShow } from "@/types/tmdb";

interface TVShowListProps {
  listType: "popular" | "top_rated" | "on_the_air";
  title?: string;
}

const TVShowList: React.FC<TVShowListProps> = ({ listType, title }) => {
  const { data: firstPageData, isLoading: isLoadingFirstPage } = useQuery({
    queryKey: ["tvShows", listType, 1],
    queryFn: () => fetchTVShows(listType, 1),
  });

  const { data: secondPageData, isLoading: isLoadingSecondPage } = useQuery({
    queryKey: ["tvShows", listType, 2],
    queryFn: () => fetchTVShows(listType, 2),
  });

  const isLoading = isLoadingFirstPage || isLoadingSecondPage;


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

  if (!firstPageData?.results || !secondPageData?.results) {
    return null;
  }

  // Combine results from both pages and filter out duplicates
  const allShows = [...firstPageData.results, ...secondPageData.results];
  const uniqueShows = Array.from(
    new Map(allShows.map((show) => [show.id, show])).values()
  );

  // Filter shows based on listType
  let filteredShows = uniqueShows;
  if (listType === "on_the_air") {
    filteredShows = uniqueShows.filter((show: TMDBTVShow) => {
      // Check if the show has a next episode to air
      const hasNextEpisode = show.next_episode_to_air !== undefined;
      // Check if the show is currently airing based on first_air_date
      const isCurrentlyAiring = show.first_air_date
        ? new Date(show.first_air_date) <= new Date()
        : false;

      return hasNextEpisode || isCurrentlyAiring;
    });
  }

  // Take only the first 24 shows
  const shows = filteredShows.slice(0, 24);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {shows.map((show: TMDBTVShow) => (
        <TVShowCard key={show.id} show={show} />
      ))}
    </div>
  );
};

export default TVShowList;
