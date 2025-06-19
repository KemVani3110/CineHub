"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLoadingState } from "@/hooks/useLoadingState";
import FileUpload from "@/components/common/FileUpload";
import Loading from "@/components/common/Loading";
import { use } from "react";
import { X } from "lucide-react";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  short_description: z.string().min(1, "Short description is required"),
  full_description: z.string().min(1, "Full description is required"),
  release_date: z.string().min(1, "Release date is required"),
  duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  status: z.enum(["coming_soon", "now_showing", "stopped"]),
  poster_url: z.string().min(1, "Poster URL is required"),
  trailer_url: z.string().min(1, "Trailer URL is required"),
});

type MovieFormData = z.infer<typeof movieSchema>;

export default function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { setLoading, isLoading } = useLoadingState();
  const [movie, setMovie] = useState<MovieFormData | null>(null);
  const resolvedParams = use(params);

  const form = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      short_description: "",
      full_description: "",
      release_date: "",
      duration_minutes: 0,
      genres: [],
      status: "coming_soon",
      poster_url: "",
      trailer_url: "",
    },
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading("movie", true);
        const response = await fetch(`/api/admin/movies/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch movie");
        }
        const data = await response.json();
        setMovie(data);
        form.reset({
          ...data,
          release_date: new Date(data.release_date).toISOString().split("T")[0],
        });
      } catch (error) {
        console.error("Error fetching movie:", error);
        toast.error("Failed to fetch movie details");
        router.push("/admin/movies");
      } finally {
        setLoading("movie", false);
      }
    };

    fetchMovie();
  }, [resolvedParams.id, form, router, setLoading]);

  const onSubmit = async (data: MovieFormData) => {
    try {
      setLoading("movie", true);
      const response = await fetch(`/api/admin/movies/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update movie");
      }

      toast.success("Movie updated successfully");
      router.push("/admin/movies");
    } catch (error) {
      console.error("Error updating movie:", error);
      toast.error("Failed to update movie");
    } finally {
      setLoading("movie", false);
    }
  };

  return (
    <div className="bg-main">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-1 h-8 bg-gradient-accent rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Edit Movie
            </h1>
          </div>
        </div>

        {isLoading("movie") ? (
          <div className="flex justify-center items-center min-h-[500px]">
            <div className="bg-card-custom rounded-lg p-12 shadow-2xl border border-custom">
              <Loading message="Loading movie details..." />
            </div>
          </div>
        ) : (
          <div className="bg-card-custom rounded-xl shadow-2xl border border-custom overflow-hidden">
            <div className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Title Field */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-base font-semibold flex items-center gap-2">
                            Movie Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12 text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white placeholder:text-text-sub"
                              placeholder="Enter movie title..."
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="short_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-base font-semibold flex items-center gap-2">
                            Short Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[120px] text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white placeholder:text-text-sub resize-none"
                              placeholder="Brief description for movie cards..."
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="full_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-base font-semibold flex items-center gap-2">
                            Full Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[120px] text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white placeholder:text-text-sub resize-none"
                              placeholder="Detailed movie description..."
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date and Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="release_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-base font-semibold flex items-center gap-2">
                            Release Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="h-12 text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white cursor-pointer"
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-base font-semibold flex items-center gap-2">
                            Duration (minutes)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              className="h-12 text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white placeholder:text-text-sub"
                              placeholder="120"
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Genres Selection */}
                  <FormField
                    control={form.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-base font-semibold flex items-center gap-2">
                          Genres
                        </FormLabel>
                        <div className="space-y-4">
                          <Select
                            onValueChange={(value) => {
                              const currentGenres = field.value || [];
                              if (!currentGenres.includes(value)) {
                                field.onChange([...currentGenres, value]);
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white cursor-pointer">
                                <SelectValue placeholder="Select genres to add..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card-custom border-border">
                              <SelectItem
                                value="Action"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Action
                              </SelectItem>
                              <SelectItem
                                value="Adventure"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Adventure
                              </SelectItem>
                              <SelectItem
                                value="Animation"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Animation
                              </SelectItem>
                              <SelectItem
                                value="Comedy"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Comedy
                              </SelectItem>
                              <SelectItem
                                value="Crime"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Crime
                              </SelectItem>
                              <SelectItem
                                value="Documentary"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Documentary
                              </SelectItem>
                              <SelectItem
                                value="Drama"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Drama
                              </SelectItem>
                              <SelectItem
                                value="Family"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Family
                              </SelectItem>
                              <SelectItem
                                value="Fantasy"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Fantasy
                              </SelectItem>
                              <SelectItem
                                value="Horror"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Horror
                              </SelectItem>
                              <SelectItem
                                value="Mystery"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Mystery
                              </SelectItem>
                              <SelectItem
                                value="Romance"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Romance
                              </SelectItem>
                              <SelectItem
                                value="Sci-Fi"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Sci-Fi
                              </SelectItem>
                              <SelectItem
                                value="Thriller"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                Thriller
                              </SelectItem>
                              <SelectItem
                                value="War"
                                className="text-white hover:bg-main cursor-pointer"
                              >
                                War
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Selected Genres Display */}
                          <div className="flex flex-wrap gap-3">
                            {field.value?.map((genre) => (
                              <div
                                key={genre}
                                className="flex items-center gap-2 bg-cinehub-accent text-white px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                <span>{genre}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(
                                      field.value?.filter((g) => g !== genre)
                                    );
                                  }}
                                  className="hover:text-danger transition-colors duration-200 cursor-pointer font-bold text-lg"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <FormMessage className="text-danger" />
                      </FormItem>
                    )}
                  />

                  {/* Status Selection */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-base font-semibold flex items-center gap-2">
                          Movie Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white cursor-pointer">
                              <SelectValue placeholder="Select movie status..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card-custom border-border">
                            <SelectItem
                              value="coming_soon"
                              className="text-white hover:bg-main cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                Coming Soon
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="now_showing"
                              className="text-white hover:bg-main cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                Now Showing
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="stopped"
                              className="text-white hover:bg-main cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                Stopped
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-danger" />
                      </FormItem>
                    )}
                  />

                  {/* Media Upload Section */}
                  <div className="space-y-8">
                    <div className="border-t border-border pt-8">
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        Media Assets
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="poster_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white text-base font-semibold">
                                Movie Poster
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-border hover:border-cinehub-accent transition-all duration-300 rounded-lg p-6 bg-main">
                                  <FileUpload
                                    value={field.value}
                                    onUploadComplete={(url: string) =>
                                      field.onChange(url)
                                    }
                                    maxSize={5 * 1024 * 1024} // 5MB
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-danger" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="trailer_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white text-base font-semibold">
                                Trailer URL
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="h-12 text-base bg-main border-2 border-border hover:border-cinehub-accent focus:border-cinehub-accent transition-all duration-300 rounded-lg text-white placeholder:text-text-sub"
                                />
                              </FormControl>
                              <FormMessage className="text-danger" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-border pt-8">
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/movies")}
                        className="h-12 px-8 text-base font-medium rounded-xl border-2 border-custom hover:text-red-500 hover:border-accent transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md text-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading("movie")}
                        className="h-12 px-8 text-base font-medium min-w-[140px] gradient-accent hover:opacity-90 border-2 border-accent transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white"
                      >
                        <span className="flex items-center gap-2">
                          {isLoading("movie") ? (
                            <>
                              <div className="w-4 h-4 border-2 border-bg-main border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            <>Update Movie</>
                          )}
                        </span>
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
