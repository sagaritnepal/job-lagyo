"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateApplicationStatusAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const applicationId = formData.get("application_id")?.toString();
  const status = formData.get("status")?.toString();
  if (!applicationId || !status) return;

  await supabase.from("applications").update({ status }).eq("id", applicationId);
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard");
}
