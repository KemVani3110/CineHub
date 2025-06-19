"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { Icons } from "@/components/ui/icons";


interface SocialLoginButtonsProps {
  onLogin?: (provider: string) => void;
}

export function SocialLoginButtons({ onLogin }: SocialLoginButtonsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const { socialLogin } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      if (!token) {
        throw new Error("Failed to get ID token");
      }

      const response = await socialLogin("google", token, {
        email: result.user.email,
        name: result.user.displayName,
        avatar: result.user.photoURL,
        providerId: result.user.uid,
      });

      onLogin?.("google");

      if (response.user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/home";
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Authentication Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to authenticate with Google",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsFacebookLoading(true);
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      if (!token) {
        throw new Error("Failed to get ID token");
      }

      const response = await socialLogin("facebook", token, {
        email: result.user.email,
        name: result.user.displayName,
        avatar: result.user.photoURL,
        providerId: result.user.uid,
      });

      onLogin?.("facebook");

      if (response.user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/home";
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast({
        title: "Authentication Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to authenticate with Facebook",
        variant: "destructive",
      });
    } finally {
      setIsFacebookLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Divider with text */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Google Button */}
        <Button
          variant="outline"
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleLogin}
          className="group relative overflow-hidden h-12 bg-card border-border hover:bg-accent hover:border-primary/50 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

          {isGoogleLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Icons.spinner className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium group-hover:text-primary transition-colors duration-200">
                Google
              </span>
            </div>
          )}
        </Button>

        {/* Facebook Button */}
        <Button
          variant="outline"
          type="button"
          disabled={isFacebookLoading}
          onClick={handleFacebookLogin}
          className="group relative overflow-hidden h-12 bg-card border-border hover:bg-accent hover:border-primary/50 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

          {isFacebookLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Icons.spinner className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1877F2] shadow-sm">
                <Icons.facebook className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium group-hover:text-primary transition-colors duration-200">
                Facebook
              </span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

export default SocialLoginButtons;
