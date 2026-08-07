import { getAuthUser } from "@/lib/supabase/auth";
import { getEmployerApplications, getEmployerJobs } from "@/lib/data/dashboard";
import { statusMeta } from "@/lib/constants";

export const metadata = {
  title: "Analytics — Job Lagyo",
};

function BreakdownBar({ label, count, max, className }: { label: string; count: number; max: number; className: string }) {
  const pct = max === 0 ? 0 : Math.max(4, (count / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700">{label}</span>
        <span className="font-semibold text-neutral-900">{count}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const [applications, jobs] = await Promise.all([
    getEmployerApplications(user.id),
    getEmployerJobs(user.id),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const app of applications) {
    statusCounts[app.status] = (statusCounts[app.status] ?? 0) + 1;
  }
  const maxStatus = Math.max(1, ...Object.values(statusCounts));

  const jobRows = [...jobs].sort((a, b) => b.applicant_count - a.applicant_count);
  const maxApplicants = Math.max(1, ...jobRows.map((j) => j.applicant_count));

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500">
        A snapshot of hiring activity across your job posts.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Applications by Status</h2>
          <div className="mt-4 space-y-3">
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-sm text-neutral-500">No applications yet.</p>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => {
                const meta = statusMeta(status);
                return (
                  <BreakdownBar
                    key={status}
                    label={meta.label}
                    count={count}
                    max={maxStatus}
                    className="bg-primary-600"
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-900">Applicants per Job Post</h2>
          <div className="mt-4 space-y-3">
            {jobRows.length === 0 ? (
              <p className="text-sm text-neutral-500">No jobs posted yet.</p>
            ) : (
              jobRows.map((job) => (
                <BreakdownBar
                  key={job.id}
                  label={job.title}
                  count={job.applicant_count}
                  max={maxApplicants}
                  className="bg-accent-600"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
