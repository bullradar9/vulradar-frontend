import { redirect } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { SidebarNav } from "./SidebarNav";
import { TopbarBreadcrumb } from "./TopbarBreadcrumb";

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

  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const email = user.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <div className="flex h-screen bg-bg">
      <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-border">
          <ShieldCheck className="h-5 w-5 text-brand" strokeWidth={1.75} />
          <span className="font-semibold tracking-tight">
            VulnRadar{" "}
            <span className="text-text-muted font-normal">
              {tCommon("brandSuffix")}
            </span>
          </span>
        </div>

        <SidebarNav />

        <div className="p-3 border-t border-border text-xs text-text-subtle">
          v0.1.0 · MVP
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-border bg-surface px-6 flex items-center justify-between">
          <TopbarBreadcrumb />
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
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
                title={tNav("signOut")}
                aria-label={tNav("signOut")}
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
