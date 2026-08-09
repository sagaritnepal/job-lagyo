"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addEducationAction, deleteEducationAction } from "./actions";
import type { CandidateEducation } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
const labelClass = "text-sm font-medium text-neutral-700";

export function EducationSection({ education }: { education: CandidateEducation[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-3">
      {education.length > 0 && (
        <ul className="space-y-2">
          {education.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {e.degree}
                  {e.field_of_study ? ` — ${e.field_of_study}` : ""}
                </p>
                <p className="text-sm text-neutral-600">{e.institution}</p>
                <p className="text-xs text-neutral-400">
                  {e.start_year ?? "—"} to {e.end_year ?? "Present"}
                </p>
              </div>
              <form action={deleteEducationAction}>
                <input type="hidden" name="id" value={e.id} />
                <button
                  type="submit"
                  className="text-neutral-400 hover:text-red-600"
                  aria-label="Delete education entry"
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
          action={addEducationAction}
          onSubmit={() => setAdding(false)}
          className="space-y-3 rounded-lg border border-neutral-200 p-3"
        >
          <div>
            <label className={labelClass}>Institution</label>
            <input type="text" name="institution" required className={inputClass} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Degree</label>
              <input type="text" name="degree" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Field of study</label>
              <input type="text" name="field_of_study" className={inputClass} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Start year</label>
              <input type="number" name="start_year" min={1950} max={2100} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End year (blank if ongoing)</label>
              <input type="number" name="end_year" min={1950} max={2100} className={inputClass} />
            </div>
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
          <Plus className="h-4 w-4" /> Add education
        </button>
      )}
    </div>
  );
}
