"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toggleSaveJobAction } from "@/lib/actions/savedJobs";

export function SaveJobButton({
  jobId,
  initialSaved,
  isLoggedIn,
  className = "",
}: {
  jobId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const result = await toggleSaveJobAction(jobId, next);
      if (!result.ok) setSaved(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition disabled:opacity-60 ${
        saved
          ? "border-primary-300 bg-primary-50 text-primary-700"
          : "border-neutral-200 text-neutral-400 hover:border-primary-300 hover:text-primary-600"
      } ${className}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
