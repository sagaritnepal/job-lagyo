"use client";

import { useActionState, useState } from "react";
import { FileText } from "lucide-react";
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
  const [resumeName, setResumeName] = useState<string | null>(null);

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
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-500 hover:border-primary-400 hover:bg-primary-50/50">
        <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
        <span className="flex-1 truncate">
          {resumeName ?? (
            <>
              <span className="font-medium text-neutral-700">Attach résumé</span>{" "}
              — PDF or Word, up to 5MB (optional)
            </>
          )}
        </span>
        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => setResumeName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
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
