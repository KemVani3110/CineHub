"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, Eye, EyeOff, ArrowLeft } from "lucide-react";
import SocialLoginButtons from "./SocialLoginButtons";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationEmail, setMigrationEmail] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      // Check user role and redirect accordingly
      if (response?.user?.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/home';
      }
    } catch (error) {
      // Check if it's a migration error
      if (error instanceof Error && error.message.includes('Account migration required')) {
        setMigrationEmail(formData.email);
        setShowMigrationDialog(true);
      }
      // Error already handled by useAuth hook via toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    // This is handled by SocialLoginButtons component
    // The onLogin callback will be triggered after successful login
    console.log("Social login initiated:", provider);
  };

  const handleMigrationRedirect = () => {
    setShowMigrationDialog(false);
    router.push(`/register?email=${encodeURIComponent(migrationEmail)}&migration=true`);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Return to Main Page Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/home">
          <Button
            variant="ghost"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors p-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm hidden sm:inline">Return to Main Page</span>
            <span className="text-xs sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-8">
        <div className="relative w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
            <div className="mb-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                WELCOME BACK TO
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              CineHub
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Sign in to continue your movie journey
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
            {/* Social Login */}
            <div className="animate-fade-in">
              <SocialLoginButtons onLogin={handleSocialLogin} />
            </div>

            {/* Divider */}
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 flex items-center">
                <Separator className="border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 animate-fade-in">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-12 h-12 bg-card border-border rounded-lg placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-12 h-12 bg-card border-border rounded-lg placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    SIGNING IN...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    SIGN IN
                  </div>
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center animate-fade-in">
                <span className="text-muted-foreground text-sm">
                  Don't have an account?{" "}
                </span>
                <Link
                  href="/register"
                  className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer hover:underline text-sm"
                >
                  Create Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Migration Dialog */}
      <AlertDialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Migration Required</AlertDialogTitle>
            <AlertDialogDescription>
              Your account requires migration. Please create a new account with the provided email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleMigrationRedirect}>Create New Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
