"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteStore } from "@/store/favoriteStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActorCard } from "@/components/common/ActorCard";
import Header from "@/components/common/Header";
import {
  Heart,
  Users,
  Star,
  Calendar,
  Grid3X3,
  List,
  Filter,
  Search,
} from "lucide-react";
import Link from "next/link";
import Loading from "@/components/common/Loading";

interface FavoriteActor {
  id: number;
  actor_id: number;
  name: string;
  profile_path: string;
  added_at: string;
}

function FavoriteActorsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    actors,
    isLoading: favoriteLoading,
    fetchFavoriteActors,
  } = useFavoriteStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!user && !authLoading) {
          router.replace("/login");
          return;
        }

        if (user) {
          await fetchFavoriteActors();
        }
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [user, authLoading, router, fetchFavoriteActors]);

  if (isLoading || authLoading || favoriteLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <Loading message="Loading favorite actors..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sortedActors = [...actors].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-bg-main via-bg-main to-bg-card">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-accent opacity-10 rounded-3xl blur-3xl"></div>
            <Card className="relative bg-gradient-card border-border/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-cinehub-accent/20 rounded-xl">
                    <Heart className="w-8 h-8 text-cinehub-accent" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                      Favorite Actors
                    </h1>
                    <p className="text-text-sub text-lg">
                      Your personal collection of beloved performers
                    </p>
                  </div>
                </div>

                {!isLoading && (
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-cinehub-accent" />
                      <span className="text-white font-medium">
                        {actors.length}{" "}
                        {actors.length === 1 ? "Actor" : "Actors"}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-cinehub-accent/20 text-cinehub-accent border-cinehub-accent/30"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Curated Collection
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          {!isLoading && actors.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                  className={`${
                    sortBy === "recent"
                      ? "bg-cinehub-accent text-white hover:bg-cinehub-accent/90"
                      : "bg-bg-card/50 text-white hover:bg-bg-card hover:text-cinehub-accent"
                  } border-cinehub-accent/30 cursor-pointer transition-colors`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Recently Added
                </Button>
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("name")}
                  className={`${
                    sortBy === "name"
                      ? "bg-cinehub-accent text-white hover:bg-cinehub-accent/90"
                      : "bg-bg-card/50 text-white hover:bg-bg-card hover:text-cinehub-accent"
                  } border-cinehub-accent/30 cursor-pointer transition-colors`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  A-Z
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`${
                    viewMode === "grid"
                      ? "bg-cinehub-accent text-white hover:bg-cinehub-accent/90"
                      : "bg-bg-card/50 text-white hover:bg-bg-card hover:text-cinehub-accent"
                  } border-cinehub-accent/30 cursor-pointer transition-colors`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`${
                    viewMode === "list"
                      ? "bg-cinehub-accent text-white hover:bg-cinehub-accent/90"
                      : "bg-bg-card/50 text-white hover:bg-bg-card hover:text-cinehub-accent"
                  } border-cinehub-accent/30 cursor-pointer transition-colors`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          {actors.length === 0 ? (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-16 text-center">
                <div className="space-y-6">
                  <div className="p-6 bg-cinehub-accent/10 rounded-full w-fit mx-auto">
                    <Heart className="w-12 h-12 text-cinehub-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">
                      No Favorite Actors Yet
                    </h3>
                    <p className="text-text-sub text-lg max-w-md mx-auto">
                      Start building your collection by adding actors you love
                      to your favorites
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="default"
                    className="bg-cinehub-accent hover:bg-cinehub-accent/90 text-white font-medium cursor-pointer transition-colors"
                  >
                    <Link href="/search">
                      <Search className="mr-2 h-4 w-4" />
                      Discover Actors
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              }
            >
              {sortedActors.map((actor: FavoriteActor, index) => (
                <div
                  key={actor.id}
                  className="group transform transition-all duration-300 ease-out hover:scale-105"
                  style={{
                    animationName: "fadeInUp",
                    animationDuration: "0.6s",
                    animationTimingFunction: "ease-out",
                    animationFillMode: "forwards",
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {viewMode === "grid" ? (
                    <div className="relative">
                      <ActorCard
                        actor={{
                          id: actor.actor_id,
                          name: actor.name,
                          profile_path: actor.profile_path,
                        }}
                      />
                      <div className="mt-3 space-y-1">
                        <Badge
                          variant="outline"
                          className="text-xs bg-cinehub-accent/10 border-cinehub-accent/30 text-cinehub-accent"
                        >
                          Added {new Date(actor.added_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-gradient-card border-border/50 hover:border-cinehub-accent/50 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <ActorCard
                              actor={{
                                id: actor.actor_id,
                                name: actor.name,
                                profile_path: actor.profile_path,
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {actor.name}
                            </h3>
                            <p className="text-text-sub text-sm mt-1">
                              Added on{" "}
                              {new Date(actor.added_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Heart className="w-5 h-5 text-cinehub-accent fill-current" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FavoriteActorsPage;