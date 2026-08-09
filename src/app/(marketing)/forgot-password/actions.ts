"use server";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export type ForgotPasswordState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const supabase = await createClient();
  const email = formData.get("email")?.toString().trim() ?? "";

  if (!email) {
    return { status: "error", message: "Enter your email address." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/confirm`,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message: "If an account exists for that email, we've sent a password reset link.",
  };
}
