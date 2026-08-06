"use server";

import { createClient } from "@/lib/supabase/server";

export type SignupState = { error?: string; success?: boolean };

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const supabase = await createClient();
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const fullName = formData.get("full_name")?.toString() ?? "";
  const role = formData.get("role")?.toString() === "employer" ? "employer" : "candidate";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
