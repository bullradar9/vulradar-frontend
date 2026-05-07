"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { setLocale } from "@/app/actions/locale";
import { isLocale } from "@/i18n/config";

export function LocaleSwitcher() {
  const current = useLocale();
  const t = useTranslations("locale");
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-1.5 text-text-muted text-sm">
      <Languages
        className="h-4 w-4"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="sr-only">{t("label")}</span>
      <select
        value={current}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          if (!isLocale(next) || next === current) return;
          startTransition(() => {
            setLocale(next);
          });
        }}
        aria-label={t("label")}
        className="bg-transparent text-sm text-text-muted hover:text-text focus:outline-none focus:ring-2 focus:ring-brand/30 rounded-md px-1 py-0.5 disabled:opacity-60"
      >
        <option value="en">{t("en")}</option>
        <option value="es">{t("es")}</option>
      </select>
    </label>
  );
}
