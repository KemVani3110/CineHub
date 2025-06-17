"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAdminMovieStore } from "@/store/adminMovieStore";
import FileUpload from "@/components/common/FileUpload";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Film,
  Calendar,
  Clock,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

type MovieFormValues = z.infer<typeof movieSchema>;

const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "War",
  "Western",
];

export default function CreateMoviePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { createMovie } = useAdminMovieStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MovieFormValues>({
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
    if (session?.user?.role !== "admin") {
      router.push("/home");
    }
  }, [session, router]);

  const onSubmit = async (data: MovieFormValues) => {
    try {
      setIsLoading(true);
      await createMovie({
        ...data,
        created_by: Number(session?.user?.id) || 0,
      });
      toast({
        title: "Success",
        description: "Movie created successfully",
      });
      router.push("/admin/movies");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create movie",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-main">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-card/80 shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-custom"
            >
              <ArrowLeft className="h-5 w-5 text-sub" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 gradient-accent rounded-xl shadow-lg">
                <Film className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Create New Movie
                </h1>
                <p className="text-sub text-lg mt-1">
                  Add a new movie to the platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="border border-custom shadow-2xl bg-card backdrop-blur-sm">
          <CardHeader className="pb-6 border-b border-custom">
            <CardTitle className="text-2xl text-foreground flex items-center space-x-2">
              <Plus className="h-6 w-6 text-accent" />
              <span>Movie Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-0"
              >
                {/* Basic Information Section */}
                <div className="p-8 border-b border-custom">
                  <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center space-x-2">
                    <Star className="h-5 w-5 text-accent" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base flex items-center space-x-2">
                            <Film className="h-4 w-4 text-accent" />
                            <span>Movie Title</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter movie title"
                              {...field}
                              className="h-12 text-base border-2 border-custom focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 rounded-xl bg-input shadow-sm hover:shadow-md cursor-text text-foreground"
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="release_date"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-accent" />
                            <span>Release Date</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="h-12 text-base border-2 border-custom focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 rounded-xl bg-input shadow-sm hover:shadow-md cursor-pointer text-foreground"
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
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span>Duration (minutes)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="120"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                              className="h-12 text-base border-2 border-custom focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 rounded-xl bg-input shadow-sm hover:shadow-md cursor-text text-foreground"
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base">
                            Movie Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base border-2 border-custom focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 rounded-xl bg-input shadow-sm hover:shadow-md cursor-pointer text-foreground">
                                <SelectValue placeholder="Select movie status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-2 shadow-xl bg-card border-custom">
                              <SelectItem
                                value="coming_soon"
                                className="cursor-pointer text-foreground hover:bg-accent/10"
                              >
                                Coming Soon
                              </SelectItem>
                              <SelectItem
                                value="now_showing"
                                className="cursor-pointer text-foreground hover:bg-accent/10"
                              >
                                Now Showing
                              </SelectItem>
                              <SelectItem
                                value="stopped"
                                className="cursor-pointer text-foreground hover:bg-accent/10"
                              >
                                Stopped
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Descriptions Section */}
                <div className="p-8 border-b border-custom">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Movie Descriptions
                  </h3>
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="short_description"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base">
                            Short Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a brief and catchy description for the movie..."
                              className="min-h-24 text-base border-2 border-custom focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 rounded-xl bg-input shadow-sm hover:shadow-md resize-none cursor-text text-foreground"
                              {...field}
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
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base">
                            Full Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the complete description with plot details, cast information, and other relevant details..."
                              className="min-h-40 text-base border-2 border-custom focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 rounded-xl bg-input shadow-sm hover:shadow-md resize-none cursor-text text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Genres Section */}
                <div className="p-8 border-b border-custom">
                  <FormField
                    control={form.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-lg font-semibold text-foreground">
                          Movie Genres
                        </FormLabel>
                        <p className="text-sub text-sm">
                          Select all genres that apply to this movie
                        </p>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {genres.map((genre) => (
                              <Button
                                key={genre}
                                type="button"
                                variant={
                                  field.value.includes(genre)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => {
                                  const newGenres = field.value.includes(genre)
                                    ? field.value.filter((g) => g !== genre)
                                    : [...field.value, genre];
                                  field.onChange(newGenres);
                                }}
                                className={`h-12 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer border-2 ${
                                  field.value.includes(genre)
                                    ? "gradient-accent hover:opacity-90 border-accent text-white shadow-lg transform hover:scale-105"
                                    : "bg-input hover:bg-accent/10 border-custom hover:border-accent text-foreground shadow-sm hover:shadow-md"
                                }`}
                              >
                                {genre}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage className="text-danger" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Media Section */}
                <div className="p-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Media Files
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="poster_url"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base">
                            Movie Poster
                          </FormLabel>
                          <FormControl>
                            <div className="border-2 border-dashed border-custom rounded-xl p-6 hover:border-accent transition-colors duration-300 bg-input/50">
                              <FileUpload
                                onUploadComplete={(url) => field.onChange(url)}
                                accept="image/*"
                                maxSize={5 * 1024 * 1024}
                                label="Upload Movie Poster"
                                value={field.value}
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
                        <FormItem className="space-y-3">
                          <FormLabel className="text-foreground font-semibold text-base">
                            Trailer URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              {...field}
                              className="h-12 text-base border-2 border-custom focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 rounded-xl bg-input shadow-sm hover:shadow-md cursor-text text-foreground"
                            />
                          </FormControl>
                          <FormMessage className="text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-8 py-6 bg-input/30 border-t border-custom rounded-b-2xl">
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="h-12 px-8 text-base font-medium rounded-xl border-2 border-custom hover:text-red-500 hover:border-accent transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 px-8 text-base font-medium min-w-[140px] gradient-accent hover:opacity-90 border-2 border-accent transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-5 w-5" />
                          Create Movie
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
