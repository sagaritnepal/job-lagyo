import Link from "next/link";
import { Briefcase, MapPin, Wallet } from "lucide-react";
import type { Job } from "@/lib/types";
import { CompanyBadge } from "@/components/CompanyBadge";
import { SaveJobButton } from "@/components/SaveJobButton";
import { formatSalary } from "@/lib/format";

const JOB_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

export function JobListItem({
  job,
  isSaved = false,
  isLoggedIn = false,
}: {
  job: Job;
  isSaved?: boolean;
  isLoggedIn?: boolean;
}) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={`group block rounded-xl border bg-white p-4 transition hover:shadow-md sm:p-5 ${
        job.featured
          ? "border-2 border-primary-400"
          : "border-neutral-200 hover:border-primary-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CompanyBadge name={job.company?.name ?? job.title} />
          <div>
            <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700">
              {job.title}
            </h3>
            <p className="text-sm text-neutral-500">
              {job.company?.name ?? "Confidential Company"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {job.featured && (
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
              FEATURED
            </span>
          )}
          <SaveJobButton jobId={job.id} initialSaved={isSaved} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-neutral-400" /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5 text-neutral-400" /> {formatSalary(job)}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
          {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
        </span>
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
