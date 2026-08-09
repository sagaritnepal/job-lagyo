import { createClient } from "@/lib/supabase/server";

export async function getResumeSignedUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
