"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useProfileStore } from "@/store/profileStore";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const {
    user,
    isEditing,
    formData,
    setIsEditing,
    setFormData,
    updateProfile,
    changePassword,
  } = useProfileStore();

  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ [name]: value });
  };

  const handleSaveProfile = () => {
    updateProfile();
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name,
      email: user?.email,
    });
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);
      await changePassword();

      toast({
        title: "Success",
        description:
          "Password updated successfully. Your current session will remain active until you log out.",
        variant: "default",
      });

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: Boolean(formData.newPassword && formData.newPassword.length >= 8),
    },
    {
      label: "One uppercase letter",
      valid: Boolean(formData.newPassword && /[A-Z]/.test(formData.newPassword)),
    },
    {
      label: "One number",
      valid: Boolean(formData.newPassword && /[0-9]/.test(formData.newPassword)),
    },
    {
      label: "Passwords match",
      valid: Boolean(
        formData.newPassword &&
          formData.confirmPassword &&
          formData.newPassword === formData.confirmPassword
      ),
    },
  ];

  const passwordReady = passwordChecks.every((item) => item.valid) && Boolean(formData.currentPassword);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="border-[var(--border)]/70 bg-slate-950/55 shadow-xl">
        <CardHeader className="border-b border-[var(--border)]/60 p-5 sm:p-6">
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cinehub-accent)]/12">
              <User className="h-5 w-5 text-[var(--cinehub-accent)]" />
            </span>
            <span>
              <span className="block text-xl font-bold">Public information</span>
              <span className="block text-sm font-normal text-[var(--text-sub)]">
                Name and email shown on your account.
              </span>
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <User className="h-4 w-4 text-[var(--cinehub-accent)]" />
              Full name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || user?.name || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-base text-white placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-[var(--cinehub-accent)] focus-visible:ring-[var(--cinehub-accent)]/30 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Mail className="h-4 w-4 text-[var(--cinehub-accent)]" />
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              value={formData.email || user?.email || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-base text-white placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-[var(--cinehub-accent)] focus-visible:ring-[var(--cinehub-accent)]/30 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="Enter your email address"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="min-h-11 cursor-pointer rounded-full bg-[var(--cinehub-accent)] px-6 font-semibold text-slate-950 hover:bg-[var(--cinehub-accent-hover)]"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit profile
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="min-h-11 cursor-pointer rounded-full border-slate-700 bg-slate-950/40 px-5 text-slate-200 hover:bg-slate-800"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  className="min-h-11 cursor-pointer rounded-full bg-emerald-400 px-6 font-semibold text-slate-950 hover:bg-emerald-300"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--border)]/70 bg-slate-950/55 shadow-xl">
        <CardHeader className="border-b border-[var(--border)]/60 p-5 sm:p-6">
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/12">
              <Lock className="h-5 w-5 text-amber-300" />
            </span>
            <span>
              <span className="block text-xl font-bold">Security</span>
              <span className="block text-sm font-normal text-[var(--text-sub)]">
                Update your local account password.
              </span>
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                id: "currentPassword",
                name: "currentPassword",
                label: "Current password",
                visible: showPasswords.current,
                field: "current" as const,
                icon: Shield,
              },
              {
                id: "newPassword",
                name: "newPassword",
                label: "New password",
                visible: showPasswords.new,
                field: "new" as const,
                icon: Lock,
              },
              {
                id: "confirmPassword",
                name: "confirmPassword",
                label: "Confirm password",
                visible: showPasswords.confirm,
                field: "confirm" as const,
                icon: Check,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="space-y-3">
                  <Label htmlFor={item.id} className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Icon className="h-4 w-4 text-amber-300" />
                    {item.label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={item.id}
                      name={item.name}
                      type={item.visible ? "text" : "password"}
                      value={(formData as any)[item.name] || ""}
                      onChange={handleInputChange}
                      className="min-h-12 rounded-xl border border-slate-700 bg-slate-950/70 px-4 pr-12 text-base text-white placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-amber-300 focus-visible:ring-amber-300/30"
                      placeholder={item.label}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 cursor-pointer rounded-lg text-slate-400 hover:bg-amber-300/10 hover:text-amber-200"
                      onClick={() => togglePasswordVisibility(item.field)}
                      aria-label={`Toggle ${item.label.toLowerCase()} visibility`}
                    >
                      {item.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {formData.newPassword && (
            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/55 p-4 sm:grid-cols-2">
              {passwordChecks.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      item.valid
                        ? "border-emerald-400 bg-emerald-400 text-slate-950"
                        : "border-slate-700 bg-slate-950 text-slate-500"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span className={item.valid ? "text-emerald-200" : "text-slate-400"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            onClick={handleChangePassword}
            disabled={isChangingPassword || !passwordReady}
            className="min-h-12 w-full cursor-pointer rounded-full bg-amber-300 font-bold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="mr-2 h-5 w-5" />
            {isChangingPassword ? "Updating..." : "Update password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
