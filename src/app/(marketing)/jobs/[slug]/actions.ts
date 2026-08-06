"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ApplyState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function applyToJobAction(
  jobId: string,
  jobSlug: string,
  _prevState: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Please log in as a candidate to apply.",
    };
  }

  const coverLetter = formData.get("cover_letter")?.toString().trim() ?? "";

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    applicant_id: user.id,
    cover_letter: coverLetter || null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "You have already applied to this job.",
      };
    }
    return {
      status: "error",
      message: "Something went wrong submitting your application.",
    };
  }

  revalidatePath(`/jobs/${jobSlug}`);
  return { status: "success", message: "Application submitted successfully!" };
}
