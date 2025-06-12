import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UserManagement } from "@/components/admin/UserManagement";

async function getUsers() {
  const [rows] = await db.query(`
    SELECT 
      id,
      name,
      email,
      role,
      is_active,
      avatar,
      created_at,
      last_login_at 
    FROM users 
    ORDER BY created_at DESC
  `);
  return rows;
}

export default async function UserManagementPage() {
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  const users = await getUsers();

  // Transform data to match client component interface
  const formattedUsers = (users as any[]).map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    avatar: user.avatar,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
  }));

  return (
    <div className="p-6">
      <UserManagement initialUsers={formattedUsers as any[]} />
    </div>
  );
}
