"use client";

import { useEffect, useRef, useState } from "react";

// Eases a stat from 0 to its real value on mount/update so dashboards feel
// alive rather than static — purely cosmetic, the real value is always what
// gets shown at rest. Only ever receives a plain number, so it stays safe
// to call from a Server Component parent (unlike passing icon components
// across the server/client boundary).
export function CountUpNumber({ value, durationMs = 650 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value, durationMs]);

  return <>{display.toLocaleString()}</>;
}
