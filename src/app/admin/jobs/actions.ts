"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateJobPages() {
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  revalidatePath("/dashboard/jobs");
  revalidatePath("/jobs");
}

export async function approveJobAction(formData: FormData) {
  const supabase = await createClient();
  const jobId = formData.get("job_id")?.toString();
  if (!jobId) return;

  await supabase
    .from("jobs")
    .update({
      status: "published",
      rejection_reason: null,
      flag_reason: null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  revalidateJobPages();
}

export async function rejectJobAction(formData: FormData) {
  const supabase = await createClient();
  const jobId = formData.get("job_id")?.toString();
  const reason = formData.get("reason")?.toString().trim();
  if (!jobId || !reason) return;

  await supabase
    .from("jobs")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  revalidateJobPages();
}

export async function flagJobAction(formData: FormData) {
  const supabase = await createClient();
  const jobId = formData.get("job_id")?.toString();
  const reason = formData.get("reason")?.toString().trim();
  if (!jobId || !reason) return;

  await supabase
    .from("jobs")
    .update({
      status: "flagged",
      flag_reason: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  revalidateJobPages();
}

export async function unflagJobAction(formData: FormData) {
  const supabase = await createClient();
  const jobId = formData.get("job_id")?.toString();
  if (!jobId) return;

  await supabase
    .from("jobs")
    .update({
      status: "published",
      flag_reason: null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  revalidateJobPages();
}
