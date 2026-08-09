"use client";

import { useActionState, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import {
  uploadVerificationDocumentAction,
  deleteVerificationDocumentAction,
  submitForVerificationAction,
  type CompanyActionState,
} from "./actions";
import type { Company, CompanyVerificationDocument, VerificationStatus } from "@/lib/types";

const initialState: CompanyActionState = {};
const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
const labelClass = "text-sm font-medium text-neutral-700";

const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "vat_certificate", label: "VAT registration certificate" },
  { value: "pan_certificate", label: "PAN registration certificate" },
  { value: "registration_certificate", label: "Company registration certificate" },
  { value: "other", label: "Other supporting document" },
];

const STATUS_META: Record<VerificationStatus, { label: string; className: string }> = {
  unverified: { label: "Not submitted", className: "bg-neutral-100 text-neutral-600" },
  pending: { label: "Pending review", className: "bg-amber-50 text-amber-700" },
  verified: { label: "Verified", className: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700" },
};

function DocumentUploadForm() {
  const [state, formAction, pending] = useActionState(uploadVerificationDocumentAction, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-neutral-200 p-3">
      <div>
        <label className={labelClass}>Document type</label>
        <select name="document_type" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select document type
          </option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-500 hover:border-primary-400 hover:bg-primary-50/50">
        <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
        <span className="flex-1 truncate">
          {fileName ?? (
            <>
              <span className="font-medium text-neutral-700">Attach document</span> — PDF, JPG, or
              PNG, up to 5MB
            </>
          )}
        </span>
        <input
          type="file"
          name="document"
          required
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-800 px-4 py-1.5 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload document"}
      </button>
    </form>
  );
}

export function VerificationSection({
  company,
  documents,
  viewUrls,
}: {
  company: Company;
  documents: CompanyVerificationDocument[];
  viewUrls: Map<string, string>;
}) {
  const [state, formAction, pending] = useActionState(submitForVerificationAction, initialState);
  const meta = STATUS_META[company.verification_status];
  const canEditAndSubmit =
    company.verification_status === "unverified" || company.verification_status === "rejected";

  return (
    <div className="space-y-4">
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
        {meta.label}
      </span>

      {company.verification_status === "rejected" && company.verification_rejection_reason && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {company.verification_rejection_reason}
        </p>
      )}

      {company.verification_status === "pending" && (
        <p className="text-sm text-neutral-500">
          Your documents are under review. We&apos;ll notify you once verification is complete.
        </p>
      )}

      {company.verification_status === "verified" && (
        <p className="text-sm text-neutral-500">
          Your business is verified — you can post jobs.
        </p>
      )}

      <div>
        <h3 className="text-sm font-semibold text-neutral-800">Documents</h3>
        {documents.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {documents.map((doc) => {
              const url = viewUrls.get(doc.id);
              const label = DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label ?? doc.document_type;
              return (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{label}</p>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary-700 hover:underline"
                      >
                        View document
                      </a>
                    )}
                  </div>
                  {canEditAndSubmit && (
                    <form action={deleteVerificationDocumentAction}>
                      <input type="hidden" name="id" value={doc.id} />
                      <input type="hidden" name="file_path" value={doc.file_path} />
                      <button
                        type="submit"
                        className="text-neutral-400 hover:text-red-600"
                        aria-label="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-neutral-500">No documents uploaded yet.</p>
        )}
      </div>

      {canEditAndSubmit && (
        <>
          <DocumentUploadForm />

          <form action={formAction} className="space-y-3 rounded-lg border border-neutral-200 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>VAT registration number</label>
                <input
                  type="text"
                  name="vat_number"
                  required
                  defaultValue={company.vat_number ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>PAN registration number</label>
                <input
                  type="text"
                  name="pan_number"
                  required
                  defaultValue={company.pan_number ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-accent-600 px-5 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
            >
              {pending ? "Submitting..." : "Submit for verification"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
