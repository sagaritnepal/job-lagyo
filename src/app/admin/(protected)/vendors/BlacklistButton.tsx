"use client";

import { useState } from "react";
import { Ban, RotateCcw } from "lucide-react";
import { blacklistVendorAction, unblacklistVendorAction } from "./actions";

export function BlacklistButton({
  companyId,
  isBlacklisted,
}: {
  companyId: string;
  isBlacklisted: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (isBlacklisted) {
    return (
      <form action={unblacklistVendorAction}>
        <input type="hidden" name="company_id" value={companyId} />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Remove blacklist
        </button>
      </form>
    );
  }

  if (confirming) {
    return (
      <form
        action={blacklistVendorAction}
        className="flex flex-col gap-2"
        onSubmit={() => setConfirming(false)}
      >
        <input type="hidden" name="company_id" value={companyId} />
        <textarea
          name="reason"
          required
          rows={2}
          placeholder="Why is this vendor being blacklisted? (e.g. not responding to applicants)"
          className="w-64 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 outline-none focus:border-red-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Confirm blacklist
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
    >
      <Ban className="h-3.5 w-3.5" /> Blacklist
    </button>
  );
}
