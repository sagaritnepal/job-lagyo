import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { getCandidateProfileBundle } from "@/lib/data/candidateProfile";
import { getCandidateDocumentSignedUrl } from "@/lib/supabase/storage";
import { CategorySelector } from "./CategorySelector";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { CertificatesSection } from "./CertificatesSection";

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/profile");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "employer") redirect("/dashboard/company");
  if (profile?.role === "admin") redirect("/admin");

  const { profile: candidateProfile, education, experience, certificates } =
    await getCandidateProfileBundle(user.id);

  const viewUrlEntries = await Promise.all(
    certificates.map(
      async (c) => [c.id, await getCandidateDocumentSignedUrl(c.document_path)] as const,
    ),
  );
  const viewUrls = new Map(
    viewUrlEntries.filter((entry): entry is [string, string] => entry[1] !== null),
  );

  const categories = candidateProfile?.categories ?? [];
  const checklist = [
    { label: "Field of expertise", done: categories.length > 0 },
    { label: "Education", done: education.length > 0 },
    { label: "Work experience", done: experience.length > 0 },
    { label: "Certificate / document proof", done: certificates.length > 0 },
  ];
  const completedCount = checklist.filter((c) => c.done).length;
  const canApply = checklist[0].done && checklist[1].done;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Complete your profile so employers can trust who you are — a field of expertise and at
        least one education entry are required before you can apply to jobs.
      </p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm font-semibold text-neutral-900">
          {completedCount} of {checklist.length} sections complete
        </p>
        <ul className="mt-2 space-y-1.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-300" />
              )}
              <span className={item.done ? "text-neutral-700" : "text-neutral-500"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        {!canApply && (
          <p className="mt-3 text-xs text-amber-700">
            Add your field of expertise and at least one education entry to unlock applying to
            jobs.
          </p>
        )}
      </div>

      <div className="mt-8 space-y-8">
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-neutral-900">Field of expertise</h2>
          <div className="mt-3">
            <CategorySelector initialCategories={categories} initialBio={candidateProfile?.bio ?? null} />
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-neutral-900">Education</h2>
          <div className="mt-3">
            <EducationSection education={education} />
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-neutral-900">Work experience</h2>
          <div className="mt-3">
            <ExperienceSection experience={experience} />
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-neutral-900">Certificates &amp; documents</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Upload proof of your skills — degree certificates, training certificates, or portfolio
            documents.
          </p>
          <div className="mt-3">
            <CertificatesSection certificates={certificates} viewUrls={viewUrls} />
          </div>
        </section>
      </div>
    </div>
  );
}
