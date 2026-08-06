import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { getPublishedJobs } from "@/lib/data/jobs";
import { JOB_CATEGORIES, JOB_TYPES, NEPAL_LOCATIONS } from "@/lib/constants";

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Browse Jobs</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {jobs.length} job{jobs.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-6">
        <SearchBar defaultQuery={q} defaultLocation={location} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
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
              {JOB_CATEGORIES.map((c) => (
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

        <div>
          {jobs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
              No jobs match your filters right now. Try broadening your
              search.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
