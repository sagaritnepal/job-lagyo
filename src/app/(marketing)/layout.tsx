import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileTabBar } from "@/components/MobileTabBar";
import { SwipeNavigation } from "@/components/SwipeNavigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  let role: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  // The bottom tab bar and swipe gestures are candidate-only — Home / Jobs /
  // Saved / Applied / Profile don't apply to employers or admins, who have
  // their own dashboard navigation instead.
  const showCandidateTabs = role !== "employer" && role !== "admin";

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className={`flex-1 ${showCandidateTabs ? "pb-16 md:pb-0" : ""}`}>{children}</main>
      <Footer />
      {showCandidateTabs && (
        <>
          <MobileTabBar />
          <SwipeNavigation />
        </>
      )}
    </div>
  );
}
