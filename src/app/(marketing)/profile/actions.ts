"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { JOB_CATEGORY_NAMES } from "@/lib/constants";

export type ProfileActionState = { error?: string };

const initialState: ProfileActionState = {};
export { initialState as profileInitialState };

async function requireCandidate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "candidate") return { supabase, user: null };
  return { supabase, user };
}

export async function updateCategoriesAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireCandidate();
  if (!user) return { error: "You must be logged in as a job seeker." };

  const categories = formData.getAll("categories").map((c) => c.toString());
  const invalid = categories.some((c) => !JOB_CATEGORY_NAMES.includes(c));
  if (invalid) return { error: "Invalid category selected." };

  const bio = formData.get("bio")?.toString().trim() || null;

  const { error } = await supabase
    .from("candidate_profiles")
    .upsert({ id: user.id, categories, bio }, { onConflict: "id" });

  if (error) {
    return { error: "Could not save your field of expertise. Please try again." };
  }

  revalidatePath("/profile");
  return {};
}

export async function addEducationAction(formData: FormData) {
  const { supabase, user } = await requireCandidate();
  if (!user) return;

  const institution = formData.get("institution")?.toString().trim();
  const degree = formData.get("degree")?.toString().trim();
  const fieldOfStudy = formData.get("field_of_study")?.toString().trim() || null;
  const startYear = formData.get("start_year")?.toString();
  const endYear = formData.get("end_year")?.toString();

  if (!institution || !degree) return;

  await supabase.from("candidate_education").insert({
    candidate_id: user.id,
    institution,
    degree,
    field_of_study: fieldOfStudy,
    start_year: startYear ? Number(startYear) : null,
    end_year: endYear ? Number(endYear) : null,
  });

  revalidatePath("/profile");
}

export async function deleteEducationAction(formData: FormData) {
  const { supabase, user } = await requireCandidate();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("candidate_education").delete().eq("id", id).eq("candidate_id", user.id);
  revalidatePath("/profile");
}

export async function addExperienceAction(formData: FormData) {
  const { supabase, user } = await requireCandidate();
  if (!user) return;

  const companyName = formData.get("company_name")?.toString().trim();
  const jobTitle = formData.get("job_title")?.toString().trim();
  const startDate = formData.get("start_date")?.toString();
  const endDate = formData.get("end_date")?.toString() || null;
  const description = formData.get("description")?.toString().trim() || null;

  if (!companyName || !jobTitle || !startDate) return;

  await supabase.from("candidate_experience").insert({
    candidate_id: user.id,
    company_name: companyName,
    job_title: jobTitle,
    start_date: startDate,
    end_date: endDate,
    description,
  });

  revalidatePath("/profile");
}

export async function deleteExperienceAction(formData: FormData) {
  const { supabase, user } = await requireCandidate();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("candidate_experience").delete().eq("id", id).eq("candidate_id", user.id);
  revalidatePath("/profile");
}

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function uploadCertificateAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireCandidate();
  if (!user) return { error: "You must be logged in as a job seeker." };

  const title = formData.get("title")?.toString().trim();
  const issuer = formData.get("issuer")?.toString().trim() || null;
  const issueDate = formData.get("issue_date")?.toString() || null;
  const document = formData.get("document");

  if (!title) return { error: "Certificate title is required." };
  if (!(document instanceof File) || document.size === 0) {
    return { error: "Please attach a supporting document." };
  }
  if (document.size > MAX_DOCUMENT_BYTES) {
    return { error: "Document must be 5MB or smaller." };
  }
  if (!ALLOWED_DOCUMENT_TYPES.includes(document.type)) {
    return { error: "Document must be a PDF, JPG, or PNG." };
  }

  const ext = document.name.split(".").pop() ?? "pdf";
  const path = `${user.id}/certificate-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("candidate-documents")
    .upload(path, document, { contentType: document.type });

  if (uploadError) {
    return { error: "Something went wrong uploading your document." };
  }

  const { error } = await supabase.from("candidate_certificates").insert({
    candidate_id: user.id,
    title,
    issuer,
    issue_date: issueDate,
    document_path: path,
  });

  if (error) {
    return { error: "Could not save the certificate. Please try again." };
  }

  revalidatePath("/profile");
  return {};
}

export async function deleteCertificateAction(formData: FormData) {
  const { supabase, user } = await requireCandidate();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const documentPath = formData.get("document_path")?.toString();
  if (!id) return;

  await supabase.from("candidate_certificates").delete().eq("id", id).eq("candidate_id", user.id);
  if (documentPath) {
    await supabase.storage.from("candidate-documents").remove([documentPath]);
  }
  revalidatePath("/profile");
}
