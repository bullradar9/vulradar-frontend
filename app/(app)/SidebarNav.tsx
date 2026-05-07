"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Monitor, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  labelKey: "dashboard" | "devices" | "alerts" | "nis2Report";
  href: Route | null;
  icon: typeof Home;
};

const ITEMS: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: Home },
  { labelKey: "devices", href: "/devices", icon: Monitor },
  { labelKey: "alerts", href: null, icon: AlertTriangle },
  { labelKey: "nis2Report", href: null, icon: FileText },
];

export function SidebarNav() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const label = tNav(item.labelKey);
        const baseClasses =
          "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors";

        if (item.href === null) {
          return (
            <div
              key={item.labelKey}
              className={cn(baseClasses, "text-text-subtle cursor-not-allowed")}
              aria-disabled="true"
              title={tCommon("comingSoon")}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span>{label}</span>
            </div>
          );
        }

        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.labelKey}
            href={item.href}
            className={cn(
              baseClasses,
              isActive
                ? "bg-surface-muted text-text font-medium"
                : "text-text-muted hover:bg-surface-muted hover:text-text",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
