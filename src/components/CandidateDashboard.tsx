import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Circle,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCandidateProfileBundle } from "@/lib/data/candidateProfile";
import { getCandidateApplications } from "@/lib/data/applications";
import { getSavedJobs, getSavedJobIds } from "@/lib/data/savedJobs";
import { getPublishedJobs } from "@/lib/data/jobs";
import { StatCard } from "@/components/dashboard/StatCard";
import { JobListItem } from "@/components/JobListItem";
import { statusMeta } from "@/lib/constants";
import type { User } from "@supabase/supabase-js";

export async function CandidateDashboard({ user }: { user: User }) {
  const supabase = await createClient();

  const [{ data: profileRow }, bundle, applications, savedJobs] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    getCandidateProfileBundle(user.id),
    getCandidateApplications(user.id),
    getSavedJobs(user.id),
  ]);

  const { profile, education, experience, certificates } = bundle;
  const categories = profile?.categories ?? [];

  const checklist = [
    { label: "Field of expertise", done: categories.length > 0 },
    { label: "Education", done: education.length > 0 },
    { label: "Work experience", done: experience.length > 0 },
    { label: "Certificate / document proof", done: certificates.length > 0 },
  ];
  const completedCount = checklist.filter((c) => c.done).length;
  const completionPct = Math.round((completedCount / checklist.length) * 100);

  const shortlistedCount = applications.filter(
    (a) => a.status === "shortlisted" || a.status === "interviewing" || a.status === "hired",
  ).length;

  const { jobs: recommendedJobs } = await getPublishedJobs({
    preferredCategories: categories,
    pageSize: 4,
  });
  const savedJobIds = await getSavedJobIds(user.id);

  const firstName = (profileRow?.full_name ?? "there").split(" ")[0];
  const recentApplications = applications.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
      <div className="animate-fade-in-up">
        <h1 className="text-lg font-bold text-neutral-900 sm:text-xl">Welcome back, {firstName}</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Here&apos;s what&apos;s happening with your job search today.
        </p>
      </div>

      <div className="mt-3.5 rounded-lg border border-neutral-200 bg-white p-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Profile Strength</h2>
          <span className="text-sm font-bold text-primary-700">{completionPct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-xs">
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
              )}
              <span className={item.done ? "text-neutral-700" : "text-neutral-500"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/profile"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 sm:w-fit sm:px-6"
        >
          {completedCount === checklist.length ? "Edit Profile" : "Complete Your Profile"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Applications Sent"
          value={applications.length}
          deltaPct={null}
          icon={FileText}
          href="/my-applications"
        />
        <StatCard
          label="Saved Jobs"
          value={savedJobs.length}
          deltaPct={null}
          icon={Bookmark}
          href="/saved-jobs"
        />
        <StatCard
          label="In Progress"
          value={shortlistedCount}
          deltaPct={null}
          icon={Sparkles}
          href="/my-applications?tab=in-progress"
        />
      </div>

      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3.5">
          <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Recommended For You</h2>
              <Link href="/jobs" className="text-xs font-semibold text-primary-700 hover:underline">
                View All Jobs →
              </Link>
            </div>
            {recommendedJobs.length === 0 ? (
              <p className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-xs text-neutral-500">
                <Search className="h-5 w-5 text-neutral-400" />
                No jobs to show yet — check back soon.
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {recommendedJobs.map((job) => (
                  <JobListItem key={job.id} job={job} isSaved={savedJobIds.has(job.id)} isLoggedIn />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Recent Applications</h2>
              <Link
                href="/my-applications"
                className="text-xs font-semibold text-primary-700 hover:underline"
              >
                View All →
              </Link>
            </div>
            {recentApplications.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-xs text-neutral-500">
                You haven&apos;t applied to any jobs yet.
              </p>
            ) : (
              <ul className="mt-2.5 divide-y divide-neutral-100">
                {recentApplications.map((app) => {
                  const meta = statusMeta(app.status);
                  return (
                    <li key={app.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <Link
                          href={`/jobs/${app.job?.slug}`}
                          className="truncate text-sm font-semibold text-neutral-900 hover:text-primary-700"
                        >
                          {app.job?.title}
                        </Link>
                        <p className="truncate text-xs text-neutral-500">
                          {app.job?.company?.name ?? "Confidential Company"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
            <h2 className="text-sm font-semibold text-neutral-900">Quick Actions</h2>
            <div className="mt-2 space-y-1.5">
              <Link
                href="/jobs"
                className="flex items-center gap-2 rounded-lg bg-primary-50 px-3.5 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
              >
                <Briefcase className="h-4 w-4" /> Browse All Jobs
              </Link>
              <Link
                href="/saved-jobs"
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Bookmark className="h-4 w-4" /> Saved Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
