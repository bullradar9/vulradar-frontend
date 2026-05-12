"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";

export function PrintButton() {
  const t = useTranslations("report");
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-brand-fg hover:bg-brand-hover transition-colors"
    >
      <Printer className="h-4 w-4" strokeWidth={1.75} />
      <span>{t("exportPdf")}</span>
    </button>
  );
}
