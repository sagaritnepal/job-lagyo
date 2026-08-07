"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useMobileNav } from "./MobileNavContext";

export function DashboardTopBar() {
  const { setOpen } = useMobileNav();

  return (
    <div className="flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            type="text"
            placeholder="Search applicants, jobs, candidates..."
            className="w-full min-w-0 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-700 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-600" /> Nepal Portal Live
        </span>
      </div>
    </div>
  );
}
