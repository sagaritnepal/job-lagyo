"use client";

import { useActionState } from "react";
import { createCompanyAction, updateCompanyDetailsAction, type CompanyActionState } from "./actions";
import { NEPAL_LOCATIONS } from "@/lib/constants";
import type { Company } from "@/lib/types";

const initialState: CompanyActionState = {};
const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
const labelClass = "text-sm font-medium text-neutral-700";

export function CompanyDetailsForm({ company }: { company: Company | null }) {
  const action = company ? updateCompanyDetailsAction : createCompanyAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass}>Company name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={company?.name}
          className={inputClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Location</label>
          <select name="location" defaultValue={company?.location ?? "Kathmandu"} className={inputClass}>
            {NEPAL_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Website (optional)</label>
          <input
            type="url"
            name="website"
            placeholder="https://"
            defaultValue={company?.website ?? ""}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Description (optional)</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={company?.description ?? ""}
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : company ? "Save changes" : "Create company profile"}
      </button>
    </form>
  );
}
