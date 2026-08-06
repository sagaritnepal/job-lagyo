import Link from "next/link";
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
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-primary-700">
            Job<span className="text-accent-600">Lagyo</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/jobs"
            className="text-sm font-medium text-neutral-700 hover:text-primary-700"
          >
            Browse Jobs
          </Link>
          {role === "employer" && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-neutral-700 hover:text-primary-700"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/post-job"
            className="text-sm font-medium text-neutral-700 hover:text-primary-700"
          >
            Post a Job
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <LogoutButton />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-700 hover:text-primary-700"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
