import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ConfigFields } from "@/features/site-config/ConfigFields";
import { adminApiRequest } from "@/lib/adminAuth";
import { useToast } from "@/hooks/use-toast";
import type { CmsValue } from "@shared/cms";

type CatalogKind = "practice" | "industry" | "team" | "news" | "job";
type CatalogRecord = Record<string, CmsValue> & { id?: string };

const config = {
  practice: {
    title: "Fichas de prácticas",
    description: "Edita aquí las fichas que aparecen en la portada y en Prácticas. La misma ficha se actualiza en sus rutas públicas.",
    endpoint: "/api/admin/practice-groups",
    empty: { name: "", nameEs: "", slug: "", slugEs: "", description: "", descriptionEs: "", fullDescription: "", fullDescriptionEs: "", published: true, teamMemberIds: null, iconName: "", imageUrl: "", order: 0 },
  },
  industry: {
    title: "Fichas de industrias",
    description: "Edita aquí las fichas que aparecen en el catálogo de Industrias y en los enlaces de la portada.",
    endpoint: "/api/admin/industry-groups",
    empty: { name: "", nameEs: "", slug: "", slugEs: "", description: "", descriptionEs: "", fullDescription: "", fullDescriptionEs: "", iconName: "", imageUrl: "", order: 0, published: true },
  },
  team: {
    title: "Fichas de socios y equipo",
    description: "Edita aquí las fichas completas de los perfiles que aparecen en Socios y equipo.",
    endpoint: "/api/admin/team",
    empty: {},
  },
  news: {
    title: "Notas del Monitor Laboral",
    description: "Edita aquí las notas que aparecen en el Monitor Laboral y sus fichas públicas.",
    endpoint: "/api/admin/news",
    empty: {},
  },
  job: {
    title: "Fichas de vacantes",
    description: "Edita aquí las vacantes que aparecen en Carreras.",
    endpoint: "/api/admin/jobs",
    empty: {},
  },
} as const;

export function InlineCatalogFields({ kind }: { kind: CatalogKind }) {
  const entry = config[kind];
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [draft, setDraft] = useState<CatalogRecord | null>(null);
  const query = useQuery<CatalogRecord[]>({
    queryKey: [entry.endpoint],
    queryFn: async () => {
      const response = await adminApiRequest("GET", entry.endpoint);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudieron cargar las fichas.");
      if (kind === "team") return data.members ?? [];
      if (kind === "news") return data.news ?? [];
      return Array.isArray(data) ? data : [];
    },
  });
  const save = useMutation({
    mutationFn: async (value: CatalogRecord) => {
      const { id, ...body } = value;
      const response = await adminApiRequest(id ? "PUT" : "POST", id ? `${entry.endpoint}/${id}` : entry.endpoint, body);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar la ficha.");
      return data;
    },
    onSuccess: () => {
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: [entry.endpoint] });
      toast({ title: "Ficha guardada" });
    },
  });

  return (
    <section className="cms-editor-card mb-5" aria-labelledby={`inline-${kind}-title`}>
      <div className="cms-editor-section-intro">
        <div>
          <h2 id={`inline-${kind}-title`}>{entry.title}</h2>
          <p>{entry.description}</p>
        </div>
        {Object.keys(entry.empty).length > 0 && <Button type="button" variant="outline" onClick={() => setDraft({ ...entry.empty })}>Añadir ficha</Button>}
      </div>
      {query.isLoading && <p role="status">Cargando fichas…</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      <div className="space-y-4">
        {(query.data ?? []).map((item) => {
          const active = draft?.id === item.id;
          return (
            <article key={String(item.id)} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{String(item.nameEs || item.name || item.titleEs || item.title || item.slug || "Ficha sin nombre")}</h3>
                  <p className="text-sm text-muted-foreground">{String(item.slug || item.email || item.departmentEs || item.department || "Ficha del catálogo")}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => setDraft({ ...item })}>{active ? "Editando" : "Editar ficha"}</Button>
              </div>
              {active && <div className="mt-4 space-y-4"><ConfigFields value={draft} onChange={(value) => setDraft(value as CatalogRecord)} media /><div className="flex flex-wrap gap-3"><Button type="button" disabled={save.isPending} onClick={() => draft && save.mutate(draft)}>{save.isPending ? "Guardando…" : "Guardar ficha"}</Button><Button type="button" variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>{save.isError && <span role="alert" className="text-sm text-red-700">{save.error.message}</span>}</div></div>}
            </article>
          );
        })}
      </div>
      {draft && !draft.id && Object.keys(entry.empty).length > 0 && <article className="mt-4 rounded-xl border border-dashed p-4"><h3 className="font-semibold">Nueva ficha</h3><div className="mt-4 space-y-4"><ConfigFields value={draft} onChange={(value) => setDraft(value as CatalogRecord)} media /><div className="flex flex-wrap gap-3"><Button type="button" disabled={save.isPending} onClick={() => save.mutate(draft)}>{save.isPending ? "Guardando…" : "Crear ficha"}</Button><Button type="button" variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>{save.isError && <span role="alert" className="text-sm text-red-700">{save.error.message}</span>}</div></div></article>}
    </section>
  );
}
