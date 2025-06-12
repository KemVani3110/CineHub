import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { authService } from '@/services/auth/authService';
import { useToast } from '@/components/ui/use-toast';

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

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: parseInt(session.user.id),
        email: session.user.email || '',
        name: session.user.name || '',
        role: session.user.role || 'user',
        avatar: session.user.image || undefined,
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
    setLoading(status === 'loading');
  }, [session, status]);

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

      setUser(response.user);
      return response;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred during login',
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

      setUser(response.user);
      return response;
    } catch (error) {
      toast({
        title: 'Social Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred during social login',
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
      return response;
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An error occurred during registration',
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
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'An error occurred during logout',
        variant: 'destructive',
      });
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
  };
}
