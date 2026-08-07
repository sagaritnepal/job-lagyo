import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { PostJobForm } from "./PostJobForm";

export const metadata = {
  title: "Post a Job — Job Lagyo",
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
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Post a Job</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Reach job seekers across Kathmandu and Nepal — posting is free.
      </p>
      <PostJobForm hasCompany={!!company} />
    </div>
  );
}
