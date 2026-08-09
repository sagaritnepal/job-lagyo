import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { MobileNavProvider } from "@/components/dashboard/MobileNavContext";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "employer") redirect("/");

  return (
    <MobileNavProvider>
      <div className="flex min-h-full bg-neutral-50">
        <DashboardSidebar name={profile.full_name ?? "Employer"} email={user.email ?? ""} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
