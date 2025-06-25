"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Share2,
  Star,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Award,
} from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
import { formatDate, calculateAge } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import BackToTop from "@/components/common/BackToTop";
import { TMDBPerson, TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { useToast } from "@/components/ui/use-toast";

interface ActorDetailProps {
  actor: TMDBPerson;
}

export default function ActorDetail({ actor }: ActorDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, getCurrentUser } = useAuthStore();
  const {
    addFavoriteActor,
    removeFavoriteActor,
    isFavoriteActor,
    fetchFavoriteActors,
  } = useFavoriteStore();
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const init = async () => {
      // Only fetch user if we don't already have user data
      if (!user) {
        await getCurrentUser();
      }

      if (user) {
        await fetchFavoriteActors();
      } else {
        // Clear favorites when user is not logged in
        useFavoriteStore.getState().resetFavorites();
      }
    };
    init();
  }, [user, getCurrentUser, fetchFavoriteActors]);

  const { data: actorData, isLoading } = useQuery({
    queryKey: ["actor", actor.id],
    queryFn: () => Promise.resolve(actor),
    initialData: actor,
  });

  const combinedCredits = actorData?.combined_credits || { cast: [] };
  const sortedCredits = [...combinedCredits.cast].sort((a, b) => {
    const dateA = a.media_type === "movie" ? a.release_date : a.first_air_date;
    const dateB = b.media_type === "movie" ? b.release_date : b.first_air_date;
    return new Date(dateB || "").getTime() - new Date(dateA || "").getTime();
  });

  const filteredCredits =
    activeTab === "all"
      ? sortedCredits
      : sortedCredits.filter((credit) => credit.media_type === activeTab);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: actorData.name,
          text: `Check out ${actorData.name} on CineHub!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add actors to your favorites.",
        variant: "default",
      });
      router.push("/login");
      return;
    }

    try {
      if (isFavoriteActor(actorData.id)) {
        const success = await removeFavoriteActor(actorData.id);
        if (!success) {
          throw new Error("Failed to remove from favorites");
        }
        toast({
          title: "Removed from favorites",
          description: `${actorData.name} has been removed from your favorite actors.`,
          variant: "default",
        });
      } else {
        const newActor = await addFavoriteActor({
          actor_id: actorData.id,
          name: actorData.name,
          profile_path: actorData.profile_path || "",
        });
        if (!newActor) {
          throw new Error("Failed to add to favorites");
        }
        toast({
          title: "Added to favorites",
          description: `${actorData.name} has been added to your favorite actors.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error handling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main to-bg-secondary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-main/80 to-bg-main"></div>
        <div className="container mx-auto px-4 py-6">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-accent cursor-pointer backdrop-blur-sm bg-bg-card/20 border border-border/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-text-main truncate">
                {actorData.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col xl:flex-row gap-8 -mt-4">
          {/* Left Column - Actor Info */}
          <div className="xl:w-1/3">
            <Card className="bg-gradient-to-br from-bg-card to-bg-card/80 border-border/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Profile Image Section */}
                <div className="relative p-6 pb-0">
                  <div className="aspect-[2/3] w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-4 border-white/10 shadow-2xl bg-gradient-to-br from-bg-card to-bg-main">
                    {actorData.profile_path ? (
                      <Image
                        src={getImageUrl(actorData.profile_path, "original")}
                        alt={actorData.name}
                        width={400}
                        height={600}
                        className="object-cover object-center w-full h-full"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-bg-card to-bg-main flex items-center justify-center">
                        <User className="w-24 h-24 text-text-sub/50" />
                      </div>
                    )}
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleFavorite()}
                      className={`${
                        user && isFavoriteActor(actorData.id)
                          ? "text-red-500 border-red-500/50 bg-red-500/20 hover:bg-red-500 hover:text-white backdrop-blur-sm"
                          : "text-red-500 border-red-500/50 bg-bg-card/80 hover:bg-red-500 hover:text-white backdrop-blur-sm"
                      } transition-all duration-300 cursor-pointer shadow-lg`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          user && isFavoriteActor(actorData.id)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare()}
                      className="text-cinehub-accent border-cinehub-accent/50 bg-bg-card/80 hover:bg-cinehub-accent hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actor Information */}
                <div className="p-6 space-y-6">
                  {/* Name and Popularity */}
                  <div className="text-center border-b border-border/30 pb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-2">
                      {actorData.name}
                    </h1>
                    {actorData.popularity && (
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-text-sub font-medium">
                          {actorData.popularity.toFixed(1)} popularity
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Key Information Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Known For */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-main/50 border border-border/20">
                      <Award className="w-5 h-5 text-cinehub-accent mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-sub mb-1">
                          Known For
                        </h3>
                        <p className="text-text-main font-medium">
                          {actorData.known_for_department}
                        </p>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-main/50 border border-border/20">
                      <User className="w-5 h-5 text-cinehub-accent mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-sub mb-1">
                          Gender
                        </h3>
                        <p className="text-text-main font-medium">
                          {actorData.gender === 1
                            ? "Female"
                            : actorData.gender === 2
                            ? "Male"
                            : "Other"}
                        </p>
                      </div>
                    </div>

                    {/* Birthday */}
                    {actorData.birthday && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-main/50 border border-border/20">
                        <Calendar className="w-5 h-5 text-cinehub-accent mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-text-sub mb-1">
                            Born
                          </h3>
                          <p className="text-text-main font-medium">
                            {formatDate(actorData.birthday)}
                            {actorData.birthday && (
                              <span className="text-text-sub text-sm ml-2">
                                ({calculateAge(actorData.birthday)} years old)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Place of Birth */}
                    {actorData.place_of_birth && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-main/50 border border-border/20">
                        <MapPin className="w-5 h-5 text-cinehub-accent mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-text-sub mb-1">
                            Place of Birth
                          </h3>
                          <p className="text-text-main font-medium">
                            {actorData.place_of_birth}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Also Known As */}
                  {actorData.also_known_as?.length > 0 && (
                    <div className="border-t border-border/30 pt-6">
                      <h3 className="text-sm font-semibold text-text-sub mb-3">
                        Also Known As
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {actorData.also_known_as
                          .slice(0, 3)
                          .map((alias, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-bg-main/50 border border-border/30 rounded-full text-sm text-text-main"
                            >
                              {alias}
                            </span>
                          ))}
                        {actorData.also_known_as.length > 3 && (
                          <span className="px-3 py-1 bg-bg-main/30 border border-border/30 rounded-full text-sm text-text-sub">
                            +{actorData.also_known_as.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Biography */}
                  {actorData.biography && (
                    <div className="border-t border-border/30 pt-6">
                      <h3 className="text-sm font-semibold text-text-sub mb-3">
                        Biography
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p
                          className={`text-text-main leading-relaxed ${
                            !showFullBio ? "line-clamp-4" : ""
                          }`}
                        >
                          {actorData.biography}
                        </p>
                        {actorData.biography.length > 200 && (
                          <Button
                            variant="link"
                            className="text-cinehub-accent hover:text-cinehub-accent-hover p-0 h-auto mt-2 transition-colors duration-300 cursor-pointer"
                            onClick={() => setShowFullBio(!showFullBio)}
                          >
                            {showFullBio ? "Show Less" : "Read More"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Filmography */}
          <div className="xl:w-2/3">
            <Card className="bg-gradient-to-br from-bg-card/90 to-bg-card/70 border-border/50 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/30">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-1">
                      Filmography
                    </h2>
                    <p className="text-text-sub">
                      {filteredCredits.length}{" "}
                      {activeTab === "all"
                        ? "credits"
                        : activeTab === "movie"
                        ? "movies"
                        : "TV shows"}
                    </p>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="grid w-full sm:w-[300px] grid-cols-3 bg-bg-secondary/50 border border-border/30">
                      <TabsTrigger
                        value="all"
                        className="cursor-pointer transition-all duration-300 text-sm font-medium data-[state=active]:bg-cinehub-accent data-[state=active]:text-white"
                      >
                        All ({sortedCredits.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="movie"
                        className="cursor-pointer transition-all duration-300 text-sm font-medium data-[state=active]:bg-cinehub-accent data-[state=active]:text-white"
                      >
                        Movies (
                        {
                          sortedCredits.filter((c) => c.media_type === "movie")
                            .length
                        }
                        )
                      </TabsTrigger>
                      <TabsTrigger
                        value="tv"
                        className="cursor-pointer transition-all duration-300 text-sm font-medium data-[state=active]:bg-cinehub-accent data-[state=active]:text-white"
                      >
                        TV (
                        {
                          sortedCredits.filter((c) => c.media_type === "tv")
                            .length
                        }
                        )
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Content */}
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="aspect-[2/3] w-full rounded-xl"
                      />
                    ))}
                  </div>
                ) : filteredCredits.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCredits.map((credit) => {
                      if (credit.media_type === "movie") {
                        const movie: TMDBMovie = {
                          id: credit.id,
                          title: credit.title || "",
                          original_title: credit.title || "",
                          overview: credit.overview || "",
                          release_date: credit.release_date || "",
                          poster_path: credit.poster_path || undefined,
                          backdrop_path: credit.backdrop_path || undefined,
                          adult: false,
                          genre_ids: [],
                          original_language: "en",
                          popularity: credit.popularity || 0,
                          vote_count: credit.vote_count || 0,
                          vote_average: credit.vote_average || 0,
                          video: false,
                          character: credit.character,
                        };
                        return (
                          <MovieCard
                            key={`movie-${credit.id}-${credit.character}`}
                            movie={movie}
                            showRating={false}
                            showCharacter={true}
                          />
                        );
                      } else {
                        const tvShow: TMDBTVShow = {
                          id: credit.id,
                          name: credit.name || "",
                          poster_path: credit.poster_path || null,
                          backdrop_path: credit.backdrop_path || null,
                          overview: credit.overview || "",
                          first_air_date: credit.first_air_date || "",
                          vote_average: credit.vote_average || 0,
                          vote_count: credit.vote_count || 0,
                          genre_ids: [],
                          character: credit.character,
                        };
                        return (
                          <TVShowCard
                            key={`tv-${credit.id}-${credit.character}`}
                            show={tvShow}
                            showRating={false}
                            showCharacter={true}
                          />
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-secondary/50 rounded-full mb-4">
                      <Award className="w-8 h-8 text-text-sub/50" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-main mb-2">
                      No{" "}
                      {activeTab === "all"
                        ? "credits"
                        : activeTab === "movie"
                        ? "movies"
                        : "TV shows"}{" "}
                      found
                    </h3>
                    <p className="text-text-sub">
                      This actor doesn't have any{" "}
                      {activeTab === "all"
                        ? "credits"
                        : activeTab === "movie"
                        ? "movies"
                        : "TV shows"}{" "}
                      in our database yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
