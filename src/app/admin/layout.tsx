import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-full bg-neutral-50">
      <AdminSidebar name={profile.full_name ?? "Admin"} email={user.email ?? ""} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
