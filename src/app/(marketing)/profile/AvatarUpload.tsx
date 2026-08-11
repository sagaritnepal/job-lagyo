"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { uploadAvatarAction, type ProfileActionState } from "./actions";
import { PhotoCropper } from "./PhotoCropper";

const initialState: ProfileActionState = {};

export function AvatarUpload({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const [state, formAction, pending] = useActionState(uploadAvatarAction, initialState);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  function onRawFileChosen(file: File) {
    setCropSrc(URL.createObjectURL(file));
  }

  function onCropConfirm(blob: Blob) {
    setCropSrc(null);
    const fd = new FormData();
    fd.set("avatar", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    startTransition(() => formAction(fd));
  }

  return (
    <div className="shrink-0">
      <div className="relative h-16 w-16">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo, not an optimizable static asset
          <img src={avatarUrl} alt={name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
            {initial}
          </div>
        )}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={pending}
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          aria-label="Take a new profile photo"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={pending}
        className="mt-1.5 block text-[11px] font-medium text-primary-700 hover:underline disabled:opacity-60"
      >
        Upload photo
      </button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
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
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onRawFileChosen(file);
          e.target.value = "";
        }}
      />

      {pending && <p className="mt-1 w-24 text-[11px] text-neutral-500">Uploading...</p>}
      {state.error && <p className="mt-1 w-24 text-[11px] text-red-600">{state.error}</p>}

      {cropSrc && (
        <PhotoCropper src={cropSrc} onCancel={() => setCropSrc(null)} onConfirm={onCropConfirm} />
      )}
    </div>
  );
}
