import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "cve" | "eol" | "outdated" | "kev" | "neutral";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider leading-none",
        variant === "kev" && "bg-severity-critical text-white",
        (variant === "cve" || variant === "eol" || variant === "outdated") &&
          "border border-border-strong text-text-muted",
        variant === "neutral" && "border border-border text-text-subtle",
        className,
      )}
    >
      {children}
    </span>
  );
}
