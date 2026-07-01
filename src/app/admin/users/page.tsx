"use client";

import { UserManagement } from "@/components/admin/UserManagement";
import { useAuth } from "@/hooks/useAuth";

export default function UserManagementPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <UserManagement currentUserId={user?.id?.toString()} />
    </div>
  );
}
