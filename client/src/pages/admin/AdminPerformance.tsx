import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { adminApiRequest, readAdminJson } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
type JobMetric = {
  agentType: string;
  status: string;
  total: number;
  duration: number;
};
type Metrics = {
  jobs: JobMetric[];
  translations: { language: string; total: number }[];
  cachedTranslations: number;
  analyzedArticles: number;
};
export default function AdminPerformance() {
  const query = useQuery<Metrics>({
    queryKey: ["/api/admin/agent-metrics"],
    queryFn: async () =>
      readAdminJson(
        await adminApiRequest("GET", "/api/admin/agent-metrics"),
        "No se pudieron cargar las métricas.",
      ),
  });
  const rows = query.data?.jobs || [],
    sum = (status: string) =>
      rows.filter((r) => r.status === status).reduce((n, r) => n + r.total, 0),
    finished = sum("completed") + sum("failed");
  return (
    <main className="admin-management-page">
      <div className="admin-users-heading">
        <div>
          <p className="admin-page-kicker">Operación del CMS</p>
          <h1>Rendimiento de agentes</h1>
          <p>
            Resultados registrados en la base de datos. Las cifras se actualizan
            con cada ejecución.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <ReloadIcon /> Actualizar
        </Button>
      </div>
      {query.isPending ? (
        <p role="status">Consultando métricas…</p>
      ) : query.isError ? (
        <p role="alert">{query.error.message}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            {[
              ["Completados", sum("completed")],
              ["Fallidos", sum("failed")],
              ["Pendientes", sum("pending")],
              [
                "Tasa de éxito",
                finished
                  ? `${Math.round((sum("completed") / finished) * 100)}%`
                  : "Sin ejecuciones",
              ],
            ].map(([label, value]) => (
              <div className="border border-border p-5 rounded-md" key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <strong className="block text-2xl mt-3">{value}</strong>
              </div>
            ))}
          </div>
          <h2 className="text-xl font-semibold my-5">Historial por agente</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-3">Agente</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Trabajos</th>
                  <th className="p-3">Tiempo promedio</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-t" key={row.agentType + row.status}>
                    <td className="p-3">{row.agentType}</td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3">{row.total}</td>
                    <td className="p-3">
                      {row.duration > 0 ? `${row.duration.toFixed(1)} s` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && (
              <p className="p-4 text-muted-foreground">
                Aún no hay ejecuciones registradas.
              </p>
            )}
          </div>
          <div className="my-8 space-y-2">
            <p>Traducciones en caché: {query.data.cachedTranslations}</p>
            <p>Artículos con análisis: {query.data.analyzedArticles}</p>
            <p>
              Traducciones guardadas:{" "}
              {query.data.translations.reduce((n, r) => n + r.total, 0)}
            </p>
          </div>
          <Link href="/admin/agents" className="underline">
            Abrir centro de agentes
          </Link>
        </>
      )}
    </main>
  );
}
