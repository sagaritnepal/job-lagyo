"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { approveVerificationAction, rejectVerificationAction } from "./actions";

export function VerificationActions({ companyId }: { companyId: string }) {
  const [rejecting, setRejecting] = useState(false);

  if (rejecting) {
    return (
      <form
        action={rejectVerificationAction}
        className="flex flex-col gap-2"
        onSubmit={() => setRejecting(false)}
      >
        <input type="hidden" name="company_id" value={companyId} />
        <textarea
          name="reason"
          required
          rows={2}
          placeholder="Why is this verification being rejected?"
          className="w-64 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 outline-none focus:border-red-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Confirm reject
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <form action={approveVerificationAction}>
        <input type="hidden" name="company_id" value={companyId} />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </button>
      </form>
      <button
        type="button"
        onClick={() => setRejecting(true)}
        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
      >
        <X className="h-3.5 w-3.5" /> Reject
      </button>
    </div>
  );
}
