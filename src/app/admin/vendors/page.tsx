import { MapPin, FileText } from "lucide-react";
import { getVendors } from "@/lib/data/admin";
import { getCompanyDocumentSignedUrl } from "@/lib/supabase/storage";
import { CompanyBadge } from "@/components/CompanyBadge";
import { BlacklistButton } from "./BlacklistButton";
import { VerificationActions } from "./VerificationActions";

export const metadata = {
  title: "Vendors — Job Lagyo Admin",
};

const VERIFICATION_META: Record<string, { label: string; className: string }> = {
  unverified: { label: "Not submitted", className: "bg-neutral-100 text-neutral-600" },
  pending: { label: "Pending review", className: "bg-amber-50 text-amber-700" },
  verified: { label: "Verified", className: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700" },
};

const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  vat_certificate: "VAT certificate",
  pan_certificate: "PAN certificate",
  registration_certificate: "Registration certificate",
  other: "Other document",
};

export default async function AdminVendorsPage() {
  const vendors = await getVendors();

  const allDocuments = vendors.flatMap((v) => v.verification_documents);
  const viewUrlEntries = await Promise.all(
    allDocuments.map(
      async (d) => [d.id, await getCompanyDocumentSignedUrl(d.file_path)] as const,
    ),
  );
  const viewUrls = new Map(
    viewUrlEntries.filter((entry): entry is [string, string] => entry[1] !== null),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        Vendors {vendors.length > 0 && `(${vendors.length})`}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Blacklist employers who post fraudulent offers or ignore applicants after they said
        they&apos;d respond.
      </p>

      {vendors.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          No vendors yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className={`rounded-xl border bg-white p-4 sm:p-5 ${
                vendor.is_blacklisted ? "border-red-200" : "border-neutral-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CompanyBadge name={vendor.name} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-neutral-900">{vendor.name}</p>
                      {vendor.is_blacklisted && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                          Blacklisted
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="h-3 w-3" /> {vendor.location}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {vendor.job_count} job{vendor.job_count === 1 ? "" : "s"} posted &middot;{" "}
                      {vendor.total_application_count} application
                      {vendor.total_application_count === 1 ? "" : "s"} received
                    </p>
                    {vendor.is_blacklisted && vendor.blacklist_reason && (
                      <p className="mt-2 max-w-xl text-sm text-red-700">
                        {vendor.blacklist_reason}
                      </p>
                    )}
                  </div>
                </div>
                <BlacklistButton companyId={vendor.id} isBlacklisted={vendor.is_blacklisted} />
              </div>

              <div className="mt-4 border-t border-neutral-100 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    VAT/PAN verification
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      VERIFICATION_META[vendor.verification_status].className
                    }`}
                  >
                    {VERIFICATION_META[vendor.verification_status].label}
                  </span>
                </div>

                {(vendor.vat_number || vendor.pan_number) && (
                  <p className="mt-1.5 text-sm text-neutral-600">
                    {vendor.vat_number && `VAT: ${vendor.vat_number}`}
                    {vendor.vat_number && vendor.pan_number && " · "}
                    {vendor.pan_number && `PAN: ${vendor.pan_number}`}
                  </p>
                )}

                {vendor.verification_documents.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-3">
                    {vendor.verification_documents.map((doc) => {
                      const url = viewUrls.get(doc.id);
                      if (!url) return null;
                      return (
                        <li key={doc.id}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            {DOCUMENT_TYPE_LABEL[doc.document_type] ?? doc.document_type}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {vendor.verification_status === "rejected" && vendor.verification_rejection_reason && (
                  <p className="mt-2 text-sm text-red-700">
                    Rejected: {vendor.verification_rejection_reason}
                  </p>
                )}

                {vendor.verification_status === "pending" && (
                  <div className="mt-3">
                    <VerificationActions companyId={vendor.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
