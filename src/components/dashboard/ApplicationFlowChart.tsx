import type { MonthlyTrendPoint } from "@/lib/data/dashboard";

export function ApplicationFlowChart({ points }: { points: MonthlyTrendPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.count));

  return (
    <div className="flex h-40 items-end gap-3 px-1">
      {points.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary-600"
              style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
              title={`${point.count} applications`}
            />
          </div>
          <span className="text-xs text-neutral-400">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
