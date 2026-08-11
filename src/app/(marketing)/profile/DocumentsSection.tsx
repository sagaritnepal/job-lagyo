import { CANDIDATE_DOCUMENT_SLOTS } from "@/lib/constants";
import { DocumentSlot } from "./DocumentSlot";
import type { CandidateDocument } from "@/lib/types";

export function DocumentsSection({
  documents,
  viewUrls,
}: {
  documents: CandidateDocument[];
  viewUrls: Map<string, string>;
}) {
  return (
    <div className="space-y-2.5">
      {CANDIDATE_DOCUMENT_SLOTS.map((slot) => {
        const doc = documents.find((d) => d.doc_type === slot.type) ?? null;
        return (
          <DocumentSlot
            key={slot.type}
            docType={slot.type}
            label={slot.label}
            hint={slot.hint}
            hasDocument={doc !== null}
            viewUrl={doc ? (viewUrls.get(doc.doc_type) ?? null) : null}
          />
        );
      })}
    </div>
  );
}
