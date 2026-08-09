import type { Metadata } from "next";
import { getAuthUser } from "@/lib/supabase/auth";
import { getCompanyByOwner, getCompanyVerificationDocuments } from "@/lib/data/companyVerification";
import { getCompanyDocumentSignedUrl } from "@/lib/supabase/storage";
import { CompanyDetailsForm } from "./CompanyDetailsForm";
import { VerificationSection } from "./VerificationSection";

export const metadata: Metadata = {
  title: "Company — Job Lagyo",
  robots: { index: false, follow: false },
};

export default async function CompanyPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const company = await getCompanyByOwner(user.id);
  const documents = company ? await getCompanyVerificationDocuments(company.id) : [];

  const viewUrlEntries = await Promise.all(
    documents.map(
      async (d) => [d.id, await getCompanyDocumentSignedUrl(d.file_path)] as const,
    ),
  );
  const viewUrls = new Map(
    viewUrlEntries.filter((entry): entry is [string, string] => entry[1] !== null),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Company</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {company
          ? "Manage your company profile and business verification."
          : "Set up your company profile to start posting jobs."}
      </p>

      <div className="mt-6 max-w-2xl space-y-8">
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-neutral-900">Company details</h2>
          <div className="mt-3">
            <CompanyDetailsForm company={company} />
          </div>
        </section>

        {company && (
          <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
            <h2 className="font-semibold text-neutral-900">VAT / PAN verification</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Job posting is enabled once an admin verifies your VAT and PAN registration
              documents.
            </p>
            <div className="mt-3">
              <VerificationSection company={company} documents={documents} viewUrls={viewUrls} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
