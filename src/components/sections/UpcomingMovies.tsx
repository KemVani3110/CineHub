'use client';

import React from 'react';
import MovieList from './MovieList';

export default function UpcomingMovies() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
      <MovieList listType="upcoming" />
    </section>
  );
} 