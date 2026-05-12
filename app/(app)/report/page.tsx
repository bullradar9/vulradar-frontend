import { getLocale, getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import {
  countByAlertType,
  countCriticalOpen,
  countDevices,
  countKevOpen,
} from "@/lib/queries/dashboard";
import {
  fetchOpenAlertStats,
  listDevices,
  mergeDeviceStats,
  type DeviceWithStats,
} from "@/lib/queries/devices";
import {
  computeRemediationStats,
  fetchReportEolSoftware,
  fetchReportTopAlerts,
  mockPatchedCriticalResolutions,
  resolutionDays,
  type PatchedCriticalRow,
  type RemediationStats,
  type ReportAlert,
  type ReportEolItem,
} from "@/lib/queries/report";
import {
  ARTICLE_21_MEASURES,
  summarizeCoverage,
  type Article21Coverage,
  type Article21Measure,
} from "@/lib/nis2/article21";
import { formatNumber } from "@/lib/format";
import { PrintButton } from "./PrintButton";

type ReportT = Awaited<ReturnType<typeof getTranslations<"report">>>;

export default async function ReportPage() {
  const t = await getTranslations("report");
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const REMEDIATION_WINDOW_DAYS = 90;

  const [
    deviceCount,
    criticalOpen,
    kevOpen,
    eolOpen,
    devices,
    alertRefs,
    topAlerts,
    eolItems,
  ] = await Promise.all([
    countDevices(supabase),
    countCriticalOpen(supabase),
    countKevOpen(supabase),
    countByAlertType(supabase, "eol"),
    listDevices(supabase),
    fetchOpenAlertStats(supabase),
    fetchReportTopAlerts(supabase, 20),
    fetchReportEolSoftware(supabase),
  ]);

  // MOCK: datos sintéticos para demo (el seed 0002 aún no se ha aplicado).
  const remediationData = mockPatchedCriticalResolutions(
    REMEDIATION_WINDOW_DAYS,
  );

  const deviceRows = mergeDeviceStats(devices, alertRefs);
  const alertsOpen = alertRefs.length;
  const remediation = computeRemediationStats(
    remediationData.rows,
    REMEDIATION_WINDOW_DAYS,
    remediationData.windowStart,
    remediationData.windowEnd,
  );

  const tenantName = user?.email ?? "—";
  const reportDate = new Date();
  const dateLong = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(reportDate);

  const statusSentence = buildStatusSentence(
    t,
    locale,
    deviceCount,
    alertsOpen,
    criticalOpen,
    kevOpen,
  );

  return (
    <div className="report-root">
      {/* Toolbar — solo pantalla */}
      <div className="print:hidden flex items-start justify-between gap-4 max-w-[210mm] mx-auto mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-text-muted">{t("subtitle")}</p>
          <p className="mt-1 text-xs text-text-subtle">{t("exportHint")}</p>
        </div>
        <div className="shrink-0">
          <PrintButton />
        </div>
      </div>

      {/* Documento */}
      <article className="report-doc bg-surface text-text border border-border print:border-0 mx-auto max-w-[210mm] shadow-sm print:shadow-none">
        <Cover
          t={t}
          tenantName={tenantName}
          dateLong={dateLong}
        />
        <PageBody>
          <ExecSummary
            t={t}
            locale={locale}
            deviceCount={deviceCount}
            criticalOpen={criticalOpen}
            kevOpen={kevOpen}
            eolOpen={eolOpen}
            statusSentence={statusSentence}
          />
          <Inventory t={t} locale={locale} devices={deviceRows} />
          <TopAlerts t={t} alerts={topAlerts} />
          <EolSection t={t} locale={locale} items={eolItems} />
          <Remediation
            t={t}
            locale={locale}
            stats={remediation}
            rows={remediationData.rows}
          />
          <Nis2Mapping t={t} />
          <ReportFooter t={t} tenantName={tenantName} dateLong={dateLong} />
        </PageBody>
      </article>
    </div>
  );
}

// =============================================================
// Portada
// =============================================================

function Cover({
  t,
  tenantName,
  dateLong,
}: {
  t: ReportT;
  tenantName: string;
  dateLong: string;
}) {
  return (
    <section className="report-cover px-12 py-16 min-h-[260mm] flex flex-col justify-between">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-subtle">
          {t("cover.kicker")}
        </div>
        <div className="mt-2 h-px w-12 bg-text" aria-hidden />
      </div>

      <div>
        <h1 className="text-4xl font-medium tracking-tight leading-tight max-w-[15ch]">
          {t("cover.title")}
        </h1>
        <p className="mt-3 text-base text-text-muted max-w-[40ch]">
          {t("cover.subtitle")}
        </p>

        <dl className="mt-12 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-text-subtle">{t("cover.tenantLabel")}</dt>
          <dd className="text-text font-medium">{tenantName}</dd>
          <dt className="text-text-subtle">{t("cover.periodLabel")}</dt>
          <dd className="text-text">{dateLong}</dd>
        </dl>
      </div>

      <div className="text-xs text-text-subtle">
        <div>{t("cover.reference")}</div>
        <div className="mt-1">{t("cover.processedIn")}</div>
      </div>
    </section>
  );
}

// =============================================================
// Layout interior con padding consistente
// =============================================================

function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="px-12 py-12 space-y-10">{children}</div>;
}

function SectionHeading({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <header className="report-section-heading flex items-baseline gap-4 border-b border-border pb-2">
      <span className="font-mono text-xs tabular-nums text-text-subtle w-6">
        {String(number).padStart(2, "0")}
      </span>
      <h2 className="text-base font-medium tracking-tight">{title}</h2>
    </header>
  );
}

// =============================================================
// Resumen ejecutivo
// =============================================================

function ExecSummary({
  t,
  locale,
  deviceCount,
  criticalOpen,
  kevOpen,
  eolOpen,
  statusSentence,
}: {
  t: ReportT;
  locale: string;
  deviceCount: number;
  criticalOpen: number;
  kevOpen: number;
  eolOpen: number;
  statusSentence: string;
}) {
  const stats: Array<{ label: string; value: number; emphasis?: boolean }> = [
    { label: t("summary.devices"), value: deviceCount },
    { label: t("summary.criticalOpen"), value: criticalOpen },
    { label: t("summary.kevOpen"), value: kevOpen, emphasis: kevOpen > 0 },
    { label: t("summary.eolOpen"), value: eolOpen },
  ];

  return (
    <section>
      <SectionHeading number={1} title={t("summary.heading")} />
      <div className="mt-5 grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-border rounded p-4 break-inside-avoid"
          >
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">
              {s.label}
            </div>
            <div
              className={
                "mt-1 font-mono text-2xl tabular-nums " +
                (s.emphasis ? "text-severity-critical" : "text-text")
              }
            >
              {formatNumber(s.value, locale)}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-text leading-relaxed max-w-[70ch]">
        {statusSentence}
      </p>
    </section>
  );
}

function buildStatusSentence(
  t: ReportT,
  locale: string,
  deviceCount: number,
  alertsOpen: number,
  criticalOpen: number,
  kevOpen: number,
): string {
  if (deviceCount === 0) return t("summary.statusEmpty");
  if (alertsOpen === 0) return t("summary.statusClean");
  if (kevOpen > 0) {
    return t("summary.statusKev", {
      kev: formatNumber(kevOpen, locale),
      critical: formatNumber(criticalOpen, locale),
    });
  }
  if (criticalOpen > 0) {
    return t("summary.statusCritical", {
      critical: formatNumber(criticalOpen, locale),
    });
  }
  return t("summary.statusOk", { total: formatNumber(alertsOpen, locale) });
}

// =============================================================
// Inventario
// =============================================================

function Inventory({
  t,
  locale,
  devices,
}: {
  t: ReportT;
  locale: string;
  devices: DeviceWithStats[];
}) {
  if (devices.length === 0) {
    return (
      <section className="break-before-page">
        <SectionHeading number={2} title={t("inventory.heading")} />
        <p className="mt-5 text-sm text-text-muted">{t("inventory.empty")}</p>
      </section>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
  });

  return (
    <section className="break-before-page">
      <SectionHeading number={2} title={t("inventory.heading")} />
      <table className="report-table mt-5 w-full text-sm border-collapse">
        <thead>
          <tr className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("inventory.table.device")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("inventory.table.os")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("inventory.table.agent")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("inventory.table.lastSeen")}
            </th>
            <th className="text-right py-2 pr-4 border-b border-border-strong">
              {t("inventory.table.open")}
            </th>
            <th className="text-right py-2 pr-4 border-b border-border-strong">
              {t("inventory.table.crit")}
            </th>
            <th className="text-right py-2 border-b border-border-strong">
              {t("inventory.table.kev")}
            </th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id} className="break-inside-avoid">
              <td className="py-2 pr-4 border-b border-border font-medium">
                {d.device_name}
              </td>
              <td className="py-2 pr-4 border-b border-border text-text-muted">
                {[d.os, d.os_version].filter(Boolean).join(" ")}
              </td>
              <td className="py-2 pr-4 border-b border-border text-text-muted font-mono text-xs">
                {d.agent_version ?? "—"}
              </td>
              <td className="py-2 pr-4 border-b border-border text-text-muted">
                {d.last_scanned
                  ? dateFmt.format(new Date(d.last_scanned))
                  : t("inventory.never")}
              </td>
              <td className="py-2 pr-4 border-b border-border text-right font-mono tabular-nums">
                {formatNumber(d.alerts_open, locale)}
              </td>
              <td className="py-2 pr-4 border-b border-border text-right font-mono tabular-nums">
                {formatNumber(d.critical_open, locale)}
              </td>
              <td className="py-2 border-b border-border text-right font-mono tabular-nums">
                {d.kev_open > 0 ? (
                  <span className="text-severity-critical">
                    {formatNumber(d.kev_open, locale)}
                  </span>
                ) : (
                  formatNumber(d.kev_open, locale)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// =============================================================
// Top alertas (top 20)
// =============================================================

function TopAlerts({ t, alerts }: { t: ReportT; alerts: ReportAlert[] }) {
  return (
    <section className="break-before-page">
      <SectionHeading number={3} title={t("topAlerts.heading")} />
      <p className="mt-3 text-sm text-text-muted max-w-[70ch]">
        {t("topAlerts.intro")}
      </p>

      {alerts.length === 0 ? (
        <p className="mt-5 text-sm text-text-muted">{t("topAlerts.empty")}</p>
      ) : (
        <ol className="mt-5 divide-y divide-border border-y border-border">
          {alerts.map((a) => (
            <li key={a.id} className="py-3 break-inside-avoid flex gap-4">
              <div className="shrink-0 w-20 text-xs">
                <div className="font-mono uppercase tracking-wider text-text-subtle">
                  {a.alert_type}
                </div>
                {a.in_cisa_kev && (
                  <div className="mt-1 inline-flex items-center gap-1 text-severity-critical font-medium">
                    <span aria-hidden>▲</span>
                    <span>{t("topAlerts.kevBadge")}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text">
                  {a.software_name}
                </div>
                <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-text-muted">
                  {a.cve_id && (
                    <Field
                      label={t("topAlerts.labels.cveId")}
                      value={a.cve_id}
                      mono
                    />
                  )}
                  {a.software_version && (
                    <Field
                      label={t("topAlerts.labels.version")}
                      value={a.software_version}
                      mono
                    />
                  )}
                  {a.latest_stable && (
                    <Field
                      label={t("topAlerts.labels.latest")}
                      value={a.latest_stable}
                      mono
                    />
                  )}
                  {a.eol_date && (
                    <Field
                      label={t("topAlerts.labels.eolDate")}
                      value={a.eol_date}
                      mono
                    />
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[10px] uppercase tracking-wider text-text-subtle">
                  {t("topAlerts.priorityLabel")}
                </div>
                <div className="font-mono text-base tabular-nums text-text">
                  {a.priority_score.toFixed(1)}
                </div>
                {a.cvss_severity && (
                  <div className="text-[10px] uppercase tracking-wider text-text-muted">
                    {a.cvss_severity}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="truncate">
      <span className="text-text-subtle">{label}: </span>
      <span className={mono ? "font-mono text-text" : "text-text"}>
        {value}
      </span>
    </div>
  );
}

// =============================================================
// EOL
// =============================================================

function EolSection({
  t,
  locale,
  items,
}: {
  t: ReportT;
  locale: string;
  items: ReportEolItem[];
}) {
  if (items.length === 0) {
    return (
      <section className="break-before-page">
        <SectionHeading number={4} title={t("eol.heading")} />
        <p className="mt-5 text-sm text-text-muted">{t("eol.empty")}</p>
      </section>
    );
  }

  return (
    <section className="break-before-page">
      <SectionHeading number={4} title={t("eol.heading")} />
      <p className="mt-3 text-sm text-text-muted max-w-[70ch]">
        {t("eol.intro")}
      </p>
      <table className="report-table mt-5 w-full text-sm border-collapse">
        <thead>
          <tr className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("eol.table.software")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("eol.table.version")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("eol.table.latest")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("eol.table.eolDate")}
            </th>
            <th className="text-right py-2 border-b border-border-strong">
              {t("eol.table.devices")}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={`${item.software_name}-${item.software_version ?? ""}-${idx}`}
              className="break-inside-avoid"
            >
              <td className="py-2 pr-4 border-b border-border font-medium">
                {item.software_name}
              </td>
              <td className="py-2 pr-4 border-b border-border text-text-muted font-mono text-xs">
                {item.software_version ?? "—"}
              </td>
              <td className="py-2 pr-4 border-b border-border text-text-muted font-mono text-xs">
                {item.latest_version ?? "—"}
              </td>
              <td className="py-2 pr-4 border-b border-border text-text-muted">
                {item.eol_date ?? t("eol.noDate")}
              </td>
              <td className="py-2 border-b border-border text-right font-mono tabular-nums">
                {formatNumber(item.affected_devices, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// =============================================================
// Métricas de remediación (Art. 21.2.f)
// =============================================================

const REMEDIATION_MIN_SAMPLE = 5;

function Remediation({
  t,
  locale,
  stats,
  rows,
}: {
  t: ReportT;
  locale: string;
  stats: RemediationStats;
  rows: PatchedCriticalRow[];
}) {
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const startLabel = dateFmt.format(new Date(stats.windowStart));
  const endLabel = dateFmt.format(new Date(stats.windowEnd));

  const hasEnough =
    stats.meanDays !== null && stats.sampleSize >= REMEDIATION_MIN_SAMPLE;

  return (
    <section className="break-before-page">
      <SectionHeading number={5} title={t("remediation.heading")} />
      <p className="mt-3 text-sm text-text-muted max-w-[70ch]">
        {t("remediation.intro")}
      </p>

      <h3 className="mt-6 text-sm font-medium text-text">
        {t("remediation.metricTitle")}
      </h3>

      {hasEnough && stats.meanDays !== null ? (
        <>
          <div className="mt-3 border border-border rounded p-6 max-w-md break-inside-avoid">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl tabular-nums text-text">
                {formatNumber(
                  Math.round(stats.meanDays * 10) / 10,
                  locale,
                )}
              </span>
              <span className="text-sm text-text-muted">
                {t("remediation.daysUnit")}
              </span>
            </div>
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              {t("remediation.metricDescription")}
            </p>
          </div>

          <dl className="mt-5 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-sm">
            <dt className="text-text-subtle">{t("remediation.sampleLabel")}</dt>
            <dd className="text-text">
              {t("remediation.sampleValue", { count: stats.sampleSize })}
            </dd>
            <dt className="text-text-subtle">{t("remediation.windowLabel")}</dt>
            <dd className="text-text">
              {t("remediation.windowValue", {
                days: stats.windowDays,
                start: startLabel,
                end: endLabel,
              })}
            </dd>
          </dl>

          <ResolvedAlertsTable t={t} locale={locale} rows={rows} />
        </>
      ) : (
        <div className="mt-3 border border-border rounded p-6 max-w-md break-inside-avoid">
          <div className="text-sm font-medium text-text">
            {t("remediation.insufficientTitle")}
          </div>
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            {t("remediation.insufficientBody", {
              min: REMEDIATION_MIN_SAMPLE,
              days: stats.windowDays,
            })}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {t("remediation.insufficientSample", { count: stats.sampleSize })}
          </p>
        </div>
      )}
    </section>
  );
}

function ResolvedAlertsTable({
  t,
  locale,
  rows,
}: {
  t: ReportT;
  locale: string;
  rows: PatchedCriticalRow[];
}) {
  if (rows.length === 0) return null;

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "short" });

  // Más recientemente resueltas primero.
  const sorted = [...rows].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  );

  return (
    <>
      <h3 className="mt-8 text-sm font-medium text-text">
        {t("remediation.listHeading")}
      </h3>
      <table className="report-table mt-3 w-full text-sm border-collapse">
        <thead>
          <tr className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("remediation.table.software")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("remediation.table.version")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("remediation.table.cve")}
            </th>
            <th className="text-right py-2 pr-4 border-b border-border-strong">
              {t("remediation.table.score")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("remediation.table.resolved")}
            </th>
            <th className="text-right py-2 border-b border-border-strong">
              {t("remediation.table.resolutionDays")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => {
            const days = resolutionDays(r);
            return (
              <tr
                key={`${r.cve_id ?? "row"}-${idx}`}
                className="break-inside-avoid"
              >
                <td className="py-2 pr-4 border-b border-border font-medium">
                  <span className="inline-flex items-center gap-2">
                    {r.software_name}
                    {r.in_cisa_kev && (
                      <span className="inline-flex items-center gap-1 text-severity-critical text-[10px] font-medium uppercase tracking-wider">
                        <span aria-hidden>▲</span>
                        {t("remediation.kevBadge")}
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-2 pr-4 border-b border-border text-text-muted font-mono text-xs">
                  {r.software_version ?? "—"}
                </td>
                <td className="py-2 pr-4 border-b border-border text-text-muted font-mono text-xs">
                  {r.cve_id ?? "—"}
                </td>
                <td className="py-2 pr-4 border-b border-border text-right font-mono tabular-nums">
                  {r.cvss_score?.toFixed(1) ?? "—"}
                </td>
                <td className="py-2 pr-4 border-b border-border text-text-muted">
                  {dateFmt.format(new Date(r.updated_at))}
                </td>
                <td className="py-2 border-b border-border text-right font-mono tabular-nums">
                  {formatNumber(days, locale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// =============================================================
// Mapeo Artículo 21
// =============================================================

function Nis2Mapping({ t }: { t: ReportT }) {
  const summary = summarizeCoverage(ARTICLE_21_MEASURES);

  return (
    <section className="break-before-page">
      <SectionHeading number={6} title={t("nis2.heading")} />
      <p className="mt-3 text-sm text-text-muted max-w-[70ch]">
        {t("nis2.intro")}
      </p>

      <table className="report-table mt-5 w-full text-sm border-collapse">
        <thead>
          <tr className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">
            <th className="text-left py-2 pr-3 border-b border-border-strong w-8">
              {t("nis2.table.letter")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong">
              {t("nis2.table.measure")}
            </th>
            <th className="text-left py-2 pr-4 border-b border-border-strong w-40">
              {t("nis2.table.status")}
            </th>
            <th className="text-left py-2 border-b border-border-strong">
              {t("nis2.table.justification")}
            </th>
          </tr>
        </thead>
        <tbody>
          {ARTICLE_21_MEASURES.map((m) => (
            <MeasureRow key={m.letter} t={t} measure={m} />
          ))}
        </tbody>
      </table>

      <p className="mt-5 text-xs text-text-muted leading-relaxed max-w-[70ch]">
        {t("nis2.footer", {
          covered: summary.covered,
          partial: summary.partial,
          notApplicable: summary.not_applicable,
        })}
      </p>
    </section>
  );
}

function MeasureRow({
  t,
  measure,
}: {
  t: ReportT;
  measure: Article21Measure;
}) {
  return (
    <tr className="break-inside-avoid align-top">
      <td className="py-3 pr-3 border-b border-border font-mono text-xs uppercase text-text-subtle">
        {measure.letter}
      </td>
      <td className="py-3 pr-4 border-b border-border font-medium text-text">
        {t(`nis2.measures.${measure.key}.title`)}
      </td>
      <td className="py-3 pr-4 border-b border-border">
        <CoverageBadge t={t} coverage={measure.coverage} />
      </td>
      <td className="py-3 border-b border-border text-text-muted leading-relaxed">
        {t(`nis2.measures.${measure.key}.justification`)}
      </td>
    </tr>
  );
}

function CoverageBadge({
  t,
  coverage,
}: {
  t: ReportT;
  coverage: Article21Coverage;
}) {
  const styles: Record<Article21Coverage, string> = {
    covered: "border-text text-text",
    partial: "border-border-strong text-text-muted",
    not_applicable: "border-border text-text-subtle",
  };
  return (
    <span
      className={
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider " +
        styles[coverage]
      }
    >
      {t(`nis2.status.${coverage}`)}
    </span>
  );
}

// =============================================================
// Footer
// =============================================================

function ReportFooter({
  t,
  tenantName,
  dateLong,
}: {
  t: ReportT;
  tenantName: string;
  dateLong: string;
}) {
  return (
    <footer className="border-t border-border pt-4 mt-10 text-xs text-text-subtle flex items-end justify-between gap-6">
      <div>
        <div>{t("footer.support")}</div>
        <div>{t("footer.processedIn")}</div>
      </div>
      <div className="text-right">
        <div>{tenantName}</div>
        <div>{dateLong}</div>
        <div className="mt-1">{t("footer.generatedBy")}</div>
      </div>
    </footer>
  );
}
