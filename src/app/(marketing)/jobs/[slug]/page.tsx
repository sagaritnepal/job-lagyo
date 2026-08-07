import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, Clock, MapPin, Wallet } from "lucide-react";
import { getJobBySlug } from "@/lib/data/jobs";
import { daysLeft, formatSalary, timeAgo } from "@/lib/format";
import { getAuthUser } from "@/lib/supabase/auth";
import { CompanyBadge } from "@/components/CompanyBadge";
import { ApplyForm } from "./ApplyForm";

const JOB_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

export default async function JobDetailPage({
  params,
}: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const [job, user] = await Promise.all([getJobBySlug(slug), getAuthUser()]);

  if (!job) notFound();

  const remaining = job.deadline ? daysLeft(job.deadline) : null;
  const requirementLines =
    job.requirements?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/jobs" className="text-sm text-primary-700 hover:underline">
        ← Back to all jobs
      </Link>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CompanyBadge name={job.company?.name ?? job.title} size="md" />
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{job.title}</h1>
            <p className="mt-1 text-sm font-medium text-primary-700">
              {job.company?.name ?? "Confidential Company"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <Wallet className="h-3.5 w-3.5" /> Salary
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">{formatSalary(job)}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <Briefcase className="h-3.5 w-3.5" /> Job Type
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <MapPin className="h-3.5 w-3.5" /> Location
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">{job.location}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
              <Clock className="h-3.5 w-3.5" /> Deadline
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                remaining !== null && remaining <= 3 ? "text-accent-600" : "text-neutral-900"
              }`}
            >
              {remaining === null
                ? "Open"
                : remaining > 0
                  ? `${remaining} Days Left`
                  : "Closed"}
            </p>
          </div>
        </div>

        {job.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
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

        <p className="mt-4 text-xs text-neutral-400">Posted {timeAgo(job.created_at)}</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-neutral-700">
          <div>
            <h2 className="font-semibold text-neutral-900">Job Description</h2>
            <p className="mt-2 whitespace-pre-line">{job.description}</p>
          </div>
          {requirementLines.length > 0 && (
            <div>
              <h2 className="font-semibold text-neutral-900">Requirements</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {requirementLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6">
          {user ? (
            <ApplyForm jobId={job.id} jobSlug={job.slug} />
          ) : (
            <p className="text-sm text-neutral-600">
              <Link href="/login" className="font-semibold text-primary-700">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="font-semibold text-primary-700">
                create an account
              </Link>{" "}
              to apply for this job.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
