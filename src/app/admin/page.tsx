import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard | CineHub",
  description: "Admin dashboard for managing users and system",
};

export default function AdminPage() {
  redirect("/admin/dashboard");
}
