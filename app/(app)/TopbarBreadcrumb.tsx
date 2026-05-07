"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function TopbarBreadcrumb() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");

  let label = "";
  if (pathname.startsWith("/devices")) label = tNav("devices");
  else if (pathname.startsWith("/dashboard")) label = tNav("dashboard");

  return <div className="text-sm text-text-muted">{label}</div>;
}
