"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isCandidateProfileComplete } from "@/lib/data/candidateProfile";

export type ApplyState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "candidate" && !(await isCandidateProfileComplete(user.id))) {
    return {
      status: "error",
      message: "Complete your profile — field of expertise and education — before applying.",
    };
  }

  const coverLetter = formData.get("cover_letter")?.toString().trim() ?? "";
  const resume = formData.get("resume");
  let resumePath: string | null = null;

  if (resume instanceof File && resume.size > 0) {
    if (resume.size > MAX_RESUME_BYTES) {
      return {
        status: "error",
        message: "Résumé must be 5MB or smaller.",
      };
    }
    if (!ALLOWED_RESUME_TYPES.includes(resume.type)) {
      return {
        status: "error",
        message: "Résumé must be a PDF or Word document.",
      };
    }

    const ext = resume.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/${jobId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, resume, { contentType: resume.type });

    if (uploadError) {
      return {
        status: "error",
        message: "Something went wrong uploading your résumé.",
      };
    }
    resumePath = path;
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    applicant_id: user.id,
    cover_letter: coverLetter || null,
    resume_url: resumePath,
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
  revalidatePath("/my-applications");
  return { status: "success", message: "Application submitted successfully!" };
}
