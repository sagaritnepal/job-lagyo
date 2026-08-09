import Link from "next/link";
import { ShieldCheck, Flag, Briefcase, Building2, Ban, BadgeCheck } from "lucide-react";
import { getAdminStats } from "@/lib/data/admin";
import { StatCard } from "@/components/dashboard/StatCard";

export const metadata = {
  title: "Admin Overview — Job Lagyo",
};

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Admin Overview</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Review job approvals, fraud flags, and vendor standing across Job Lagyo.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Pending approvals" value={stats.pendingJobs} deltaPct={null} icon={ShieldCheck} />
        <StatCard label="Flagged for fraud" value={stats.flaggedJobs} deltaPct={null} icon={Flag} />
        <StatCard label="Live job posts" value={stats.publishedJobs} deltaPct={null} icon={Briefcase} />
        <StatCard label="Pending verifications" value={stats.pendingVerifications} deltaPct={null} icon={BadgeCheck} />
        <StatCard label="Blacklisted vendors" value={stats.blacklistedVendors} deltaPct={null} icon={Ban} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/jobs?status=pending"
          className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-sm"
        >
          <p className="flex items-center gap-2 font-semibold text-neutral-900">
            <ShieldCheck className="h-4.5 w-4.5 text-primary-600" /> Review pending jobs
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {stats.pendingJobs} job{stats.pendingJobs === 1 ? "" : "s"} waiting for approval before
            they go live.
          </p>
        </Link>
        <Link
          href="/admin/vendors"
          className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-sm"
        >
          <p className="flex items-center gap-2 font-semibold text-neutral-900">
            <Building2 className="h-4.5 w-4.5 text-primary-600" /> Manage vendors
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {stats.totalVendors} vendor{stats.totalVendors === 1 ? "" : "s"} on the platform,{" "}
            {stats.pendingVerifications} awaiting verification, {stats.blacklistedVendors} blacklisted.
          </p>
        </Link>
      </div>
    </div>
  );
}
