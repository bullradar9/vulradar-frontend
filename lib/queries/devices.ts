import type { Tables } from "@/types/database";
import type { createClient as createServerSupabase } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createServerSupabase>>;

// =============================================================
// Tipos derivados de types/database.ts (sin inventar)
// =============================================================

export type DeviceRow = Pick<
  Tables<"devices">,
  | "id"
  | "device_name"
  | "os"
  | "os_version"
  | "architecture"
  | "agent_version"
  | "last_scanned"
  | "created_at"
>;

export type AlertStatRef = Pick<
  Tables<"client_alerts">,
  "device_id" | "cvss_severity" | "in_cisa_kev"
>;

export type DeviceWithStats = DeviceRow & {
  alerts_open: number;
  critical_open: number;
  kev_open: number;
};

// =============================================================
// Queries (cada función = una query, todas Promise.all-ables)
// RLS filtra por tenant_id = auth.uid() (D021)
// =============================================================

export async function listDevices(supabase: Client): Promise<DeviceRow[]> {
  const { data, error } = await supabase
    .from("devices")
    .select(
      "id, device_name, os, os_version, architecture, agent_version, last_scanned, created_at",
    )
    .order("last_scanned", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchOpenAlertStats(
  supabase: Client,
): Promise<AlertStatRef[]> {
  const { data, error } = await supabase
    .from("client_alerts")
    .select("device_id, cvss_severity, in_cisa_kev")
    .eq("status", "open");
  if (error) throw error;
  return data ?? [];
}

// =============================================================
// Helper puro (sin IO): fusiona devices con sus contadores
// =============================================================

export function mergeDeviceStats(
  devices: DeviceRow[],
  alertRefs: AlertStatRef[],
): DeviceWithStats[] {
  const stats = alertRefs.reduce<
    Record<string, { open: number; critical: number; kev: number }>
  >((acc, r) => {
    const k = r.device_id;
    const entry = acc[k] ?? { open: 0, critical: 0, kev: 0 };
    entry.open += 1;
    if (r.cvss_severity === "critical") entry.critical += 1;
    if (r.in_cisa_kev === true) entry.kev += 1;
    acc[k] = entry;
    return acc;
  }, {});

  return devices.map((d) => {
    const s = stats[d.id];
    return {
      ...d,
      alerts_open: s?.open ?? 0,
      critical_open: s?.critical ?? 0,
      kev_open: s?.kev ?? 0,
    };
  });
}
