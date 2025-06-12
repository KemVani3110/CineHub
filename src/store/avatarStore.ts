import { create } from 'zustand';
import { useToast } from '@/components/ui/use-toast';

interface UserAvatar {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
  is_active: boolean;
}

interface AvatarState {
  // State
  avatars: UserAvatar[];
  loading: boolean;
  uploading: boolean;
  selectedFile: File | null;

  // Actions
  setAvatars: (avatars: UserAvatar[]) => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setSelectedFile: (file: File | null) => void;

  // Async actions
  fetchAvatars: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: (id: number) => Promise<void>;
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  // Initial state
  avatars: [],
  loading: false,
  uploading: false,
  selectedFile: null,

  // Setters
  setAvatars: (avatars) => set({ avatars }),
  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
  setSelectedFile: (file) => set({ selectedFile: file }),

  // Async actions
  fetchAvatars: async () => {
    try {
      set({ loading: true });
      const response = await fetch('/api/admin/avatars');
      const data = await response.json();
      if (response.ok) {
        set({ avatars: data.avatars });
      } else {
        throw new Error(data.message || 'Failed to fetch avatars');
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (file: File) => {
    try {
      set({ uploading: true });
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/admin/avatars/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh avatars list
        await get().fetchAvatars();
        set({ selectedFile: null });
      } else {
        throw new Error(data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      set({ uploading: false });
    }
  },

  deleteAvatar: async (id: number) => {
    try {
      const response = await fetch(`/api/admin/avatars/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh avatars list
        await get().fetchAvatars();
      } else {
        throw new Error(data.message || 'Failed to delete avatar');
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  },
})); 