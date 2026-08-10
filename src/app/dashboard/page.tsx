import Link from "next/link";
import { Briefcase, Calendar, CheckCircle2, HelpCircle, Plus, UserCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
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
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  const [{ data: company }, stats, recentApplications, trend] = await Promise.all([
    supabase.from("companies").select("name").eq("owner_id", user.id).maybeSingle(),
    getEmployerStats(user.id),
    getRecentApplications(user.id, 5),
    getApplicationFlowTrend(user.id),
  ]);

  return (
    <div>
      <h1 className="text-lg font-bold text-neutral-900 sm:text-xl">
        {company?.name ? `${company.name} Recruiter Dashboard` : "Recruiter Dashboard"}
      </h1>
      <p className="mt-0.5 text-xs text-neutral-500">
        Manage job opportunities and view real-time applicant matches in Kathmandu, Pokhara & beyond.
      </p>

      <div className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Jobs" value={stats.activeJobs.value} deltaPct={stats.activeJobs.deltaPct} icon={Briefcase} />
        <StatCard label="Total Applications" value={stats.totalApplications.value} deltaPct={stats.totalApplications.deltaPct} icon={Users} />
        <StatCard label="Interviews Scheduled" value={stats.interviewsScheduled.value} deltaPct={stats.interviewsScheduled.deltaPct} icon={Calendar} />
        <StatCard label="Hires This Month" value={stats.hiresThisMonth.value} deltaPct={stats.hiresThisMonth.deltaPct} icon={CheckCircle2} />
      </div>

      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Applications</h2>
            <Link href="/dashboard/applications" className="text-xs font-semibold text-primary-700 hover:underline">
              View All →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-xs text-neutral-500">
              No applications yet.
            </p>
          ) : (
            <div className="mt-2.5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wide text-neutral-400">
                  <tr>
                    <th className="pb-1.5 font-medium">Candidate</th>
                    <th className="pb-1.5 font-medium">Position</th>
                    <th className="pb-1.5 font-medium">Status</th>
                    <th className="pb-1.5 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentApplications.map((app) => {
                    const meta = statusMeta(app.status);
                    return (
                      <tr key={app.id}>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <CompanyBadge name={app.applicant?.full_name ?? "Candidate"} size="sm" />
                            <span className="font-medium text-neutral-900">
                              {app.applicant?.full_name ?? "Candidate"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 text-neutral-600">{app.job?.title}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2 text-neutral-500">
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

        <div className="space-y-3.5">
          <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
            <h2 className="text-sm font-semibold text-neutral-900">Application Flow Trend</h2>
            <div className="mt-2.5">
              <ApplicationFlowChart points={trend} />
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
            <h2 className="text-sm font-semibold text-neutral-900">Quick Actions</h2>
            <div className="mt-2 space-y-1.5">
              <Link
                href="/post-job"
                className="flex items-center gap-2 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-700"
              >
                <Plus className="h-4 w-4" /> Post a New Job
              </Link>
              <Link
                href="/dashboard/applications?status=shortlisted"
                className="flex items-center gap-2 rounded-lg bg-primary-50 px-3.5 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
              >
                <UserCheck className="h-4 w-4" /> Review Shortlisted Candidates
              </Link>
              <a
                href="mailto:support@joblagyo.com"
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
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
