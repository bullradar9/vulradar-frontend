import { ShieldCheck } from "lucide-react";
import { LoginForm } from "./LoginForm";

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

          <LoginForm />

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
