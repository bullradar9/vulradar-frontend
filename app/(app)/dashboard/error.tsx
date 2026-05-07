"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError(_props: DashboardErrorProps) {
  const t = useTranslations("dashboard.error");

  return (
    <EmptyState
      icon={AlertTriangle}
      title={t("title")}
      description={t("description")}
      action={
        <button
          type="button"
          onClick={() => _props.reset()}
          className="rounded-md bg-brand text-brand-fg px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors"
        >
          {t("retry")}
        </button>
      }
    />
  );
}
