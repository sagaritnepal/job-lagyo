import { createClient } from "@/lib/supabase/server";
import type { Company, Job } from "@/lib/types";

export interface AdminStats {
  pendingJobs: number;
  flaggedJobs: number;
  publishedJobs: number;
  totalVendors: number;
  blacklistedVendors: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [pending, flagged, published, vendors, blacklisted] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "flagged"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_blacklisted", true),
  ]);

  return {
    pendingJobs: pending.count ?? 0,
    flaggedJobs: flagged.count ?? 0,
    publishedJobs: published.count ?? 0,
    totalVendors: vendors.count ?? 0,
    blacklistedVendors: blacklisted.count ?? 0,
  };
}

export async function getJobsForModeration(status?: string): Promise<Job[]> {
  const supabase = await createClient();
  let query = supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getJobsForModeration error:", error.message);
    return [];
  }
  return (data as Job[]) ?? [];
}

export interface VendorRow extends Company {
  job_count: number;
  total_application_count: number;
}

interface RawVendorRow extends Company {
  jobs: { id: string; applications: { count: number }[] | null }[] | null;
}

export async function getVendors(): Promise<VendorRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*, jobs(id, applications(count))")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getVendors error:", error?.message);
    return [];
  }

  return (data as unknown as RawVendorRow[]).map((company) => {
    const jobs = company.jobs ?? [];
    const totalApplicationCount = jobs.reduce(
      (sum, job) => sum + (job.applications?.[0]?.count ?? 0),
      0,
    );
    return {
      id: company.id,
      owner_id: company.owner_id,
      name: company.name,
      slug: company.slug,
      logo_url: company.logo_url,
      website: company.website,
      description: company.description,
      location: company.location,
      is_blacklisted: company.is_blacklisted,
      blacklist_reason: company.blacklist_reason,
      blacklisted_at: company.blacklisted_at,
      created_at: company.created_at,
      job_count: jobs.length,
      total_application_count: totalApplicationCount,
    };
  });
}
