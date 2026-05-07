import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Home,
  Monitor,
  AlertTriangle,
  FileText,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { signOut } from "./actions";

type NavItem = {
  label: string;
  href: string | null;
  icon: typeof Home;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, active: true },
  { label: "Equipos", href: null, icon: Monitor },
  { label: "Alertas", href: null, icon: AlertTriangle },
  { label: "Informe NIS2", href: null, icon: FileText },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <div className="flex h-screen bg-bg">
      <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-border">
          <ShieldCheck className="h-5 w-5 text-brand" strokeWidth={1.75} />
          <span className="font-semibold tracking-tight">
            VulnRadar <span className="text-text-muted font-normal">EU</span>
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDisabled = item.href === null;

            const baseClasses =
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors";

            if (isDisabled) {
              return (
                <div
                  key={item.label}
                  className={cn(
                    baseClasses,
                    "text-text-subtle cursor-not-allowed",
                  )}
                  aria-disabled="true"
                  title="Próximamente"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href as "/dashboard"}
                className={cn(
                  baseClasses,
                  item.active
                    ? "bg-surface-muted text-text font-medium"
                    : "text-text-muted hover:bg-surface-muted hover:text-text",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border text-xs text-text-subtle">
          v0.1.0 · MVP
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-border bg-surface px-6 flex items-center justify-between">
          <div className="text-sm text-text-muted">Dashboard</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-brand text-brand-fg flex items-center justify-center text-xs font-medium">
                {initial}
              </div>
              <span className="text-sm text-text-muted hidden sm:inline">
                {email}
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
