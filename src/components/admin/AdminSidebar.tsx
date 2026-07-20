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
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  CircleUser,
  Menu,
  Flag,
  MessageSquare,
  Settings,
  Gauge,
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
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
    section: "Core",
  },
  {
    title: "Operations",
    href: "/admin/operations",
    icon: Gauge,
    badge: null,
    section: "Core",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    badge: null,
    section: "Core",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    badge: null,
    section: "Management",
  },
  {
    title: "Source Reports",
    href: "/admin/source-reports",
    icon: Flag,
    badge: null,
    section: "Management",
  },
  {
    title: "Contact Messages",
    href: "/admin/contact-messages",
    icon: MessageSquare,
    badge: null,
    section: "Management",
  },
  {
    title: "User Avatar",
    href: "/admin/avatar",
    icon: CircleUser,
    badge: null,
    section: "System",
  },
  {
    title: "Activity Logs",
    href: "/admin/activity-logs",
    icon: Activity,
    badge: null,
    section: "System",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
    section: "System",
  },
];

const navSections = ["Core", "Management", "System"];

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
          className="fixed left-3 top-3 z-50 h-11 w-11 rounded-full border border-border/60 bg-card/90 shadow-lg backdrop-blur md:hidden"
          aria-label="Open admin navigation"
        >
          <Menu size={24} />
        </Button>
      )}
      <TooltipProvider>
        <div
          className={cn(
            "flex h-dvh flex-col border-r border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
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
                  href="/admin"
                  className="flex items-center space-x-2 hover:opacity-90 transition-opacity flex-1 min-w-0"
                >
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt="CineHub Logo"
                      fill
                      sizes="32px"
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
                      sizes="32px"
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
                className="h-10 w-10 flex-shrink-0 rounded-full hover:!bg-transparent hover:text-primary"
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
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 min-h-0">
            {navSections.map((section) => {
              const items = navItems.filter((item) => item.section === section);

              return (
                <div key={section} className="space-y-1.5">
                  {!isCollapsed && (
                    <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {section}
                    </div>
                  )}

                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href === "/admin" && pathname === "/admin/dashboard");

                    const navButton = (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        <div
                          className={cn(
                            "relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                            isActive ? "bg-primary-foreground/15" : "bg-background/40"
                          )}
                        >
                          <Icon size={18} />
                        </div>

                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant={isActive ? "secondary" : "outline"}
                                className="ml-auto h-5 px-2 text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}

                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground" />
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
                </div>
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
                    className="w-full h-10 text-primary hover:text-primary hover:bg-primary/10 rounded-xl cursor-pointer"
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
                className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-10 px-4 cursor-pointer"
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
                        className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
