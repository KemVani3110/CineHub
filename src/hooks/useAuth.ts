import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { authService } from '@/services/auth/authService';
import { useToast } from '@/components/ui/use-toast';
import { useProfileStore } from '@/store/profileStore';
import { useSearchStore } from '@/store/searchStore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { fetchUserData } = useProfileStore();

  const initializeAuth = useCallback(async () => {
    if (isProduction) {
      // For production, listen to Firebase auth state
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData);
              await fetchUserData();
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // For development, use NextAuth session
      if (status === 'authenticated' && session?.user) {
        const userData = {
          id: parseInt(session.user.id),
          email: session.user.email || '',
          name: session.user.name || '',
          role: session.user.role || 'user',
          avatar: session.user.image || undefined,
        };
        setUser(userData);
        // Fetch user data immediately when session is authenticated
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else if (status === 'unauthenticated') {
        setUser(null);
      }
      setLoading(status === 'loading');
    }
  }, [session, status, fetchUserData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if (isProduction) {
        // For production, use Firestore auth directly
        const response = await authService.login({ email, password });
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
          variant: 'default',
        });

        setUser(response.user);
        await fetchUserData();
        return response;
      } else {
        // For development, use MySQL API then create NextAuth session
        const response = await authService.login({ email, password });

        // Create NextAuth session by calling signIn with credentials
        const result = await signIn('credentials', {
          email,
          password: 'ALREADY_AUTHENTICATED_' + response.token, // Special flag + token
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
          variant: 'default',
        });

        setUser(response.user);
        await fetchUserData();
        return response;
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error 
          ? error.message === 'Invalid credentials' || error.message === 'Invalid email or password'
            ? 'Invalid email or password'
            : error.message
          : 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook', token: string, userData: any) => {
    try {
      setLoading(true);
      
      if (isProduction) {
        // For production, use Firestore auth directly
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

        toast({
          title: 'Login Successful',
          description: 'Welcome to CineHub!',
          variant: 'default',
        });

        setUser(response.user);
        await fetchUserData();
        return response;
      } else {
        // For development, use NextAuth with social login API
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

        const result = await signIn('credentials', {
          email: userData.email,
          password: token,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        toast({
          title: 'Login Successful',
          description: 'Welcome to CineHub!',
          variant: 'default',
        });

        setUser(response.user);
        await fetchUserData();
        return response;
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error 
          ? error.message === 'Invalid credentials'
            ? 'Unable to authenticate your account. Please try again.'
            : error.message
          : 'An error occurred during social login. Please try again.',
        variant: 'destructive',
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
      
      toast({
        title: 'Registration Successful',
        description: isProduction 
          ? 'Welcome to CineHub!' 
          : 'Please check your email to verify your account.',
        variant: 'default',
      });
      
      if (isProduction) {
        // For production, user is automatically logged in after registration
        setUser(response.user);
        await fetchUserData();
      }
      
      return response;
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error 
          ? error.message === 'Email already exists'
            ? 'This email is already in use. Please use a different email.'
            : error.message
          : 'An error occurred during registration. Please try again.',
        variant: 'destructive',
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
      
      if (!isProduction) {
        await signOut({ redirect: false });
      }
      
      setUser(null);
      
      // Clear search history when logging out
      const { resetStore } = useSearchStore.getState();
      resetStore();
      
      toast({
        title: 'Logout Successful',
        description: 'See you again!',
        variant: 'default',
      });
      
      // Use window.location for immediate redirect
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'An error occurred during logout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        setUser(user);
        // Fetch user data immediately when user is authenticated
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      return user;
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
