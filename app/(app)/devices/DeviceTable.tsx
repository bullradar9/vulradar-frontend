"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { SeverityDot } from "@/components/ui/SeverityDot";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DeviceWithStats } from "@/lib/queries/devices";

type SortKey = "device_name" | "last_scanned" | "alerts_open" | "critical_open";
type SortDir = "asc" | "desc";

type Props = {
  rows: DeviceWithStats[];
};

export function DeviceTable({ rows }: Props) {
  const t = useTranslations("devices");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("last_scanned");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.device_name.toLowerCase().includes(q));
  }, [rows, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      // NULLs siempre al final, independiente del dir
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;

      let cmp: number;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv, locale);
      } else if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), locale);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir, locale]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "device_name" ? "asc" : "desc");
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle pointer-events-none"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-surface placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <Table>
          <THead>
            <Tr className="border-t-0">
              <SortableTh
                active={sortKey === "device_name"}
                dir={sortDir}
                onClick={() => toggleSort("device_name")}
              >
                {t("table.device")}
              </SortableTh>
              <Th>{t("table.os")}</Th>
              <Th>{t("table.arch")}</Th>
              <Th>{t("table.agent")}</Th>
              <SortableTh
                active={sortKey === "last_scanned"}
                dir={sortDir}
                onClick={() => toggleSort("last_scanned")}
              >
                {t("table.lastSeen")}
              </SortableTh>
              <SortableTh
                active={sortKey === "alerts_open"}
                dir={sortDir}
                onClick={() => toggleSort("alerts_open")}
                align="right"
              >
                {t("table.open")}
              </SortableTh>
              <SortableTh
                active={sortKey === "critical_open"}
                dir={sortDir}
                onClick={() => toggleSort("critical_open")}
                align="right"
              >
                {t("table.crit")}
              </SortableTh>
              <Th className="text-right">{t("table.kev")}</Th>
            </Tr>
          </THead>
          <TBody>
            {sorted.map((d) => (
              <Tr key={d.id} className="hover:bg-surface-muted">
                <Td>
                  <Link
                    href={`/devices/${d.id}` as Route}
                    className="font-medium text-text hover:text-brand"
                  >
                    {d.device_name}
                  </Link>
                </Td>
                <Td className="text-text-muted">{compactOs(d.os_version, d.os)}</Td>
                <Td className="text-text-muted">{d.architecture ?? "—"}</Td>
                <Td className="text-text-muted font-mono">
                  {d.agent_version ?? "—"}
                </Td>
                <Td className="text-text-muted">
                  {d.last_scanned
                    ? formatRelativeTime(d.last_scanned, locale)
                    : t("never")}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  {formatNumber(d.alerts_open, locale)}
                </Td>
                <Td className="text-right font-mono tabular-nums">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    {d.critical_open > 0 && <SeverityDot level="critical" />}
                    {formatNumber(d.critical_open, locale)}
                  </span>
                </Td>
                <Td className="text-right">
                  {d.kev_open > 0 ? (
                    <Badge variant="kev">{t("kevBadge")}</Badge>
                  ) : null}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      {sorted.length === 0 && search && (
        <p className="text-center text-sm text-text-muted py-4">
          {t("noMatches")}
        </p>
      )}
    </div>
  );
}

type SortableThProps = {
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
  children: React.ReactNode;
};

function SortableTh({
  active,
  dir,
  onClick,
  align = "left",
  children,
}: SortableThProps) {
  return (
    <Th className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 hover:text-text transition-colors uppercase tracking-wider text-[10px] font-medium",
          align === "right" && "flex-row-reverse",
          active ? "text-text" : "text-text-subtle",
        )}
      >
        {children}
        {active &&
          (dir === "asc" ? (
            <ChevronUp className="h-3 w-3" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-3 w-3" strokeWidth={2} />
          ))}
      </button>
    </Th>
  );
}

function compactOs(osVersion: string | null, os: string): string {
  if (!osVersion) return os;
  // "Windows 11 23H2 build 22631" → "Windows 11 23H2"
  return osVersion.replace(/\s+build\s+\d+$/i, "");
}
