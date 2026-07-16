"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification, useNotificationStore } from "@/store/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 60_000);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-cyan-300" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

    if (notification.href) {
      router.push(notification.href);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-full hover:bg-accent/10"
          aria-label="Open notifications"
        >
          {unreadCount > 0 ? (
            <BellRing size={22} className="text-primary" />
          ) : (
            <Bell size={22} />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(92vw,380px)] p-0">
        <DropdownMenuLabel className="flex items-start justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="text-xs font-normal text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-1 h-4 w-4" />
                Read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="m-0" />

        {error ? (
          <div className="px-4 py-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Could not load notifications
            </p>
            <p className="mt-1 text-xs">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-9"
              onClick={() => fetchNotifications()}
            >
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Watchlist and source report updates will show here.
            </p>
          </div>
        ) : (
          <div className="max-h-[min(70vh,430px)] overflow-y-auto p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "group mb-1 rounded-md border border-transparent p-3 transition-colors",
                  "hover:border-primary/25 hover:bg-primary/10",
                  !notification.read && "border-primary/20 bg-primary/10"
                )}
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-start gap-3 text-left"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/70">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="mt-2 block text-xs text-muted-foreground/80">
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                </button>

                {notification.read && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {notifications.some((notification) => notification.read) && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="flex justify-end px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => clearRead()}
              >
                Clear read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
