"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Image as ImageIcon,
  ChevronLeft,
  Shield,
  Camera,
  Mail,

} from "lucide-react";
import Link from "next/link";
import { useProfileStore } from "@/store/profileStore";
import Loading from "@/components/common/Loading";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Settings from "@/components/profile/Settings";

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
        await fetchUserData();
        await fetchAvatars();
        setActiveTab("settings");
      } catch (error) {
        console.error('Error initializing profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
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

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/*  Header with Cover Background */}
      <div className="relative">
        {/* Cover Background */}
        <div className="h-48 lg:h-64 bg-gradient-to-br from-[var(--cinehub-accent)]/20 via-[var(--bg-card)] to-[var(--cinehub-accent)]/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--cinehub-accent)]/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--success)]/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Header Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 lg:p-6">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border)]/50 hover:bg-[var(--bg-card)] transition-all duration-200"
                asChild
              >
                <Link href="/home">
                  <ChevronLeft size={20} />
                </Link>
              </Button>
              <h1 className="text-xl lg:text-2xl font-bold gradient-text">Profile Settings</h1>
            </div>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="container mx-auto px-4 lg:px-6 relative -mt-16">
          <Card className="bg-[var(--bg-card)]/95 backdrop-blur-xl border-[var(--border)]/50 shadow-2xl">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                  <div className="relative">
                    <Avatar className="h-28 w-28 lg:h-32 lg:w-32 border-4 border-[var(--cinehub-accent)]/30 shadow-xl">
                      <AvatarImage
                        src={user?.avatar}
                        alt={user?.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[var(--cinehub-accent)]/20 to-[var(--success)]/20 text-[var(--cinehub-accent)] text-2xl lg:text-3xl font-bold">
                        {getUserInitials(user?.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-[var(--cinehub-accent)] hover:bg-[var(--cinehub-accent-hover)] text-[var(--bg-main)] shadow-lg border-2 border-[var(--bg-card)]"
                      onClick={() => setIsAvatarDialogOpen(true)}
                    >
                      <Camera size={16} />
                    </Button>
                  </div>
                  
                  {/* Online Status */}
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-[var(--success)] rounded-full border-2 border-[var(--bg-card)] animate-pulse" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text-main)]">{user?.name}</h2>
                      <Badge className="bg-[var(--cinehub-accent)]/10 text-[var(--cinehub-accent)] border-[var(--cinehub-accent)]/30 px-3 py-1">
                        <Shield size={12} className="mr-1" />
                        {user?.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-sub)]">
                      <Mail size={14} />
                      <span className="text-sm lg:text-base">{user?.email}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-[var(--bg-main)]/50">
                      <div className="text-lg lg:text-xl font-bold text-[var(--cinehub-accent)]">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                      <div className="text-xs text-[var(--text-sub)]">Member Since</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[var(--bg-main)]/50">
                      <div className="text-lg lg:text-xl font-bold text-[var(--success)]">
                        {user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : 'Never'}
                      </div>
                      <div className="text-xs text-[var(--text-sub)]">Last Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Content */}
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <Settings />
      </div>

      {/*  Avatar Selection Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[var(--bg-card)]/95 backdrop-blur-xl border-[var(--border)]/50">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-main)] text-xl">Choose Your Avatar</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-3 gap-4 p-2">
              {availableAvatars.map((avatar, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto p-2 hover:bg-[var(--cinehub-accent)]/10 hover:scale-105 transition-all duration-200 rounded-xl border-2 border-transparent hover:border-[var(--cinehub-accent)]/30"
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <Image
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    width={100}
                    height={100}
                    className="rounded-lg shadow-lg"
                  />
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}