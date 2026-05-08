import type { ReactNode } from "react";
import { ShieldCheck, Inbox } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { DownloadAgentButton } from "@/components/DownloadAgentButton";
import { SmartScreenNotice } from "@/components/SmartScreenNotice";
import {
  countAlertsOpen,
  countByAlertType,
  countCriticalOpen,
  countCveBySeverity,
  countDevices,
  countKevOpen,
  fetchOpenAlertDeviceIds,
  fetchTopAlerts,
  fetchTopDevices,
  type TopAlert,
  type TopDevice,
} from "@/lib/queries/dashboard";

import {
  Card,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import {
  isSeverityLevel,
  SeverityDot,
  type SeverityLevel,
} from "@/components/ui/SeverityDot";
import {
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber, formatRelativeTime } from "@/lib/format";

type DashboardT = Awaited<ReturnType<typeof getTranslations<"dashboard">>>;

type DeviceWithAlertCount = TopDevice & { open_alert_count: number };

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const supabase = await createClient();

  // Promise.all paraliza las 13 queries — no hay cascada.
  // Cada una está sujeta a RLS por tenant_id = auth.uid() (D021).
  const [
    alertsOpen,
    criticalOpen,
    kevOpen,
    deviceCount,
    cveCritical,
    cveHigh,
    cveMedium,
    cveLow,
    eolOpen,
    outdatedOpen,
    topAlerts,
    topDevices,
    alertDeviceRefs,
  ] = await Promise.all([
    countAlertsOpen(supabase),
    countCriticalOpen(supabase),
    countKevOpen(supabase),
    countDevices(supabase),
    countCveBySeverity(supabase, "critical"),
    countCveBySeverity(supabase, "high"),
    countCveBySeverity(supabase, "medium"),
    countCveBySeverity(supabase, "low"),
    countByAlertType(supabase, "eol"),
    countByAlertType(supabase, "outdated"),
    fetchTopAlerts(supabase),
    fetchTopDevices(supabase),
    fetchOpenAlertDeviceIds(supabase),
  ]);

  const cveOpen = cveCritical + cveHigh + cveMedium + cveLow;

  const alertsByDevice = alertDeviceRefs.reduce<Record<string, number>>(
    (acc, { device_id }) => {
      acc[device_id] = (acc[device_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const devicesWithCount: DeviceWithAlertCount[] = topDevices.map((d) => ({
    ...d,
    open_alert_count: alertsByDevice[d.id] ?? 0,
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <h1 className="text-2xl font-medium tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-text-muted">{t("subtitle")}</p>
      </header>

      <section
        aria-label={t("title")}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Stat
          label={t("kpi.alertsOpenLabel")}
          value={alertsOpen}
          sublabel={t("kpi.alertsOpenSub")}
          locale={locale}
        />
        <Stat
          label={t("kpi.criticalLabel")}
          value={criticalOpen}
          sublabel={t("kpi.criticalSub")}
          locale={locale}
        />
        <Stat
          label={t("kpi.kevLabel")}
          value={kevOpen}
          sublabel={t("kpi.kevSub")}
          emphasis="critical"
          locale={locale}
        />
        <Stat
          label={t("kpi.devicesLabel")}
          value={deviceCount}
          sublabel={t("kpi.devicesSub")}
          locale={locale}
        />
      </section>

      {deviceCount === 0 ? (
        <NoDevicesEmpty t={t} />
      ) : alertsOpen === 0 ? (
        <NoAlertsBanner t={t} />
      ) : (
        <>
          <section aria-labelledby="pillars-heading" className="space-y-3">
            <h2
              id="pillars-heading"
              className="text-xs font-medium uppercase tracking-wider text-text-subtle"
            >
              {t("pillars.sectionTitle")}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-4">
              <CvePillar
                t={t}
                locale={locale}
                total={cveOpen}
                critical={cveCritical}
                high={cveHigh}
                medium={cveMedium}
                low={cveLow}
              />
              <SimplePillar
                title={t("pillars.eolTitle")}
                count={eolOpen}
                description={t("pillars.eolDescription")}
                locale={locale}
              />
              <SimplePillar
                title={t("pillars.outdatedTitle")}
                count={outdatedOpen}
                description={t("pillars.outdatedDescription")}
                locale={locale}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DevicesPanel devices={devicesWithCount} t={t} locale={locale} />
            <AlertsPanel alerts={topAlerts} t={t} locale={locale} />
          </section>
        </>
      )}
    </div>
  );
}

// =============================================================
// Pilares
// =============================================================

function CvePillar({
  t,
  locale,
  total,
  critical,
  high,
  medium,
  low,
}: {
  t: DashboardT;
  locale: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}) {
  const breakdown: Array<{ level: SeverityLevel; count: number }> = [
    { level: "critical", count: critical },
    { level: "high", count: high },
    { level: "medium", count: medium },
    { level: "low", count: low },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pillars.cveTitle")}</CardTitle>
        <span className="font-mono text-xl font-medium tabular-nums">
          {formatNumber(total, locale)}
        </span>
      </CardHeader>
      <CardBody>
        <div className="border-t border-border -mx-5">
          {breakdown.map(({ level, count }) => (
            <div
              key={level}
              className="flex items-center justify-between px-5 py-2 border-t border-border first:border-t-0"
            >
              <div className="flex items-center gap-2.5">
                <SeverityDot level={level} />
                <span className="text-sm text-text">
                  {t(`severity.${level}`)}
                </span>
              </div>
              <span className="font-mono text-sm tabular-nums text-text-muted">
                {formatNumber(count, locale)}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function SimplePillar({
  title,
  count,
  description,
  locale,
}: {
  title: string;
  count: number;
  description: string;
  locale: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="font-mono text-xl font-medium tabular-nums">
          {formatNumber(count, locale)}
        </span>
      </CardHeader>
      <CardBody>
        <CardSubtitle className="leading-relaxed">{description}</CardSubtitle>
      </CardBody>
    </Card>
  );
}

// =============================================================
// Tabla de equipos
// =============================================================

function DevicesPanel({
  devices,
  t,
  locale,
}: {
  devices: DeviceWithAlertCount[];
  t: DashboardT;
  locale: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("devicesPanel.title")}</CardTitle>
      </CardHeader>
      <Table>
        <THead>
          <Tr className="border-t-0">
            <Th>{t("devicesPanel.headerDevice")}</Th>
            <Th>{t("devicesPanel.headerOs")}</Th>
            <Th>{t("devicesPanel.headerLastSeen")}</Th>
            <Th className="text-right">{t("devicesPanel.headerAlerts")}</Th>
          </Tr>
        </THead>
        <TBody>
          {devices.map((d) => (
            <Tr key={d.id}>
              <Td className="font-medium text-text">{d.device_name}</Td>
              <Td className="text-text-muted">{d.os}</Td>
              <Td className="text-text-muted">
                {d.last_scanned
                  ? formatRelativeTime(d.last_scanned, locale)
                  : t("devicesPanel.never")}
              </Td>
              <Td className="text-right font-mono tabular-nums">
                {formatNumber(d.open_alert_count, locale)}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}

// =============================================================
// Lista de alertas
// =============================================================

function AlertsPanel({
  alerts,
  t,
  locale: _locale,
}: {
  alerts: TopAlert[];
  t: DashboardT;
  locale: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("alertsPanel.title")}</CardTitle>
      </CardHeader>
      <ul role="list" className="border-t border-border">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="flex items-start gap-3 px-5 py-3 border-t border-border first:border-t-0"
          >
            <div className="flex flex-col gap-1 shrink-0 mt-0.5">
              <Badge variant={alertTypeVariant(alert.alert_type)}>
                {alert.alert_type}
              </Badge>
              {alert.in_cisa_kev && (
                <Badge variant="kev">{t("alertsPanel.kevBadge")}</Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text truncate">
                {alert.software_name}
              </div>
              <div className="text-xs text-text-subtle font-mono mt-0.5 truncate">
                {alertDetail(alert, t)}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isSeverityLevel(alert.cvss_severity) && (
                <SeverityDot level={alert.cvss_severity} />
              )}
              <span className="font-mono text-sm tabular-nums text-text">
                {alert.priority_score.toFixed(1)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function alertTypeVariant(
  alertType: string,
): "cve" | "eol" | "outdated" | "neutral" {
  if (alertType === "cve" || alertType === "eol" || alertType === "outdated") {
    return alertType;
  }
  return "neutral";
}

function alertDetail(alert: TopAlert, t: DashboardT): ReactNode {
  if (alert.alert_type === "cve") {
    return alert.cve_id ?? "—";
  }
  if (alert.alert_type === "outdated") {
    const from = alert.software_version ?? "?";
    const to = alert.latest_stable ?? "?";
    return `${from} → ${to}`;
  }
  if (alert.alert_type === "eol") {
    return alert.latest_version
      ? `${alert.software_name} ${alert.latest_version}`
      : t("alertsPanel.eolNoSupport");
  }
  return alert.software_version ?? "—";
}

// =============================================================
// Empty states
// =============================================================

function NoDevicesEmpty({ t }: { t: DashboardT }) {
  return (
    <Card>
      <EmptyState
        icon={ShieldCheck}
        title={t("empty.noDevicesTitle")}
        description={t("empty.noDevicesDescription")}
        action={
          <div className="flex flex-col items-center">
            <DownloadAgentButton variant="large" />
            <SmartScreenNotice />
          </div>
        }
      />
    </Card>
  );
}

function NoAlertsBanner({ t }: { t: DashboardT }) {
  return (
    <Card>
      <EmptyState
        icon={Inbox}
        title={t("empty.noAlertsTitle")}
        description={t("empty.noAlertsDescription")}
      />
    </Card>
  );
}
