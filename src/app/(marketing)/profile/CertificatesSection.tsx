"use client";

import { useActionState, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { uploadCertificateAction, deleteCertificateAction, type ProfileActionState } from "./actions";
import type { CandidateCertificate } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500";
const labelClass = "text-sm font-medium text-neutral-700";
const initialState: ProfileActionState = {};

export function CertificatesSection({
  certificates,
  viewUrls,
}: {
  certificates: CandidateCertificate[];
  viewUrls: Map<string, string>;
}) {
  const [adding, setAdding] = useState(false);
  const [state, formAction, pending] = useActionState(uploadCertificateAction, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {certificates.length > 0 && (
        <ul className="space-y-2">
          {certificates.map((c) => {
            const url = viewUrls.get(c.id);
            return (
              <li
                key={c.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{c.title}</p>
                  {c.issuer && <p className="text-sm text-neutral-600">{c.issuer}</p>}
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
                    >
                      <FileText className="h-3 w-3" /> View document
                    </a>
                  )}
                </div>
                <form action={deleteCertificateAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="document_path" value={c.document_path} />
                  <button
                    type="submit"
                    className="text-neutral-400 hover:text-red-600"
                    aria-label="Delete certificate"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {adding ? (
        <form action={formAction} className="space-y-3 rounded-lg border border-neutral-200 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input type="text" name="title" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Issuer (optional)</label>
              <input type="text" name="issuer" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Issue date (optional)</label>
            <input type="date" name="issue_date" className={inputClass} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-500 hover:border-primary-400 hover:bg-primary-50/50">
            <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="flex-1 truncate">
              {fileName ?? (
                <>
                  <span className="font-medium text-neutral-700">Attach document</span> — PDF,
                  JPG, or PNG, up to 5MB
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
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {pending ? "Uploading..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"
        >
          <Plus className="h-4 w-4" /> Add certificate / document
        </button>
      )}
    </div>
  );
}
