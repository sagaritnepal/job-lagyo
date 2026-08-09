"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { JOB_CATEGORY_NAMES, NEPAL_LOCATIONS } from "@/lib/constants";

export function SearchBar({
  defaultQuery = "",
  defaultLocation = "",
  defaultCategory = "",
}: {
  defaultQuery?: string;
  defaultLocation?: string;
  defaultCategory?: string;
}) {
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const params = new URLSearchParams();
    const q = formData.get("q")?.toString().trim();
    const location = formData.get("location")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      action={handleSubmit}
      className="flex w-full flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-200 px-3 focus-within:border-primary-500">
        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
        <input
          type="text"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Job title, keywords or skills"
          className="w-full py-2 text-sm text-neutral-900 outline-none"
        />
      </div>
      <select
        name="location"
        defaultValue={defaultLocation}
        className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 sm:w-44"
      >
        <option value="">All Locations</option>
        {NEPAL_LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <select
        name="category"
        defaultValue={defaultCategory}
        className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 sm:w-44"
      >
        <option value="">All Categories</option>
        {JOB_CATEGORY_NAMES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-accent-600 px-6 py-2 text-sm font-semibold text-white hover:bg-accent-700"
      >
        Search Jobs
      </button>
    </form>
  );
}
