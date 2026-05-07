import { cn } from "@/lib/utils";

export type SeverityLevel = "critical" | "high" | "medium" | "low";

const DOT_COLOR: Record<SeverityLevel, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
};

export const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

type SeverityDotProps = {
  level: SeverityLevel;
  className?: string;
};

export function SeverityDot({ level, className }: SeverityDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        DOT_COLOR[level],
        className,
      )}
    />
  );
}

export function isSeverityLevel(value: unknown): value is SeverityLevel {
  return (
    value === "critical" ||
    value === "high" ||
    value === "medium" ||
    value === "low"
  );
}
