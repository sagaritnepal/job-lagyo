"use client";

import { useRouter } from "next/navigation";
import { NEPAL_LOCATIONS } from "@/lib/constants";

export function SearchBar({
  defaultQuery = "",
  defaultLocation = "",
}: {
  defaultQuery?: string;
  defaultLocation?: string;
}) {
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const params = new URLSearchParams();
    const q = formData.get("q")?.toString().trim();
    const location = formData.get("location")?.toString().trim();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      action={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-xl bg-white p-3 shadow-lg sm:flex-row sm:items-center"
    >
      <input
        type="text"
        name="q"
        defaultValue={defaultQuery}
        placeholder="Job title, e.g. Accountant, Frontend Developer"
        className="flex-1 rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary-500"
      />
      <select
        name="location"
        defaultValue={defaultLocation}
        className="rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary-500 sm:w-48"
      >
        <option value="">All locations</option>
        {NEPAL_LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white hover:bg-accent-700"
      >
        Search Jobs
      </button>
    </form>
  );
}
