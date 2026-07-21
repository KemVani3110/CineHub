"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Activity,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Camera,
  Clock3,
  Heart,
  Image as ImageIcon,
  KeyRound,
  LockKeyhole,
  Mail,
  PlayCircle,
  Shield,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useProfileStore } from "@/store/profileStore";
import Loading from "@/components/common/Loading";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Settings from "@/components/profile/Settings";
import { AuthProvider } from "@/types/auth";
import { authenticatedFetch } from "@/lib/firebase-auth-api";

interface ProfileStats {
  watched: number;
  watchlist: number;
  ratings: number;
  favoriteActors: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    mediaType: string;
    date: string;
  }>;
}

function formatProfileDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getProviderLabel(provider?: AuthProvider) {
  if (provider === AuthProvider.GOOGLE) return "Google";
  if (provider === AuthProvider.FACEBOOK) return "Facebook";
  return "Email";
}

function formatActivityTime(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();
  const {
    user,
    isAvatarDialogOpen,
    availableAvatars,
    loading: profileLoading,
    setActiveTab,
    setIsAvatarDialogOpen,
    updateAvatar,
    fetchUserData,
    fetchAvatars,
  } = useProfileStore();
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    watched: 0,
    watchlist: 0,
    ratings: 0,
    favoriteActors: 0,
    recentActivity: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authUser) {
      router.push("/login");
      return;
    }

    const initializeProfile = async () => {
      try {
        const statsRequest = authenticatedFetch("/api/profile/stats", {
          cache: "no-store",
        });

        await Promise.all([fetchUserData(), fetchAvatars()]);

        const statsResponse = await statsRequest;
        if (statsResponse.ok) {
          setProfileStats(await statsResponse.json());
        }
        setActiveTab("settings");
      } catch (error) {
        console.error("Error initializing profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setStatsLoading(false);
      }
    };

    initializeProfile();
  }, [authUser, authLoading, router, fetchUserData, fetchAvatars, setActiveTab, toast]);

  const handleAvatarSelect = async (avatarPath: string) => {
    try {
      await updateAvatar(avatarPath);
      setIsAvatarDialogOpen(false);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update avatar",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  if (authLoading || profileLoading) {
    return <Loading message="Loading profile..." />;
  }

  const providerLabel = getProviderLabel(user?.provider);
  const accountStats = [
    {
      label: "Member since",
      value: formatProfileDate(user?.created_at),
      icon: CalendarDays,
      tone: "text-[var(--cinehub-accent)]",
    },
    {
      label: "Last active",
      value: formatProfileDate(user?.last_login_at),
      icon: Clock3,
      tone: "text-[var(--cinehub-accent)]",
    },
    {
      label: "Sign-in method",
      value: providerLabel,
      icon: Shield,
      tone: "text-[var(--cinehub-accent)]",
    },
  ];
  const engagementStats = [
    {
      label: "Watched",
      value: profileStats.watched,
      icon: PlayCircle,
      href: "/history",
    },
    {
      label: "Watchlist",
      value: profileStats.watchlist,
      icon: BookOpen,
      href: "/watchlist",
    },
    {
      label: "Ratings",
      value: profileStats.ratings,
      icon: Star,
      href: "/history",
    },
    {
      label: "Favorite actors",
      value: profileStats.favoriteActors,
      icon: Heart,
      href: "/favorite-actors",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <section className="border-b border-[var(--border)]/60 bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(15,23,42,0.96)_42%,rgba(248,113,113,0.12))]">
        <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="ghost"
              className="min-h-11 cursor-pointer rounded-full border border-[var(--border)]/70 bg-slate-950/30 px-4 text-[var(--text-main)] hover:bg-slate-800/80"
              asChild
            >
              <Link href="/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>

            <Badge className="min-h-9 border border-[var(--cinehub-accent)]/30 bg-[var(--cinehub-accent)]/12 px-4 text-[var(--cinehub-accent)]">
              <BadgeCheck className="mr-2 h-4 w-4" />
              Account profile
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-end">
            <Card className="overflow-hidden border-[var(--border)]/70 bg-slate-950/55 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-5 sm:p-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="relative w-fit shrink-0">
                    <Avatar className="h-28 w-28 border-4 border-[var(--cinehub-accent)]/35 shadow-2xl sm:h-32 sm:w-32">
                      <AvatarImage
                        src={user?.avatar}
                        alt={user?.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[var(--cinehub-accent)]/25 to-[var(--cinehub-accent-hover)]/15 text-3xl font-bold text-[var(--cinehub-accent)]">
                        {getUserInitials(user?.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-11 w-11 cursor-pointer rounded-full border-2 border-slate-950 bg-[var(--cinehub-accent)] text-slate-950 shadow-xl hover:bg-[var(--cinehub-accent-hover)]"
                      onClick={() => setIsAvatarDialogOpen(true)}
                      aria-label="Change avatar"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-emerald-400" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="break-words text-3xl font-bold tracking-normal text-white sm:text-4xl">
                          {user?.name || "CineHub User"}
                        </h1>
                        <Badge variant="outline" className="h-8 border-[var(--cinehub-accent)]/40 bg-[var(--cinehub-accent)]/10 px-3 capitalize text-[var(--cinehub-accent)]">
                          {user?.role || "user"}
                        </Badge>
                      </div>
                      <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--text-sub)] sm:text-base">
                        <Mail className="h-4 w-4 shrink-0 text-[var(--cinehub-accent)]" />
                        <span className="truncate">{user?.email}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        className="min-h-11 cursor-pointer rounded-full bg-[var(--cinehub-accent)] px-5 font-semibold text-slate-950 hover:bg-[var(--cinehub-accent-hover)]"
                        onClick={() => setIsAvatarDialogOpen(true)}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Choose avatar
                      </Button>
                      <Button
                        variant="outline"
                        className="min-h-11 cursor-pointer rounded-full border-[var(--border)]/70 bg-slate-950/25 px-5 text-[var(--text-main)] hover:bg-slate-800/80"
                        asChild
                      >
                        <Link href="/watchlist">View watchlist</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {accountStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[var(--border)]/70 bg-slate-950/45 p-4 backdrop-blur-xl"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/80">
                      <Icon className={`h-5 w-5 ${item.tone}`} />
                    </div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-sub)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {engagementStats.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group rounded-2xl border border-[var(--border)]/70 bg-slate-950/45 p-5 transition-colors hover:border-[var(--cinehub-accent)]/45 hover:bg-slate-900/75"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--cinehub-accent)]/12">
                    <Icon className="h-5 w-5 text-[var(--cinehub-accent)]" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-[var(--cinehub-accent)]/25 bg-[var(--cinehub-accent)]/8 text-[var(--cinehub-accent)]"
                  >
                    Live
                  </Badge>
                </div>
                <p className="mt-4 text-3xl font-bold text-white">
                  {statsLoading ? "..." : item.value}
                </p>
                <p className="mt-1 text-sm text-[var(--text-sub)]">
                  {item.label}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mb-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="border-[var(--border)]/70 bg-slate-950/55 shadow-xl">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cinehub-accent)]/12">
                  <Activity className="h-5 w-5 text-[var(--cinehub-accent)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Activity timeline
                  </h2>
                  <p className="text-sm text-[var(--text-sub)]">
                    Your latest saved, watched, and favorite activity.
                  </p>
                </div>
              </div>

              {profileStats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {profileStats.recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-[var(--border)]/60 bg-slate-900/45 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/70">
                        {item.mediaType === "actor" ? (
                          <Heart className="h-4 w-4 text-[var(--cinehub-accent)]" />
                        ) : item.mediaType === "tv" ? (
                          <BookOpen className="h-4 w-4 text-[var(--cinehub-accent)]" />
                        ) : (
                          <PlayCircle className="h-4 w-4 text-[var(--cinehub-accent)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {item.type}: {item.title}
                        </p>
                        <p className="text-xs text-[var(--text-sub)]">
                          {formatActivityTime(item.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)]/70 p-8 text-center text-sm text-[var(--text-sub)]">
                  Start watching or saving titles and your timeline will appear
                  here.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--border)]/70 bg-slate-950/55 shadow-xl">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cinehub-accent)]/12">
                  <LockKeyhole className="h-5 w-5 text-[var(--cinehub-accent)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Account security
                  </h2>
                  <p className="text-sm text-[var(--text-sub)]">
                    Sign-in method and password control.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-[var(--border)]/60 bg-slate-900/45 p-4">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-sub)]">
                    Provider
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {providerLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)]/60 bg-slate-900/45 p-4">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-sub)]">
                    Password changes
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-white">
                    <KeyRound className="h-4 w-4 text-[var(--cinehub-accent)]" />
                    {user?.provider === AuthProvider.LOCAL
                      ? "Available below"
                      : `Managed by ${providerLabel}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cinehub-accent)]/12">
            <UserRound className="h-5 w-5 text-[var(--cinehub-accent)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Profile settings</h2>
            <p className="text-sm text-[var(--text-sub)]">
              Manage your public identity and account security.
            </p>
          </div>
        </div>

        {user?.provider === AuthProvider.LOCAL ? (
          <Settings />
        ) : (
          <Card className="border-[var(--border)]/70 bg-slate-950/55 shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cinehub-accent)]/12">
                  <Shield className="h-6 w-6 text-[var(--cinehub-accent)]" />
                </div>
                <h3 className="text-xl font-semibold text-white">Managed by {providerLabel}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-sub)]">
                  Profile editing and password changes are only available for email accounts.
                  This account signs in with {providerLabel}, so authentication details are managed by that provider.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="border-[var(--border)]/70 bg-slate-950 text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Choose your public avatar</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-[var(--border)]/70 bg-slate-900/65 p-5">
              <p className="mb-4 text-sm font-medium text-[var(--text-sub)]">Current avatar</p>
              <Avatar className="mx-auto h-32 w-32 border-4 border-[var(--cinehub-accent)]/30">
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} className="object-cover" />
                <AvatarFallback className="bg-[var(--cinehub-accent)]/15 text-3xl font-bold text-[var(--cinehub-accent)]">
                  {getUserInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <p className="mt-4 text-center text-sm font-semibold text-white">
                {user?.name || "CineHub User"}
              </p>
            </div>

            <div className="max-h-[65vh] overflow-y-auto pr-1">
              {availableAvatars.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {availableAvatars.map((avatar, index) => {
                    const isSelected = user?.avatar === avatar;
                    return (
                      <Button
                        key={avatar}
                        type="button"
                        variant="ghost"
                        className={`h-auto min-h-28 cursor-pointer rounded-2xl border p-3 transition-all hover:-translate-y-0.5 hover:bg-[var(--cinehub-accent)]/10 ${
                          isSelected
                            ? "border-[var(--cinehub-accent)] bg-[var(--cinehub-accent)]/12"
                            : "border-slate-800 bg-slate-900/55 hover:border-[var(--cinehub-accent)]/40"
                        }`}
                        onClick={() => handleAvatarSelect(avatar)}
                      >
                        <Avatar className="h-20 w-20 rounded-2xl">
                          <AvatarImage
                            src={avatar}
                            alt={`Avatar ${index + 1}`}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-2xl bg-slate-800 text-slate-300">
                            {index + 1}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-[var(--text-sub)]">
                  No avatars available yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
