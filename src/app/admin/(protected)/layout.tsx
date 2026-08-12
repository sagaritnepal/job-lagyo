import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { MobileNavProvider } from "@/components/dashboard/MobileNavContext";
import { SwipeSidebar } from "@/components/dashboard/SwipeSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) redirect("/admin/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  const unreadCount = await getUnreadNotificationCount(user.id);

  return (
    <MobileNavProvider>
      <div className="flex min-h-full bg-neutral-50">
        <AdminSidebar name={profile.full_name ?? "Admin"} email={user.email ?? ""} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar unreadCount={unreadCount} />
          <main className="flex-1 p-3 sm:p-4">{children}</main>
        </div>
      </div>
      <SwipeSidebar />
    </MobileNavProvider>
  );
}
