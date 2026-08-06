import { createClient } from "@/lib/supabase/server";
import type { Company, Job } from "@/lib/types";
import { JOB_CATEGORY_NAMES } from "@/lib/constants";

export interface JobFilters {
  q?: string;
  category?: string;
  location?: string;
  jobType?: string;
}

export async function getPublishedJobs(filters: JobFilters = {}): Promise<Job[]> {
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

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

  const { data, error } = await query;
  if (error) {
    console.error("getPublishedJobs error:", error.message);
    return [];
  }
  return (data as Job[]) ?? [];
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
