import Link from "next/link";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { CountUpNumber } from "./CountUpNumber";

export function StatCard({
  label,
  value,
  deltaPct,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  deltaPct: number | null;
  icon: LucideIcon;
  href?: string;
}) {
  const className =
    "group block rounded-lg border border-neutral-200 bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md";

  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">{label}</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition group-hover:bg-primary-100">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-neutral-900">
        <CountUpNumber value={value} />
      </p>
      {deltaPct !== null && (
        <p
          className={`mt-0.5 flex items-center gap-1 text-[11px] font-semibold ${
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
