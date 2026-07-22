"use client";

import { useEffect, useMemo, useState } from "react";
import { User, UserRole } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { authenticatedFetch } from "@/lib/firebase-auth-api";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";

interface UserManagementProps {
  users?: User[];
  initialUsers?: User[];
  onUsersChange?: (users: User[]) => void;
  currentUserId?: string;
}

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.MODERATOR, label: "Moderator" },
  { value: UserRole.USER, label: "User" },
];

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function escapeCsvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadUsersCsv(filename: string, rows: User[]) {
  const headers = [
    "id",
    "name",
    "email",
    "role",
    "isActive",
    "emailVerified",
    "provider",
    "createdAt",
    "lastLoginAt",
  ];
  const csv = [
    headers.join(","),
    ...rows.map((user) =>
      headers
        .map((key) => escapeCsvValue(user[key as keyof User]))
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function UserManagement({
  users: propUsers,
  initialUsers,
  onUsersChange,
  currentUserId,
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(propUsers || initialUsers || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { toast } = useToast();

  useEffect(() => {
    if (propUsers) {
      setUsers(propUsers);
    }
  }, [propUsers]);

  useEffect(() => {
    if (!propUsers && !initialUsers?.length) {
      refreshUsers();
    }
  }, [propUsers, initialUsers?.length]);

  useEffect(() => {
    onUsersChange?.(users);
  }, [users, onUsersChange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const refreshUsers = async () => {
    try {
      setRefreshing(true);
      const response = await authenticatedFetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Refresh failed",
        description:
          error instanceof Error ? error.message : "Could not refresh users.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const name = user.name || "";
      const email = user.email || "";
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        String(user.id).includes(query);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchTerm, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      detail: `${filteredUsers.length} visible`,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active",
      value: users.filter((user) => user.isActive).length,
      detail: `${users.filter((user) => !user.isActive).length} inactive`,
      icon: UserCheck,
      color: "text-emerald-300",
    },
    {
      label: "Verified",
      value: users.filter((user) => user.emailVerified).length,
      detail: "Email verified",
      icon: CheckCircle2,
      color: "text-cyan-300",
    },
    {
      label: "Admin Roles",
      value: users.filter((user) => user.role === UserRole.ADMIN).length,
      detail: `${users.filter((user) => user.role === UserRole.MODERATOR).length} moderators`,
      icon: Shield,
      color: "text-rose-300",
    },
  ];

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (currentUserId && String(userId) === currentUserId) {
      toast({
        title: "Error",
        description: "Cannot change your own role",
        variant: "destructive",
      });
      return;
    }

    if (newRole === UserRole.ADMIN) {
      toast({
        title: "Error",
        description: "Cannot promote users to admin role",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [`role-${userId}`]: true }));

      const response = await authenticatedFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: newRole as UserRole,
          isActive: users.find((u) => u.id === userId)?.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole as UserRole } : user
        )
      );

      toast({
        title: "Success",
        description: "User role updated successfully",
        className: "bg-green-600/10 border-green-500/20 text-green-400",
      });

      await refreshUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [`role-${userId}`]: false }));
    }
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    const user = users.find((u) => u.id === userId);
    if (user?.role === UserRole.ADMIN && !isActive) {
      toast({
        title: "Error",
        description: "Cannot deactivate admin accounts",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [`status-${userId}`]: true }));

      const response = await authenticatedFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: users.find((u) => u.id === userId)?.role,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive } : user
        )
      );

      toast({
        title: "Success",
        description: `User ${isActive ? "activated" : "deactivated"} successfully`,
        className: "bg-green-600/10 border-green-500/20 text-green-400",
      });

      await refreshUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [`status-${userId}`]: false }));
    }
  };

  const openDeleteDialog = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user?.role === UserRole.ADMIN) {
      toast({
        title: "Error",
        description: "Cannot delete admin accounts",
        variant: "destructive",
      });
      return;
    }

    setUserToDelete(user || null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setLoading((prev) => ({ ...prev, [`delete-${userToDelete.id}`]: true }));

      const response = await authenticatedFetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete.id)
      );

      toast({
        title: "Success",
        description: "User deleted successfully",
        className: "bg-green-600/10 border-green-500/20 text-green-400",
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);

      await refreshUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({
        ...prev,
        [`delete-${userToDelete.id}`]: false,
      }));
    }
  };

  const roleBadgeClass = (role: string) => {
    if (role === UserRole.ADMIN) return "border-rose-500/40 bg-rose-500/10 text-rose-300";
    if (role === UserRole.MODERATOR) return "border-blue-500/40 bg-blue-500/10 text-blue-300";
    return "border-slate-600 bg-slate-800/70 text-slate-300";
  };

  const getRoleIcon = (role: string) => {
    if (role === UserRole.ADMIN) return <Shield className="h-3 w-3" />;
    if (role === UserRole.MODERATOR) return <UserCheck className="h-3 w-3" />;
    return <Mail className="h-3 w-3" />;
  };

  const formatRoleDisplay = (role: string) =>
    role.charAt(0).toUpperCase() + role.slice(1);

  const formatProvider = (provider?: string) =>
    provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Local";

  const formatDate = (value?: Date | string | null) => {
    if (!value) return "Not recorded";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not recorded";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({ title: "Email copied", description: email });
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard is not available in this browser.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const isSelf = (user: User) =>
    currentUserId ? String(user.id) === currentUserId : false;

  const canEditRole = (user: User) =>
    user.role !== UserRole.ADMIN && !isSelf(user) && !loading[`role-${user.id}`];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  User Management
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Manage account access, user status, roles, and production support context.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => downloadUsersCsv("cinehub-users.csv", filteredUsers)}
              disabled={!filteredUsers.length}
              className="min-h-11 w-full border-slate-700 text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={refreshUsers}
              disabled={refreshing}
              className="min-h-11 w-full border-slate-700 text-slate-200 hover:bg-slate-900 lg:w-auto"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
              {refreshing ? "Refreshing..." : "Refresh users"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-800 bg-slate-950/75 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{stat.detail}</p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-2">
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-slate-800 bg-slate-950/75 shadow-none">
        <CardContent className="p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_190px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="min-h-11 border-slate-700 bg-slate-950/80 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary/40"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
            >
              <SelectTrigger className="min-h-11 border-slate-700 bg-slate-950/80 text-slate-200">
                <Filter className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-h-11 border-slate-700 bg-slate-950/80 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!searchTerm && roleFilter === "all" && statusFilter === "all"}
              className="min-h-11 border-slate-700 text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Users</h2>
            <p className="text-sm text-slate-400">
              Showing {filteredUsers.length ? startIndex + 1 : 0}-
              {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
            {filteredUsers.length} visible
          </Badge>
        </div>

        {paginatedUsers.length ? (
          <div className="grid gap-3">
            {paginatedUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4 shadow-none transition-colors hover:border-primary/35 hover:bg-slate-950"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_180px_170px_160px_44px] xl:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-slate-700">
                      <AvatarImage src={user.avatar} alt={user.name || user.email} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-white">{user.name || "Unnamed user"}</h3>
                        {isSelf(user) && (
                          <Badge variant="outline" className="border-primary/40 text-primary">
                            You
                          </Badge>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyEmail(user.email)}
                        className="mt-1 flex min-h-6 max-w-full cursor-pointer items-center gap-1 text-left text-sm text-slate-400 transition-colors hover:text-primary"
                        title="Copy email"
                      >
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={roleBadgeClass(user.role)}>
                      {getRoleIcon(user.role)}
                      {formatRoleDisplay(user.role)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        user.emailVerified
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      }
                    >
                      {user.emailVerified ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>

                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={!canEditRole(user)}
                  >
                    <SelectTrigger className="min-h-10 border-slate-700 bg-slate-950/80 text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                      {loading[`role-${user.id}`] ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Updating
                        </span>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
                      <SelectItem value={UserRole.USER}>User</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={user.role === UserRole.ADMIN || loading[`status-${user.id}`]}
                    onClick={() => handleStatusChange(user.id, !user.isActive)}
                    className={cn(
                      "min-h-10 justify-start border-slate-700 text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60",
                      user.isActive && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                      !user.isActive && "border-slate-700 bg-slate-800/60 text-slate-400"
                    )}
                  >
                    {loading[`status-${user.id}`] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : user.isActive ? (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {user.isActive ? "Active" : "Inactive"}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-xl text-slate-300 hover:bg-primary/10 hover:text-primary"
                        aria-label={`Actions for ${user.name || user.email}`}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {!isSelf(user) && user.role !== UserRole.ADMIN && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() =>
                            handleRoleChange(
                              user.id,
                              user.role === UserRole.MODERATOR
                                ? UserRole.USER
                                : UserRole.MODERATOR
                            )
                          }
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          {user.role === UserRole.MODERATOR ? "Make User" : "Make Moderator"}
                        </DropdownMenuItem>
                      )}
                      {user.role !== UserRole.ADMIN && (
                        <DropdownMenuItem
                          className="cursor-pointer text-red-400 focus:text-red-400"
                          onClick={() => openDeleteDialog(user.id)}
                          disabled={loading[`delete-${user.id}`]}
                        >
                          {loading[`delete-${user.id}`] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 grid gap-2 border-t border-slate-800 pt-4 text-sm text-slate-400 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500" />
                    {formatProvider(user.provider)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    Joined {formatDate(user.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Last login {formatDate(user.lastLoginAt)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Card className="border-slate-800 bg-slate-950/75 shadow-none">
            <CardContent className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserX className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">No users found</h3>
              <p className="mt-2 text-sm text-slate-400">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-5 border-slate-700 text-slate-200 hover:bg-slate-900"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}

        {filteredUsers.length > itemsPerPage && (
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/75 p-3 sm:flex-row">
            <p className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="min-h-10 border-slate-700 text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="min-h-10 border-slate-700 text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="border-slate-800 bg-slate-950 text-slate-100 sm:max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User details</DialogTitle>
                <DialogDescription>
                  Account context and moderation controls for this user.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <Avatar className="h-16 w-16 border-2 border-slate-700">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name || selectedUser.email} />
                    <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                      {(selectedUser.name || selectedUser.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-semibold text-white">
                      {selectedUser.name || "Unnamed user"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => copyEmail(selectedUser.email)}
                      className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-slate-400 hover:text-primary"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {selectedUser.email}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["User ID", selectedUser.id],
                    ["Role", formatRoleDisplay(selectedUser.role)],
                    ["Status", selectedUser.isActive ? "Active" : "Inactive"],
                    ["Email", selectedUser.emailVerified ? "Verified" : "Unverified"],
                    ["Provider", formatProvider(selectedUser.provider)],
                    ["Provider ID", selectedUser.providerId || "Not recorded"],
                    ["Joined", formatDate(selectedUser.createdAt)],
                    ["Last login", formatDate(selectedUser.lastLoginAt)],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
                      <p className="mt-2 break-words font-medium text-white">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-slate-800 bg-slate-950 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user account</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
              This action cannot be undone and will permanently remove user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            This will delete the profile, watchlist, ratings, reviews, and activity history
            associated with this account.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={loading[`delete-${userToDelete?.id}`]}
              className="bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading[`delete-${userToDelete?.id}`] ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
