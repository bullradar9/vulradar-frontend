import type { Tables } from "@/types/database";
import type { createClient as createServerSupabase } from "@/lib/supabase/server";

// Atado al cliente real que devuelve lib/supabase/server.ts. Si Supabase
// cambia la firma de SupabaseClient<...>, este alias se actualiza solo.
type Client = Awaited<ReturnType<typeof createServerSupabase>>;

// =============================================================
// Tipos derivados de types/database.ts (sin inventar)
// =============================================================

export type TopAlert = Pick<
  Tables<"client_alerts">,
  | "id"
  | "alert_type"
  | "software_name"
  | "software_version"
  | "cve_id"
  | "cvss_severity"
  | "priority_score"
  | "in_cisa_kev"
  | "latest_stable"
  | "latest_version"
>;

export type TopDevice = Pick<
  Tables<"devices">,
  "id" | "device_name" | "os" | "os_version" | "last_scanned"
>;

export type AlertDeviceRef = Pick<Tables<"client_alerts">, "device_id">;

// =============================================================
// Counts (cada función = una query head:true count)
// Cuando el day-of-tomorrow lleguen las vistas SQL en scan-processor,
// se sustituyen por dos selects a dashboard_stats + device_dashboard.
// =============================================================

export async function countAlertsOpen(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("client_alerts")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  if (error) throw error;
  return count ?? 0;
}

export async function countCriticalOpen(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("client_alerts")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("cvss_severity", "critical");
  if (error) throw error;
  return count ?? 0;
}

export async function countKevOpen(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("client_alerts")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("in_cisa_kev", true);
  if (error) throw error;
  return count ?? 0;
}

export async function countDevices(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("devices")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function countCveBySeverity(
  supabase: Client,
  severity: "critical" | "high" | "medium" | "low",
): Promise<number> {
  const { count, error } = await supabase
    .from("client_alerts")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("alert_type", "cve")
    .eq("cvss_severity", severity);
  if (error) throw error;
  return count ?? 0;
}

export async function countByAlertType(
  supabase: Client,
  alertType: "cve" | "eol" | "outdated",
): Promise<number> {
  const { count, error } = await supabase
    .from("client_alerts")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .eq("alert_type", alertType);
  if (error) throw error;
  return count ?? 0;
}

// =============================================================
// Listas top-N
// =============================================================

export async function fetchTopAlerts(
  supabase: Client,
  limit = 5,
): Promise<TopAlert[]> {
  const { data, error } = await supabase
    .from("client_alerts")
    .select(
      "id, alert_type, software_name, software_version, cve_id, cvss_severity, priority_score, in_cisa_kev, latest_stable, latest_version",
    )
    .eq("status", "open")
    .order("priority_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchTopDevices(
  supabase: Client,
  limit = 5,
): Promise<TopDevice[]> {
  const { data, error } = await supabase
    .from("devices")
    .select("id, device_name, os, os_version, last_scanned")
    .order("last_scanned", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// Devuelve solo el device_id de cada alerta abierta. Se usa para contar
// alertas abiertas por equipo en JS sin GROUP BY (no soportado limpio
// por PostgREST cliente-side).
export async function fetchOpenAlertDeviceIds(
  supabase: Client,
): Promise<AlertDeviceRef[]> {
  const { data, error } = await supabase
    .from("client_alerts")
    .select("device_id")
    .eq("status", "open");
  if (error) throw error;
  return data ?? [];
}
