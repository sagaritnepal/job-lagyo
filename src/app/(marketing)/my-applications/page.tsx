import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, FileText } from "lucide-react";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCandidateApplications } from "@/lib/data/applications";
import { isCandidateProfileComplete } from "@/lib/data/candidateProfile";
import { getResumeSignedUrl } from "@/lib/supabase/storage";
import { statusMeta } from "@/lib/constants";
import { CompanyBadge } from "@/components/CompanyBadge";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";

export const metadata: Metadata = {
  title: "My Applications",
  robots: { index: false, follow: true },
};

export default async function MyApplicationsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/my-applications");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const [applications, profileComplete] = await Promise.all([
    getCandidateApplications(user.id),
    profile?.role === "candidate" ? isCandidateProfileComplete(user.id) : Promise.resolve(true),
  ]);
  const resumeUrls = new Map(
    await Promise.all(
      applications
        .filter((a) => a.resume_url)
        .map(async (a) => [a.id, await getResumeSignedUrl(a.resume_url!)] as const),
    ),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">My Applications</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Track the status of every job you&apos;ve applied to on Job Lagyo.
      </p>

      {!profileComplete && (
        <div className="mt-4">
          <ProfileCompletionBanner />
        </div>
      )}

      {applications.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
          You haven&apos;t applied to any jobs yet.{" "}
          <Link href="/jobs" className="font-semibold text-primary-700">
            Browse open roles →
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((app) => {
            const meta = statusMeta(app.status);
            const resumeUrl = resumeUrls.get(app.id);
            return (
              <div
                key={app.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CompanyBadge name={app.job?.company?.name ?? app.job?.title ?? "Job"} />
                    <div>
                      <Link
                        href={`/jobs/${app.job?.slug}`}
                        className="font-semibold text-neutral-900 hover:text-primary-700"
                      >
                        {app.job?.title}
                      </Link>
                      <p className="text-sm text-neutral-500">
                        {app.job?.company?.name ?? "Confidential Company"}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>

                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" /> View submitted résumé
                  </a>
                )}

                <div className="mt-4 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Applied {new Date(app.created_at).toLocaleDateString("en-CA")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
