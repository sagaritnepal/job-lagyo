"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addEducationAction, deleteEducationAction } from "./actions";
import { DEGREE_LEVELS, COMMON_FIELDS_OF_STUDY } from "@/lib/constants";
import type { CandidateEducation } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
const labelClass = "text-sm font-medium text-neutral-700";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 65 }, (_, i) => CURRENT_YEAR + 2 - i);

function YearSelect({
  name,
  defaultValue,
  disabled,
}: {
  name: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} disabled={disabled} className={inputClass}>
      <option value="">Select year</option>
      {YEARS.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}

function AddEducationForm({ onDone }: { onDone: () => void }) {
  const [degree, setDegree] = useState<string | null>(null);
  const [ongoing, setOngoing] = useState(false);

  return (
    <form
      action={addEducationAction}
      onSubmit={() => onDone()}
      className="space-y-4 rounded-lg border border-neutral-200 p-3"
    >
      <div>
        <label className={labelClass}>Institution</label>
        <input type="text" name="institution" required className={inputClass} placeholder="e.g. Tribhuvan University" />
      </div>

      <div>
        <p className={labelClass}>Degree / level</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {DEGREE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDegree(level)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                degree === level
                  ? "border-primary-600 bg-primary-50 text-primary-800"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <input type="hidden" name="degree" value={degree ?? ""} />
      </div>

      <div>
        <label className={labelClass}>Field of study</label>
        <input
          type="text"
          name="field_of_study"
          list="field-of-study-options"
          className={inputClass}
          placeholder="Start typing or pick a suggestion"
        />
        <datalist id="field-of-study-options">
          {COMMON_FIELDS_OF_STUDY.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Start year</label>
          <YearSelect name="start_year" />
        </div>
        <div>
          <label className={labelClass}>End year</label>
          <YearSelect name="end_year" disabled={ongoing} />
          <label className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
            <input
              type="checkbox"
              checked={ongoing}
              onChange={(e) => setOngoing(e.target.checked)}
              className="accent-primary-600"
            />
            I&apos;m currently studying here
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!degree}
          className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
        >
          Cancel
        </button>
        {!degree && <p className="text-xs text-neutral-400">Pick a degree level above</p>}
      </div>
    </form>
  );
}

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
        <AddEducationForm onDone={() => setAdding(false)} />
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
