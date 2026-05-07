export default function DashboardPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
      <p className="mt-2 text-text-muted">
        Aquí verás el estado de tus equipos, alertas priorizadas y el informe
        NIS2. Próximamente.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">
          Esta es una vista preliminar. El siguiente paso es conectar el
          listado real de alertas y equipos.
        </p>
      </div>
    </div>
  );
}
