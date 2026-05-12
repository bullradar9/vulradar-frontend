import type { Tables } from "@/types/database";
import type { createClient as createServerSupabase } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createServerSupabase>>;

// =============================================================
// Tipos
// =============================================================

export type ReportAlert = Pick<
  Tables<"client_alerts">,
  | "id"
  | "alert_type"
  | "software_name"
  | "software_version"
  | "cve_id"
  | "cvss_severity"
  | "cvss_score"
  | "priority_score"
  | "in_cisa_kev"
  | "latest_stable"
  | "latest_version"
  | "eol_date"
  | "device_id"
>;

export type PatchedCriticalRow = Pick<
  Tables<"client_alerts">,
  | "created_at"
  | "updated_at"
  | "software_name"
  | "software_version"
  | "cve_id"
  | "cvss_score"
  | "in_cisa_kev"
>;

export type RemediationStats = {
  /** Número de alertas críticas resueltas en la ventana. */
  sampleSize: number;
  /** Media en días entre created_at y updated_at. Null si sampleSize=0. */
  meanDays: number | null;
  /** Ventana cubierta (inclusive). */
  windowDays: number;
  /** Inicio de la ventana en ISO 8601 (UTC). */
  windowStart: string;
  /** Fin de la ventana en ISO 8601 (UTC), normalmente "ahora". */
  windowEnd: string;
};

export type ReportEolItem = {
  software_name: string;
  software_version: string | null;
  latest_version: string | null;
  eol_date: string | null;
  affected_devices: number;
};

// =============================================================
// Queries
// =============================================================

// Top 20 por priority_score (incluye CVE, EOL y OUTDATED).
// Reutiliza los mismos campos que el dashboard pero con limit y campos extra.
export async function fetchReportTopAlerts(
  supabase: Client,
  limit = 20,
): Promise<ReportAlert[]> {
  const { data, error } = await supabase
    .from("client_alerts")
    .select(
      "id, alert_type, software_name, software_version, cve_id, cvss_severity, cvss_score, priority_score, in_cisa_kev, latest_stable, latest_version, eol_date, device_id",
    )
    .eq("status", "open")
    .order("priority_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// Software EOL agregado por (software_name, software_version). Dedupe
// device-side: una misma versión EOL en N equipos = una fila con
// affected_devices = N.
// =============================================================
// Métrica: tiempo medio de resolución de alertas críticas
// (Art. 21.2.f — eficacia de las medidas de gestión de riesgos)
// =============================================================

const DAY_MS = 1000 * 60 * 60 * 24;

export async function fetchPatchedCriticalResolutions(
  supabase: Client,
  windowDays = 90,
): Promise<{ rows: PatchedCriticalRow[]; windowStart: string; windowEnd: string }> {
  const now = new Date();
  const since = new Date(now.getTime() - windowDays * DAY_MS);
  const sinceIso = since.toISOString();

  const { data, error } = await supabase
    .from("client_alerts")
    .select(
      "created_at, updated_at, software_name, software_version, cve_id, cvss_score, in_cisa_kev",
    )
    .eq("status", "patched")
    .gte("priority_score", 9.0)
    .gte("updated_at", sinceIso)
    .returns<PatchedCriticalRow[]>();

  if (error) throw error;
  return {
    rows: data ?? [],
    windowStart: sinceIso,
    windowEnd: now.toISOString(),
  };
}

// ⚠️ MOCK — datos sintéticos para demo del Informe NIS2.
// 25 alertas críticas resueltas, repartidas en los últimos 90 días.
// Sustituir por la query real cuando se aplique el seed 0002.
export function mockPatchedCriticalResolutions(windowDays = 90): {
  rows: PatchedCriticalRow[];
  windowStart: string;
  windowEnd: string;
} {
  const now = Date.now();
  const windowStart = new Date(now - windowDays * DAY_MS).toISOString();
  const windowEnd = new Date(now).toISOString();

  type Fixture = {
    software: string;
    version: string;
    cve: string;
    score: number;
    kev: boolean;
    daysAgo: number;
    resolution: number;
  };

  const fixtures: ReadonlyArray<Fixture> = [
    // 8 rápidas (1-3 días)
    { software: "chrome",  version: "128.0.6613.84",  cve: "CVE-2024-7971",  score: 9.6, kev: true,  daysAgo: 87, resolution: 2 },
    { software: "firefox", version: "127.0.1",        cve: "CVE-2024-6604",  score: 9.0, kev: false, daysAgo: 80, resolution: 1 },
    { software: "office",  version: "16.0.17029.20",  cve: "CVE-2024-43505", score: 9.8, kev: false, daysAgo: 75, resolution: 3 },
    { software: "chrome",  version: "129.0.6668.69",  cve: "CVE-2024-9120",  score: 9.2, kev: false, daysAgo: 68, resolution: 1 },
    { software: "dotnet",  version: "6.0.20",         cve: "CVE-2024-30045", score: 9.3, kev: false, daysAgo: 60, resolution: 2 },
    { software: "firefox", version: "128.0",          cve: "CVE-2024-7522",  score: 9.5, kev: true,  daysAgo: 52, resolution: 3 },
    { software: "office",  version: "16.0.17328.20",  cve: "CVE-2024-38200", score: 9.1, kev: false, daysAgo: 40, resolution: 2 },
    { software: "chrome",  version: "130.0.6723.59",  cve: "CVE-2024-10487", score: 9.7, kev: false, daysAgo: 25, resolution: 1 },
    // 10 medias (4-10 días)
    { software: "office",  version: "16.0.16626.20",  cve: "CVE-2024-26168", score: 9.4, kev: false, daysAgo: 88, resolution: 6 },
    { software: "dotnet",  version: "7.0.10",         cve: "CVE-2024-21319", score: 9.0, kev: false, daysAgo: 82, resolution: 5 },
    { software: "chrome",  version: "127.0.6533.122", cve: "CVE-2024-7965",  score: 9.0, kev: false, daysAgo: 74, resolution: 7 },
    { software: "firefox", version: "125.0.3",        cve: "CVE-2024-3859",  score: 9.5, kev: false, daysAgo: 66, resolution: 4 },
    { software: "office",  version: "16.0.16731.20",  cve: "CVE-2024-30060", score: 9.2, kev: false, daysAgo: 58, resolution: 8 },
    { software: "dotnet",  version: "8.0.0",          cve: "CVE-2024-0057",  score: 9.1, kev: false, daysAgo: 50, resolution: 10 },
    { software: "chrome",  version: "128.0.6613.137", cve: "CVE-2024-8198",  score: 9.3, kev: false, daysAgo: 42, resolution: 6 },
    { software: "firefox", version: "129.0",          cve: "CVE-2024-8385",  score: 9.0, kev: false, daysAgo: 34, resolution: 9 },
    { software: "office",  version: "16.0.17029.21",  cve: "CVE-2024-38021", score: 9.8, kev: false, daysAgo: 24, resolution: 5 },
    { software: "dotnet",  version: "6.0.25",         cve: "CVE-2024-21386", score: 9.4, kev: false, daysAgo: 18, resolution: 7 },
    // 7 lentas (15-30 días)
    { software: "office",  version: "16.0.15601.20",  cve: "CVE-2024-20677", score: 9.0, kev: false, daysAgo: 85, resolution: 28 },
    { software: "dotnet",  version: "4.7.2",          cve: "CVE-2024-29059", score: 9.1, kev: false, daysAgo: 78, resolution: 22 },
    { software: "chrome",  version: "126.0.6478.114", cve: "CVE-2024-6100",  score: 9.3, kev: true,  daysAgo: 70, resolution: 17 },
    { software: "firefox", version: "124.0.2",        cve: "CVE-2024-2607",  score: 9.0, kev: false, daysAgo: 62, resolution: 25 },
    { software: "office",  version: "16.0.16924.20",  cve: "CVE-2024-30103", score: 9.5, kev: false, daysAgo: 55, resolution: 19 },
    { software: "dotnet",  version: "7.0.5",          cve: "CVE-2024-21320", score: 9.0, kev: false, daysAgo: 46, resolution: 30 },
    { software: "chrome",  version: "127.0.6533.88",  cve: "CVE-2024-7532",  score: 9.2, kev: false, daysAgo: 38, resolution: 15 },
  ];

  const rows: PatchedCriticalRow[] = fixtures.map((f) => {
    const created = new Date(now - f.daysAgo * DAY_MS);
    const updated = new Date(created.getTime() + f.resolution * DAY_MS);
    return {
      created_at: created.toISOString(),
      updated_at: updated.toISOString(),
      software_name: f.software,
      software_version: f.version,
      cve_id: f.cve,
      cvss_score: f.score,
      in_cisa_kev: f.kev,
    };
  });

  return { rows, windowStart, windowEnd };
}

/** Días entre created_at y updated_at, redondeado a 1 decimal. */
export function resolutionDays(row: PatchedCriticalRow): number {
  const ms =
    new Date(row.updated_at).getTime() - new Date(row.created_at).getTime();
  return Math.round((ms / DAY_MS) * 10) / 10;
}

// Helper puro (sin IO): media en días entre created_at y updated_at.
export function computeRemediationStats(
  rows: PatchedCriticalRow[],
  windowDays: number,
  windowStart: string,
  windowEnd: string,
): RemediationStats {
  if (rows.length === 0) {
    return { sampleSize: 0, meanDays: null, windowDays, windowStart, windowEnd };
  }
  const totalMs = rows.reduce((acc, r) => {
    const created = new Date(r.created_at).getTime();
    const updated = new Date(r.updated_at).getTime();
    return acc + (updated - created);
  }, 0);
  return {
    sampleSize: rows.length,
    meanDays: totalMs / rows.length / DAY_MS,
    windowDays,
    windowStart,
    windowEnd,
  };
}

type EolRow = Pick<
  Tables<"client_alerts">,
  "software_name" | "software_version" | "latest_version" | "eol_date"
>;

export async function fetchReportEolSoftware(
  supabase: Client,
): Promise<ReportEolItem[]> {
  const { data, error } = await supabase
    .from("client_alerts")
    .select("software_name, software_version, latest_version, eol_date")
    .eq("status", "open")
    .eq("alert_type", "eol")
    .returns<EolRow[]>();
  if (error) throw error;
  if (!data) return [];

  const byKey = new Map<string, ReportEolItem>();
  for (const row of data) {
    const key = `${row.software_name}::${row.software_version ?? ""}`;
    const entry = byKey.get(key);
    if (entry) {
      entry.affected_devices += 1;
    } else {
      byKey.set(key, {
        software_name: row.software_name,
        software_version: row.software_version,
        latest_version: row.latest_version,
        eol_date: row.eol_date,
        affected_devices: 1,
      });
    }
  }

  return [...byKey.values()].sort((a, b) => {
    // Sin fecha al final, fechas más próximas primero.
    if (!a.eol_date && !b.eol_date) return 0;
    if (!a.eol_date) return 1;
    if (!b.eol_date) return -1;
    return a.eol_date.localeCompare(b.eol_date);
  });
}
