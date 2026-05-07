import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

type StatProps = {
  label: string;
  value: number | string;
  sublabel?: string;
  emphasis?: "default" | "critical";
  locale?: string;
};

export function Stat({
  label,
  value,
  sublabel,
  emphasis = "default",
  locale = "en",
}: StatProps) {
  const display =
    typeof value === "number" ? formatNumber(value, locale) : value;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-4xl font-medium tabular-nums tracking-tight leading-none",
          emphasis === "critical" ? "text-severity-critical" : "text-text",
        )}
      >
        {display}
      </p>
      {sublabel && (
        <p className="mt-2 text-xs text-text-muted">{sublabel}</p>
      )}
    </div>
  );
}
