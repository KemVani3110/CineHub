"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
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
  Loader2,
  Film,
  Tv,
  BookOpen,
} from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { MovieCard } from "@/components/common/MovieCard";
import { TVShowCard } from "@/components/common/TVShowCard";
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
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        await getCurrentUser();
      }

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        await fetchFavoriteActors();
      } else {
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
  const getCreditDateTime = (credit: any) => {
    const rawDate =
      credit.media_type === "movie" ? credit.release_date : credit.first_air_date;
    if (!rawDate) return 0;

    const time = new Date(`${rawDate}T00:00:00Z`).getTime();
    return Number.isFinite(time) ? time : 0;
  };

  const formatStableDate = (dateString: string) =>
    new Date(`${dateString}T00:00:00Z`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

  const sortedCredits = [...combinedCredits.cast].sort((a, b) => {
    const dateDiff = getCreditDateTime(b) - getCreditDateTime(a);
    if (dateDiff !== 0) return dateDiff;

    const mediaDiff = String(a.media_type || "").localeCompare(
      String(b.media_type || "")
    );
    if (mediaDiff !== 0) return mediaDiff;

    const titleA = a.title || a.name || "";
    const titleB = b.title || b.name || "";
    const titleDiff = titleA.localeCompare(titleB);
    if (titleDiff !== 0) return titleDiff;

    return Number(a.id || 0) - Number(b.id || 0);
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
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: `${actorData.name}'s profile link has been copied.`,
      });
    } catch (error) {
      toast({
        title: "Unable to copy link",
        description: "Please copy the URL from your browser manually.",
        variant: "destructive",
      });
    }
  };

  const handleFavorite = async () => {
    if (isFavoriteUpdating) return;

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
      setIsFavoriteUpdating(true);
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
    } finally {
      setIsFavoriteUpdating(false);
    }
  };

  const isFavorited = !!user && isFavoriteActor(actorData.id);
  const movieCreditsCount = sortedCredits.filter(
    (credit) => credit.media_type === "movie"
  ).length;
  const tvCreditsCount = sortedCredits.filter(
    (credit) => credit.media_type === "tv"
  ).length;
  const birthYear = actorData.birthday
    ? new Date(`${actorData.birthday}T00:00:00Z`).getUTCFullYear()
    : null;
  const genderLabel =
    actorData.gender === 1 ? "Female" : actorData.gender === 2 ? "Male" : "Other";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(79,209,197,0.14),transparent_30%),linear-gradient(135deg,var(--bg-main),#102136_48%,var(--bg-main))]">
      <section className="border-b border-border/40 bg-bg-main/35">
        <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="min-h-11 cursor-pointer rounded-full border border-border/50 bg-bg-card/45 px-4 text-text-main backdrop-blur-sm hover:border-cinehub-accent/50 hover:bg-cinehub-accent/10 hover:text-cinehub-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </section>

      <main className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-bg-card/70 shadow-2xl backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)]">
            <div className="border-b border-border/50 bg-bg-main/35 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="mx-auto aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-2xl border border-border/60 bg-bg-main shadow-2xl">
                {actorData.profile_path ? (
                  <Image
                    src={getImageUrl(actorData.profile_path, "original")}
                    alt={actorData.name}
                    width={480}
                    height={720}
                    className="h-full w-full object-cover object-center"
                    sizes="(max-width: 768px) 86vw, (max-width: 1200px) 320px, 360px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-card to-bg-main">
                    <User className="h-24 w-24 text-text-sub/50" />
                  </div>
                )}
              </div>

              <div className="mx-auto mt-4 grid max-w-[320px] grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleFavorite}
                  disabled={isFavoriteUpdating}
                  className={`${
                    isFavorited
                      ? "border-red-400/35 bg-red-500/15 text-red-200 hover:bg-red-500/25 hover:text-red-100"
                      : "border-border/70 bg-bg-card/70 text-text-main hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
                  } min-h-11 cursor-pointer rounded-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {isFavoriteUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Heart
                      className={`mr-2 h-4 w-4 ${
                        isFavorited ? "fill-current" : ""
                      }`}
                    />
                  )}
                  {isFavorited ? "Saved" : "Favorite"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="min-h-11 cursor-pointer rounded-xl border-cinehub-accent/40 bg-cinehub-accent/10 text-cinehub-accent transition-all duration-300 hover:bg-cinehub-accent hover:text-slate-950"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-between p-5 sm:p-7 lg:p-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {actorData.known_for_department && (
                      <span className="rounded-full border border-cinehub-accent/30 bg-cinehub-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cinehub-accent">
                        {actorData.known_for_department}
                      </span>
                    )}
                    {actorData.popularity ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-bold text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {actorData.popularity.toFixed(1)} popularity
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                      {actorData.name}
                    </h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-text-sub sm:text-lg">
                      {actorData.biography
                        ? actorData.biography.slice(0, 190) +
                          (actorData.biography.length > 190 ? "..." : "")
                        : "Explore this performer and their movies, TV shows, and profile information on CineHub."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cinehub-accent/12 text-cinehub-accent">
                      <Film className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {movieCreditsCount}
                    </p>
                    <p className="text-sm text-text-sub">Movie credits</p>
                  </div>
                  <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cinehub-accent/12 text-cinehub-accent">
                      <Tv className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {tvCreditsCount}
                    </p>
                    <p className="text-sm text-text-sub">TV credits</p>
                  </div>
                  <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cinehub-accent/12 text-cinehub-accent">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {birthYear || "N/A"}
                    </p>
                    <p className="text-sm text-text-sub">Birth year</p>
                  </div>
                  <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cinehub-accent/12 text-cinehub-accent">
                      <Award className="h-5 w-5" />
                    </div>
                    <p className="truncate text-2xl font-bold text-white">
                      {sortedCredits.length}
                    </p>
                    <p className="text-sm text-text-sub">Total credits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-border/60 bg-bg-card/70 p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cinehub-accent/12 text-cinehub-accent">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Biography</h2>
                <p className="text-sm text-text-sub">Career background and profile</p>
              </div>
            </div>

            {actorData.biography ? (
              <>
                <p
                  className={`text-base leading-8 text-text-main ${
                    !showFullBio ? "line-clamp-6" : ""
                  }`}
                >
                  {actorData.biography}
                </p>
                {actorData.biography.length > 360 && (
                  <Button
                    variant="link"
                    className="mt-3 h-auto cursor-pointer p-0 text-cinehub-accent hover:text-cinehub-accent-hover"
                    onClick={() => setShowFullBio(!showFullBio)}
                  >
                    {showFullBio ? "Show Less" : "Read More"}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-text-sub">
                No biography is available for this performer yet.
              </p>
            )}
          </div>

          <aside className="rounded-3xl border border-border/60 bg-bg-card/70 p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <h2 className="mb-5 text-2xl font-bold text-white">Profile</h2>
            <div className="space-y-3">
              <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-sub">
                  Known for
                </p>
                <p className="mt-1 font-semibold text-white">
                  {actorData.known_for_department || "N/A"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-sub">
                  Gender
                </p>
                <p className="mt-1 font-semibold text-white">{genderLabel}</p>
              </div>
              {actorData.birthday && (
                <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-sub">
                    Born
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {formatStableDate(actorData.birthday)}
                  </p>
                </div>
              )}
              {actorData.place_of_birth && (
                <div className="rounded-2xl border border-border/45 bg-bg-main/55 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-sub">
                    Place of birth
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {actorData.place_of_birth}
                  </p>
                </div>
              )}
            </div>

            {actorData.also_known_as?.length > 0 && (
              <div className="mt-6 border-t border-border/40 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-sub">
                  Also known as
                </p>
                <div className="flex flex-wrap gap-2">
                  {actorData.also_known_as.slice(0, 5).map((alias, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-border/45 bg-bg-main/55 px-3 py-1 text-sm text-text-main"
                    >
                      {alias}
                    </span>
                  ))}
                  {actorData.also_known_as.length > 5 && (
                    <span className="rounded-full border border-border/45 bg-bg-main/35 px-3 py-1 text-sm text-text-sub">
                      +{actorData.also_known_as.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </aside>
        </section>

        <section className="rounded-3xl border border-border/60 bg-bg-card/70 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex flex-col gap-4 border-b border-border/40 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Filmography
              </h2>
              <p className="mt-1 text-text-sub">
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
              className="w-full xl:w-auto"
            >
              <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl border border-border/50 bg-bg-main/70 p-1 xl:w-[360px]">
                <TabsTrigger
                  value="all"
                  className="min-h-10 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-300 data-[state=active]:bg-cinehub-accent data-[state=active]:text-slate-950"
                >
                  All ({sortedCredits.length})
                </TabsTrigger>
                <TabsTrigger
                  value="movie"
                  className="min-h-10 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-300 data-[state=active]:bg-cinehub-accent data-[state=active]:text-slate-950"
                >
                  Movies ({movieCreditsCount})
                </TabsTrigger>
                <TabsTrigger
                  value="tv"
                  className="min-h-10 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-300 data-[state=active]:bg-cinehub-accent data-[state=active]:text-slate-950"
                >
                  TV ({tvCreditsCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
              ))}
            </div>
          ) : filteredCredits.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredCredits.map((credit, index) => {
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
                      key={`movie-${credit.id}-${credit.character || "role"}-${index}`}
                      movie={movie}
                      showRating={false}
                      showCharacter={true}
                    />
                  );
                }

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
                    key={`tv-${credit.id}-${credit.character || "role"}-${index}`}
                    show={tvShow}
                    showRating={false}
                    showCharacter={true}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-main/60">
                <Award className="h-8 w-8 text-text-sub/50" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-text-main">
                No{" "}
                {activeTab === "all"
                  ? "credits"
                  : activeTab === "movie"
                  ? "movies"
                  : "TV shows"}{" "}
                found
              </h3>
              <p className="text-text-sub">
                This performer does not have matching credits in the database yet.
              </p>
            </div>
          )}
        </section>
      </main>

      <BackToTop />
    </div>
  );
}
