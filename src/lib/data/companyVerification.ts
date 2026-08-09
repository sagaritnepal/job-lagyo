import { createClient } from "@/lib/supabase/server";
import type { Company, CompanyVerificationDocument } from "@/lib/types";

export async function getCompanyByOwner(ownerId: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    console.error("getCompanyByOwner error:", error.message);
    return null;
  }
  return data as Company | null;
}

export async function getCompanyVerificationDocuments(
  companyId: string,
): Promise<CompanyVerificationDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_verification_documents")
    .select("*")
    .eq("company_id", companyId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("getCompanyVerificationDocuments error:", error.message);
    return [];
  }
  return (data as CompanyVerificationDocument[]) ?? [];
}
