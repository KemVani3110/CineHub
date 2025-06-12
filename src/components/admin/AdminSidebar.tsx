"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
  FileText,
  CircleUser,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    badge: null,
  },
  {
    title: "Activity Logs",
    href: "/admin/activity-logs",
    icon: Activity,
    badge: null,
  },
  {
    title: "User Avatar",
    href: "/admin/avatar",
    icon: CircleUser,
    badge: null,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
    badge: null,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getUserInitials = (name: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getUserAvatar = () => {
    if (!user) return null;

    const avatarUrl =
      user.avatar ||
      (user as any).picture ||
      (user as any).photoURL ||
      (user as any).image ||
      (user as any).profilePicture;

    return avatarUrl || null;
  };

  const handleLogout = async () => {
    await logout();
  };

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";
  const mobileClasses = isMobile
    ? "fixed top-0 left-0 z-50 transform transition-transform duration-300"
    : "";
  const mobileTransform =
    isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0";

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 md:hidden"
        >
          <Menu size={24} />
        </Button>
      )}
      <TooltipProvider>
        <div
          className={cn(
            "bg-gradient-to-b from-card to-card/50 border-r border-border/50 h-screen flex flex-col transition-all duration-300 ease-in-out backdrop-blur-sm",
            sidebarWidth,
            mobileClasses,
            mobileTransform,
            className
          )}
        >
          {/* Header Section */}
          <div className="p-4 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center justify-between min-h-[48px]">
              {!isCollapsed ? (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center space-x-2 hover:opacity-90 transition-opacity flex-1 min-w-0"
                >
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt="CineHub Logo"
                      fill
                      className="object-contain rounded-full ring-2 ring-primary/20"
                      priority
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-lg font-bold gradient-text truncate">
                      Admin Panel
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      CineHub Management
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex justify-center w-full">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/logo.png"
                      alt="CineHub Logo"
                      fill
                      className="object-contain rounded-full ring-2 ring-primary/20"
                      priority
                    />
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 rounded-full hover:!bg-transparent flex-shrink-0 cursor-pointer hover:text-primary"
              >
                {isCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* User Info Section */}
          {user && (
            <div className="p-4 border-b border-border/50 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-background">
                    <AvatarImage
                      src={getUserAvatar()}
                      alt={user.name || user.email || "Admin"}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {getUserInitials(user.name || user.email || "Admin")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground truncate text-sm">
                        {user.name || user.email}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        <Shield size={8} className="mr-1" />
                        Admin
                      </Badge>
                    </div>
                    {user.email && user.name && (
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    )}
                    <span className="text-xs text-green-500 font-medium">
                      Online
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Section */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              const navButton = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50 hover:scale-102"
                  )}
                >
                  <div className="relative">
                    <Icon size={20} className="flex-shrink-0" />
                    {isActive && (
                      <div className="absolute inset-0 bg-primary-foreground/20 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="text-xs h-5 px-2 ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"></div>
                  )}
                </Link>
              );

              return isCollapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <div className="flex items-center space-x-2">
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                navButton
              );
            })}
          </nav>

          <Separator className="mt-2" />

          {/* Back to Main */}
          <div className="px-3 py-2 flex-shrink-0">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-10 text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
                    asChild
                  >
                    <Link href="/home">
                      <ChevronLeft size={20} />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  Back to Main
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-10 px-4"
                asChild
              >
                <Link href="/home">
                  <ChevronLeft size={20} className="mr-3" />
                  Back to Main
                </Link>
              </Button>
            )}
          </div>

          <Separator />

          {/* Quick Actions */}
          {/* {!isCollapsed && (
            <div className="px-3 py-3 flex-shrink-0">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Quick Actions
                </h4>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 px-3 text-xs rounded-lg hover:bg-accent/50"
                >
                  <Bell size={14} className="mr-2" />
                  Notifications
                  <Badge
                    variant="destructive"
                    className="ml-auto h-4 w-4 p-0 text-xs"
                  >
                    5
                  </Badge>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 px-3 text-xs rounded-lg hover:bg-accent/50"
                >
                  <HelpCircle size={14} className="mr-2" />
                  Help & Support
                </Button>
              </div>
            </div>
          )} */}

          {/* Logout Section */}
          <div className="p-3 border-t border-border/50 flex-shrink-0">
            <AlertDialog>
              {isCollapsed ? (
                <Tooltip>
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <LogOut size={20} />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <TooltipContent side="right" className="ml-2">
                    Logout
                  </TooltipContent>
                </Tooltip>
              ) : (
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 px-4 cursor-pointer"
                  >
                    <LogOut size={20} className="mr-3" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
              )}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to logout?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be signed out of your admin account and redirected
                    to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </TooltipProvider>
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
