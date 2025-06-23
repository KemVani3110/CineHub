"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigration, setIsMigration] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { register } = useAuth();

  // Handle migration parameters
  useEffect(() => {
    const email = searchParams.get('email');
    const migration = searchParams.get('migration');
    
    if (email && migration === 'true') {
      setFormData(prev => ({ ...prev, email }));
      setIsMigration(true);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);

      toast({
        title: "Success",
        description: isMigration 
          ? "Account migration completed successfully! You can now sign in with your new credentials."
          : "Account created successfully! Welcome to CineHub",
      });

      if (isMigration) {
        // For migration, redirect to login with success message
        router.push("/login?migrated=true");
      } else {
        router.push("/login");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : isMigration ? "Migration failed" : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-8 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
            <div className="mb-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {isMigration ? 'ACCOUNT MIGRATION' : 'START FOR FREE'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              {isMigration ? 'Migrate Account' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {isMigration 
                ? 'Complete your account migration to the new system' 
                : 'Join CineHub and discover amazing movies'
              }
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 animate-fade-in-up">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

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
                  disabled={isMigration}
                  className="pl-12 h-12 bg-card border-border rounded-lg placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1 sm:space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      formData.password.length >= 8 ? "bg-success" : "bg-muted"
                    }`}
                  />
                  <span
                    className={
                      formData.password.length >= 8
                        ? "text-success"
                        : "text-muted-foreground"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[A-Z]/.test(formData.password) ? "bg-success" : "bg-muted"
                    }`}
                  />
                  <span
                    className={
                      /[A-Z]/.test(formData.password)
                        ? "text-success"
                        : "text-muted-foreground"
                    }
                  >
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[0-9]/.test(formData.password) ? "bg-success" : "bg-muted"
                    }`}
                  />
                  <span
                    className={
                      /[0-9]/.test(formData.password)
                        ? "text-success"
                        : "text-muted-foreground"
                    }
                  >
                    One number
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] mt-6 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  CREATING ACCOUNT...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  CREATE ACCOUNT
                </div>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-1 animate-fade-in">
              <span className="text-muted-foreground text-sm">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer hover:underline text-sm"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
