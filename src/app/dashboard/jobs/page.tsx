import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEmployerJobs } from "@/lib/data/dashboard";
import { timeAgo } from "@/lib/format";

export const metadata = {
  title: "Job Posts — Job Lagyo",
};

export default async function JobPostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const jobs = await getEmployerJobs(user.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Job Posts</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {jobs.length} job{jobs.length === 1 ? "" : "s"} posted
          </p>
        </div>
        <Link
          href="/post-job"
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" /> Post a Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          You haven&apos;t posted any jobs yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 font-medium">Applicants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    <Link href={`/jobs/${job.slug}`} className="hover:text-primary-700">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        job.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{timeAgo(job.created_at)}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    <Link
                      href={`/dashboard/applications?job=${job.id}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {job.applicant_count}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
