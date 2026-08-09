import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";
import { getSavedJobs } from "@/lib/data/savedJobs";
import { JobListItem } from "@/components/JobListItem";

export const metadata: Metadata = {
  title: "Saved Jobs",
  robots: { index: false, follow: true },
};

export default async function SavedJobsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/saved-jobs");

  const jobs = await getSavedJobs(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Saved Jobs</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Jobs you&apos;ve bookmarked to come back to later.
      </p>

      {jobs.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
          You haven&apos;t saved any jobs yet.{" "}
          <Link href="/jobs" className="font-semibold text-primary-700">
            Browse open roles →
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((job) => (
            <JobListItem key={job.id} job={job} isSaved isLoggedIn />
          ))}
        </div>
      )}
    </div>
  );
}
