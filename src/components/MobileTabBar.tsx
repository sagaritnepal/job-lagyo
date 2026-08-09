"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Bookmark, FileText, User } from "lucide-react";
import type { ComponentType } from "react";

const TABS: { href: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/saved-jobs", label: "Saved", icon: Bookmark },
  { href: "/my-applications", label: "Applied", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                active ? "text-primary-700" : "text-neutral-500"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary-700" : "text-neutral-500"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
