"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

// Eases a stat from 0 to its real value on mount/update so dashboards feel
// alive rather than static — purely cosmetic, the real value is always what
// gets shown at rest.
function useCountUp(value: number, durationMs = 650) {
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

  return display;
}

export function StatCard({
  label,
  value,
  deltaPct,
  icon: Icon,
}: {
  label: string;
  value: number;
  deltaPct: number | null;
  icon: LucideIcon;
}) {
  const animatedValue = useCountUp(value);

  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition group-hover:bg-primary-100">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-extrabold tabular-nums text-neutral-900">
        {animatedValue.toLocaleString()}
      </p>
      {deltaPct !== null && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-semibold ${
            deltaPct >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {deltaPct >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {Math.abs(deltaPct)}% <span className="font-normal text-neutral-400">vs last month</span>
        </p>
      )}
    </div>
  );
}
