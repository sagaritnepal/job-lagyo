import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
import { getCandidateProfileBundle } from "@/lib/data/candidateProfile";
import { getCandidateDocumentSignedUrl } from "@/lib/supabase/storage";
import type { CandidateDocumentType } from "@/lib/types";
import { LogoutButton } from "@/components/LogoutButton";
import { AvatarUpload } from "./AvatarUpload";
import { CategorySelector } from "./CategorySelector";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { DocumentsSection } from "./DocumentsSection";

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
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "employer") redirect("/dashboard/company");
  if (profile?.role === "admin") redirect("/admin");

  const { profile: candidateProfile, education, experience, documents } =
    await getCandidateProfileBundle(user.id);

  const viewUrlEntries = await Promise.all(
    documents.map(
      async (d) => [d.doc_type, await getCandidateDocumentSignedUrl(d.document_path)] as const,
    ),
  );
  const viewUrls = new Map(
    viewUrlEntries.filter(
      (entry): entry is [CandidateDocumentType, string] => entry[1] !== null,
    ),
  );

  const categories = candidateProfile?.categories ?? [];
  const checklist = [
    { label: "Field of expertise", done: categories.length > 0 },
    { label: "Education", done: education.length > 0 },
    { label: "Work experience", done: experience.length > 0 },
    { label: "Required documents", done: documents.length === 3 },
  ];
  const completedCount = checklist.filter((c) => c.done).length;
  const completionPct = Math.round((completedCount / checklist.length) * 100);
  const canApply = checklist[0].done && checklist[1].done;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">My Profile</h1>
      <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
        Complete your profile so employers can trust who you are — a field of expertise and at
        least one education entry are required before you can apply to jobs.
      </p>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Account</h2>
        <div className="mt-3 flex items-center gap-4">
          <AvatarUpload
            avatarUrl={profile?.avatar_url ?? null}
            name={profile?.full_name ?? user.email ?? "?"}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {profile?.full_name ?? "—"}
            </p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-neutral-100 pt-3">
          <LogoutButton />
        </div>
      </div>

      <div className="mt-3.5 rounded-lg border border-neutral-200 bg-white p-3.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">Profile strength</p>
          <span className="text-sm font-bold text-primary-700">{completionPct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5 text-xs">
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
              )}
              <span className={item.done ? "text-neutral-700" : "text-neutral-500"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        {!canApply && (
          <p className="mt-2.5 text-xs text-amber-700">
            Add your field of expertise and at least one education entry to unlock applying to
            jobs.
          </p>
        )}
      </div>

      <div className="mt-5 space-y-5">
        <section className="rounded-lg border border-neutral-200 bg-white p-3.5 sm:p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Field of expertise</h2>
          <div className="mt-2.5">
            <CategorySelector initialCategories={categories} initialBio={candidateProfile?.bio ?? null} />
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-3.5 sm:p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Education</h2>
          <div className="mt-2.5">
            <EducationSection education={education} />
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-3.5 sm:p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Work experience</h2>
          <div className="mt-2.5">
            <ExperienceSection experience={experience} />
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-3.5 sm:p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Documents</h2>
          <p className="mt-1 text-xs text-neutral-500">
            3 documents are required — take a photo or upload a file for each.
          </p>
          <div className="mt-2.5">
            <DocumentsSection documents={documents} viewUrls={viewUrls} />
          </div>
        </section>
      </div>
    </div>
  );
}
