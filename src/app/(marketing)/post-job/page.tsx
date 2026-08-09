import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { PostJobForm } from "./PostJobForm";

export const metadata: Metadata = {
  title: "Post a Job",
  description:
    "Post a job vacancy for free and reach thousands of job seekers across Kathmandu and Nepal. Hire top local talent on Job Lagyo.",
  alternates: { canonical: "/post-job" },
};

export default async function PostJobPage() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Log in as an employer to post a job
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          <Link href="/login" className="font-semibold text-primary-700">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-semibold text-primary-700">
            create an employer account
          </Link>{" "}
          to get started — it&apos;s free.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "employer") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Employer accounts only
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Your account is registered as a job seeker. Create a separate
          employer account to post job vacancies on Job Lagyo.
        </p>
      </div>
    );
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, verification_status, verification_rejection_reason")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">Set up your company first</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Before posting a job, create your company profile and submit your VAT/PAN documents for
          verification.
        </p>
        <Link
          href="/dashboard/company"
          className="mt-5 inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Set up company →
        </Link>
      </div>
    );
  }

  if (company.verification_status !== "verified") {
    const messages: Record<string, string> = {
      unverified: "Submit your VAT and PAN registration documents for review before you can post jobs.",
      pending: "Your VAT/PAN documents are under review. You'll be able to post jobs once verified.",
      rejected: company.verification_rejection_reason
        ? `Your verification was rejected: ${company.verification_rejection_reason} Please resubmit your documents.`
        : "Your verification was rejected. Please resubmit your documents.",
    };

    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">Verification required</h1>
        <p className="mt-3 text-sm text-neutral-600">
          {messages[company.verification_status] ?? messages.unverified}
        </p>
        <Link
          href="/dashboard/company"
          className="mt-5 inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Go to company verification →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Post a Job</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Reach job seekers across Kathmandu and Nepal — posting is free.
      </p>
      <PostJobForm />
    </div>
  );
}
