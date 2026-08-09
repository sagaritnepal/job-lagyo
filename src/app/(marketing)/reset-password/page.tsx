import type { Metadata } from "next";
import Link from "next/link";
import { getAuthUser } from "@/lib/supabase/auth";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">Link expired</h1>
        <p className="mt-3 text-sm text-neutral-600">
          This password reset link is invalid or has expired.{" "}
          <Link href="/forgot-password" className="font-semibold text-primary-700">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return <ResetPasswordForm />;
}
