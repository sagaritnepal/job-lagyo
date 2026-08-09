import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { JobListItem } from "@/components/JobListItem";
import { SearchBar } from "@/components/SearchBar";
import { getPublishedJobs, type JobSort } from "@/lib/data/jobs";
import { getSavedJobIds } from "@/lib/data/savedJobs";
import { getAuthUser } from "@/lib/supabase/auth";
import { JOB_CATEGORY_NAMES, JOB_TYPES, NEPAL_LOCATIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description:
    "Search thousands of verified job vacancies across Kathmandu, Pokhara, and all of Nepal. Filter by category, location, and job type on Job Lagyo.",
  alternates: { canonical: "/jobs" },
};

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "salary", label: "Highest Salary" },
];

const PAGE_SIZE = 10;

export default async function JobsPage({
  searchParams,
}: PageProps<"/jobs">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const location = typeof params.location === "string" ? params.location : "";
  const jobType = typeof params.jobType === "string" ? params.jobType : "";
  const sort: JobSort = params.sort === "salary" ? "salary" : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ jobs, total }, user] = await Promise.all([
    getPublishedJobs({ q, category, location, jobType, sort, page, pageSize: PAGE_SIZE }),
    getAuthUser(),
  ]);
  const savedJobIds = user ? await getSavedJobIds(user.id) : new Set<string>();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function filterHref(
    next: Partial<Record<"category" | "location" | "jobType" | "sort" | "page", string>>,
  ) {
    const merged = { q, category, location, jobType, sort, page: "1", ...next };
    const search = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (!value) return;
      if (key === "sort" && value === "newest") return;
      if (key === "page" && value === "1") return;
      search.set(key, value);
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-neutral-500">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Found {total} job
            {total === 1 ? "" : "s"}
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

        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 text-xs">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={filterHref({ sort: opt.value })}
              className={`rounded-md px-2.5 py-1.5 font-medium ${
                sort === opt.value
                  ? "bg-primary-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
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
            <>
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.has(job.id)}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  {page > 1 ? (
                    <Link
                      href={filterHref({ page: String(page - 1) })}
                      className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm text-neutral-500">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      href={filterHref({ page: String(page + 1) })}
                      className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
