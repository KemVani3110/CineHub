import { Metadata } from "next";
import AdminDashboard  from "@/app/admin/dashboard/page";

export const metadata: Metadata = {
  title: "Admin Dashboard | CineHub",
  description: "Admin dashboard for managing users and system",
};

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ activityPage?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <AdminDashboard searchParams={searchParams} />
    </div>
  );
}
