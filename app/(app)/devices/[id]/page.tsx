import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DevicePage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("devices.detail");

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-medium tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-text-muted">{t("placeholder")}</p>
      </header>

      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-wider text-text-subtle">id</p>
        <p className="mt-1 font-mono text-sm break-all">{id}</p>
      </div>
    </div>
  );
}
