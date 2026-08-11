"use client";

import { useState } from "react";
import { Check, Flag, RotateCcw, X } from "lucide-react";
import { approveJobAction, flagJobAction, rejectJobAction, unflagJobAction } from "./actions";

export function JobModerationActions({
  jobId,
  status,
}: {
  jobId: string;
  status: string;
}) {
  const [mode, setMode] = useState<"idle" | "reject" | "flag">("idle");

  if (mode === "reject" || mode === "flag") {
    const action = mode === "reject" ? rejectJobAction : flagJobAction;
    const label = mode === "reject" ? "Reject" : "Flag as fraud";
    return (
      <form
        action={action}
        className="flex flex-col gap-2"
        onSubmit={() => setMode("idle")}
      >
        <input type="hidden" name="job_id" value={jobId} />
        <textarea
          name="reason"
          required
          rows={2}
          placeholder={mode === "reject" ? "Reason for rejection..." : "Why does this look fraudulent?"}
          className="w-56 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 outline-none focus:border-primary-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            {label}
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(status === "pending" || status === "rejected" || status === "flagged") && (
        <form action={approveJobAction}>
          <input type="hidden" name="job_id" value={jobId} />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </button>
        </form>
      )}

      {status === "pending" && (
        <button
          type="button"
          onClick={() => setMode("reject")}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          <X className="h-3.5 w-3.5" /> Reject
        </button>
      )}

      {status === "published" && (
        <button
          type="button"
          onClick={() => setMode("flag")}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          <Flag className="h-3.5 w-3.5" /> Flag as fraud
        </button>
      )}

      {status === "flagged" && (
        <form action={unflagJobAction}>
          <input type="hidden" name="job_id" value={jobId} />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restore
          </button>
        </form>
      )}
    </div>
  );
}
