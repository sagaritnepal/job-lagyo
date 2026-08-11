"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Rect = { x: number; y: number; w: number; h: number };
type Handle = "nw" | "ne" | "sw" | "se" | "move";

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export function PhotoCropper({
  src,
  onCancel,
  onConfirm,
}: {
  src: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [busy, setBusy] = useState(false);
  const dragRef = useRef<{ handle: Handle; startX: number; startY: number; startRect: Rect } | null>(
    null,
  );

  function initRect() {
    const img = imgRef.current;
    if (!img) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    const pad = 0.08;
    setRect({ x: w * pad, y: h * pad, w: w * (1 - 2 * pad), h: h * (1 - 2 * pad) });
  }

  function onHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!rect) return;
    const handle = e.currentTarget.dataset.handle as Handle;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startRect: rect };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    const img = imgRef.current;
    if (!drag || !img) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const boundsW = img.clientWidth;
    const boundsH = img.clientHeight;
    const start = drag.startRect;
    let { x, y, w, h } = start;

    if (drag.handle === "move") {
      x = clamp(start.x + dx, 0, boundsW - w);
      y = clamp(start.y + dy, 0, boundsH - h);
    } else {
      if (drag.handle.includes("w")) {
        const newX = clamp(start.x + dx, 0, start.x + start.w - 40);
        w = start.w - (newX - start.x);
        x = newX;
      }
      if (drag.handle.includes("e")) {
        w = clamp(start.w + dx, 40, boundsW - start.x);
      }
      if (drag.handle.includes("n")) {
        const newY = clamp(start.y + dy, 0, start.y + start.h - 40);
        h = start.h - (newY - start.y);
        y = newY;
      }
      if (drag.handle.includes("s")) {
        h = clamp(start.h + dy, 40, boundsH - start.y);
      }
    }
    setRect({ x, y, w, h });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function confirmCrop() {
    const img = imgRef.current;
    if (!img || !rect) return;
    setBusy(true);
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.w * scaleX);
    canvas.height = Math.round(rect.h * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.drawImage(
      img,
      rect.x * scaleX,
      rect.y * scaleY,
      rect.w * scaleX,
      rect.h * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(
      (blob) => {
        setBusy(false);
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4">
      <div className="flex items-center justify-between text-white">
        <p className="text-sm font-semibold">Drag the corners to crop, then confirm</p>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 hover:bg-white/10"
          aria-label="Cancel crop"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-1 items-center justify-center overflow-hidden">
        <div
          className="relative inline-block touch-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Captured document"
            className="max-h-[70vh] max-w-full select-none"
            onLoad={initRect}
            draggable={false}
          />
          {rect && (
            <>
              <div
                data-handle="move"
                className="absolute cursor-move border-2 border-primary-500"
                style={{
                  left: rect.x,
                  top: rect.y,
                  width: rect.w,
                  height: rect.h,
                  boxShadow: "0 0 0 2000px rgba(0,0,0,0.55)",
                }}
                onPointerDown={onHandlePointerDown}
              />
              {(["nw", "ne", "sw", "se"] as const).map((h) => (
                <div
                  key={h}
                  data-handle={h}
                  onPointerDown={onHandlePointerDown}
                  className="absolute h-5 w-5 touch-none rounded-full border-2 border-white bg-primary-600"
                  style={{
                    left: h.includes("w") ? rect.x - 10 : rect.x + rect.w - 10,
                    top: h.includes("n") ? rect.y - 10 : rect.y + rect.h - 10,
                    cursor: h === "nw" || h === "se" ? "nwse-resize" : "nesw-resize",
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/30 px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmCrop}
          disabled={!rect || busy}
          className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {busy ? "Cropping..." : "Use Photo"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
