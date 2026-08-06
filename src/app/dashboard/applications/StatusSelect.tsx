"use client";

import { useRef } from "react";
import { updateApplicationStatusAction } from "./actions";
import { APPLICATION_STATUSES } from "@/lib/constants";

export function StatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateApplicationStatusAction}>
      <input type="hidden" name="application_id" value={applicationId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs font-medium text-neutral-700 outline-none focus:border-primary-500"
      >
        {APPLICATION_STATUSES.filter((s) => s.value !== "reviewed").map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </form>
  );
}
