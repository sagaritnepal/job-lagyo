import Link from "next/link";
import { getJobsForModeration } from "@/lib/data/admin";
import { jobStatusMeta } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import { CompanyBadge } from "@/components/CompanyBadge";
import { JobModerationActions } from "./JobModerationActions";

export const metadata = {
  title: "Job Approvals — Job Lagyo Admin",
};

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

export default async function AdminJobsPage({
  searchParams,
}: PageProps<"/admin/jobs">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "pending";

  const jobs = await getJobsForModeration(status || undefined);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        Job Approvals {jobs.length > 0 && `(${jobs.length})`}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Approve new listings, reject bad submissions, or flag suspected fraud.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/jobs${tab.value ? `?status=${tab.value}` : ""}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              status === tab.value
                ? "bg-primary-600 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          No jobs here.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((job) => {
            const meta = jobStatusMeta(job.status);
            const reason =
              job.status === "rejected"
                ? job.rejection_reason
                : job.status === "flagged"
                  ? job.flag_reason
                  : null;
            return (
              <div key={job.id} className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CompanyBadge name={job.company?.name ?? "Company"} />
                    <div>
                      <p className="font-semibold text-neutral-900">{job.title}</p>
                      <p className="text-sm text-neutral-500">
                        {job.company?.name} &middot; {job.location} &middot; {timeAgo(job.created_at)}
                      </p>
                      <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                        {meta.label}
                      </span>
                      {reason && <p className="mt-2 max-w-xl text-sm text-neutral-600">{reason}</p>}
                    </div>
                  </div>
                  <JobModerationActions jobId={job.id} status={job.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
