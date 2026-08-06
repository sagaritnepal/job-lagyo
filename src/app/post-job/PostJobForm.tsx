"use client";

import { useActionState } from "react";
import { postJobAction, type PostJobState } from "./actions";
import { JOB_CATEGORIES, JOB_TYPES, NEPAL_LOCATIONS } from "@/lib/constants";

const initialState: PostJobState = {};

export function PostJobForm({ hasCompany }: { hasCompany: boolean }) {
  const [state, formAction, pending] = useActionState(
    postJobAction,
    initialState,
  );

  const inputClass =
    "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
  const labelClass = "text-sm font-medium text-neutral-700";

  return (
    <form action={formAction} className="mt-6 space-y-8">
      {!hasCompany && (
        <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-semibold text-neutral-800">
            Company details (first job posting only)
          </legend>
          <div>
            <label className={labelClass}>Company name</label>
            <input type="text" name="company_name" required className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Location</label>
              <select name="company_location" defaultValue="Kathmandu" className={inputClass}>
                {NEPAL_LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Website (optional)</label>
              <input type="url" name="company_website" placeholder="https://" className={inputClass} />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-semibold text-neutral-800">
          Job details
        </legend>
        <div>
          <label className={labelClass}>Job title</label>
          <input type="text" name="title" required className={inputClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select category
              </option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Job type</label>
            <select name="job_type" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select job type
              </option>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Location</label>
            <select name="location" required defaultValue="Kathmandu" className={inputClass}>
              {NEPAL_LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Application deadline</label>
            <input type="date" name="deadline" className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Minimum salary (Rs/month)</label>
            <input type="number" name="salary_min" min={0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Maximum salary (Rs/month)</label>
            <input type="number" name="salary_max" min={0} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Job description</label>
          <textarea name="description" rows={5} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Requirements (optional)</label>
          <textarea name="requirements" rows={4} className={inputClass} />
        </div>
      </fieldset>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent-600 py-3 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? "Posting..." : "Post Job"}
      </button>
    </form>
  );
}
