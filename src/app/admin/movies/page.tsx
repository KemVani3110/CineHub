"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  Film,
  Calendar,
  Clock,
  Tag,
} from "lucide-react";
import { useLoadingState } from "@/hooks/useLoadingState";

interface LocalMovie {
  id: number;
  title: string;
  short_description: string;
  full_description: string;
  release_date: string;
  duration_minutes: number;
  genres: string[] | string;
  status: "coming_soon" | "now_showing" | "stopped";
  poster_url: string;
  trailer_url: string;
  created_at: string;
  updated_at: string;
}

export default function AdminMoviesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { setLoading, isLoading } = useLoadingState();
  const [movies, setMovies] = useState<LocalMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/");
      toast.error("Unauthorized access");
    }
  }, [session, router]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading("movies", true);
      const response = await fetch("/api/admin/movies");
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      toast.error("Failed to load movies");
      console.error(error);
    } finally {
      setLoading("movies", false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      setLoading("delete", true);
      const response = await fetch(`/api/admin/movies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete movie");

      toast.success("Movie deleted successfully");
      fetchMovies();
    } catch (error) {
      toast.error("Failed to delete movie");
      console.error(error);
    } finally {
      setLoading("delete", false);
    }
  };

  const getGenres = (movie: LocalMovie): string[] => {
    if (Array.isArray(movie.genres)) {
      return movie.genres;
    }
    try {
      return JSON.parse(movie.genres as string);
    } catch (error) {
      console.error(`Error parsing genres for movie ${movie.id}:`, error);
      return [];
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || movie.status === statusFilter;
    const movieGenres = getGenres(movie);
    const matchesGenre =
      genreFilter === "all" || movieGenres.includes(genreFilter);
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "now_showing":
        return "bg-success/20 text-success border border-success/30";
      case "coming_soon":
        return "bg-cinehub-accent/20 text-cinehub-accent border border-cinehub-accent/30";
      case "stopped":
        return "bg-danger/20 text-danger border border-danger/30";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="bg-gradient-card rounded-xl p-6 mb-8 border border-border shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cinehub-accent/20 rounded-lg">
                <Film className="h-6 w-6 text-cinehub-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Movie Management
                </h1>
                <p className="text-text-sub">
                  Manage your cinema's movie collection
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin/movies/create")}
              className="bg-cinehub-accent hover:bg-cinehub-accent-hover text-bg-main font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer group"
            >
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              Add New Movie
            </Button>
          </div>
        </div>
        {/* Filters Section */}
        <div className="bg-gradient-card rounded-xl p-6 mb-8 border border-border shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-sub group-hover:text-cinehub-accent transition-colors duration-200" />
                <Input
                  placeholder="Search movies by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-bg-main border-2 border-border hover:border-cinehub-accent/50 focus:border-cinehub-accent rounded-lg text-white placeholder-text-sub transition-all duration-200"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[200px] bg-bg-main border-2 border-border hover:border-cinehub-accent/50 rounded-lg text-white cursor-pointer transition-all duration-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border rounded-lg">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  All Status
                </SelectItem>
                <SelectItem
                  value="coming_soon"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Coming Soon
                </SelectItem>
                <SelectItem
                  value="now_showing"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Now Showing
                </SelectItem>
                <SelectItem
                  value="stopped"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Stopped
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-full lg:w-[200px] bg-bg-main border-2 border-border hover:border-cinehub-accent/50 rounded-lg text-white cursor-pointer transition-all duration-200">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border rounded-lg">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  All Genres
                </SelectItem>
                <SelectItem
                  value="Action"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Action
                </SelectItem>
                <SelectItem
                  value="Drama"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Drama
                </SelectItem>
                <SelectItem
                  value="Comedy"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Comedy
                </SelectItem>
                <SelectItem
                  value="Thriller"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Thriller
                </SelectItem>
                <SelectItem
                  value="Horror"
                  className="text-white hover:bg-cinehub-accent/20 cursor-pointer"
                >
                  Horror
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Movies Table */}
        <div className="bg-gradient-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-cinehub-accent" />
              Movies List ({filteredMovies.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-cinehub-accent font-semibold py-4 px-6">
                    Title
                  </TableHead>
                  <TableHead className="text-cinehub-accent font-semibold py-4 px-6">
                    Genres
                  </TableHead>
                  <TableHead className="text-cinehub-accent font-semibold py-4 px-6">
                    Release Date
                  </TableHead>
                  <TableHead className="text-cinehub-accent font-semibold py-4 px-6">
                    Duration
                  </TableHead>
                  <TableHead className="text-cinehub-accent font-semibold py-4 px-6">
                    Status
                  </TableHead>
                  <TableHead className="text-cinehub-accent font-semibold py-4 px-6 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading("movies") ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-cinehub-accent" />
                        <p className="text-text-sub">Loading movies...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMovies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Film className="h-12 w-12 text-text-sub" />
                        <p className="text-text-sub text-lg">No movies found</p>
                        <p className="text-text-sub text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovies.map((movie) => (
                    <TableRow
                      key={movie.id}
                      className="border-border hover:bg-bg-main/50 transition-all duration-200 group"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-bg-main rounded-lg border border-border flex items-center justify-center overflow-hidden">
                            {movie.poster_url ? (
                              <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="h-6 w-6 text-text-sub" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium group-hover:text-cinehub-accent transition-colors duration-200">
                              {movie.title}
                            </p>
                            <p className="text-text-sub text-sm truncate max-w-xs">
                              {movie.short_description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {getGenres(movie)
                            .slice(0, 2)
                            .map((genre, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-cinehub-accent/20 text-cinehub-accent text-xs rounded-full border border-cinehub-accent/30"
                              >
                                {genre}
                              </span>
                            ))}
                          {getGenres(movie).length > 2 && (
                            <span className="px-2 py-1 bg-text-sub/20 text-text-sub text-xs rounded-full">
                              +{getGenres(movie).length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-text-sub" />
                          <span className="text-white">
                            {new Date(movie.release_date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-text-sub" />
                          <span className="text-white">
                            {movie.duration_minutes}min
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles(
                            movie.status
                          )}`}
                        >
                          {movie.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/movies/${movie.id}/edit`)
                            }
                            disabled={isLoading("delete")}
                            className="bg-transparent border-2 border-cinehub-accent/50 text-cinehub-accent hover:bg-cinehub-accent hover:text-bg-main transition-all duration-200 cursor-pointer group"
                          >
                            <Edit className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(movie.id)}
                            disabled={isLoading("delete")}
                            className="bg-transparent border-2 border-danger/50 text-danger hover:bg-danger hover:text-white transition-all duration-200 cursor-pointer group"
                          >
                            {isLoading("delete") ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
                            )}
                            {isLoading("delete") ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
