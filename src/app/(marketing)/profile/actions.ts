"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { JOB_CATEGORY_NAMES, CANDIDATE_DOCUMENT_SLOTS } from "@/lib/constants";
import type { CandidateDocumentType } from "@/lib/types";

export type ProfileActionState = { error?: string };

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
const DOCUMENT_TYPES = CANDIDATE_DOCUMENT_SLOTS.map((s) => s.type);

export async function uploadDocumentAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireCandidate();
  if (!user) return { error: "You must be logged in as a job seeker." };

  const docType = formData.get("doc_type")?.toString() as CandidateDocumentType | undefined;
  if (!docType || !DOCUMENT_TYPES.includes(docType)) {
    return { error: "Invalid document type." };
  }

  const document = formData.get("document");
  if (!(document instanceof File) || document.size === 0) {
    return { error: "Please attach a document." };
  }
  if (document.size > MAX_DOCUMENT_BYTES) {
    return { error: "Document must be 5MB or smaller." };
  }
  if (!ALLOWED_DOCUMENT_TYPES.includes(document.type)) {
    return { error: "Document must be a PDF, JPG, or PNG." };
  }

  const { data: existing } = await supabase
    .from("candidate_documents")
    .select("document_path")
    .eq("candidate_id", user.id)
    .eq("doc_type", docType)
    .maybeSingle();

  const ext = document.name.split(".").pop() ?? "pdf";
  const path = `${user.id}/${docType}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("candidate-documents")
    .upload(path, document, { contentType: document.type });

  if (uploadError) {
    return { error: "Something went wrong uploading your document." };
  }

  const { error } = await supabase
    .from("candidate_documents")
    .upsert(
      { candidate_id: user.id, doc_type: docType, document_path: path },
      { onConflict: "candidate_id,doc_type" },
    );

  if (error) {
    return { error: "Could not save the document. Please try again." };
  }

  if (existing?.document_path) {
    await supabase.storage.from("candidate-documents").remove([existing.document_path]);
  }

  revalidatePath("/profile");
  return {};
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadAvatarAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const avatar = formData.get("avatar");
  if (!(avatar instanceof File) || avatar.size === 0) {
    return { error: "Please choose a photo." };
  }
  if (avatar.size > MAX_AVATAR_BYTES) {
    return { error: "Photo must be 2MB or smaller." };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(avatar.type)) {
    return { error: "Photo must be a JPG, PNG, or WEBP." };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const ext = avatar.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, avatar, { contentType: avatar.type });

  if (uploadError) {
    return { error: "Something went wrong uploading your photo." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

  if (error) {
    return { error: "Could not save your photo. Please try again." };
  }

  const oldPath = existing?.avatar_url?.split("/avatars/")[1];
  if (oldPath) {
    await supabase.storage.from("avatars").remove([oldPath]);
  }

  revalidatePath("/profile");
  return {};
}
