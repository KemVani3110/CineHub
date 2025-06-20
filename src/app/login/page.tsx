"use client"

import { useEffect } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { socialLogin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          // User came back from social login redirect
          const token = await result.user.getIdToken();
          
          // Determine provider from providerId
          const providerId = result.providerId || result.user.providerData[0]?.providerId;
          let provider: 'google' | 'facebook' = 'google';
          
          if (providerId?.includes('facebook')) {
            provider = 'facebook';
          }

          const response = await socialLogin(provider, token, {
            email: result.user.email,
            name: result.user.displayName,
            avatar: result.user.photoURL,
            providerId: result.user.uid,
          });

          toast({
            title: "Login Successful",
            description: "Welcome to CineHub!",
            variant: "default",
          });

          // Redirect based on role
          if (response.user.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/home");
          }
          
          // Refresh to ensure auth state is updated
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } catch (error: any) {
        console.error("Redirect result error:", error);
        
        // Only show error if it's not a cancelled operation
        if (error.code !== 'auth/popup-closed-by-user' && 
            error.code !== 'auth/cancelled-popup-request') {
          toast({
            title: "Authentication Failed",
            description: error.message || "Failed to complete social login",
            variant: "destructive",
          });
        }
      }
    };

    handleRedirectResult();
  }, [socialLogin, router, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-32 -translate-y-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-32 translate-y-32" />
      
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  );
} 