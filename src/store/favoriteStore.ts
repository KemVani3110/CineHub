import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteActor {
  id: number;
  actor_id: number;
  name: string;
  profile_path: string;
  added_at: string;
}

interface FavoriteState {
  actors: FavoriteActor[];
  isLoading: boolean;
  error: string | null;
  addFavoriteActor: (actor: Omit<FavoriteActor, "id" | "added_at">) => Promise<void>;
  removeFavoriteActor: (actorId: number) => Promise<void>;
  fetchFavoriteActors: () => Promise<void>;
  isFavoriteActor: (actorId: number) => boolean;
  resetFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      actors: [],
      isLoading: false,
      error: null,

      addFavoriteActor: async (actor) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch("/api/favorites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              actorId: actor.actor_id,
              name: actor.name,
              profilePath: actor.profile_path,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to add to favorites");
          }

          const newActor = await response.json();
          set((state) => ({
            actors: [...state.actors, newActor],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "An error occurred",
            isLoading: false,
          });
        }
      },

      removeFavoriteActor: async (actorId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/favorites?actorId=${actorId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to remove from favorites");
          }

          set((state) => ({
            actors: state.actors.filter((actor) => actor.actor_id !== actorId),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "An error occurred",
            isLoading: false,
          });
        }
      },

      fetchFavoriteActors: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch("/api/favorites");

          if (!response.ok) {
            throw new Error("Failed to fetch favorites");
          }

          const data = await response.json();
          set({ actors: data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "An error occurred",
            isLoading: false,
          });
        }
      },

      isFavoriteActor: (actorId) => {
        return get().actors.some((actor) => actor.actor_id === actorId);
      },

      resetFavorites: () => {
        set({ actors: [], isLoading: false, error: null });
      },
    }),
    {
      name: "favorites-storage",
    }
  )
); 