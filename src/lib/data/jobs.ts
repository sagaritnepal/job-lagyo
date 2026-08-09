import { createClient } from "@/lib/supabase/server";
import type { Company, Job } from "@/lib/types";
import { JOB_CATEGORY_NAMES } from "@/lib/constants";

export type JobSort = "newest" | "salary";

export interface JobFilters {
  q?: string;
  category?: string;
  location?: string;
  jobType?: string;
  sort?: JobSort;
  page?: number;
  pageSize?: number;
}

export interface PublishedJobsResult {
  jobs: Job[];
  total: number;
}

export async function getPublishedJobs(filters: JobFilters = {}): Promise<PublishedJobsResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("jobs")
    .select("*, company:companies(*)", { count: "exact" })
    .eq("status", "published");

  if (filters.q) {
    query = query.ilike("title", `%${filters.q}%`);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.location) {
    query = query.eq("location", filters.location);
  }
  if (filters.jobType) {
    query = query.eq("job_type", filters.jobType);
  }

  query = query.order("featured", { ascending: false });
  if (filters.sort === "salary") {
    query = query.order("salary_max", { ascending: false, nullsFirst: false });
  }
  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("getPublishedJobs error:", error.message);
    return { jobs: [], total: 0 };
  }
  return { jobs: (data as Job[]) ?? [], total: count ?? 0 };
}

export async function getFeaturedJobs(limit = 6): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedJobs error:", error.message);
    return [];
  }
  return (data as Job[]) ?? [];
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getJobBySlug error:", error.message);
    return null;
  }
  return data as Job | null;
}

export interface HomeStats {
  activeJobs: number;
  verifiedEmployers: number;
  successfulHires: number;
  dailyApplications: number;
}

export async function getHomeStats(): Promise<HomeStats> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [jobs, companies, hires, dailyApps] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "hired"),
    supabase.from("applications").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);

  return {
    activeJobs: jobs.count ?? 0,
    verifiedEmployers: companies.count ?? 0,
    successfulHires: hires.count ?? 0,
    dailyApplications: dailyApps.count ?? 0,
  };
}

export async function getTopCompanies(limit = 5): Promise<Company[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getTopCompanies error:", error.message);
    return [];
  }
  return (data as Company[]) ?? [];
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("is_blacklisted", false)
    .maybeSingle();

  if (error) {
    console.error("getCompanyBySlug error:", error.message);
    return null;
  }
  return data as Company | null;
}

export async function getCompanyJobs(companyId: string): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("company_id", companyId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCompanyJobs error:", error.message);
    return [];
  }
  return (data as Job[]) ?? [];
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("category")
    .eq("status", "published");

  if (error || !data) {
    console.error("getCategoryCounts error:", error?.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const name of JOB_CATEGORY_NAMES) counts[name] = 0;
  for (const row of data) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}
