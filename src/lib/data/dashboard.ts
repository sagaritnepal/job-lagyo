import { createClient } from "@/lib/supabase/server";

export interface EmployerJobRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  applicant_count: number;
}

interface RawEmployerJobRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  applications: { count: number }[] | null;
}

export async function getEmployerJobs(ownerId: string): Promise<EmployerJobRow[]> {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", ownerId);

  const companyIds = companies?.map((c) => c.id) ?? [];
  if (companyIds.length === 0) return [];

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, slug, status, created_at, applications(count)")
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
    created_at: job.created_at,
    applicant_count: job.applications?.[0]?.count ?? 0,
  }));
}
