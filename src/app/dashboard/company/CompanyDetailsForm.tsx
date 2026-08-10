"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useActionState } from "react";
import { createCompanyAction, updateCompanyDetailsAction, type CompanyActionState } from "./actions";
import { NEPAL_LOCATIONS } from "@/lib/constants";
import { CompanyBadge } from "@/components/CompanyBadge";
import type { Company } from "@/lib/types";

const initialState: CompanyActionState = {};
const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
const labelClass = "text-sm font-medium text-neutral-700";

export function CompanyDetailsForm({ company }: { company: Company | null }) {
  const action = company ? updateCompanyDetailsAction : createCompanyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(company?.name ?? "");
  const [location, setLocation] = useState(company?.location ?? "Kathmandu");

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex items-center gap-3">
        <CompanyBadge name={name.trim() || "Your Company"} />
        <div className="flex-1">
          <label className={labelClass}>Company name</label>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Location</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {NEPAL_LOCATIONS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocation(l)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                location === l
                  ? "border-primary-600 bg-primary-50 text-primary-800"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <MapPin className="h-3 w-3" /> {l}
            </button>
          ))}
        </div>
        <input type="hidden" name="location" value={location} />
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
      <div>
        <label className={labelClass}>Description (optional)</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={company?.description ?? ""}
          className={inputClass}
          placeholder="What does your company do? What's it like to work there?"
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
