"use client";

import { useState, useEffect } from "react";
import { User, UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Filter,
  RefreshCw,
  Users,
  MoreHorizontal,
  Eye,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserManagementProps {
  users?: User[];
  initialUsers?: User[];
  onUsersChange?: (users: User[]) => void;
}

export function UserManagement({
  users: propUsers,
  initialUsers,
  onUsersChange,
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(propUsers || initialUsers || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (propUsers) {
      setUsers(propUsers);
    }
  }, [propUsers]);

  useEffect(() => {
    if (onUsersChange) {
      onUsersChange(users);
    }
  }, [users, onUsersChange]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setLoading((prev) => ({ ...prev, [`role-${userId}`]: true }));

      const response = await fetch("/api/admin/users", {
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
    try {
      setLoading((prev) => ({ ...prev, [`status-${userId}`]: true }));

      const response = await fetch("/api/admin/users", {
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
        description: `User ${
          isActive ? "activated" : "deactivated"
        } successfully`,
        className: "bg-green-600/10 border-green-500/20 text-green-400",
      });
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "moderator":
        return <UserCheck className="h-3 w-3" />;
      default:
        return <Mail className="h-3 w-3" />;
    }
  };

  const formatRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getStatsCount = (type: string) => {
    switch (type) {
      case "total":
        return users.length;
      case "active":
        return users.filter((u) => u.isActive).length;
      case "admin":
        return users.filter((u) => u.role === "admin").length;
      case "moderator":
        return users.filter((u) => u.role === "moderator").length;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6 bg-[var(--bg-main)] text-[var(--text-main)] p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--cinehub-accent)]" />
            User Management
          </h1>
          <p className="text-[var(--text-sub)]">
            Manage user roles and permissions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10 hover:text-[var(--cinehub-accent)] transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[var(--bg-card)] border-[var(--border)] hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-sub)]">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-[var(--text-main)]">
                  {getStatsCount("total")}
                </p>
              </div>
              <div className="h-8 w-8 bg-[var(--cinehub-accent)]/10 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-[var(--cinehub-accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-card)] border-[var(--border)] hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-sub)]">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-[var(--success)]">
                  {getStatsCount("active")}
                </p>
              </div>
              <div className="h-8 w-8 bg-[var(--success)]/10 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-[var(--success)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-card)] border-[var(--border)] hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-sub)]">
                  Administrators
                </p>
                <p className="text-2xl font-bold text-red-400">
                  {getStatsCount("admin")}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-400/10 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-card)] border-[var(--border)] hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-sub)]">
                  Moderators
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {getStatsCount("moderator")}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-400/10 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-[var(--bg-card)] border-[var(--border)]">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-sub)] h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[var(--bg-main)] border-[var(--border)] focus:border-[var(--cinehub-accent)] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--text-sub)]" />
                <Select
                  value={roleFilter}
                  onValueChange={(value) =>
                    setRoleFilter(value as UserRole | "all")
                  }
                >
                  <SelectTrigger className="w-[140px] bg-[var(--bg-main)] border-[var(--border)] cursor-pointer hover:border-[var(--cinehub-accent)] transition-colors">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-card)] border-[var(--border)]">
                    <SelectItem value="all" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                      All Roles
                    </SelectItem>
                    <SelectItem value="admin" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                      Admin
                    </SelectItem>
                    <SelectItem value="moderator" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                      Moderator
                    </SelectItem>
                    <SelectItem value="user" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                      User
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-[var(--bg-main)] border-[var(--border)] cursor-pointer hover:border-[var(--cinehub-accent)] transition-colors">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-card)] border-[var(--border)]">
                  <SelectItem value="all" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                    All Status
                  </SelectItem>
                  <SelectItem value="active" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card className="bg-[var(--bg-card)] border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--cinehub-accent)]/5 border-[var(--border)] hover:bg-[var(--cinehub-accent)]/5">
                <TableHead className="text-[var(--text-main)] font-semibold">
                  User
                </TableHead>
                <TableHead className="text-[var(--text-main)] font-semibold hidden sm:table-cell">
                  Email
                </TableHead>
                <TableHead className="text-[var(--text-main)] font-semibold">
                  Role
                </TableHead>
                <TableHead className="text-[var(--text-main)] font-semibold hidden md:table-cell">
                  Change Role
                </TableHead>
                <TableHead className="text-[var(--text-main)] font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-[var(--text-main)] font-semibold w-[50px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-[var(--cinehub-accent)]/5 transition-colors border-[var(--border)] cursor-pointer"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border-2 border-[var(--border)] cursor-pointer hover:border-[var(--cinehub-accent)] transition-colors">
                        <AvatarImage
                          src={user.avatar}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-[var(--cinehub-accent)]/10 text-[var(--cinehub-accent)] font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[var(--text-main)]">
                          {user.name}
                        </p>
                        <p className="text-sm text-[var(--text-sub)] sm:hidden">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--text-sub)] hidden sm:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="flex items-center space-x-1 w-fit cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {getRoleIcon(user.role)}
                      <span>{formatRoleDisplay(user.role)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={loading[`role-${user.id}`]}
                    >
                      <SelectTrigger className="w-[130px] h-9 text-sm bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-main)] cursor-pointer hover:border-[var(--cinehub-accent)] transition-colors">
                        {loading[`role-${user.id}`] ? (
                          <div className="flex items-center">
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)]">
                        <SelectItem value="admin" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                          Admin
                        </SelectItem>
                        <SelectItem value="moderator" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                          Moderator
                        </SelectItem>
                        <SelectItem value="user" className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10">
                          User
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer hover:opacity-80 transition-opacity",
                        user.isActive
                          ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 hover:bg-[var(--success)]/20"
                          : "bg-[var(--text-sub)]/10 text-[var(--text-sub)] border-[var(--text-sub)]/20 hover:bg-[var(--text-sub)]/20"
                      )}
                      onClick={() => handleStatusChange(user.id, !user.isActive)}
                    >
                      {loading[`status-${user.id}`] ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          <span>...</span>
                        </div>
                      ) : user.isActive ? (
                        "Active"
                      ) : (
                        "Inactive"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer hover:bg-[var(--cinehub-accent)]/10 hover:text-[var(--cinehub-accent)] transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[var(--bg-card)] border-[var(--border)]"
                      >
                        <DropdownMenuItem className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10 text-[var(--text-main)]">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10 text-[var(--text-main)] md:hidden">
                          <Settings className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="bg-[var(--bg-card)] border-[var(--border)]">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--cinehub-accent)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="h-8 w-8 text-[var(--text-sub)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
              No users found
            </h3>
            <p className="text-[var(--text-sub)] mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="cursor-pointer hover:bg-[var(--cinehub-accent)]/10 hover:text-[var(--cinehub-accent)] transition-colors"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}