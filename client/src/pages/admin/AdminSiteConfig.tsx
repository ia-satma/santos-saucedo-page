import { IntegrationFields } from "@/features/site-config/IntegrationFields";
import type { SiteIntegrations } from "@shared/siteIntegrations";
import { NavigationFields } from "@/features/site-config/NavigationFields";
import type { SiteNavigation } from "@shared/siteControls";
import { useRef, useEffect, useState } from "react";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { queryClient } from "@/lib/queryClient";
import { cmsSections, type CmsSection, type CmsValue } from "@shared/cms";
import { SUPPORTED_LANGUAGES } from "@shared/constants";
import { Button } from "@/components/ui/button";
import { ConfigFields } from "@/features/site-config/ConfigFields";
import { notifyCmsSaved } from "@/hooks/useCmsContent";
import { useToast } from "@/hooks/use-toast";
import { AdminPageHelp } from "@/components/admin/AdminPageHelp";
import { adminHrefForCmsSection, getCmsEditorPage, getCmsTab } from "@/features/site-config/editorMetadata";
import "@/features/site-config/cms-editor.css";

type SectionResponse = { section: CmsSection; content: CmsValue; revision: string; previous: CmsValue | null };

export default function AdminSiteConfig({ fixedSection }: { fixedSection?: CmsSection } = {}) {
  const { section: routeSection } = useParams<{ section?: string }>();
  const selected = (fixedSection || routeSection) === "cookies" ? "consent" : fixedSection || routeSection || "home";
  const [, navigate] = useLocation();
  const section = cmsSections.find((item) => item.key === selected) ?? cmsSections[0];
  const page = getCmsEditorPage(section.key);
  const activeTab = getCmsTab(section.key);
  const { isAuthenticated, isLoading, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState<CmsValue | undefined>();
  const [snapshot, setSnapshot] = useState("");
  const [revision, setRevision] = useState("initial");
  const [lang, setLang] = useState("es");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { requireAuth(); }, [requireAuth]);
  const queryKey = ["/api/admin/site-config", section.key];
  const query = useQuery<SectionResponse>({ queryKey, enabled: isAuthenticated, refetchOnWindowFocus: false, staleTime: Infinity, queryFn: async () => {
    const response = await adminApiRequest("GET", `/api/admin/site-config/${section.key}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo abrir la sección.");
    return data;
  }});
  const loadedSection = useRef("");
  useEffect(() => {
    if (!query.data || (loadedSection.current === section.key && draft !== undefined && JSON.stringify(draft) !== snapshot)) return;
    loadedSection.current = section.key;
    setDraft(query.data.content);
    setSnapshot(JSON.stringify(query.data.content));
    setRevision(query.data.revision);
    setError("");
  }, [query.data, section.key, draft, snapshot]);
  const dirty = draft !== undefined && JSON.stringify(draft) !== snapshot;
  useEffect(() => { const fn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", fn); return () => window.removeEventListener("beforeunload", fn); }, [dirty]);
  useUnsavedChanges(dirty);
  const save = useMutation({ mutationFn: async () => {
    const response = await adminApiRequest("PUT", `/api/admin/site-config/${section.key}`, { content: draft, revision });
    const data = await response.json();
    if (!response.ok) throw new Error([data.error, ...(data.details ?? [])].filter(Boolean).join("\n"));
    return data as SectionResponse;
  }, onSuccess: (data) => { setDraft(data.content); setSnapshot(JSON.stringify(data.content)); setRevision(data.revision); queryClient.setQueryData(queryKey, data); notifyCmsSaved(); toast({ title: "Cambios guardados en el sitio" }); setError(""); }, onError: (cause: Error) => setError(cause.message) });
  const storageStatus = useQuery<{ configured: boolean; migration: { state: string; uploaded: number; total: number; bytes: number; error?: string } }>({ queryKey: ["/api/admin/storage/status"], enabled: isAuthenticated && section.key === "media", refetchInterval: 5000, queryFn: async () => { const response = await adminApiRequest("GET", "/api/admin/storage/status"); if (!response.ok) throw new Error("No se pudo consultar App Storage."); return response.json(); } });
  const [storageBusy, setStorageBusy] = useState(false);
  const storageAction = async (action: "verify" | "import") => { setStorageBusy(true); setError(""); try { const response = await adminApiRequest("POST", `/api/admin/storage/${action}`, {}); const data = await response.json(); if (!response.ok) throw new Error(data.error || "No se pudo completar la operación."); toast({ title: action === "verify" ? "App Storage conectado y verificado" : "Importación iniciada" }); void storageStatus.refetch(); } catch (cause) { setError((cause as Error).message); } finally { setStorageBusy(false); } };
  const changeSection = (key: string) => { if (key === section.key) return; if (dirty && !window.confirm("Hay cambios sin guardar. ¿Descartarlos y abrir otra sección?")) return; setDraft(undefined); setSnapshot(""); setError(""); navigate(adminHrefForCmsSection(key as CmsSection)); };
  const obj = draft && !Array.isArray(draft) && typeof draft === "object" ? draft : undefined;
  const langs = SUPPORTED_LANGUAGES.filter((item) => obj && item.code in obj);
  const selectedLang = langs.some((item) => item.code === lang) ? lang : langs[0]?.code;
  const value = selectedLang && obj ? obj[selectedLang] : draft;
  if (isLoading || !isAuthenticated) return <p className="p-8" role="status">Verificando sesión…</p>;

  return <div className="cms-editor-page">
    <header className="cms-editor-header"><div className="cms-editor-header-inner">
      <div className="cms-editor-breadcrumb" aria-label="Ruta del editor"><Link href="/admin/dashboard">Inicio</Link><span aria-hidden="true">›</span><span>{page.group}</span><span aria-hidden="true">›</span><strong>{page.label}</strong></div>
      <div className="cms-editor-heading-row"><div><h1>{page.label}</h1><p>{page.description}</p><span className="cms-editor-impact">{page.impact}</span></div><span className="cms-editor-status" role="status">{dirty ? "Cambios sin guardar" : "Cambios guardados"}</span></div>
      <div className="flex flex-wrap gap-3 mt-5"><a href={section.path} target="_blank" rel="noopener noreferrer" className="admin-subtle-link">Ver página pública ↗</a><Button variant="outline" onClick={() => setShowPreview((current) => !current)}>{showPreview ? "Cerrar vista previa" : "Ver vista previa"}</Button><Button disabled={!dirty || save.isPending} onClick={() => save.mutate()} data-testid="button-save-site-config">{save.isPending ? "Guardando…" : "Guardar cambios"}</Button></div>
    </div></header>
    <main className="cms-editor-main" id="admin-main">
      <AdminPageHelp pageId={`site-config-${page.id}`} manualSectionId={page.manualId}>Edita esta página por bloques. Guarda los cambios para reflejarlos en el sitio. Los campos de idioma mantienen separadas las versiones en español e inglés.</AdminPageHelp>
      <nav className="cms-editor-tabs" aria-label={`Secciones de ${page.label}`}>{page.tabs.map((tab) => <Link key={tab.section} href={adminHrefForCmsSection(tab.section)} className={`cms-editor-tab ${tab.section === section.key ? "is-active" : ""}`} aria-current={tab.section === section.key ? "page" : undefined} title={tab.description}>{tab.label}</Link>)}</nav>
      <div className="flex items-center justify-between gap-4 mb-5"><div><h2 className="text-xl font-semibold text-[var(--admin-ink,#172b39)]">{activeTab.label}</h2><p className="text-sm text-[var(--admin-muted,#68777c)] mt-1">{activeTab.description}</p></div><Link href="/admin/content" className="admin-subtle-link">Ver directorio completo</Link></div>
      {section.key === "media" && <div className="cms-editor-card mb-5 space-y-3"><h3 className="font-semibold">Biblioteca de medios y App Storage</h3><p className="text-sm text-muted-foreground">Carga y verifica imágenes, videos y documentos antes de enlazarlos al sitio.</p><p className="text-sm">{storageStatus.data?.configured ? "Bucket configurado." : "Falta configurar REPLIT_APP_STORAGE_BUCKET_ID en Replit."}</p>{storageStatus.data && <p className="text-sm">Importación {storageStatus.data.migration.state} · {storageStatus.data.migration.uploaded}/{storageStatus.data.migration.total} archivos verificados</p>}{storageStatus.data?.migration.error && <p role="alert" className="text-red-700 text-sm">{storageStatus.data.migration.error}</p>}<div className="flex flex-wrap gap-3"><Button variant="outline" disabled={storageBusy || !storageStatus.data?.configured} onClick={() => void storageAction("verify")}>Verificar conexión</Button><Button variant="outline" disabled={storageBusy || dirty || !storageStatus.data?.configured || storageStatus.data.migration.state === "running"} onClick={() => void storageAction("import")}>Importar a App Storage</Button><Button variant="outline" disabled={dirty} onClick={() => query.refetch()}>Recargar medios</Button></div></div>}
      {langs.length > 0 && <div className="cms-editor-card mb-5 flex flex-wrap items-center gap-3"><label htmlFor="cms-language" className="text-sm font-semibold">Idioma que estás editando</label><select id="cms-language" className="border rounded-md p-2 bg-background" value={selectedLang ?? "es"} onChange={(event) => setLang(event.target.value)}>{langs.map((item) => <option key={item.code} value={item.code}>{item.nameNative}</option>)}</select></div>}
      {error && <div role="alert" className="border border-red-300 bg-red-50 text-red-800 whitespace-pre-line p-4 mb-5 rounded-xl">{error}<Button variant="outline" size="sm" className="mt-3" onClick={() => { if (!dirty || window.confirm("¿Descartar el borrador y cargar la última versión?")) { setDraft(undefined); void query.refetch(); } }}>Recargar versión guardada</Button></div>}
      {query.isLoading && <p role="status">Cargando contenido…</p>}{query.isError && <p role="alert">{query.error.message} <Button variant="outline" onClick={() => query.refetch()}>Reintentar</Button></p>}
      {value !== undefined && <section className="cms-editor-card" aria-labelledby="cms-editor-content-title"><h3 id="cms-editor-content-title" className="sr-only">Campos editables de {activeTab.label}</h3>{section.key === "integrations" ? <IntegrationFields value={value as unknown as SiteIntegrations} onChange={(next) => setDraft(next as unknown as CmsValue)} /> : section.key === "navigation" ? <NavigationFields value={value as unknown as SiteNavigation} onChange={(next) => setDraft(next as unknown as CmsValue)} /> : <ConfigFields value={value} media={section.key === "media" || section.key === "v3" || section.key === "home"} path={selectedLang ? [selectedLang] : []} onChange={(next) => setDraft(selectedLang && obj ? { ...obj, [selectedLang]: next } : next)} />}</section>}
      {query.data?.previous && <div className="mt-5"><Button variant="outline" onClick={() => { if (window.confirm("¿Cargar la versión anterior como borrador? Tendrás que guardar para aplicarla.")) setDraft(query.data!.previous!); }}>Restaurar versión anterior como borrador</Button></div>}
      {showPreview && <div className="cms-editor-card mt-5 p-0 overflow-hidden"><p className="p-4 text-sm text-muted-foreground">Vista del sitio guardado. El borrador se muestra después de guardar.</p><iframe key={query.data?.revision} title={`Vista previa de ${page.label}`} src={`${section.path}?cms-preview=1`} className="w-full h-[700px] border-t" /></div>}
      <select id="cms-section" value={section.key} onChange={(event) => changeSection(event.target.value)} className="sr-only" aria-label="Sección técnica actual">{cmsSections.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select>
    </main>
  </div>;
}
