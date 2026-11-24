import type { Config, Data } from "@puckeditor/core";
import type { ReactNode } from "react";
import { MediaField } from "@/features/site-config/MediaField";
import {
  HomeCatalogPreview,
  HomeHeroPreview,
  HomeIndustriesPreview,
  HomeIntroPreview,
  HomeMonitorPreview,
  HomePracticesPreview,
  HomeQuotePreview,
  HomeTeamPreview,
  PageSectionPreview,
  VisualFallback,
} from "./visualLiveBlocks";

type Tone = "navy" | "paper" | "lime";

const sourceOptions = [
  { label: "Catálogo de prácticas", value: "practices" },
  { label: "Catálogo de industrias", value: "industries" },
  { label: "Directorio de equipo", value: "team" },
  { label: "Monitor Laboral", value: "news" },
  { label: "Biblioteca de medios", value: "media" },
  { label: "Navegación compartida", value: "navigation" },
  { label: "Contacto compartido", value: "contact" },
] as const;

const toneOptions = [
  { label: "Papel", value: "paper" },
  { label: "Azul", value: "navy" },
  { label: "Lima", value: "lime" },
] as const;

function Surface({ tone = "paper", children }: { tone?: Tone; children: ReactNode }) {
  return <div className={`visual-builder-surface visual-builder-surface--${tone}`}>{children}</div>;
}

function ReferenceSurface({ label, source, tone = "paper" }: { label: string; source?: string; tone?: Tone }) {
  return <Surface tone={tone}><div className="visual-builder-reference"><span>Fuente CMS · {source || "contenido compartido"}</span><h2>{label}</h2><p>Este bloque utiliza la fuente editorial de su catálogo y conserva sus permisos, traducciones y visibilidad.</p></div></Surface>;
}

function referenceComponent(label: string, defaultSource: string) {
  return {
    label,
    fields: {
      source: { type: "select", label: "Fuente editorial", options: sourceOptions },
      limit: { type: "number", label: "Elementos visibles", min: 1, max: 24 },
      tone: { type: "select", label: "Fondo", options: toneOptions },
    },
    defaultProps: { source: defaultSource, limit: 6, tone: "paper" },
    render: ({ source, limit, tone }: Record<string, string>) => <><HomeCatalogPreview source={source} limit={Number(limit) || 6} /><VisualFallback><ReferenceSurface label={label} source={source} tone={(tone as Tone) || "paper"} /></VisualFallback></>,
  };
}

const libraryMediaField = {
  type: "custom" as const,
  label: "Medio de Biblioteca",
  render: ({ value, onChange, id }: { value: unknown; onChange: (value: string) => void; id: string }) => (
    <MediaField id={id} value={typeof value === "string" ? value : ""} onChange={onChange} />
  ),
};

export const visualBuilderConfig: Config = {
  categories: {
    contenido: { title: "Contenido", components: ["HeroBlock", "TextBlock", "QuoteBlock", "StatsBlock", "SectionBlock"], defaultExpanded: true },
    catalogos: { title: "Catálogos y fichas", components: ["PracticesGrid", "IndustriesGrid", "TeamGrid", "NewsFeed"], defaultExpanded: true },
    estructura: { title: "Estructura y formularios", components: ["Navigation", "Footer", "Form", "Map", "VisualSheet", "Spacer"], defaultExpanded: false },
    medios: { title: "Medios", components: ["MediaBlock", "VideoBlock", "Gallery"], defaultExpanded: true },
  },
  components: {
    HeroBlock: {
      label: "Hero",
      fields: {
        eyebrow: { type: "text", label: "Etiqueta" },
        title: { type: "text", label: "Título" },
        description: { type: "textarea", label: "Descripción" },
        mediaPath: libraryMediaField,
        tone: { type: "select", label: "Fondo", options: [{ label: "Azul", value: "navy" }, { label: "Papel", value: "paper" }, { label: "Lima", value: "lime" }] },
      },
      defaultProps: { eyebrow: "Santos & Saucedo", title: "Al lado de las empresas", description: "Edita este bloque desde el constructor visual.", mediaPath: "", tone: "navy" },
      render: ({ eyebrow, title, description, mediaPath, tone }: Record<string, string>) => <><HomeHeroPreview title={title} description={description} mediaPath={mediaPath} /><VisualFallback><Surface tone={(tone as Tone) || "navy"}><div className="visual-builder-hero"><div><p className="visual-builder-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{mediaPath ? <img src={mediaPath} alt="" width="1200" height="700" loading="lazy" /> : <div className="visual-builder-media-placeholder">Selecciona un medio desde la Biblioteca</div>}</div></Surface></VisualFallback></>,
    },
    TextBlock: {
      label: "Texto",
      fields: {
        title: { type: "text", label: "Título" },
        body: { type: "textarea", label: "Párrafo" },
        tone: { type: "select", label: "Fondo", options: [{ label: "Papel", value: "paper" }, { label: "Azul", value: "navy" }, { label: "Lima", value: "lime" }] },
      },
      defaultProps: { title: "Título del bloque", body: "Texto editable del bloque.", tone: "paper" },
      render: ({ title, body, tone }: Record<string, string>) => <><HomeIntroPreview title={title} body={body} /><VisualFallback><Surface tone={(tone as Tone) || "paper"}><div className="visual-builder-copy"><h2>{title}</h2><p>{body}</p></div></Surface></VisualFallback></>,
    },
    QuoteBlock: {
      label: "Cita",
      fields: { quote: { type: "textarea", label: "Cita" }, author: { type: "text", label: "Autor" } },
      defaultProps: { quote: "Una cita editorial del sitio.", author: "Santos & Saucedo" },
      render: ({ quote, author }: Record<string, string>) => <><HomeQuotePreview quote={quote} author={author} /><VisualFallback><Surface tone="navy"><figure className="visual-builder-quote"><blockquote>“{quote}”</blockquote><figcaption>{author}</figcaption></figure></Surface></VisualFallback></>,
    },
    StatsBlock: {
      label: "Cifras",
      fields: { title: { type: "text", label: "Título" }, items: { type: "array", label: "Cifras", arrayFields: { value: { type: "text", label: "Cifra" }, label: { type: "text", label: "Descripción" } } } },
      defaultProps: { title: "Cifras", items: [{ value: "32", label: "Años de experiencia" }] },
      render: ({ title, items }: Record<string, any>) => <VisualFallback><Surface tone="paper"><div className="visual-builder-stats"><h2>{title}</h2><div>{(items || []).map((item: any, index: number) => <article key={`${item.value}-${index}`}><strong>{item.value}</strong><span>{item.label}</span></article>)}</div></div></Surface></VisualFallback>,
    },
    SectionBlock: {
      label: "Sección existente",
      fields: { sectionId: { type: "text", label: "Referencia CMS" }, title: { type: "text", label: "Nombre visible" }, description: { type: "textarea", label: "Descripción" } },
      defaultProps: { sectionId: "home", title: "Sección existente", description: "Este bloque conserva su fuente editorial actual." },
      render: ({ sectionId, title, description }: Record<string, string>) => <PageSectionPreview sectionId={sectionId} title={title} description={description} />,
    },
    MediaBlock: {
      label: "Imagen o video",
      fields: { mediaPath: libraryMediaField, alt: { type: "text", label: "Texto alternativo" }, caption: { type: "text", label: "Pie de foto" } },
      defaultProps: { mediaPath: "", alt: "", caption: "" },
      render: ({ mediaPath, alt, caption }: Record<string, string>) => <Surface tone="paper"><figure className="visual-builder-media"><div className="visual-builder-media-frame">{mediaPath ? <img src={mediaPath} alt={alt || ""} width="1200" height="800" loading="lazy" /> : <span>Selecciona un medio desde la Biblioteca</span>}</div>{caption && <figcaption>{caption}</figcaption>}</figure></Surface>,
    },
    VideoBlock: {
      label: "Video",
      fields: { videoPath: libraryMediaField, posterPath: libraryMediaField, alt: { type: "text", label: "Texto alternativo" }, tone: { type: "select", label: "Fondo", options: toneOptions } },
      defaultProps: { videoPath: "", posterPath: "", alt: "", tone: "paper" },
      render: ({ videoPath, posterPath, alt, tone }: Record<string, string>) => <Surface tone={(tone as Tone) || "paper"}><figure className="visual-builder-media"><div className="visual-builder-media-frame">{videoPath ? <video controls playsInline muted preload="metadata" poster={posterPath || undefined} aria-label={alt || undefined} width="1200" height="675"><source src={videoPath} /></video> : <span>Selecciona un video desde la Biblioteca</span>}</div></figure></Surface>,
    },
    Gallery: {
      label: "Galería",
      fields: { source: { type: "select", label: "Fuente editorial", options: [{ label: "Biblioteca de medios", value: "media" }, { label: "Fotografías de la página", value: "page-media" }] }, limit: { type: "number", label: "Elementos visibles", min: 1, max: 24 }, tone: { type: "select", label: "Fondo", options: toneOptions } },
      defaultProps: { source: "media", limit: 6, tone: "paper" },
      render: ({ source, limit, tone }: Record<string, string>) => <ReferenceSurface label="Galería" source={`${source || "media"} · ${limit || 6} elementos`} tone={(tone as Tone) || "paper"} />,
    },
    PracticesGrid: referenceComponent("Prácticas", "practices"),
    IndustriesGrid: referenceComponent("Industrias", "industries"),
    TeamGrid: referenceComponent("Socios y equipo", "team"),
    NewsFeed: referenceComponent("Monitor Laboral", "news"),
    Map: {
      label: "Mapa y presencia",
      fields: { source: { type: "select", label: "Fuente editorial", options: [{ label: "Oficinas", value: "offices" }, { label: "Contacto", value: "contact" }] }, tone: { type: "select", label: "Fondo", options: toneOptions } },
      defaultProps: { source: "offices", tone: "paper" },
      render: ({ source, tone }: Record<string, string>) => <ReferenceSurface label="Mapa y presencia" source={source} tone={(tone as Tone) || "paper"} />,
    },
    Form: {
      label: "Formulario",
      fields: { formId: { type: "select", label: "Formulario", options: [{ label: "Contacto", value: "contact" }, { label: "Carreras", value: "careers" }, { label: "Boletín", value: "newsletter" }, { label: "Testimonios", value: "testimonials" }] }, tone: { type: "select", label: "Fondo", options: toneOptions } },
      defaultProps: { formId: "contact", tone: "paper" },
      render: ({ formId, tone }: Record<string, string>) => <ReferenceSurface label="Formulario" source={formId} tone={(tone as Tone) || "paper"} />,
    },
    VisualSheet: {
      label: "Lámina visual",
      fields: { sheetId: { type: "select", label: "Lámina", options: [{ label: "Siempre hacia adelante", value: "siempre-hacia-adelante" }, { label: "Capacidad de reacción", value: "capacidad-de-reaccion" }] }, tone: { type: "select", label: "Fondo", options: toneOptions } },
      defaultProps: { sheetId: "capacidad-de-reaccion", tone: "navy" },
      render: ({ sheetId, tone }: Record<string, string>) => <ReferenceSurface label="Lámina visual" source={sheetId} tone={(tone as Tone) || "navy"} />,
    },
    Navigation: {
      label: "Navegación",
      fields: { source: { type: "select", label: "Fuente editorial", options: [{ label: "Menú principal", value: "navigation" }, { label: "Submenús", value: "subnavigation" }] }, tone: { type: "select", label: "Fondo", options: toneOptions } },
      defaultProps: { source: "navigation", tone: "navy" },
      render: ({ source, tone }: Record<string, string>) => <ReferenceSurface label="Navegación" source={source} tone={(tone as Tone) || "navy"} />,
    },
    Footer: {
      label: "Pie de página",
      fields: { source: { type: "select", label: "Fuente editorial", options: [{ label: "Pie compartido", value: "navigation" }, { label: "Contacto compartido", value: "contact" }] }, tone: { type: "select", label: "Fondo", options: toneOptions } },
      defaultProps: { source: "navigation", tone: "navy" },
      render: ({ source, tone }: Record<string, string>) => <ReferenceSurface label="Pie de página" source={source} tone={(tone as Tone) || "navy"} />,
    },
    Spacer: {
      label: "Espaciador",
      fields: { size: { type: "select", label: "Altura", options: [{ label: "Pequeña", value: "small" }, { label: "Mediana", value: "medium" }, { label: "Grande", value: "large" }] } },
      defaultProps: { size: "medium" },
      render: ({ size }: Record<string, string>) => <div className={`visual-builder-spacer visual-builder-spacer--${["small", "medium", "large"].includes(size) ? size : "medium"}`} aria-hidden="true" />,
    },
  },
  root: {
    fields: { pageTitle: { type: "text", label: "Nombre de la página" } },
    defaultProps: { pageTitle: "Página del sitio" },
    render: (props: any) => <div className="visual-builder-root">{props.children}</div>,
  },
};

type InitialSections = Record<string, unknown>;

export function createInitialVisualData(pageId: string, sections: InitialSections, language = "es"): Data {
  if (pageId === "home") {
    const homeRoot = (sections.home && typeof sections.home === "object" ? sections.home : {}) as Record<string, any>;
    const home = (homeRoot[language] && typeof homeRoot[language] === "object" ? homeRoot[language] : homeRoot.es ?? homeRoot.en ?? homeRoot) as Record<string, any>;
    const hero = home.hero && typeof home.hero === "object" ? home.hero : {};
    const firma = home.firma && typeof home.firma === "object" ? home.firma : {};
    const extranjeras = home.extranjeras && typeof home.extranjeras === "object" ? home.extranjeras : {};
    const media = (sections.media && typeof sections.media === "object" ? sections.media : {}) as Record<string, any>;
    const heroMedia = media.hero && typeof media.hero === "object" ? media.hero : {};
    return {
      root: { props: { pageTitle: "Portada" } },
      content: [
        { type: "HeroBlock", props: { id: "hero", eyebrow: hero.eyebrow || "Santos & Saucedo", title: hero.tagline || "Al lado de las empresas", description: hero.firma || "Derecho laboral para multinacionales.", mediaPath: heroMedia.poster || "", tone: "navy", sourceMap: { eyebrow: "home.hero.eyebrow", title: "home.hero.tagline", description: "home.hero.firma", mediaPath: "media.hero.poster" } } },
        { type: "TextBlock", props: { id: "firma", title: firma.title || "Nuestra firma", body: Array.isArray(firma.body) ? firma.body.join("\n\n") : firma.body || "Edita la introducción de Nuestra firma desde el CMS.", tone: "paper", sourceMap: { title: "home.firma.title", body: "home.firma.body" } } },
        { type: "StatsBlock", props: { id: "cifras", title: "Cifras", items: Array.isArray(extranjeras.figures) ? extranjeras.figures.slice(0, 6).map((item: any) => ({ value: item.value || item.number || "", label: item.label || item.text || "" })) : [{ value: "32", label: "Años de experiencia" }], sourceMap: { items: "home.extranjeras.figures" } } },
        { type: "QuoteBlock", props: { id: "filosofia", quote: home.creemos?.quote || "La prevención y la reacción forman una misma estrategia.", author: home.creemos?.label || "Santos & Saucedo", sourceMap: { quote: "home.creemos.quote", author: "home.creemos.label" } } },
      ],
    } as Data;
  }
  const content = Object.keys(sections).slice(0, 12).map((sectionId) => ({ type: "SectionBlock", props: { id: `section-${sectionId}`, sectionId, title: sectionId, description: "Bloque conectado a la fuente editorial actual." } }));
  return { root: { props: { pageTitle: pageId } }, content } as Data;
}
