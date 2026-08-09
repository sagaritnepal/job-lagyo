import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";

export async function getCandidateApplications(userId: string): Promise<Application[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(*, company:companies(*))")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCandidateApplications error:", error.message);
    return [];
  }
  return (data as Application[]) ?? [];
}
