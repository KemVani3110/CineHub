"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu,
  User,
  LogIn,
  Home,
  Compass,
  Bell,
  LogOut,
  Search,
  PanelLeft,
  Users,
  Activity,
  BookmarkPlus,
  History,
  Heart,
  Film,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/store/profileStore";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useHistoryStore } from "@/store/historyStore";
import { useHeaderStore } from "@/store/headerStore";
import NotificationBell from "./NotificationBell";
import { useAdminMovieStore } from "@/store/adminMovieStore";
import { useEffect } from "react";

interface HeaderProps {
  onSidebarChange?: (isOpen: boolean) => void;
}

const Header = ({ onSidebarChange }: HeaderProps) => {
  const pathname = usePathname();
  const {
    isMobileMenuOpen,
    isSidebarOpen,
    setIsMobileMenuOpen,
    closeMobileMenu,
  } = useHeaderStore();
  const { user: authUser, logout } = useAuth();
  const { user: profileUser } = useProfileStore();
  const { toast } = useToast();
  const router = useRouter();
  const { getRecentHistory } = useHistoryStore();
  const recentHistory = getRecentHistory(5);
  const { data: session } = useSession();
  const { fetchMovies } = useAdminMovieStore();

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Search", path: "/search", icon: Search },
    { name: "CineHub's Films", path: "/movie/internal", icon: Film },
    {
      name: "Watchlist",
      path: "/watchlist",
      icon: BookmarkPlus,
      requiresAuth: true,
    },
    { name: "History", path: "/history", icon: History, requiresAuth: true },
  ];

  const adminMenuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: PanelLeft,
    },
    {
      name: "Movies",
      path: "/admin/movies",
      icon: Film,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Activity Logs",
      path: "/admin/activity-logs",
      icon: Activity,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      router.push("/login");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if user logged in through social providers
  const isSocialLogin =
    session?.user?.image?.includes("googleusercontent.com") ||
    session?.user?.image?.includes("facebook.com");

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.requiresAuth && !authUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    router.push(item.path);
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // Get user avatar with fallback
  const getUserAvatar = () => {
    if (!authUser) return null;

    // First check if user has a custom avatar from our system
    if (profileUser?.avatar) {
      return profileUser.avatar;
    }

    // Then check social auth avatars
    const socialAvatar =
      (authUser as any).picture ||
      (authUser as any).photoURL ||
      (authUser as any).image ||
      (authUser as any).profilePicture;

    return socialAvatar || null;
  };

  // Add useEffect to fetch movies when admin menu is opened
  useEffect(() => {
    if (authUser?.role === "admin") {
      fetchMovies();
    }
  }, [authUser?.role, fetchMovies]);

  return (
    <>
      <header
        className={`w-full bg-gradient-to-r from-slate-900/95 via-cinehub-accent/20 to-slate-800/95 backdrop-blur-md border-b border-cinehub-accent/30 sticky top-0 z-40 transition-all duration-300 shadow-lg shadow-cinehub-accent/10 ${
          isSidebarOpen ? "hidden" : "block"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link
                href="/home"
                className="flex items-center space-x-2 md:space-x-3 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14">
                  <Image
                    src="/logo.png"
                    alt="CineHub Logo"
                    fill
                    className="object-contain rounded-full"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold gradient-text">
                    CineHub
                  </span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground -mt-1">
                    Cinema Experience
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item)}
                    className={`nav-item flex items-center space-x-2 px-4 py-2 mx-1 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "text-white bg-primary shadow-lg shadow-primary/25"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {authUser ? (
                <>
                  {/* Notifications Button */}
                  <NotificationBell />

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hidden sm:flex p-1 rounded-full hover:!bg-transparent focus-visible:ring-0 cursor-pointer"
                      >
                        <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20">
                          <AvatarImage
                            src={getUserAvatar()}
                            alt={authUser.name || authUser.email || "User"}
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getUserInitials(
                              authUser.name || authUser.email || "User"
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="pb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getUserAvatar()}
                              alt={authUser.name || authUser.email || "User"}
                              referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getUserInitials(
                                authUser.name || authUser.email || "User"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium truncate">
                              {authUser.name || authUser.email}
                            </span>
                            {authUser.email && authUser.name && (
                              <span className="text-xs text-muted-foreground truncate">
                                {authUser.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/favorite-actors"
                          className="cursor-pointer"
                        >
                          <Heart className="mr-3 h-4 w-4" />
                          Favorite Actors
                        </Link>
                      </DropdownMenuItem>
                      {authUser?.role === "admin" && (
                        <>
                          {adminMenuItems.map((item) => (
                            <DropdownMenuItem key={item.path} asChild>
                              <Link href={item.path} className="cursor-pointer">
                                <item.icon className="mr-3 h-4 w-4" />
                                {item.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Auth Buttons */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="rounded-full"
                    >
                      <Link href="/login">
                        <LogIn size={18} className="mr-2" />
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="rounded-full">
                      <Link href="/register">
                        <User size={18} className="mr-2" />
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-9 w-9 rounded-full hover:bg-slate-700/50 text-slate-300 hover:text-white relative"
                  >
                    <Menu size={22} />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[400px] p-0 bg-slate-900 border-slate-700"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-full">
                    {/* Header - Replaced with User Info */}
                    <div className="p-4 border-b border-slate-700/50">
                      {authUser ? (
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={getUserAvatar()}
                              alt={authUser.name || authUser.email || "User"}
                              referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getUserInitials(
                                authUser.name || authUser.email || "User"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {authUser.name || authUser.email}
                            </p>
                            {authUser.email && authUser.name && (
                              <p className="text-xs text-slate-400 truncate">
                                {authUser.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Guest User</p>
                            <p className="text-xs text-slate-400">
                              Sign in to access more features
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-2">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={closeMobileMenu}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? "text-white bg-primary shadow-lg shadow-primary/25"
                                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                              }`}
                            >
                              <Icon size={20} className="flex-shrink-0" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>

                      <Separator className="my-4 bg-slate-700" />

                      {/* User Section */}
                      {authUser ? (
                        <div className="space-y-2">
                          <Link
                            href="/profile"
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50"
                          >
                            <User size={20} className="flex-shrink-0" />
                            <span>Profile</span>
                          </Link>

                          <Link
                            href="/favorite-actors"
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50"
                          >
                            <Heart size={20} className="flex-shrink-0" />
                            <span>Favorite Actors</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            href="/login"
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50"
                          >
                            <LogIn size={20} className="flex-shrink-0" />
                            <span>Login</span>
                          </Link>
                          <Link
                            href="/register"
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50"
                          >
                            <User size={20} className="flex-shrink-0" />
                            <span>Register</span>
                          </Link>
                        </div>
                      )}

                      {authUser?.role === "admin" && (
                        <div className="space-y-2">
                          {adminMenuItems.map((item) => (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={closeMobileMenu}
                              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50"
                            >
                              <item.icon size={20} className="flex-shrink-0" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer with Logout and Version */}
                    <div className="mt-auto border-t border-slate-700/50 bg-slate-800/50">
                      {authUser && (
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-none text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 justify-start"
                        >
                          <LogOut size={20} className="flex-shrink-0" />
                          <span>Logout</span>
                        </Button>
                      )}
                      <div className="px-4 py-3 text-center">
                        <p className="text-xs text-slate-400">CineHub v1.0.0</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
