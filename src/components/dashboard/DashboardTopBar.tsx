"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useMobileNav } from "./MobileNavContext";

export function DashboardTopBar() {
  const { setOpen } = useMobileNav();

  return (
    <div className="sticky top-0 z-30 flex h-13 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-3 sm:px-5">
      <div className="flex flex-1 items-center gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-neutral-200 px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <input
            type="text"
            placeholder="Search applicants, jobs, candidates..."
            className="w-full min-w-0 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-600" /> Nepal Portal Live
        </span>
      </div>
    </div>
  );
}
