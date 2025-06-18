import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { authService } from '@/services/auth/authService';
import { useToast } from '@/components/ui/use-toast';
import { useProfileStore } from '@/store/profileStore';

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
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { fetchUserData } = useProfileStore();

  useEffect(() => {
    const initializeAuth = async () => {
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
    };

    initializeAuth();
  }, [session, status, fetchUserData]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      const result = await signIn('credentials', {
        email,
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
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error 
          ? error.message === 'Invalid credentials'
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
        description: 'Please check your email to verify your account.',
        variant: 'default',
      });
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
      await signOut({ redirect: false });
      setUser(null);
      toast({
        title: 'Logout Successful',
        description: 'See you again!',
        variant: 'default',
      });
      router.push('/login');
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
