import { useNotificationStore } from "@/store/notificationStore";

export const useNotification = () => {
  const { addNotification } = useNotificationStore();

  const notify = {
    info: (title: string, message: string) => {
      addNotification({
        title,
        message,
        type: "info",
      });
    },
    success: (title: string, message: string) => {
      addNotification({
        title,
        message,
        type: "success",
      });
    },
    warning: (title: string, message: string) => {
      addNotification({
        title,
        message,
        type: "warning",
      });
    },
    error: (title: string, message: string) => {
      addNotification({
        title,
        message,
        type: "error",
      });
    },
  };

  return notify;
}; 