import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { JobListItem } from "@/components/JobListItem";
import { SearchBar } from "@/components/SearchBar";
import { getPublishedJobs } from "@/lib/data/jobs";
import { JOB_CATEGORY_NAMES, JOB_TYPES, NEPAL_LOCATIONS } from "@/lib/constants";

export const metadata = {
  title: "Browse Jobs — Job Lagyo",
};

export default async function JobsPage({
  searchParams,
}: PageProps<"/jobs">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const location = typeof params.location === "string" ? params.location : "";
  const jobType = typeof params.jobType === "string" ? params.jobType : "";

  const jobs = await getPublishedJobs({ q, category, location, jobType });

  function filterHref(next: Partial<Record<"category" | "location" | "jobType", string>>) {
    const merged = { q, category, location, jobType, ...next };
    const search = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    return `/jobs${search.toString() ? `?${search.toString()}` : ""}`;
  }

  const activeFilters = [
    category && { key: "category" as const, label: category },
    jobType && { key: "jobType" as const, label: JOB_TYPES.find((t) => t.value === jobType)?.label ?? jobType },
    location && { key: "location" as const, label: location },
  ].filter(Boolean) as { key: "category" | "jobType" | "location"; label: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Browse Jobs</h1>

      <div className="mt-6">
        <SearchBar defaultQuery={q} defaultLocation={location} defaultCategory={category} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm text-neutral-500">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Found {jobs.length} job
          {jobs.length === 1 ? "" : "s"}
        </span>
        {activeFilters.map((f) => (
          <Link
            key={f.key}
            href={filterHref({ [f.key]: "" })}
            className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white"
          >
            {f.label} <X className="h-3 w-3" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="order-2 space-y-6 lg:order-1">
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">
              Category
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <Link
                  href={filterHref({ category: "" })}
                  className={
                    !category
                      ? "font-semibold text-primary-700"
                      : "text-neutral-600 hover:text-primary-700"
                  }
                >
                  All categories
                </Link>
              </li>
              {JOB_CATEGORY_NAMES.map((c) => (
                <li key={c}>
                  <Link
                    href={filterHref({ category: c })}
                    className={
                      category === c
                        ? "font-semibold text-primary-700"
                        : "text-neutral-600 hover:text-primary-700"
                    }
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-800">
              Job type
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <Link
                  href={filterHref({ jobType: "" })}
                  className={
                    !jobType
                      ? "font-semibold text-primary-700"
                      : "text-neutral-600 hover:text-primary-700"
                  }
                >
                  All types
                </Link>
              </li>
              {JOB_TYPES.map((t) => (
                <li key={t.value}>
                  <Link
                    href={filterHref({ jobType: t.value })}
                    className={
                      jobType === t.value
                        ? "font-semibold text-primary-700"
                        : "text-neutral-600 hover:text-primary-700"
                    }
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-800">
              Location
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <Link
                  href={filterHref({ location: "" })}
                  className={
                    !location
                      ? "font-semibold text-primary-700"
                      : "text-neutral-600 hover:text-primary-700"
                  }
                >
                  All locations
                </Link>
              </li>
              {NEPAL_LOCATIONS.map((l) => (
                <li key={l}>
                  <Link
                    href={filterHref({ location: l })}
                    className={
                      location === l
                        ? "font-semibold text-primary-700"
                        : "text-neutral-600 hover:text-primary-700"
                    }
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="order-1 lg:order-2">
          {jobs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
              No jobs match your filters right now. Try broadening your
              search.
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobListItem key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
