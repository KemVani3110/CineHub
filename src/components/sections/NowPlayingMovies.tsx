'use client';

import React from 'react';
import MovieList from './MovieList';

export default function NowPlayingMovies() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Now Playing</h2>
      <MovieList listType="now_playing" />
    </section>
  );
} 