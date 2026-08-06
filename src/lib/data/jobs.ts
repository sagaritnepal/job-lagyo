import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

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

export async function getJobsForOwner(ownerId: string): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .in(
      "company_id",
      (
        await supabase.from("companies").select("id").eq("owner_id", ownerId)
      ).data?.map((c) => c.id) ?? [],
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getJobsForOwner error:", error.message);
    return [];
  }
  return (data as Job[]) ?? [];
}
