import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cmsEditorPages, getCmsPage } from "@/features/site-config/editorMetadata";
import { VisualPageEditor } from "@/features/visual-builder/VisualPageEditor";
import { PageVisibilityPanel } from "@/features/site-config/PageVisibilityPanel";
import { adminApiRequest, useAdminAuth } from "@/lib/adminAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "@shared/constants";
import type { CmsValue } from "@shared/cms";
import "./admin-visual-editor.css";

type SectionResponse = { section: string; content: CmsValue };

export default function AdminVisualEditor() {
  const { language } = useLanguage();
  const { isAuthenticated, isLoading, requireAuth } = useAdminAuth();
  const params = useParams<{ pageId?: string }>();
  const [pageId, setPageId] = useState(params.pageId && getCmsPage(params.pageId) ? params.pageId : "home");
  const [editingLanguage, setEditingLanguage] = useState(language === "es" ? "es" : language);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ss-admin-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const page = getCmsPage(pageId) ?? cmsEditorPages[0];
  const sections = useMemo(() => page.tabs.map((tab) => tab.section), [page]);

  useEffect(() => { requireAuth(); }, [requireAuth]);
  useEffect(() => { if (params.pageId && getCmsPage(params.pageId)) setPageId(params.pageId); }, [params.pageId]);
  useEffect(() => {
    const onState = (event: Event) => {
      const detail = (event as CustomEvent<{ collapsed?: boolean }>).detail;
      if (typeof detail?.collapsed === "boolean") setSidebarCollapsed(detail.collapsed);
    };
    window.addEventListener("ss:admin-sidebar-state", onState);
    return () => window.removeEventListener("ss:admin-sidebar-state", onState);
  }, []);

  const toggleAdminSidebar = () => {
    window.dispatchEvent(new Event("ss:toggle-admin-sidebar"));
    setSidebarCollapsed((value) => !value);
  };

  const query = useQuery<SectionResponse[]>({
    queryKey: ["/api/admin/visual-editor", page.id, sections.join(",")],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    queryFn: async () => Promise.all(sections.map(async (section) => {
      const response = await adminApiRequest("GET", `/api/admin/site-config/${section}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `No se pudo cargar ${section}.`);
      return { section, content: data.content } as SectionResponse;
    })),
  });

  if (isLoading || !isAuthenticated) return <p className="p-8" role="status">Verificando sesión…</p>;
  const drafts = Object.fromEntries((query.data ?? []).map((item) => [item.section, item.content]));
  const pages = cmsEditorPages.filter((item) => item.id !== "media");

  return <div className="visual-editor-workspace">
    <header className="visual-editor-workspace-header">
      <div><div className="visual-editor-breadcrumb"><Link href="/admin/dashboard">Inicio</Link><span aria-hidden="true">›</span><strong>Editor visual</strong></div><h1>Editor visual</h1><p>Construye la composición de cada página con bloques controlados. Arrastra, duplica, edita y revisa el resultado antes de publicar.</p></div>
      <div className="visual-editor-header-actions"><button type="button" className="visual-editor-link visual-editor-sidebar-button" onClick={toggleAdminSidebar} aria-expanded={!sidebarCollapsed} aria-label={sidebarCollapsed ? "Mostrar menú lateral del CMS" : "Ocultar menú lateral del CMS"}>{sidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}</button><a href={page.path || "/"} target="_blank" rel="noopener noreferrer" className="visual-editor-link">Ver página pública ↗</a><Link href={`/admin/page/${page.id}`} className="visual-editor-link">Editor detallado ↗</Link></div>
    </header>
    <div className="visual-editor-layout">
      <aside className="visual-editor-page-list" aria-label="Páginas para editar visualmente"><div className="visual-editor-panel-heading"><span>Páginas</span><small>{pages.length}</small></div>{pages.map((item) => <button key={item.id} type="button" className={item.id === page.id ? "is-active" : ""} onClick={() => setPageId(item.id)}><span>{item.label}</span><small>{item.path || "/"}</small></button>)}</aside>
      <main className="visual-editor-canvas-area">
        <div className="visual-editor-canvas-toolbar"><label htmlFor="visual-editor-page">Página</label><select id="visual-editor-page" value={page.id} onChange={(event) => setPageId(event.target.value)}>{pages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><label htmlFor="visual-editor-language">Idioma</label><select id="visual-editor-language" value={editingLanguage} onChange={(event) => setEditingLanguage(event.target.value)}>{SUPPORTED_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.nameNative}</option>)}</select><span className="visual-editor-live-badge"><span aria-hidden="true" />Lienzo en tiempo real</span></div>
        <PageVisibilityPanel pageId={page.id} />
        {query.isLoading && <p className="visual-editor-state" role="status">Cargando la página visual…</p>}
        {query.isError && <p className="visual-editor-state visual-editor-state--error" role="alert">{query.error.message}</p>}
        {!query.isLoading && !query.isError && <VisualPageEditor pageId={page.id} language={editingLanguage} pageLabel={page.label} sections={drafts} />}
      </main>
      <aside className="visual-editor-info-panel"><div className="visual-editor-panel-heading"><span>Esta página</span></div><h2>{page.label}</h2><p>{page.description}</p><dl><div><dt>Bloques</dt><dd>{page.blocks.length}</dd></div><div><dt>Fuente pública</dt><dd>{page.path || "/"}</dd></div><div><dt>Publicación</dt><dd>Revisión y restauración</dd></div></dl><Link href={`/admin/page/${page.id}`} className="visual-editor-detail-link">Abrir campos detallados ↗</Link></aside>
    </div>
  </div>;
}
