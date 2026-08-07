"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/coming-soon", label: "Services" },
  { href: "/coming-soon", label: "Salaries" },
  { href: "/coming-soon", label: "Blogs" },
];

export function NavLinks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-7 md:flex">
        {LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="text-sm font-medium text-neutral-600 hover:text-primary-700"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 md:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-neutral-200 bg-white px-4 py-2 shadow-sm md:hidden">
          <nav className="flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
