import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AdminPageHelp } from "@/components/admin/AdminPageHelp";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { localizeHref } from "@/lib/localeRouting";
import { canonicalPageOrder, getCmsPage } from "@/features/site-config/editorMetadata";
import { layoutDefaults } from "@/lib/cmsLightDefaults";
import "@/features/site-config/cms-editor.css";

type PageState = { enabled: boolean; blocks: Record<string, boolean> };
type LayoutState = { pages?: Record<string, PageState>; [key: string]: unknown };
type LayoutResponse = { content: LayoutState; revision: string };

const visibilityKey = ["/api/admin/site-config", "layout", "visibility"];

function defaultPage(id: string): PageState {
  const page = (layoutDefaults.pages as Record<string, PageState>)[id];
  return page ? { enabled: page.enabled, blocks: { ...page.blocks } } : { enabled: true, blocks: {} };
}

export default function AdminPublicPages() {
  const { isAuthenticated, isLoading, requireAuth } = useAdminAuth();
  const queryClient = useQueryClient();
  const query = useQuery<LayoutResponse>({
    queryKey: visibilityKey,
    enabled: isAuthenticated,
    staleTime: 15000,
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/api/admin/site-config/layout");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar la visibilidad.");
      return data;
    },
  });
  const [draft, setDraft] = useState<LayoutState>();
  const [revision, setRevision] = useState("initial");
  const [snapshot, setSnapshot] = useState("");

  useEffect(() => { requireAuth(); }, [requireAuth]);
  useEffect(() => {
    if (!query.data) return;
    setDraft(query.data.content);
    setRevision(query.data.revision);
    setSnapshot(JSON.stringify(query.data.content));
  }, [query.data]);

  const dirty = Boolean(draft && JSON.stringify(draft) !== snapshot);
  const pages = useMemo(() => canonicalPageOrder.map((id) => {
    const page = getCmsPage(id);
    return { id, label: page?.label ?? id, path: page?.path ?? "", description: page?.description ?? "" };
  }), []);

  const updatePage = (id: string, enabled: boolean) => {
    if (!draft) return;
    const current = draft.pages?.[id] ?? defaultPage(id);
    setDraft({ ...draft, pages: { ...(draft.pages ?? {}), [id]: { ...current, enabled } } });
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
      setSnapshot(JSON.stringify(data.content));
      queryClient.setQueryData(visibilityKey, data);
    },
  });

  if (isLoading || !isAuthenticated) return <p className="p-8" role="status">Verificando sesión…</p>;
  if (query.isLoading) return <p className="p-8" role="status">Cargando páginas públicas…</p>;
  if (query.isError || !draft) return <p className="p-8 text-red-700" role="alert">{query.error?.message || "No se pudo cargar la visibilidad."}</p>;

  return (
    <main className="cms-editor-page">
      <header className="cms-editor-header"><div className="cms-editor-header-inner">
        <div className="cms-editor-breadcrumb" aria-label="Ruta del editor"><Link href="/admin/dashboard">Inicio</Link><span aria-hidden="true">›</span><span>Configuración</span><span aria-hidden="true">›</span><strong>Páginas públicas</strong></div>
        <div className="cms-editor-heading-row"><div><h1>Páginas públicas</h1><p>Activa u oculta páginas completas desde un solo lugar.</p><span className="cms-editor-impact">Afecta todos los idiomas, el encabezado, el pie y el contenido público.</span></div><span className="cms-editor-status" role="status">{dirty ? "Cambios sin guardar" : "Cambios guardados"}</span></div>
        <div className="flex flex-wrap gap-3 mt-5"><Button disabled={!dirty || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Guardando…" : "Guardar cambios"}</Button><Link href="/admin/navigation" className="admin-subtle-link">Editar menús y submenús ↗</Link></div>
      </div></header>
      <div className="cms-editor-main">
        <AdminPageHelp pageId="public-pages" manualSectionId="navegacion">Cuando una página está oculta, desaparece del encabezado y el pie y su contenido público deja de renderizarse. Los interruptores de cada página siguen disponibles dentro de su editor para trabajar por bloque.</AdminPageHelp>
        <section className="cms-editor-card" aria-labelledby="public-pages-title">
          <div className="mb-5"><h2 id="public-pages-title" className="text-xl font-semibold">Páginas del sitio</h2><p className="mt-1 text-sm text-muted-foreground">Elige qué páginas puede ver el público. El cambio se guarda una sola vez y se aplica a todos los idiomas.</p></div>
          <div className="grid gap-4 lg:grid-cols-2">
            {pages.map((page) => {
              const state = draft.pages?.[page.id] ?? defaultPage(page.id);
              const publicPath = page.path ? localizeHref(page.path, "es") : "";
              return <article key={page.id} className="rounded-xl border border-[var(--admin-line,#dce3e5)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold text-[var(--admin-ink,#172b39)]">{page.label}</h3><p className="mt-1 text-sm text-muted-foreground">{page.description}</p>{publicPath && <code className="mt-2 inline-block text-xs text-muted-foreground">{publicPath}</code>}</div><label className="flex shrink-0 items-center gap-2 text-sm font-medium"><Switch checked={state.enabled !== false} onCheckedChange={(enabled) => updatePage(page.id, enabled)} />{state.enabled !== false ? "Visible" : "Oculta"}</label></div>
                <p className="mt-3 text-xs text-muted-foreground">{state.enabled !== false ? "Aparece en el menú, el pie y su ruta pública." : "Se oculta del menú, el pie y todo su contenido público."}</p>
                <div className="mt-4 flex flex-wrap gap-3"><Link href={`/admin/page/${page.id}`} className="admin-subtle-link">Editar contenido ↗</Link>{publicPath && <a href={publicPath} target="_blank" rel="noopener noreferrer" className="admin-subtle-link">Ver página pública ↗</a>}</div>
              </article>;
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3"><Button disabled={!dirty || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Guardando…" : "Guardar cambios"}</Button>{save.isError && <span className="text-sm text-red-700" role="alert">{save.error.message}</span>}{!save.isError && !dirty && <span className="text-sm text-emerald-700" role="status">Todo está guardado.</span>}</div>
        </section>
      </div>
    </main>
  );
}
