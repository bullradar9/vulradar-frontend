"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "large";
type LabelKey = "idle" | "addDevice";
type State = "idle" | "loading" | "success" | "error";

type Props = {
  variant?: Variant;
  labelKey?: LabelKey;
};

export function DownloadAgentButton({
  variant = "default",
  labelKey = "idle",
}: Props) {
  const t = useTranslations("agent.download");
  const [state, setState] = useState<State>("idle");

  async function handleClick() {
    setState("loading");
    try {
      const res = await fetch("/api/download-agent");
      if (!res.ok) {
        setState("error");
        window.setTimeout(() => setState("idle"), 5000);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vulnradar-agent.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setState("success");
      window.setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 5000);
    }
  }

  const sizeClasses =
    variant === "large" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";

  const iconSize = variant === "large" ? "h-5 w-5" : "h-4 w-4";

  const label =
    state === "loading"
      ? t("loading")
      : state === "success"
        ? t("success")
        : t(labelKey);

  const Icon =
    state === "loading" ? Loader2 : state === "success" ? Check : Download;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className={cn(
          "inline-flex items-center gap-2 rounded-md bg-brand text-brand-fg font-medium hover:bg-brand-hover transition-colors disabled:opacity-70 disabled:cursor-wait",
          sizeClasses,
        )}
      >
        <Icon
          className={cn(iconSize, state === "loading" && "animate-spin")}
          strokeWidth={2}
        />
        <span>{label}</span>
      </button>
      {state === "error" && (
        <p className="text-xs text-severity-critical">{t("errorGeneric")}</p>
      )}
    </div>
  );
}
