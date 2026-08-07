import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLinks } from "@/components/NavLinks";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/job-lagyo-logo.png"
            alt="Job Lagyo"
            width={1140}
            height={270}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <NavLinks />

        <Suspense fallback={<NavbarAuthFallback />}>
          <NavbarAuthSection />
        </Suspense>
      </div>
    </header>
  );
}

function NavbarAuthFallback() {
  return (
    <div className="flex items-center gap-4">
      <span className="h-8 w-24 animate-pulse rounded-lg bg-neutral-100" />
    </div>
  );
}

async function NavbarAuthSection() {
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

  return (
    <div className="flex items-center gap-2 sm:gap-4">
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
          {role === "admin" && (
            <Link
              href="/admin"
              className="hidden text-sm font-medium text-neutral-600 hover:text-primary-700 sm:inline"
            >
              Admin
            </Link>
          )}
          <LogoutButton />
          <Link
            href="/post-job"
            className="rounded-lg bg-accent-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-700 sm:px-4 sm:text-sm"
          >
            Post a Job
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-700 sm:px-4 sm:text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/post-job"
            className="rounded-lg bg-accent-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-700 sm:px-4 sm:text-sm"
          >
            Post a Job
          </Link>
        </>
      )}
    </div>
  );
}
