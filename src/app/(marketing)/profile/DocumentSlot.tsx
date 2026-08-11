"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, FileText, Upload } from "lucide-react";
import { uploadDocumentAction, type ProfileActionState } from "./actions";
import { PhotoCropper } from "./PhotoCropper";
import type { CandidateDocumentType } from "@/lib/types";

const initialState: ProfileActionState = {};

export function DocumentSlot({
  docType,
  label,
  hint,
  hasDocument,
  viewUrl,
}: {
  docType: CandidateDocumentType;
  label: string;
  hint: string;
  hasDocument: boolean;
  viewUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, initialState);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function submitFile(file: File) {
    const fd = new FormData();
    fd.set("doc_type", docType);
    fd.set("document", file);
    formAction(fd);
  }

  function onRawFileChosen(file: File) {
    if (file.type.startsWith("image/")) {
      setCropSrc(URL.createObjectURL(file));
    } else {
      submitFile(file);
    }
  }

  function onCropConfirm(blob: Blob) {
    setCropSrc(null);
    submitFile(new File([blob], `${docType}.jpg`, { type: "image/jpeg" }));
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{label}</p>
          <p className="text-xs text-neutral-500">{hint}</p>
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
            >
              <FileText className="h-3 w-3" /> View uploaded document
            </a>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
            hasDocument ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {hasDocument ? "Uploaded" : "Required"}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
        >
          <Camera className="h-3.5 w-3.5" /> {hasDocument ? "Retake photo" : "Take photo"}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" /> Upload file
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onRawFileChosen(file);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onRawFileChosen(file);
          e.target.value = "";
        }}
      />

      {pending && <p className="mt-2 text-xs text-neutral-500">Uploading...</p>}
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}

      {cropSrc && (
        <PhotoCropper
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={onCropConfirm}
        />
      )}
    </div>
  );
}
