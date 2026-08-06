import Link from "next/link";
import { Briefcase, Calendar, CheckCircle2, HelpCircle, Plus, UserCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getApplicationFlowTrend,
  getEmployerStats,
  getRecentApplications,
} from "@/lib/data/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ApplicationFlowChart } from "@/components/dashboard/ApplicationFlowChart";
import { CompanyBadge } from "@/components/CompanyBadge";
import { statusMeta } from "@/lib/constants";

export const metadata = {
  title: "Dashboard — Job Lagyo",
};

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("owner_id", user.id)
    .maybeSingle();

  const [stats, recentApplications, trend] = await Promise.all([
    getEmployerStats(user.id),
    getRecentApplications(user.id, 5),
    getApplicationFlowTrend(user.id),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        {company?.name ? `${company.name} Recruiter Dashboard` : "Recruiter Dashboard"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage job opportunities and view real-time applicant matches in Kathmandu, Pokhara & beyond.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Jobs" value={stats.activeJobs.value} deltaPct={stats.activeJobs.deltaPct} icon={Briefcase} />
        <StatCard label="Total Applications" value={stats.totalApplications.value} deltaPct={stats.totalApplications.deltaPct} icon={Users} />
        <StatCard label="Interviews Scheduled" value={stats.interviewsScheduled.value} deltaPct={stats.interviewsScheduled.deltaPct} icon={Calendar} />
        <StatCard label="Hires This Month" value={stats.hiresThisMonth.value} deltaPct={stats.hiresThisMonth.deltaPct} icon={CheckCircle2} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Recent Applications</h2>
            <Link href="/dashboard/applications" className="text-sm font-semibold text-primary-700 hover:underline">
              View All Applications →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
              No applications yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-neutral-400">
                  <tr>
                    <th className="pb-2 font-medium">Candidate</th>
                    <th className="pb-2 font-medium">Position</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentApplications.map((app) => {
                    const meta = statusMeta(app.status);
                    return (
                      <tr key={app.id}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <CompanyBadge name={app.applicant?.full_name ?? "Candidate"} size="sm" />
                            <span className="font-medium text-neutral-900">
                              {app.applicant?.full_name ?? "Candidate"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-neutral-600">{app.job?.title}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 text-neutral-500">
                          {new Date(app.created_at).toLocaleDateString("en-CA")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold text-neutral-900">Application Flow Trend</h2>
            <div className="mt-4">
              <ApplicationFlowChart points={trend} />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold text-neutral-900">Quick Actions</h2>
            <div className="mt-3 space-y-2">
              <Link
                href="/post-job"
                className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-3 text-sm font-semibold text-white hover:bg-accent-700"
              >
                <Plus className="h-4 w-4" /> Post a New Job
              </Link>
              <Link
                href="/dashboard/applications?status=shortlisted"
                className="flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-100"
              >
                <UserCheck className="h-4 w-4" /> Review Shortlisted Candidates
              </Link>
              <a
                href="mailto:support@joblagyo.com"
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <HelpCircle className="h-4 w-4" /> Nepali Recruiter Helpdesk
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
