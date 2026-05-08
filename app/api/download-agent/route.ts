import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hardcoded: cuando llegue el momento de tener varios entornos (staging vs prod),
// movemos a env var. Hoy hay un solo processor.
const PROCESSOR_URL = "https://scan-processor-production.up.railway.app";

function buildConfigYaml(args: {
  email: string;
  tenantId: string;
  timestamp: string;
}): string {
  return `# VulnRadar Agent — auto-generated configuration
# Generated for: ${args.email} on ${args.timestamp}
#
# DO NOT EDIT processor_url or tenant_id - both are pre-configured.
# device_id and agent_id are auto-filled when agent.exe runs the first
# time. If you delete them, the device will register as new.

processor_url: ${PROCESSOR_URL}

tenant_id: ${args.tenantId}
device_id:
agent_id:
`;
}

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const locale = await getLocale();
  const installFile = locale === "es" ? "INSTALACION.md" : "INSTALLATION.md";

  const [agentRes, installRes] = await Promise.all([
    supabase.storage.from("agent-installer").download("agent.exe"),
    supabase.storage.from("agent-installer").download(installFile),
  ]);

  if (
    agentRes.error ||
    !agentRes.data ||
    installRes.error ||
    !installRes.data
  ) {
    return NextResponse.json({ error: "storage_unavailable" }, { status: 502 });
  }

  const agentBytes = new Uint8Array(await agentRes.data.arrayBuffer());
  const installText = await installRes.data.text();
  const configYaml = buildConfigYaml({
    email: user.email ?? "",
    tenantId: user.id,
    timestamp: new Date().toISOString(),
  });

  const zip = new JSZip();
  zip.file("agent.exe", agentBytes);
  zip.file(installFile, installText);
  zip.file("config.yaml", configYaml);

  const buffer = await zip.generateAsync({ type: "arraybuffer" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="vulnradar-agent.zip"',
      "Cache-Control": "no-store",
    },
  });
}
