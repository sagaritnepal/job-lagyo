import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Briefcase className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-primary-700">
            Job Lagyo
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/jobs" className="text-sm font-medium text-neutral-600 hover:text-primary-700">
            Find Jobs
          </Link>
          <Link href="/companies" className="text-sm font-medium text-neutral-600 hover:text-primary-700">
            Companies
          </Link>
          <Link href="/coming-soon" className="text-sm font-medium text-neutral-600 hover:text-primary-700">
            Services
          </Link>
          <Link href="/coming-soon" className="text-sm font-medium text-neutral-600 hover:text-primary-700">
            Salaries
          </Link>
          <Link href="/coming-soon" className="text-sm font-medium text-neutral-600 hover:text-primary-700">
            Blogs
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {role === "employer" && (
                <Link
                  href="/dashboard"
                  className="hidden text-sm font-medium text-neutral-600 hover:text-primary-700 sm:inline"
                >
                  Dashboard
                </Link>
              )}
              <LogoutButton />
              <Link
                href="/post-job"
                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-700"
              >
                Post a Job
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-primary-700">
                Sign In
              </Link>
              <Link
                href="/post-job"
                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-700"
              >
                Post a Job
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
