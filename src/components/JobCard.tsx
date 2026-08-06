import Link from "next/link";
import type { Job } from "@/lib/types";
import { formatSalary, timeAgo } from "@/lib/format";

const JOB_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700">
            {job.title}
          </h3>
          <p className="mt-0.5 text-sm text-neutral-500">
            {job.company?.name ?? "Confidential Company"} · {job.location}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">
          {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
        <span className="rounded-md bg-primary-50 px-2 py-0.5 text-primary-700">
          {job.category}
        </span>
        <span>{formatSalary(job)}</span>
      </div>

      <p className="mt-3 text-xs text-neutral-400">{timeAgo(job.created_at)}</p>
    </Link>
  );
}
