const PALETTE = [
  "bg-primary-600",
  "bg-accent-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-rose-600",
  "bg-amber-600",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function CompanyBadge({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  return (
    <span
      className={`flex ${dimension} shrink-0 items-center justify-center rounded-lg font-bold text-white ${colorFor(name)}`}
    >
      {initialsFor(name)}
    </span>
  );
}
