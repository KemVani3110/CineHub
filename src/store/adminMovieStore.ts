import { create } from 'zustand';
import { toast } from '@/components/ui/use-toast';

interface AdminMovie {
  id: number;
  title: string;
  short_description: string;
  full_description: string;
  release_date: string;
  duration_minutes: number;
  genres: string[];
  status: 'coming_soon' | 'now_showing' | 'stopped';
  poster_url: string;
  trailer_url: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface AdminMovieStore {
  movies: AdminMovie[];
  isLoading: boolean;
  error: string | null;
  fetchMovies: () => Promise<void>;
  createMovie: (movie: Omit<AdminMovie, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMovie: (id: number, movie: Partial<AdminMovie>) => Promise<void>;
  deleteMovie: (id: number) => Promise<void>;
}

export const useAdminMovieStore = create<AdminMovieStore>((set, get) => ({
  movies: [],
  isLoading: false,
  error: null,

  fetchMovies: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/admin/movies');
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      set({ movies: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      toast({
        title: 'Error',
        description: 'Failed to fetch movies',
        variant: 'destructive',
      });
    }
  },

  createMovie: async (movie) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movie),
      });
      if (!response.ok) throw new Error('Failed to create movie');
      await get().fetchMovies();
      toast({
        title: 'Success',
        description: 'Movie created successfully',
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      toast({
        title: 'Error',
        description: 'Failed to create movie',
        variant: 'destructive',
      });
    }
  },

  updateMovie: async (id, movie) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/movies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movie),
      });
      if (!response.ok) throw new Error('Failed to update movie');
      await get().fetchMovies();
      toast({
        title: 'Success',
        description: 'Movie updated successfully',
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      toast({
        title: 'Error',
        description: 'Failed to update movie',
        variant: 'destructive',
      });
    }
  },

  deleteMovie: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/admin/movies/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete movie');
      await get().fetchMovies();
      toast({
        title: 'Success',
        description: 'Movie deleted successfully',
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      toast({
        title: 'Error',
        description: 'Failed to delete movie',
        variant: 'destructive',
      });
    }
  },
})); 