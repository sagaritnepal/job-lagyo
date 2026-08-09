"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uniqueSlug } from "@/lib/slug";

export type CompanyActionState = { error?: string };

async function requireEmployer() {
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

  if (profile?.role !== "employer") return { supabase, user: null };
  return { supabase, user };
}

function revalidateCompanyPages() {
  revalidatePath("/dashboard/company");
  revalidatePath("/dashboard/settings");
  revalidatePath("/post-job");
}

export async function createCompanyAction(
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { supabase, user } = await requireEmployer();
  if (!user) return { error: "You must be logged in as an employer." };

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (existing) return { error: "You already have a company profile." };

  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "Company name is required." };
  const location = formData.get("location")?.toString() || "Kathmandu";
  const website = formData.get("website")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;

  const { error } = await supabase.from("companies").insert({
    owner_id: user.id,
    name,
    slug: uniqueSlug(name),
    location,
    website,
    description,
  });

  if (error) return { error: "Could not create your company profile. Please try again." };

  revalidateCompanyPages();
  return {};
}

export async function updateCompanyDetailsAction(
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { supabase, user } = await requireEmployer();
  if (!user) return { error: "You must be logged in as an employer." };

  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "Company name is required." };
  const location = formData.get("location")?.toString() || "Kathmandu";
  const website = formData.get("website")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;

  const { error } = await supabase
    .from("companies")
    .update({ name, location, website, description })
    .eq("owner_id", user.id);

  if (error) return { error: "Could not update your company profile. Please try again." };

  revalidateCompanyPages();
  return {};
}

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const DOCUMENT_TYPES = ["vat_certificate", "pan_certificate", "registration_certificate", "other"];

export async function uploadVerificationDocumentAction(
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { supabase, user } = await requireEmployer();
  if (!user) return { error: "You must be logged in as an employer." };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!company) return { error: "Create your company profile first." };

  const documentType = formData.get("document_type")?.toString();
  if (!documentType || !DOCUMENT_TYPES.includes(documentType)) {
    return { error: "Please select a document type." };
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

  const ext = document.name.split(".").pop() ?? "pdf";
  const path = `${company.id}/${documentType}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("company-documents")
    .upload(path, document, { contentType: document.type });

  if (uploadError) return { error: "Something went wrong uploading your document." };

  const { error } = await supabase.from("company_verification_documents").insert({
    company_id: company.id,
    document_type: documentType,
    file_path: path,
  });

  if (error) return { error: "Could not save the document. Please try again." };

  revalidateCompanyPages();
  return {};
}

export async function deleteVerificationDocumentAction(formData: FormData) {
  const { supabase, user } = await requireEmployer();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const filePath = formData.get("file_path")?.toString();
  if (!id) return;

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!company) return;

  await supabase
    .from("company_verification_documents")
    .delete()
    .eq("id", id)
    .eq("company_id", company.id);
  if (filePath) {
    await supabase.storage.from("company-documents").remove([filePath]);
  }

  revalidateCompanyPages();
}

export async function submitForVerificationAction(
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { supabase, user } = await requireEmployer();
  if (!user) return { error: "You must be logged in as an employer." };

  const { data: company } = await supabase
    .from("companies")
    .select("id, verification_status")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!company) return { error: "Create your company profile first." };

  const vatNumber = formData.get("vat_number")?.toString().trim();
  const panNumber = formData.get("pan_number")?.toString().trim();
  if (!vatNumber || !panNumber) {
    return { error: "VAT and PAN registration numbers are both required." };
  }

  const { count: documentCount } = await supabase
    .from("company_verification_documents")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);
  if (!documentCount || documentCount === 0) {
    return { error: "Upload at least one supporting document (VAT/PAN certificate) before submitting." };
  }

  const { error } = await supabase
    .from("companies")
    .update({
      vat_number: vatNumber,
      pan_number: panNumber,
      verification_status: "pending",
      verification_submitted_at: new Date().toISOString(),
      verification_rejection_reason: null,
    })
    .eq("id", company.id);

  if (error) return { error: "Could not submit for verification. Please try again." };

  revalidateCompanyPages();
  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  return {};
}
