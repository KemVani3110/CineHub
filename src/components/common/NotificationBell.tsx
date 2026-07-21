"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Flag,
  Info,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
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

  const getSourceMeta = (source?: string) => {
    switch (source) {
      case "watchlist":
        return {
          label: "Watchlist",
          icon: Bookmark,
          className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        };
      case "source_report":
        return {
          label: "Source report",
          icon: Flag,
          className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
        };
      case "contact":
        return {
          label: "Contact",
          icon: MessageSquare,
          className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
        };
      case "admin":
        return {
          label: "Admin",
          icon: ShieldCheck,
          className: "border-violet-400/30 bg-violet-400/10 text-violet-300",
        };
      default:
        return {
          label: "System",
          icon: Info,
          className: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
        };
    }
  };

  const getActionLabel = (notification: Notification) => {
    if (!notification.href) return "Mark read";
    if (notification.source === "source_report") return "Review report";
    if (notification.source === "contact") return "Open inbox";
    if (notification.source === "watchlist") return "View item";
    if (notification.source === "admin") return "Open admin";
    return "Open";
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
          className="relative h-11 w-11 cursor-pointer rounded-full hover:bg-accent/10"
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

      <DropdownMenuContent
        align="end"
        className="w-[min(94vw,430px)] overflow-hidden rounded-2xl border-border/70 bg-slate-950/95 p-0 text-white shadow-2xl backdrop-blur-xl"
      >
        <DropdownMenuLabel className="flex items-start justify-between gap-3 bg-gradient-to-r from-primary/15 to-transparent px-4 py-4">
          <div>
            <p className="font-semibold text-white">Notifications</p>
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
              onClick={() => fetchNotifications()}
              aria-label="Refresh notifications"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 cursor-pointer rounded-full px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
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
            <p className="font-medium text-white">
              Could not load notifications
            </p>
            <p className="mt-1 text-xs">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-9 cursor-pointer border-border/70 bg-slate-900/70 text-white hover:border-primary/50 hover:text-primary"
              onClick={() => fetchNotifications()}
            >
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-white">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Source reports, contact replies, watchlist updates, and admin
              alerts will show here.
            </p>
          </div>
        ) : (
          <div className="max-h-[min(72vh,480px)] overflow-y-auto p-2 scrollbar-thin">
            {notifications.map((notification) => {
              const sourceMeta = getSourceMeta(notification.source);
              const SourceIcon = sourceMeta.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group mb-2 rounded-xl border p-3 transition-colors",
                    "border-border/45 bg-slate-900/55 hover:border-primary/35 hover:bg-primary/10",
                    !notification.read && "border-primary/35 bg-primary/10"
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-start gap-3 text-left"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950/80">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                        {notification.message}
                      </span>
                      <span className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex min-h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold",
                            sourceMeta.className
                          )}
                        >
                          <SourceIcon className="h-3.5 w-3.5" />
                          {sourceMeta.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80">
                          {formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </span>
                    </span>
                  </button>

                  <div className="mt-3 flex items-center justify-between gap-2 pl-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 cursor-pointer rounded-full px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {getActionLabel(notification)}
                      {notification.href && (
                        <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      )}
                    </Button>
                    {notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 cursor-pointer rounded-full px-2 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {notifications.some((notification) => notification.read) && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="flex justify-end px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 cursor-pointer rounded-full text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-300"
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
