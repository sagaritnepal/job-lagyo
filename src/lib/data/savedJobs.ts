import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

export async function getSavedJobIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", userId);

  if (error) {
    console.error("getSavedJobIds error:", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((row) => row.job_id as string));
}

interface SavedJobRow {
  job: Job | null;
}

export async function getSavedJobs(userId: string): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job:jobs(*, company:companies(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSavedJobs error:", error.message);
    return [];
  }
  return ((data as unknown as SavedJobRow[]) ?? [])
    .map((row) => row.job)
    .filter((job): job is Job => job !== null);
}
