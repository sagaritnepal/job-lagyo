import Link from "next/link";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEmployerApplications } from "@/lib/data/dashboard";
import { statusMeta } from "@/lib/constants";
import { CompanyBadge } from "@/components/CompanyBadge";
import { StatusSelect } from "./StatusSelect";

export const metadata = {
  title: "Applications — Job Lagyo",
};

const TABS = [
  { value: "", label: "All" },
  { value: "submitted", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

export default async function ApplicationsPage({
  searchParams,
}: PageProps<"/dashboard/applications">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const jobId = typeof params.job === "string" ? params.job : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let applications = await getEmployerApplications(user.id, status || undefined);
  if (jobId) {
    applications = applications.filter((a) => a.job_id === jobId);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        Applicants {applications.length > 0 && `(${applications.length})`}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/applications${tab.value ? `?status=${tab.value}` : ""}`}
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

      {applications.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          No applications here yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((app) => {
            const meta = statusMeta(app.status);
            return (
              <div
                key={app.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyBadge name={app.applicant?.full_name ?? "Candidate"} />
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {app.applicant?.full_name ?? "Candidate"}
                      </p>
                      <p className="text-sm text-neutral-500">{app.job?.title}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>

                {app.cover_letter && (
                  <p className="mt-3 text-sm text-neutral-600">{app.cover_letter}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(app.created_at).toLocaleDateString("en-CA")}
                  </span>
                  <StatusSelect applicationId={app.id} currentStatus={app.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
