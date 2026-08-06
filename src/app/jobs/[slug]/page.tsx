import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobBySlug } from "@/lib/data/jobs";
import { formatSalary, timeAgo } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ApplyForm } from "./ApplyForm";

export default async function JobDetailPage({
  params,
}: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/jobs" className="text-sm text-primary-700 hover:underline">
        ← Back to all jobs
      </Link>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {job.title}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {job.company?.name ?? "Confidential Company"} · {job.location}
            </p>
          </div>
          <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
            {job.job_type}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="rounded-md bg-primary-50 px-2.5 py-1 text-primary-700">
            {job.category}
          </span>
          <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-600">
            {formatSalary(job)}
          </span>
          <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-600">
            Posted {timeAgo(job.created_at)}
          </span>
          {job.deadline && (
            <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-600">
              Apply by {new Date(job.deadline).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-700">
          <div>
            <h2 className="font-semibold text-neutral-900">
              Job Description
            </h2>
            <p className="mt-2 whitespace-pre-line">{job.description}</p>
          </div>
          {job.requirements && (
            <div>
              <h2 className="font-semibold text-neutral-900">
                Requirements
              </h2>
              <p className="mt-2 whitespace-pre-line">{job.requirements}</p>
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
