import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AGENT_DEFINITIONS } from "@shared/agentConstants";
import { adminNavigation } from "@/features/admin/navigation";
import { canVisitAdminPath } from "@shared/adminAccess";
import { useQuery } from "@tanstack/react-query";
import { adminApiRequest, readAdminJson } from "@/lib/adminAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@radix-ui/react-icons";
export default function SystemExplorer() {
  const [search, setSearch] = useState("");
  const { data: me } = useQuery<{ role: string; permissions?: string[] }>({
    queryKey: ["/api/admin/me"],
    queryFn: async () =>
      readAdminJson(
        await adminApiRequest("GET", "/api/admin/me"),
        "No se pudo verificar el acceso.",
      ),
  });
  const normalized = search.toLocaleLowerCase("es");
  const sections = useMemo(
    () =>
      adminNavigation
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (i) =>
              canVisitAdminPath(me, i.href) &&
              `${i.label} ${i.hint}`
                .toLocaleLowerCase("es")
                .includes(normalized),
          ),
        }))
        .filter((g) => g.items.length),
    [me, normalized],
  );
  const agents = AGENT_DEFINITIONS.filter((a) =>
    (a.name + " " + a.role + " " + a.description)
      .toLocaleLowerCase("es")
      .includes(normalized),
  );
  const download = () => {
    const report = [
      "# CMS Santos & Saucedo",
      "",
      "## Secciones",
      ...sections.flatMap((g) => [
        "",
        `### ${g.label}`,
        ...g.items.map((i) => `- ${i.label}: ${i.href} — ${i.hint}`),
      ]),
      "",
      "## Agentes",
      ...agents.map((a) => `- ${a.name} (${a.id}): ${a.description}`),
      "",
      "## Archivos",
      "Los medios públicos y presentaciones privadas se conservan en Replit App Storage. Los documentos privados se descargan con una sesión autorizada.",
      "Las propuestas de IA requieren revisión editorial.",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([report], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "cms-santos-saucedo.md";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className="admin-management-page">
      <div className="admin-users-heading">
        <div>
          <p className="admin-page-kicker">Guía del sistema</p>
          <h1>Mapa del CMS</h1>
          <p>
            Secciones disponibles y agentes conectados a Santos &amp; Saucedo.
          </p>
        </div>
        <Button variant="outline" onClick={download}>
          <DownloadIcon /> Descargar guía
        </Button>
      </div>
      <Input
        aria-label="Buscar sección o agente"
        placeholder="Buscar sección o agente…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-lg my-8"
      />
      <div className="grid md:grid-cols-2 gap-8">
        {sections.map((group) => (
          <section key={group.label}>
            <h2 className="text-xl font-semibold mb-4">{group.label}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.href} className="border-t py-4">
                  <Link className="font-medium underline" href={item.href}>
                    {item.label}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.hint}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          Agentes del proyecto · {AGENT_DEFINITIONS.length}
        </h2>
        <p className="my-3 text-muted-foreground">
          Su ejecución y sus resultados se consultan en el centro de agentes.
          Las conexiones con proveedores se verifican al ejecutar cada proceso.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          {agents.map((agent) => (
            <article className="border p-5 rounded-md" key={agent.id}>
              <h3 className="font-semibold">{agent.name}</h3>
              <p className="text-sm mt-2">{agent.description}</p>
              <p className="text-sm text-muted-foreground mt-3">
                {agent.capabilities.join(" · ")}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
