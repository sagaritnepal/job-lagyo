"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShieldCheck, Building2, X } from "lucide-react";
import { useMobileNav } from "./MobileNavContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/jobs", label: "Job Approvals", icon: ShieldCheck },
  { href: "/admin/vendors", label: "Vendors", icon: Building2 },
];

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav();

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col bg-neutral-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 px-5 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              JL
            </span>
            <div>
              <p className="text-sm font-bold text-white">Job Lagyo</p>
              <p className="text-[10px] font-semibold tracking-wide text-primary-500">
                ADMIN CONSOLE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-neutral-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-neutral-800 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white">
            {name.charAt(0).toUpperCase() || "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate text-xs text-neutral-400">{email}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
