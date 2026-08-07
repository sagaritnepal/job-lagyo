import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";

export interface EmployerJobRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  rejection_reason: string | null;
  flag_reason: string | null;
  created_at: string;
  applicant_count: number;
}

interface RawEmployerJobRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  rejection_reason: string | null;
  flag_reason: string | null;
  created_at: string;
  applications: { count: number }[] | null;
}

async function getOwnerCompanyIds(ownerId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", ownerId);
  return data?.map((c) => c.id) ?? [];
}

async function getOwnerJobIds(companyIds: string[]): Promise<string[]> {
  if (companyIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id")
    .in("company_id", companyIds);
  return data?.map((j) => j.id) ?? [];
}

export async function getEmployerJobs(ownerId: string): Promise<EmployerJobRow[]> {
  const supabase = await createClient();
  const companyIds = await getOwnerCompanyIds(ownerId);
  if (companyIds.length === 0) return [];

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, slug, status, rejection_reason, flag_reason, created_at, applications(count)")
    .in("company_id", companyIds)
    .order("created_at", { ascending: false });

  if (error || !jobs) {
    console.error("getEmployerJobs error:", error?.message);
    return [];
  }

  return (jobs as unknown as RawEmployerJobRow[]).map((job) => ({
    id: job.id,
    title: job.title,
    slug: job.slug,
    status: job.status,
    rejection_reason: job.rejection_reason,
    flag_reason: job.flag_reason,
    created_at: job.created_at,
    applicant_count: job.applications?.[0]?.count ?? 0,
  }));
}

export interface StatWithDelta {
  value: number;
  deltaPct: number | null;
}

export interface EmployerStats {
  activeJobs: StatWithDelta;
  totalApplications: StatWithDelta;
  interviewsScheduled: StatWithDelta;
  hiresThisMonth: StatWithDelta;
}

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getEmployerStats(ownerId: string): Promise<EmployerStats> {
  const empty: StatWithDelta = { value: 0, deltaPct: null };
  const companyIds = await getOwnerCompanyIds(ownerId);
  if (companyIds.length === 0) {
    return { activeJobs: empty, totalApplications: empty, interviewsScheduled: empty, hiresThisMonth: empty };
  }

  const jobIds = await getOwnerJobIds(companyIds);
  const supabase = await createClient();
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(-1);

  if (jobIds.length === 0) {
    const { count: activeJobsNow } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .in("company_id", companyIds)
      .eq("status", "published");
    return {
      activeJobs: { value: activeJobsNow ?? 0, deltaPct: null },
      totalApplications: empty,
      interviewsScheduled: empty,
      hiresThisMonth: empty,
    };
  }

  const [
    activeJobsNow,
    jobsThisMonth,
    jobsLastMonth,
    appsTotal,
    appsThisMonth,
    appsLastMonth,
    interviewingNow,
    interviewingThisMonth,
    interviewingLastMonth,
    hiredThisMonth,
    hiredLastMonth,
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).in("company_id", companyIds).eq("status", "published"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).in("company_id", companyIds).gte("created_at", thisMonth.start.toISOString()).lt("created_at", thisMonth.end.toISOString()),
    supabase.from("jobs").select("id", { count: "exact", head: true }).in("company_id", companyIds).gte("created_at", lastMonth.start.toISOString()).lt("created_at", lastMonth.end.toISOString()),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds).gte("created_at", thisMonth.start.toISOString()).lt("created_at", thisMonth.end.toISOString()),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds).gte("created_at", lastMonth.start.toISOString()).lt("created_at", lastMonth.end.toISOString()),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds).eq("status", "interviewing"),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds).eq("status", "interviewing").gte("updated_at", thisMonth.start.toISOString()).lt("updated_at", thisMonth.end.toISOString()),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds).eq("status", "interviewing").gte("updated_at", lastMonth.start.toISOString()).lt("updated_at", lastMonth.end.toISOString()),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds).eq("status", "hired").gte("updated_at", thisMonth.start.toISOString()).lt("updated_at", thisMonth.end.toISOString()),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds).eq("status", "hired").gte("updated_at", lastMonth.start.toISOString()).lt("updated_at", lastMonth.end.toISOString()),
  ]);

  return {
    activeJobs: { value: activeJobsNow.count ?? 0, deltaPct: deltaPct(jobsThisMonth.count ?? 0, jobsLastMonth.count ?? 0) },
    totalApplications: { value: appsTotal.count ?? 0, deltaPct: deltaPct(appsThisMonth.count ?? 0, appsLastMonth.count ?? 0) },
    interviewsScheduled: { value: interviewingNow.count ?? 0, deltaPct: deltaPct(interviewingThisMonth.count ?? 0, interviewingLastMonth.count ?? 0) },
    hiresThisMonth: { value: hiredThisMonth.count ?? 0, deltaPct: deltaPct(hiredThisMonth.count ?? 0, hiredLastMonth.count ?? 0) },
  };
}

export async function getRecentApplications(ownerId: string, limit = 5): Promise<Application[]> {
  const supabase = await createClient();
  const companyIds = await getOwnerCompanyIds(ownerId);
  const jobIds = await getOwnerJobIds(companyIds);
  if (jobIds.length === 0) return [];

  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(*), applicant:profiles(*)")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentApplications error:", error.message);
    return [];
  }
  return (data as Application[]) ?? [];
}

export async function getEmployerApplications(
  ownerId: string,
  status?: string,
): Promise<Application[]> {
  const supabase = await createClient();
  const companyIds = await getOwnerCompanyIds(ownerId);
  const jobIds = await getOwnerJobIds(companyIds);
  if (jobIds.length === 0) return [];

  let query = supabase
    .from("applications")
    .select("*, job:jobs(*), applicant:profiles(*)")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getEmployerApplications error:", error.message);
    return [];
  }
  return (data as Application[]) ?? [];
}

export interface MonthlyTrendPoint {
  label: string;
  count: number;
}

export async function getApplicationFlowTrend(
  ownerId: string,
  months = 6,
): Promise<MonthlyTrendPoint[]> {
  const supabase = await createClient();
  const companyIds = await getOwnerCompanyIds(ownerId);
  const jobIds = await getOwnerJobIds(companyIds);

  const now = new Date();
  const points: MonthlyTrendPoint[] = [];
  const ranges: { start: Date; end: Date; label: string }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    ranges.push({
      start,
      end,
      label: start.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  if (jobIds.length === 0) {
    return ranges.map((r) => ({ label: r.label, count: 0 }));
  }

  for (const range of ranges) {
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .in("job_id", jobIds)
      .gte("created_at", range.start.toISOString())
      .lt("created_at", range.end.toISOString());
    points.push({ label: range.label, count: count ?? 0 });
  }

  return points;
}
