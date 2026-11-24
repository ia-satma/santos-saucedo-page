import { useEffect, useMemo, useState } from "react";
import { adminApiRequest } from "@/lib/adminAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { layoutDefaults } from "@/lib/cmsLightDefaults";
import { notifyCmsSaved } from "@/hooks/useCmsContent";

type PageState = { enabled: boolean; blocks: Record<string, boolean> };
type LayoutState = { pages?: Record<string, PageState>; [key: string]: unknown };
type LayoutResponse = { content: LayoutState; revision: string };

function defaultPage(pageId: string): PageState {
  const page = (layoutDefaults.pages as Record<string, PageState>)[pageId];
  return page ? { enabled: page.enabled, blocks: { ...page.blocks } } : { enabled: true, blocks: {} };
}

const legacyBlockAliases: Record<string, Set<string>> = {
  team: new Set(["carrusel", "perfiles"]),
};
const canonicalToLegacy: Record<string, Record<string, string>> = {
  team: { socios: "carrusel", colaboradores: "perfiles" },
};

const pageLabels: Record<string, string> = {
  home: "Portada",
  about: "Nuestra firma",
  practices: "Prácticas",
  industries: "Industrias",
  team: "Socios y equipo",
  news: "Monitor Laboral",
  contact: "Contacto",
  careers: "Carreras",
  offices: "Oficinas",
  testimonials: "Testimonios",
  interns: "Pasantías S&S",
  newsletter: "Boletín",
  privacy: "Aviso de privacidad",
  terms: "Términos de uso",
  "not-found": "Página no encontrada",
};

const blockLabels: Record<string, string> = {
  hero: "Hero y encabezado",
  firma: "Nuestra firma",
  creemos: "Lo que creemos",
  practicas: "Prácticas",
  industrias: "Industrias",
  socios: "Socios y equipo",
  extranjeras: "Empresas extranjeras",
  monitor: "Monitor Laboral",
  historia: "Historia",
  cifras: "Cifras",
  valores: "Valores y principios",
  prioridad: "Prioridad y frases",
  laminas: "Láminas visuales",
  oficina: "Oficina y fotografías",
  lista: "Listado principal",
  servicios: "Servicios",
  laminaReaccion: "Lámina Capacidad de reacción",
  industries: "Industrias relacionadas",
  animacion: "Animación y mapa",
  textos: "Textos de cada industria en la portada",
  carrusel: "Carrusel del equipo",
  perfiles: "Perfiles",
  filtros: "Filtros y estados",
  publicaciones: "Publicaciones",
  suscripcion: "Suscripción",
  datos: "Datos de contacto",
  formulario: "Formulario",
  informacion: "Información",
  vacantes: "Vacantes",
  galeria: "Galería",
  horario: "Horario",
  estrellas: "Estrellas",
  visual: "Constructor visual publicado",
};

function labelFor(value: string) {
  return blockLabels[value] ?? value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ");
}

export function PageVisibilityPanel({ pageId }: { pageId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery<LayoutResponse>({
    queryKey: ["/api/admin/site-config", "layout", "visibility"],
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/api/admin/site-config/layout");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar la visibilidad.");
      return data;
    },
    staleTime: 15000,
  });
  const [draft, setDraft] = useState<LayoutState>();
  const [revision, setRevision] = useState("initial");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setDraft(query.data.content);
    setRevision(query.data.revision);
  }, [query.data]);

  const current = useMemo(() => {
    if (!draft) return undefined;
    const fallback = defaultPage(pageId);
    const stored = draft.pages?.[pageId];
    return stored ? { ...fallback, ...stored, blocks: { ...fallback.blocks, ...(stored.blocks ?? {}) } } : fallback;
  }, [draft, pageId]);
  const update = (next: PageState) => {
    if (!draft) return;
    setDraft({ ...draft, pages: { ...(draft.pages ?? {}), [pageId]: next } });
    setSaved("");
  };
  const updateBlock = (blockKey: string, enabled: boolean) => {
    if (!current) return;
    const blocks = { ...current.blocks, [blockKey]: enabled };
    const legacyKey = canonicalToLegacy[pageId]?.[blockKey];
    if (legacyKey) blocks[legacyKey] = enabled;
    update({ ...current, blocks });
  };
  const save = useMutation({
    mutationFn: async () => {
      const response = await adminApiRequest("PUT", "/api/admin/site-config/layout", { content: draft, revision });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar la visibilidad.");
      return data as LayoutResponse;
    },
    onSuccess: (data) => {
      setDraft(data.content);
      setRevision(data.revision);
      queryClient.setQueryData(["/api/admin/site-config", "layout", "visibility"], data);
      notifyCmsSaved();
      setSaved("Visibilidad guardada");
    },
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Cargando visibilidad…</p>;
  if (query.isError) return <p role="alert" className="text-sm text-red-700">{query.error.message}</p>;
  if (!current) return null;

  return (
    <section className="cms-editor-card mb-5" aria-labelledby="cms-visibility-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 id="cms-visibility-title" className="font-semibold">Visibilidad de {pageLabels[pageId] ?? pageId}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Control global para todos los idiomas. Al ocultar un bloque, desaparece del menú o del contenido público según corresponda.</p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor={`page-visible-${pageId}`} className="text-sm font-medium">Página visible</label>
          <Switch id={`page-visible-${pageId}`} checked={current.enabled} onCheckedChange={(enabled) => update({ ...current, enabled })} />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Object.entries(current.blocks).filter(([key]) => !legacyBlockAliases[pageId]?.has(key)).map(([key, enabled]) => (
          <label key={key} className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <span className="text-sm font-medium">{labelFor(key)}</span>
            <Switch checked={enabled} onCheckedChange={(next) => updateBlock(key, next)} aria-label={`Visible: ${labelFor(key)}`} />
          </label>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Guardando…" : "Guardar visibilidad"}</Button>
        {saved && <span role="status" className="text-sm text-emerald-700">{saved}</span>}
        {save.isError && <span role="alert" className="text-sm text-red-700">{save.error.message}</span>}
      </div>
    </section>
  );
}
