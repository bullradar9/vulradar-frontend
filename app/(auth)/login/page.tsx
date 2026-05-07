import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./LoginForm";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function LoginPage() {
  const t = await getTranslations("login");
  const tCommon = await getTranslations("common");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand" strokeWidth={1.75} />
            <span className="font-semibold text-lg tracking-tight">
              VulnRadar{" "}
              <span className="text-text-muted font-normal">
                {tCommon("brandSuffix")}
              </span>
            </span>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-xl font-medium mb-1">{t("title")}</h1>
          <p className="text-sm text-text-muted mb-6">{t("subtitle")}</p>

          <LoginForm />

          <p className="mt-6 text-xs text-text-subtle text-center">
            {t("noAccount")}{" "}
            <a
              href="mailto:hola@vulnradar.eu"
              className="text-brand hover:underline"
            >
              {t("contactUs")}
            </a>
          </p>
        </div>

        <p className="mt-6 text-xs text-text-subtle text-center">
          {t("footer")}
        </p>
      </div>
    </main>
  );
}
