import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserFromUid } from "@/lib/firebase-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user = await getUserFromUid(decodedToken.uid);

    if (!user) {
      redirect("/login");
    }

    if (user.role !== "admin") {
      redirect("/home");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 py-16 sm:px-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
