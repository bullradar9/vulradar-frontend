import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("intro")}</p>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">{t("preview")}</p>
      </div>
    </div>
  );
}
