import { create } from 'zustand';
import { AuthProvider } from '@/types/auth';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  provider: AuthProvider;
  created_at: string;
  last_login_at: string;
}

interface FormData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  avatar?: string;
}

interface ProfileState {
  user: User | null;
  isEditing: boolean;
  isAvatarDialogOpen: boolean;
  availableAvatars: string[];
  activeTab: string;
  formData: FormData;
  loading: boolean;
  setActiveTab: (tab: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  setIsAvatarDialogOpen: (isOpen: boolean) => void;
  setFormData: (data: Partial<FormData>) => void;
  updateProfile: () => Promise<void>;
  changePassword: () => Promise<void>;
  updateAvatar: (avatarPath: string) => Promise<void>;
  fetchUserData: () => Promise<void>;
  fetchAvatars: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  isEditing: false,
  isAvatarDialogOpen: false,
  availableAvatars: [],
  activeTab: "overview",
  formData: {},
  loading: true,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setIsAvatarDialogOpen: (isOpen) => set({ isAvatarDialogOpen: isOpen }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),

  updateProfile: async () => {
    const { formData } = get();
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const data = await response.json();
      set({ 
        user: data.user, 
        isEditing: false,
        formData: {
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar
        }
      });
    } catch (error) {
      throw error;
    }
  },

  changePassword: async () => {
    const { formData } = get();
    try {
      // Validate form data
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        throw new Error("All password fields are required");
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      if (formData.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }

      if (!/[A-Z]/.test(formData.newPassword)) {
        throw new Error("New password must contain at least one uppercase letter");
      }

      if (!/[0-9]/.test(formData.newPassword)) {
        throw new Error("New password must contain at least one number");
      }

      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      const result = await response.json();

      // Clear password fields after successful change
      set({ 
        isEditing: false,
        formData: {
          name: get().user?.name || "",
          email: get().user?.email || "",
          avatar: get().user?.avatar || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }
      });

      return result;
    } catch (error) {
      throw error;
    }
  },

  updateAvatar: async (avatarPath: string) => {
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar: avatarPath }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update avatar");
      }

      const data = await response.json();
      set({ user: data.user });
    } catch (error) {
      throw error;
    }
  },

  fetchUserData: async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      set({ 
        user: data.user, 
        formData: {
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar
        },
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchAvatars: async () => {
    try {
      const response = await fetch("/api/profile/avatars");
      if (!response.ok) {
        throw new Error("Failed to fetch avatars");
      }
      const data = await response.json();
      set({ availableAvatars: data.avatars.map((avatar: any) => avatar.file_path) });
    } catch (error) {
      console.error("Error fetching avatars:", error);
      set({ availableAvatars: [] });
    }
  },
})); 