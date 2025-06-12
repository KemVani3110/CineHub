"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Edit3, 
  Save, 
  X, 
  User, 
  Lock, 
  Mail,
  Shield,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useProfileStore } from "@/store/profileStore";
import { useState } from "react";

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

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

  return (
    <div className="max-w-10xl mx-auto space-y-8">
    {/* Profile Information Card */}
    <Card className="bg-[var(--bg-card)]/90 backdrop-blur-xl border-[var(--border)]/60 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--cinehub-accent)]/5 via-transparent to-[var(--success)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="text-[var(--text-main)] flex items-center gap-4 text-xl">
          <div className="p-3 bg-gradient-to-br from-[var(--cinehub-accent)]/15 to-[var(--cinehub-accent)]/25 rounded-xl shadow-lg">
            <User className="w-6 h-6 text-[var(--cinehub-accent)]" />
          </div>
          <div>
            <span className="text-2xl font-bold">Profile Information</span>
            <p className="text-sm text-[var(--text-sub)] font-normal mt-1">Update your personal details</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Full Name Field */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-[var(--text-main)] font-semibold text-base flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--cinehub-accent)]" />
              Full Name
            </Label>
            <div className="relative group">
              <Input
                id="name"
                name="name"
                value={formData.name || user?.name || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-12 bg-[var(--bg-main)]/60 border-2 border-[var(--border)]/50 text-[var(--text-main)] 
                  rounded-xl px-4 text-base font-medium
                  focus:border-[var(--cinehub-accent)] focus:bg-[var(--bg-main)]/80 focus:shadow-lg
                  disabled:opacity-70 disabled:cursor-not-allowed
                  hover:border-[var(--border)] hover:bg-[var(--bg-main)]/70
                  transition-all duration-300"
                placeholder="Enter your full name"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--cinehub-accent)]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-[var(--text-main)] font-semibold text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--cinehub-accent)]" />
              Email Address
            </Label>
            <div className="relative group">
              <Input
                id="email"
                name="email"
                value={formData.email || user?.email || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-12 bg-[var(--bg-main)]/60 border-2 border-[var(--border)]/50 text-[var(--text-main)] 
                  rounded-xl px-4 text-base font-medium
                  focus:border-[var(--cinehub-accent)] focus:bg-[var(--bg-main)]/80 focus:shadow-lg
                  disabled:opacity-70 disabled:cursor-not-allowed
                  hover:border-[var(--border)] hover:bg-[var(--bg-main)]/70
                  transition-all duration-300"
                placeholder="Enter your email address"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--cinehub-accent)]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="h-12 px-8 bg-gradient-to-r from-[var(--cinehub-accent)] to-[var(--cinehub-accent)]/90 
                hover:from-[var(--cinehub-accent)]/90 hover:to-[var(--cinehub-accent)]/80 
                text-[var(--bg-main)] font-semibold text-base rounded-xl shadow-lg 
                hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer
                border-2 border-[var(--cinehub-accent)]/30"
            >
              <Edit3 className="w-5 h-5 mr-3" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="h-12 px-6 border-2 border-[var(--border)] text-[var(--text-sub)] 
                  hover:bg-[var(--bg-main)]/60 hover:border-[var(--border)]/80 hover:text-[var(--text-main)]
                  rounded-xl font-semibold transition-all duration-300 cursor-pointer
                  hover:scale-105"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="h-12 px-8 bg-gradient-to-r from-[var(--success)] to-[var(--success)]/90 
                  hover:from-[var(--success)]/90 hover:to-[var(--success)]/80 
                  text-white font-semibold rounded-xl shadow-lg hover:shadow-xl 
                  hover:scale-105 transition-all duration-300 cursor-pointer
                  border-2 border-[var(--success)]/30"
              >
                <Save className="w-5 h-5 mr-3" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Security & Password Card */}
    <Card className="bg-[var(--bg-card)]/90 backdrop-blur-xl border-[var(--border)]/60 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--warning)]/5 via-transparent to-[var(--cinehub-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="text-[var(--text-main)] flex items-center gap-4 text-xl">
          <div className="p-3 bg-gradient-to-br from-[var(--warning)]/15 to-[var(--warning)]/25 rounded-xl shadow-lg">
            <Lock className="w-6 h-6 text-[var(--warning)]" />
          </div>
          <div>
            <span className="text-2xl font-bold">Security & Password</span>
            <p className="text-sm text-[var(--text-sub)] font-normal mt-1">Keep your account secure</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Password */}
          <div className="space-y-3">
            <Label htmlFor="currentPassword" className="text-[var(--text-main)] font-semibold text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--warning)]" />
              Current Password
            </Label>
            <div className="relative group">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword || ""}
                onChange={handleInputChange}
                className="h-12 bg-[var(--bg-main)]/60 border-2 border-[var(--border)]/50 text-[var(--text-main)] 
                  rounded-xl px-4 pr-12 text-base font-medium
                  focus:border-[var(--warning)] focus:bg-[var(--bg-main)]/80 focus:shadow-lg
                  hover:border-[var(--border)] hover:bg-[var(--bg-main)]/70
                  transition-all duration-300"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 
                  text-[var(--text-sub)] hover:text-[var(--warning)] hover:bg-[var(--warning)]/10 
                  rounded-lg transition-all duration-200 cursor-pointer"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-3">
            <Label htmlFor="newPassword" className="text-[var(--text-main)] font-semibold text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--warning)]" />
              New Password
            </Label>
            <div className="relative group">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword || ""}
                onChange={handleInputChange}
                className="h-12 bg-[var(--bg-main)]/60 border-2 border-[var(--border)]/50 text-[var(--text-main)] 
                  rounded-xl px-4 pr-12 text-base font-medium
                  focus:border-[var(--warning)] focus:bg-[var(--bg-main)]/80 focus:shadow-lg
                  hover:border-[var(--border)] hover:bg-[var(--bg-main)]/70
                  transition-all duration-300"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 
                  text-[var(--text-sub)] hover:text-[var(--warning)] hover:bg-[var(--warning)]/10 
                  rounded-lg transition-all duration-200 cursor-pointer"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-[var(--text-main)] font-semibold text-base flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--warning)]" />
              Confirm Password
            </Label>
            <div className="relative group">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword || ""}
                onChange={handleInputChange}
                className="h-12 bg-[var(--bg-main)]/60 border-2 border-[var(--border)]/50 text-[var(--text-main)] 
                  rounded-xl px-4 pr-12 text-base font-medium
                  focus:border-[var(--warning)] focus:bg-[var(--bg-main)]/80 focus:shadow-lg
                  hover:border-[var(--border)] hover:bg-[var(--bg-main)]/70
                  transition-all duration-300"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 
                  text-[var(--text-sub)] hover:text-[var(--warning)] hover:bg-[var(--warning)]/10 
                  rounded-lg transition-all duration-200 cursor-pointer"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Update Password Button */}
        <div className="pt-4">
          <Button
            onClick={changePassword}
            disabled={
              !formData.currentPassword ||
              !formData.newPassword ||
              !formData.confirmPassword
            }
            className="w-full h-14 bg-gradient-to-r from-[var(--warning)] to-[var(--warning)]/90 
              hover:from-[var(--warning)]/90 hover:to-[var(--warning)]/80 
              text-[var(--bg-main)] font-bold text-lg rounded-xl shadow-lg 
              hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              border-2 border-[var(--warning)]/30"
          >
            <Lock className="w-6 h-6 mr-3" />
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
  );
}