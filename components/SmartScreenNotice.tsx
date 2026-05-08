"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

type Props = {
  children?: ReactNode;
};

// Sin children: aviso permanente que se renderiza como párrafo. Se usa en
// empty states donde el usuario aún no ha visto el flujo y necesita el contexto.
//
// Con children: envuelve el botón con un tooltip que aparece en hover/focus.
// Se usa en el topbar de /devices cuando el usuario ya tiene equipos y solo
// quiere añadir uno nuevo (el aviso es ruido si lo ve permanentemente).
export function SmartScreenNotice({ children }: Props) {
  const t = useTranslations("agent");
  const text = t("smartscreen");

  if (children) {
    return (
      <div className="relative group inline-block">
        {children}
        <div
          role="tooltip"
          className="invisible group-hover:visible group-focus-within:visible pointer-events-none absolute right-0 top-full mt-2 w-72 rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-muted leading-relaxed shadow-md z-10"
        >
          {text}
        </div>
      </div>
    );
  }

  return (
    <p className="mt-3 max-w-md text-xs text-text-subtle leading-relaxed text-center">
      {text}
    </p>
  );
}
