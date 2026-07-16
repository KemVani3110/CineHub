import { create } from "zustand";
import { authenticatedFetch } from "@/lib/firebase-auth-api";

type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  href?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date | null;
  readAt?: Date | null;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearRead: () => Promise<void>;
  clearAll: () => void;
  reset: () => void;
}

function parseDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeNotification(notification: any): Notification {
  return {
    id: String(notification.id),
    title: notification.title || "",
    message: notification.message || "",
    type: notification.type || "info",
    read: Boolean(notification.read),
    href: notification.href || null,
    source: notification.source || "system",
    metadata: notification.metadata || {},
    createdAt: parseDate(notification.createdAt) || new Date(),
    updatedAt: parseDate(notification.updatedAt),
    readAt: parseDate(notification.readAt),
  };
}

function unreadCount(notifications: Notification[]) {
  return notifications.filter((notification) => !notification.read).length;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await authenticatedFetch("/api/notifications?limit=50", {
        cache: "no-store",
      });

      if (response.status === 401) {
        set({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          error: null,
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await response.json();
      const notifications = (data.notifications || []).map(normalizeNotification);

      set({
        notifications,
        unreadCount: Number(data.unreadCount ?? unreadCount(notifications)),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load notifications",
      });
    }
  },
  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
        createdAt: new Date(),
      };
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }),
  markAsRead: (id) =>
    new Promise((resolve) => {
      const previousState = useNotificationStore.getState();

      set((state) => {
        const notifications = state.notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true, readAt: new Date() } : notification
        );

        return {
          notifications,
          unreadCount: unreadCount(notifications),
        };
      });

      authenticatedFetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
        .then((response) => {
          if (!response.ok && response.status !== 404) {
            throw new Error("Failed to mark notification as read");
          }
          resolve();
        })
        .catch(() => {
          set({
            notifications: previousState.notifications,
            unreadCount: previousState.unreadCount,
          });
          resolve();
        });
    }),
  markAllAsRead: () =>
    new Promise((resolve) => {
      const previousState = useNotificationStore.getState();

      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date(),
        })),
        unreadCount: 0,
      }));

      authenticatedFetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to mark all as read");
          resolve();
        })
        .catch(() => {
          set({
            notifications: previousState.notifications,
            unreadCount: previousState.unreadCount,
          });
          resolve();
        });
    }),
  removeNotification: (id) =>
    new Promise((resolve) => {
      const previousState = useNotificationStore.getState();

      set((state) => {
        const notifications = state.notifications.filter(
          (notification) => notification.id !== id
        );

        return {
          notifications,
          unreadCount: unreadCount(notifications),
        };
      });

      authenticatedFetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
        .then((response) => {
          if (!response.ok && response.status !== 404) {
            throw new Error("Failed to remove notification");
          }
          resolve();
        })
        .catch(() => {
          set({
            notifications: previousState.notifications,
            unreadCount: previousState.unreadCount,
          });
          resolve();
        });
    }),
  clearRead: () =>
    new Promise((resolve) => {
      const previousState = useNotificationStore.getState();

      set((state) => {
        const notifications = state.notifications.filter(
          (notification) => !notification.read
        );

        return {
          notifications,
          unreadCount: unreadCount(notifications),
        };
      });

      authenticatedFetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to clear read notifications");
          resolve();
        })
        .catch(() => {
          set({
            notifications: previousState.notifications,
            unreadCount: previousState.unreadCount,
          });
          resolve();
        });
    }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  reset: () => set({ notifications: [], unreadCount: 0, error: null }),
})); 
