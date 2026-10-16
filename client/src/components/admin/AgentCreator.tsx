import { useQuery } from "@tanstack/react-query";
import { adminApiRequest } from "@/lib/adminAuth";
import { AgentUseCenter } from "./AgentUseCenter";
import type { AgentId } from "@shared/agentConstants";
export function AgentCreator({ agent }: { agent: AgentId }) {
  const status = useQuery<{
    orchestrator: { registeredAgents: string[] };
    providerConfiguration: { text: boolean; audio: boolean; images: boolean };
  }>({
    queryKey: ["/api/agents/status"],
    queryFn: async () => {
      const r = await adminApiRequest("GET", "/api/agents/status");
      if (!r.ok)
        throw new Error("No se pudo consultar el estado de los agentes.");
      return r.json();
    },
  });
  if (status.isLoading)
    return (
      <p role="status" className="py-6">
        Cargando herramienta de creación…
      </p>
    );
  if (status.isError) return <p role="alert">{status.error.message}</p>;
  const provider = agent === "voice_agent" ? "audio" : "images";
  return (
    <div className="my-8 space-y-4">
      {!status.data?.providerConfiguration?.[provider] && (
        <p className="border p-4 text-sm" role="status">
          La herramienta está instalada. La prueba con el proveedor real sigue
          pendiente de configurar credenciales; no se ha utilizado Replit Agent.
        </p>
      )}
      <AgentUseCenter
        key={agent}
        compact
        initialAgent={agent}
        registeredAgents={status.data?.orchestrator.registeredAgents || []}
      />
    </div>
  );
}
