"use client";

import { useActionState } from "react";
import { applyToJobAction, type ApplyState } from "./actions";

const initialState: ApplyState = { status: "idle" };

export function ApplyForm({
  jobId,
  jobSlug,
}: {
  jobId: string;
  jobSlug: string;
}) {
  const applyWithJob = applyToJobAction.bind(null, jobId, jobSlug);
  const [state, formAction, pending] = useActionState(
    applyWithJob,
    initialState,
  );

  if (state.status === "success") {
    return (
      <p className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="cover_letter"
        rows={4}
        placeholder="Cover letter (optional)"
        className="w-full rounded-lg border border-neutral-200 p-3 text-sm text-neutral-900 outline-none focus:border-primary-500"
      />
      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Apply For Job"}
      </button>
    </form>
  );
}
