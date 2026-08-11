"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateVendorPages() {
  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  revalidatePath("/companies");
  revalidatePath("/dashboard/company");
  revalidatePath("/post-job");
}

export async function approveVerificationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = formData.get("company_id")?.toString();
  if (!user || !companyId) return;

  await supabase
    .from("companies")
    .update({
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      verification_rejection_reason: null,
    })
    .eq("id", companyId);

  revalidateVendorPages();
}

export async function rejectVerificationAction(formData: FormData) {
  const supabase = await createClient();
  const companyId = formData.get("company_id")?.toString();
  const reason = formData.get("reason")?.toString().trim();
  if (!companyId || !reason) return;

  await supabase
    .from("companies")
    .update({
      verification_status: "rejected",
      verification_rejection_reason: reason,
    })
    .eq("id", companyId);

  revalidateVendorPages();
}

export async function blacklistVendorAction(formData: FormData) {
  const supabase = await createClient();
  const companyId = formData.get("company_id")?.toString();
  const reason = formData.get("reason")?.toString().trim();
  if (!companyId || !reason) return;

  await supabase
    .from("companies")
    .update({
      is_blacklisted: true,
      blacklist_reason: reason,
      blacklisted_at: new Date().toISOString(),
    })
    .eq("id", companyId);

  // Pull down any live listings from a blacklisted vendor.
  await supabase
    .from("jobs")
    .update({ status: "closed" })
    .eq("company_id", companyId)
    .in("status", ["pending", "published", "flagged"]);

  revalidateVendorPages();
  revalidatePath("/dashboard/jobs");
}

export async function unblacklistVendorAction(formData: FormData) {
  const supabase = await createClient();
  const companyId = formData.get("company_id")?.toString();
  if (!companyId) return;

  await supabase
    .from("companies")
    .update({
      is_blacklisted: false,
      blacklist_reason: null,
      blacklisted_at: null,
    })
    .eq("id", companyId);

  revalidateVendorPages();
}
