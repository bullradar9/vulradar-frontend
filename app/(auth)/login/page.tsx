import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <ShieldCheck className="h-6 w-6 text-brand" strokeWidth={1.75} />
          <span className="font-semibold text-lg tracking-tight">
            VulnRadar <span className="text-text-muted font-normal">EU</span>
          </span>
        </div>

        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-xl font-medium mb-1">Acceder a tu cuenta</h1>
          <p className="text-sm text-text-muted mb-6">
            Introduce tus credenciales para entrar al panel.
          </p>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-text"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-text"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-md bg-brand text-brand-fg px-3 py-2 text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Entrar
            </button>
          </form>

          <p className="mt-6 text-xs text-text-subtle text-center">
            ¿No tienes cuenta?{" "}
            <a
              href="mailto:hola@vulnradar.eu"
              className="text-brand hover:underline"
            >
              Contáctanos
            </a>
          </p>
        </div>

        <p className="mt-6 text-xs text-text-subtle text-center">
          Datos procesados en la UE · Frankfurt
        </p>
      </div>
    </main>
  );
}
