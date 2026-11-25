import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cmsEditorPages, getCmsPage } from "@/features/site-config/editorMetadata";
import { ConfigFields } from "@/features/site-config/ConfigFields";
import { ExplicitAboutFields, ExplicitHomeFields, ExplicitPracticeFields } from "@/features/site-config/ExplicitPageFields";
import { PageVisibilityPanel } from "@/features/site-config/PageVisibilityPanel";
import { InlineCatalogFields } from "@/features/site-config/InlineCatalogFields";
import { TeamMosaicFields } from "@/features/site-config/TeamMosaicFields";
import { AdminPageHelp } from "@/components/admin/AdminPageHelp";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { localizeHref } from "@/lib/localeRouting";
import { notifyCmsSaved } from "@/hooks/useCmsContent";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES } from "@shared/constants";
import type { CmsSection, CmsValue } from "@shared/cms";
import { Button } from "@/components/ui/button";
import { getPageBlockMeta } from "@/features/site-config/pageBlockCatalog";
import "@/features/site-config/cms-editor.css";

type SectionResponse = { section: CmsSection; content: CmsValue; revision: string; previous: CmsValue | null };
type BundleResponse = { sections: Record<string, SectionResponse> };
const PREVIEW_STORAGE_KEY = "santos-cms-preview-content";

const catalogLinks: Record<string, { label: string; href: string }[]> = {
  practices: [{ label: "Administrar fichas de prácticas", href: "/admin/practice-groups" }],
  industries: [{ label: "Administrar fichas de industrias", href: "/admin/industry-groups" }],
  team: [
    { label: "Editar carrusel de colaboradores", href: "/admin/page/team#page-block-3" },
    { label: "Administrar perfiles de socios y equipo", href: "/admin/team" },
  ],
  news: [{ label: "Administrar notas del Monitor", href: "/admin/news" }, { label: "Administrar categorías", href: "/admin/categories" }],
  careers: [{ label: "Administrar vacantes", href: "/admin/jobs" }],
  testimonials: [{ label: "Revisar testimonios", href: "/admin/testimonials" }],
  media: [{ label: "Abrir Biblioteca de medios", href: "/admin/media" }],
};

const sharedCmsLinks: { section: CmsSection; label: string; href: string; description: string }[] = [
  { section: "chrome", label: "Menú y pie de página", href: "/admin/site-config/chrome", description: "Etiquetas que pueden aparecer en varias páginas." },
  { section: "contactData", label: "Datos del despacho", href: "/admin/site-config/contactData", description: "Dirección, teléfonos y correos compartidos." },
  { section: "media", label: "Biblioteca de medios", href: "/admin/media", description: "Imágenes, videos y documentos reutilizables." },
  { section: "links", label: "Enlaces y botones", href: "/admin/site-config/links", description: "Destinos usados por varias llamadas a la acción." },
  { section: "forms", label: "Formularios públicos", href: "/admin/site-config/forms", description: "Activación y mensajes de contacto y suscripción." },
];

const tabBlockKeys: Record<string, Record<string, string>> = {
  about: { "Historia y valores": "historia", "Láminas visuales": "laminas" },
  practices: { Portada: "hero", Servicios: "servicios", Fichas: "lista", Idiomas: "lista", "Lámina Capacidad de reacción": "laminaReaccion" },
  industries: { Portada: "hero", Fichas: "lista" },
  team: { Portada: "hero", "Carrusel de colaboradores": "colaboradores" },
  news: { Introducción: "hero", "Filtros y estados": "filtros", Suscripción: "suscripcion", Notas: "publicaciones" },
  contact: { Contenido: "hero", "Datos del despacho": "datos", "Consentimiento": "formulario", Respuestas: "formulario", "Controles del formulario": "formulario" },
  offices: { "Nombre de la página": "hero", Contenido: "datos", Medios: "galeria", "Datos del despacho": "datos" },
  careers: { Carreras: "hero", Pasantías: "informacion", Formularios: "formulario", Medios: "informacion" },
  testimonials: { Contenido: "hero", Medios: "hero" },
  interns: { Pasantías: "hero", Formularios: "formulario" },
  newsletter: { Contenido: "hero", Formularios: "formulario", "Notas relacionadas": "relacionadas" },
  privacy: { Contenido: "hero", Contacto: "contacto", Medios: "hero" },
  terms: { Contenido: "hero", Contacto: "contacto", Medios: "hero" },
};

function isLanguageMap(value: CmsValue): value is Record<string, CmsValue> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).some((key) => SUPPORTED_LANGUAGES.some((language) => language.code === key)));
}

export default function AdminPageEditor() {
  const { pageId = "home" } = useParams<{ pageId?: string }>();
  const [location] = useLocation();
  const page = getCmsPage(pageId) ?? cmsEditorPages[0];
  const { language } = useLanguage();
  const publicPath = localizeHref(page.path || "/", language);
  const { isAuthenticated, isLoading, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, CmsValue>>({});
  const [snapshot, setSnapshot] = useState("");
  const [revisions, setRevisions] = useState<Record<string, string>>({});
  const [lang, setLang] = useState(language === "es" ? "es" : language);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>();

  useEffect(() => { requireAuth(); }, [requireAuth]);
  const sections = useMemo(() => page.tabs.map((tab) => tab.section), [page]);
  const query = useQuery<SectionResponse[]>({
    queryKey: ["/api/admin/page-editor", page.id, sections.join(",")],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const responses = await Promise.all(sections.map(async (section) => {
        const response = await adminApiRequest("GET", `/api/admin/site-config/${section}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `No se pudo cargar ${section}.`);
        return data as SectionResponse;
      }));
      return responses;
    },
  });

  useEffect(() => {
    if (!query.data) return;
    const nextDrafts = Object.fromEntries(query.data.map((item) => [item.section, item.content]));
    setDrafts(nextDrafts);
    setRevisions(Object.fromEntries(query.data.map((item) => [item.section, item.revision])));
    setSnapshot(JSON.stringify(nextDrafts));
  }, [query.data]);
  useEffect(() => {
    if (!showPreview) {
      sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
      setPreviewSrc(undefined);
      return;
    }
    try {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(drafts));
      setPreviewSrc(`${publicPath}?cms-preview=1&draft=${Date.now()}`);
    } catch {
      setPreviewSrc(`${publicPath}?cms-preview=1`);
    }
  }, [drafts, publicPath, showPreview]);
  useEffect(() => {
    const focus = new URLSearchParams(location.split("?")[1] || "").get("focus");
    if (!focus) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(`cms-${focus.split(".").join("-")}`) || document.querySelector<HTMLElement>(".cms-page-content .cms-explicit-block");
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location, query.data]);

  const dirty = JSON.stringify(drafts) !== snapshot;
  const save = useMutation({
    mutationFn: async () => {
      const response = await adminApiRequest("PUT", "/api/admin/site-config-bundle", {
        sections: sections.map((section) => ({ section, content: drafts[section], revision: revisions[section] })),
      });
      const data = await response.json();
      if (!response.ok) throw new Error([data.error, ...(data.details ?? [])].filter(Boolean).join("\n"));
      return data as BundleResponse;
    },
    onSuccess: (data) => {
      const nextRevisions = Object.fromEntries(Object.entries(data.sections).map(([section, item]) => [section, item.revision]));
      setRevisions(nextRevisions);
      setSnapshot(JSON.stringify(drafts));
      notifyCmsSaved();
      toast({ title: "Borrador guardado" });
    },
  });
  const publish = useMutation({
    mutationFn: async () => {
      const response = await adminApiRequest("POST", "/api/admin/site-config-bundle/publish", {
        sections: sections.map((section) => ({ section, revision: revisions[section] })),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo publicar el paquete.");
      return data as BundleResponse;
    },
    onSuccess: (data) => {
      const nextRevisions = Object.fromEntries(Object.entries(data.sections).map(([section, item]) => [section, item.revision]));
      setRevisions((current) => ({ ...current, ...nextRevisions }));
      setSnapshot(JSON.stringify(drafts));
      notifyCmsSaved();
      toast({ title: "Cambios publicados" });
    },
  });

  if (isLoading || !isAuthenticated) return <p className="p-8" role="status">Verificando sesión…</p>;

  const updateSection = (section: string, next: CmsValue) => setDrafts((current) => ({ ...current, [section]: next }));
  const links = catalogLinks[page.id] ?? [];
  const sharedLinks = sharedCmsLinks.filter((item) => sections.includes(item.section) && item.href !== `/admin/page/${page.id}`);

  return (
    <div className="cms-editor-page">
      <header className="cms-editor-header"><div className="cms-editor-header-inner">
        <div className="cms-editor-breadcrumb" aria-label="Ruta del editor"><Link href="/admin/dashboard">Inicio</Link><span aria-hidden="true">›</span><span>Contenido del sitio</span><span aria-hidden="true">›</span><strong>{page.label}</strong></div>
        <div className="cms-editor-heading-row"><div><p className="cms-editor-kicker">Estás editando</p><h1>{page.label}</h1><p>{page.description}</p><span className="cms-editor-impact">{page.impact}</span></div><span className="cms-editor-status" role="status">{dirty ? "Borrador sin guardar" : "Cambios guardados"}</span></div>
        <div className="flex flex-wrap gap-3 mt-5"><a href={publicPath} target="_blank" rel="noopener noreferrer" className="admin-subtle-link">Ver página pública ↗</a><Button variant="outline" onClick={() => setShowPreview((current) => !current)}>{showPreview ? "Cerrar vista previa" : "Ver vista previa"}</Button><Button disabled={!dirty || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Guardando…" : "Guardar borrador"}</Button><Button variant="outline" disabled={publish.isPending || dirty} onClick={() => publish.mutate()}>{publish.isPending ? "Publicando…" : "Publicar cambios"}</Button><Link href={`/admin/site-config/${page.tabs[0].section}`} className="admin-subtle-link">Directorio técnico</Link></div>
        {save.isError && <p className="mt-3 text-sm text-red-700" role="alert">No se guardó el borrador. {save.error.message}</p>}
        {publish.isError && <p className="mt-3 text-sm text-red-700" role="alert">No se publicaron los cambios. {publish.error.message}</p>}
      </div></header>
      <main className="cms-editor-main">
        <AdminPageHelp pageId={`page-${page.id}`} manualSectionId={page.manualId}>Edita esta página de arriba abajo. Cada bloque conserva sus textos, medios, enlaces, visibilidad y orden. Los campos compartidos indican dónde más aparecen.</AdminPageHelp>
        <div className="cms-page-layout">
          <aside className="cms-page-index" aria-label={`Índice de ${page.label}`}><p className="cms-page-index-title">En esta página</p>{page.tabs.map((tab, index) => <a key={`${tab.section}-${index}`} href={`#page-block-${index}`}>{tab.label}</a>)}{links.map((link) => <Link key={link.href} href={link.href}>{link.label} ↗</Link>)}</aside>
          <div className="cms-page-content">
            <section className="cms-quick-actions" aria-labelledby="cms-quick-actions-title">
              <div>
                <h2 id="cms-quick-actions-title">¿Qué quieres cambiar?</h2>
                <p>Elige una opción para ir directamente al lugar correcto. Los nombres indican qué parte de la página se modifica.</p>
              </div>
              <div className="cms-quick-actions-list">
                {page.tabs.map((tab, index) => <a key={`jump-${tab.section}-${index}`} href={`#page-block-${index}`}>{tab.label}</a>)}
                {links.map((link) => <Link key={`quick-${link.href}`} href={link.href}>{link.label} ↗</Link>)}
              </div>
            </section>
            <div className="cms-editor-card mb-5 flex flex-wrap items-center gap-3"><label htmlFor="cms-page-language" className="text-sm font-semibold">Idioma que estás editando</label><select id="cms-page-language" className="border rounded-md p-2 bg-background" value={lang} onChange={(event) => setLang(event.target.value)}>{SUPPORTED_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.nameNative}</option>)}</select></div>
            <PageVisibilityPanel pageId={page.id} />
            {sharedLinks.length > 0 && <section className="cms-related-card" aria-labelledby="cms-shared-title">
              <div>
                <h2 id="cms-shared-title">Contenido compartido</h2>
                <p>Estos datos pueden aparecer en más de una página. Si los cambias aquí, el mismo contenido se actualiza en todos sus lugares.</p>
              </div>
              <div className="cms-related-links">{sharedLinks.map((link) => <Link key={link.section} href={link.href} title={link.description}>{link.label} ↗</Link>)}</div>
            </section>}
            {page.id === "practices" && <InlineCatalogFields kind="practice" />}
            {page.id === "industries" && <InlineCatalogFields kind="industry" />}
            {page.id === "team" && <InlineCatalogFields kind="team" />}
            {page.id === "news" && <InlineCatalogFields kind="news" />}
            {page.id === "careers" && <InlineCatalogFields kind="job" />}
            {query.isLoading && <p role="status">Cargando bloques…</p>}
            {query.isError && <p role="alert">{query.error.message}</p>}
            {page.tabs.map((tab, index) => {
              const content = drafts[tab.section];
              if (content === undefined) return null;
              const localized = isLanguageMap(content) && content[lang] !== undefined;
              const current = localized ? content[lang] : content;
              const update = (next: CmsValue) => updateSection(tab.section, localized ? { ...content, [lang]: next } : next);
              const fields = tab.section === "home"
                ? <ExplicitHomeFields value={current} onChange={update} />
                : tab.section === "about"
                  ? <ExplicitAboutFields value={current} onChange={update} />
                  : tab.section === "v3" && page.id === "practices"
                    ? <ExplicitPracticeFields value={current} onChange={update} />
                  : tab.section === "media" && page.id === "team"
                    ? <><TeamMosaicFields value={current} onChange={update} language={lang} /><ConfigFields value={current} onChange={update} path={localized ? [lang] : []} media excludeKeys={["teamMosaic"]} /></>
                    : <ConfigFields value={current} onChange={update} path={localized ? [lang] : []} media={tab.section === "media" || tab.section === "v3"} />;
              const blockKey = tabBlockKeys[page.id]?.[tab.label];
              const guide = getPageBlockMeta(page.id, blockKey || tab.section);
              if (tab.section === "layout") {
                return <section id={`page-block-${index}`} key={`${tab.section}-${index}`} className="cms-editor-card mb-5 scroll-mt-6"><div className="cms-editor-section-intro"><div><h2>Visibilidad y orden</h2><p>Activa u oculta los bloques de esta página desde el panel de visibilidad. El orden y los límites que todavía necesitan edición aparecen debajo.</p><p className="cms-editor-section-guide"><strong>Dónde aparece:</strong> En esta página pública. Los cambios de visibilidad se guardan con «Guardar visibilidad».</p></div><span className="text-xs text-muted-foreground">Bloque {index + 1} de {page.tabs.length}</span></div><ConfigFields value={current} onChange={update} path={localized ? [lang] : []} excludeKeys={["pages", "home"]} /></section>;
              }
              return <section id={`page-block-${index}`} key={`${tab.section}-${index}`} className="cms-editor-card mb-5 scroll-mt-6"><div className="cms-editor-section-intro"><div><h2>{guide.label || tab.label}</h2><p>{tab.description}</p><p className="cms-editor-section-guide"><strong>Dónde aparece:</strong> {guide.where}. {guide.description}</p></div><span className="text-xs text-muted-foreground">Bloque {index + 1} de {page.tabs.length}</span></div>{fields}</section>;
            })}
            {showPreview && previewSrc && <div className="cms-editor-card mt-5 p-0 overflow-hidden"><p className="p-4 text-sm text-muted-foreground">Vista previa privada del borrador actual. También funciona mientras esta página esté oculta al público. Los cambios no se publican hasta confirmar «Publicar cambios».</p><iframe title={`Vista previa de ${page.label}`} src={previewSrc} className="w-full h-[760px] border-t" /></div>}
          </div>
        </div>
      </main>
    </div>
  );
}
