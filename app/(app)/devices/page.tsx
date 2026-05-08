import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import {
  fetchOpenAlertStats,
  listDevices,
  mergeDeviceStats,
} from "@/lib/queries/devices";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DownloadAgentButton } from "@/components/DownloadAgentButton";
import { SmartScreenNotice } from "@/components/SmartScreenNotice";
import { DeviceTable } from "./DeviceTable";

export default async function DevicesPage() {
  const t = await getTranslations("devices");
  const supabase = await createClient();

  const [devices, alertRefs] = await Promise.all([
    listDevices(supabase),
    fetchOpenAlertStats(supabase),
  ]);

  const rows = mergeDeviceStats(devices, alertRefs);

  if (rows.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl">
        <header>
          <h1 className="text-2xl font-medium tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("subtitle", { count: 0 })}
          </p>
        </header>

        <Card>
          <EmptyState
            icon={ShieldCheck}
            title={t("empty.title")}
            description={t("empty.description")}
            action={
              <div className="flex flex-col items-center">
                <DownloadAgentButton variant="large" />
                <SmartScreenNotice />
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("subtitle", { count: rows.length })}
          </p>
        </div>
        <div className="shrink-0">
          <SmartScreenNotice>
            <DownloadAgentButton labelKey="addDevice" />
          </SmartScreenNotice>
        </div>
      </header>

      <DeviceTable rows={rows} />
    </div>
  );
}
