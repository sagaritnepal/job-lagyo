"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addExperienceAction, deleteExperienceAction } from "./actions";
import type { CandidateExperience } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
const labelClass = "text-sm font-medium text-neutral-700";

function formatDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short" });
}

export function ExperienceSection({ experience }: { experience: CandidateExperience[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-3">
      {experience.length > 0 && (
        <ul className="space-y-2">
          {experience.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-900">{e.job_title}</p>
                <p className="text-sm text-neutral-600">{e.company_name}</p>
                <p className="text-xs text-neutral-400">
                  {formatDate(e.start_date)} to {formatDate(e.end_date)}
                </p>
                {e.description && (
                  <p className="mt-1 text-xs text-neutral-600">{e.description}</p>
                )}
              </div>
              <form action={deleteExperienceAction}>
                <input type="hidden" name="id" value={e.id} />
                <button
                  type="submit"
                  className="text-neutral-400 hover:text-red-600"
                  aria-label="Delete experience entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          action={addExperienceAction}
          onSubmit={() => setAdding(false)}
          className="space-y-3 rounded-lg border border-neutral-200 p-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Job title</label>
              <input type="text" name="job_title" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input type="text" name="company_name" required className={inputClass} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" name="start_date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End date (blank if current)</label>
              <input type="date" name="end_date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description (optional)</label>
            <textarea name="description" rows={3} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"
        >
          <Plus className="h-4 w-4" /> Add work experience
        </button>
      )}
    </div>
  );
}
