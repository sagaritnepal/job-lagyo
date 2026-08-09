"use client";

import { useActionState, useState } from "react";
import { updateCategoriesAction, type ProfileActionState } from "./actions";
import { JOB_CATEGORY_NAMES } from "@/lib/constants";

const initialState: ProfileActionState = {};

export function CategorySelector({
  initialCategories,
  initialBio,
}: {
  initialCategories: string[];
  initialBio: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateCategoriesAction, initialState);
  const [selected, setSelected] = useState<string[]>(initialCategories);

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-neutral-700">
          Field(s) of expertise
        </p>
        <p className="text-xs text-neutral-500">
          Jobs in these categories will be shown to you first.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {JOB_CATEGORY_NAMES.map((name) => (
            <label
              key={name}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                selected.includes(name)
                  ? "border-primary-600 bg-primary-50 text-primary-800"
                  : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
              }`}
            >
              <input
                type="checkbox"
                name="categories"
                value={name}
                checked={selected.includes(name)}
                onChange={() => toggle(name)}
                className="accent-primary-600"
              />
              {name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-neutral-700">
          Short bio (optional)
        </label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={initialBio ?? ""}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save field of expertise"}
      </button>
    </form>
  );
}
