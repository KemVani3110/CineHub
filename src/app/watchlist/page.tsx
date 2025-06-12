"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { WatchlistPage } from "@/components/watch/WatchlistPage";
import Header from "@/components/common/Header";


export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your watchlist",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [user, loading, router, toast]);

  if (loading) {
    return ;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <WatchlistPage />
    </>
  );
} 