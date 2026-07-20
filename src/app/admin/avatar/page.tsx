"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Trash2, Loader2, ImageIcon, Plus } from "lucide-react";
import Loading from "@/components/common/Loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAvatarStore } from "@/store/avatarStore";

const AVATARS_PER_PAGE = 5;

export default function AvatarManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const {
    avatars,
    loading,
    uploading,
    selectedFile,
    setSelectedFile,
    fetchAvatars,
    uploadAvatar,
    deleteAvatar,
  } = useAvatarStore();

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const totalPages = Math.max(1, Math.ceil(avatars.length / AVATARS_PER_PAGE));
  const pageStart = (currentPage - 1) * AVATARS_PER_PAGE;
  const paginatedAvatars = useMemo(
    () => avatars.slice(pageStart, pageStart + AVATARS_PER_PAGE),
    [avatars, pageStart]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        // 20MB limit
        toast({
          title: "Error",
          description: "File size should be less than 20MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadAvatar(selectedFile);
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (avatarId: number) => {
    try {
      await deleteAvatar(avatarId);
      toast({
        title: "Success",
        description: "Avatar deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete avatar",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading avatars..." showBackdrop={false} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-8 max-w-6xl overflow-y-hidden">
      <h1 className="text-2xl font-bold mb-6">Avatar Management</h1>
      
      {/* Upload Section */}
      <Card className="mb-8 border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-card)]/70 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-[var(--text-main)] flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5 text-[var(--cinehub-accent)]" />
            Upload New Avatar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-main)]/30 hover:border-[var(--cinehub-accent)]/50 transition-colors duration-300">
            <div className="flex-1 w-full">
              <label htmlFor="avatar-upload" className="cursor-pointer block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card)]/70 transition-colors duration-200">
                  <ImageIcon className="h-5 w-5 text-[var(--cinehub-accent)]" />
                  <span className="text-[var(--text-main)] flex-1">
                    {selectedFile ? selectedFile.name : "Choose image file"}
                  </span>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-[var(--cinehub-accent)] hover:bg-[var(--cinehub-accent-hover)] text-[var(--bg-main)] font-semibold px-6 py-2.5 cursor-pointer transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Avatar
                </>
              )}
            </Button>
          </div>
          
          {selectedFile && (
            <div className="mt-4 p-4 bg-[var(--bg-main)]/40 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[var(--cinehub-accent)]/10 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-[var(--cinehub-accent)]" />
                </div>
                <div className="flex-1">
                  <p className="text-[var(--text-main)] font-medium">{selectedFile.name}</p>
                  <p className="text-[var(--text-sub)] text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avatars Section */}
      <Card className="border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-card)]/70 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-[var(--text-main)] flex items-center justify-between">
            <span className="text-xl">Your Avatars</span>
            <span className="text-sm font-normal text-[var(--text-sub)] bg-[var(--bg-main)]/50 px-3 py-1 rounded-full">
              {avatars.length} avatar{avatars.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {avatars.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[var(--bg-main)]/50 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-[var(--text-sub)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
                No avatars yet
              </h3>
              <p className="text-[var(--text-sub)] mb-6 max-w-md mx-auto">
                Upload your first avatar to get started. You can upload multiple avatars and switch between them.
              </p>
              <Button
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="bg-[var(--cinehub-accent)] hover:bg-[var(--cinehub-accent-hover)] text-[var(--bg-main)] cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload First Avatar
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {paginatedAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="group relative aspect-square rounded-xl overflow-hidden border-2 border-[var(--border)] bg-[var(--bg-main)]/30 hover:border-[var(--cinehub-accent)]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--cinehub-accent)]/20"
                  >
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage
                        src={avatar.file_path}
                        alt={avatar.original_name}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <AvatarFallback className="bg-[var(--cinehub-accent)]/10 text-[var(--cinehub-accent)] text-lg font-semibold">
                        {avatar.original_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">
                            {avatar.original_name}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 ml-2 cursor-pointer hover:scale-110 transition-transform duration-200"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[var(--bg-card)] border-[var(--border)] max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-[var(--text-main)]">
                                Delete Avatar
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-[var(--text-sub)]">
                                Are you sure you want to delete "{avatar.original_name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-main)]/50 cursor-pointer">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(avatar.id)}
                                className="bg-[var(--danger)] hover:bg-[var(--danger)]/90 cursor-pointer"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {avatars.length > AVATARS_PER_PAGE && (
                <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)]/35 p-3 sm:flex-row">
                  <p className="text-sm text-[var(--text-sub)]">
                    Showing {pageStart + 1}-{Math.min(pageStart + AVATARS_PER_PAGE, avatars.length)} of {avatars.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer disabled:cursor-not-allowed"
                    >
                      Previous
                    </Button>
                    <span className="rounded-md border border-[var(--border)] px-3 py-1 text-sm text-[var(--text-sub)]">
                      {currentPage}/{totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
