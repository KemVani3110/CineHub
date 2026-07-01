import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/authService";
import { useToast } from "@/components/ui/use-toast";
import { useProfileStore } from "@/store/profileStore";
import { useSearchStore } from "@/store/searchStore";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { fetchUserData } = useProfileStore();

  const initializeAuth = useCallback(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          await fetchUserData();
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      setUser(response.user);
      await fetchUserData();

      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default",
      });

      return response;
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message === "Firebase: Error (auth/invalid-credential)."
              ? "Invalid email or password"
              : error.message
            : "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (
    provider: "google" | "facebook",
    token: string,
    userData: any
  ) => {
    try {
      setLoading(true);
      const response = await authService.socialLogin({
        provider,
        token,
        user: {
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          providerId: userData.providerId,
        },
      });

      setUser(response.user);
      await fetchUserData();

      toast({
        title: "Login Successful",
        description: "Welcome to CineHub!",
        variant: "default",
      });

      return response;
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during social login. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.register({ name, email, password });

      setUser(response.user);
      await fetchUserData();

      toast({
        title: "Registration Successful",
        description: "Welcome to CineHub!",
        variant: "default",
      });

      return response;
    } catch (error) {
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message === "Firebase: Error (auth/email-already-in-use)."
              ? "This email is already in use. Please use a different email."
              : error.message
            : "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);

      const { resetStore } = useSearchStore.getState();
      resetStore();

      toast({
        title: "Logout Successful",
        description: "See you again!",
        variant: "default",
      });

      window.location.href = "/login";
    } catch {
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData();
      }
      return currentUser;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    socialLogin,
    getCurrentUser,
  };
}
