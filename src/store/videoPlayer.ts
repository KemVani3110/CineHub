import { create } from 'zustand';

interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  videoDuration: number;
  volume: number;
  showControls: boolean;
  quality: string;
  setPlaying: (isPlaying: boolean) => void;
  setMuted: (isMuted: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVideoDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setShowControls: (show: boolean) => void;
  setQuality: (quality: string) => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  isMuted: false,
  currentTime: 0,
  videoDuration: 0,
  volume: 1,
  showControls: true,
  quality: '1080p',
};

export const useVideoPlayerStore = create<VideoPlayerState>((set) => ({
  ...initialState,

  setPlaying: (isPlaying) => set({ isPlaying }),
  setMuted: (isMuted) => set({ isMuted }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setVideoDuration: (videoDuration) => set({ videoDuration }),
  setVolume: (volume) => set({ volume }),
  setShowControls: (showControls) => set({ showControls }),
  setQuality: (quality) => set({ quality }),
  reset: () => set(initialState),
})); 