import { useEffect, useState, type ReactNode } from "react";
import type { VisualComponent, VisualPageData } from "@shared/visualPages";
import { HomeCatalogPreview, HomeHeroPreview, HomeIntroPreview, HomeQuotePreview, VisualBuilderPreviewContext, VisualFallback } from "./visualLiveBlocks";
import "./visual-builder.css";

type VisualPagePublicProps = { pageId: string; language: string; fallback: ReactNode };
type PublicResponse = { data?: VisualPageData | null };
type CatalogRecord = Record<string, unknown>;
type CatalogData = { practices: CatalogRecord[]; industries: CatalogRecord[]; team: CatalogRecord[]; news: CatalogRecord[] };

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.min(24, value)) : fallback;
}

function tone(value: unknown, fallback: "navy" | "paper" | "lime" = "paper") {
  return value === "navy" || value === "lime" || value === "paper" ? value : fallback;
}

function internalMedia(value: unknown) {
  const path = text(value);
  return path.startsWith("/") && !path.startsWith("//") ? path : "";
}

function referenceBlock(id: string, label: string, source: unknown, blockTone: "navy" | "paper" | "lime" = "paper") {
  return <section key={id} className={`visual-builder-surface visual-builder-surface--${blockTone}`}><div className="visual-builder-reference"><span>Fuente CMS · {text(source, "contenido compartido")}</span><h2>{label}</h2><p>Este bloque utiliza la fuente editorial de su catálogo y conserva sus permisos, traducciones y visibilidad.</p></div></section>;
}

function catalogBlock(id: string, label: string, source: unknown, items: CatalogRecord[] | undefined, limitValue: unknown, language: string, basePath: string, blockTone: "navy" | "paper" | "lime") {
  const limit = number(limitValue, 6);
  if (!items) return referenceBlock(id, label, source, blockTone);
  return <section key={id} className={`visual-builder-surface visual-builder-surface--${blockTone}`}><div className="visual-builder-reference"><span>Fuente CMS · {text(source, "catálogo")}</span><h2>{label}</h2>{items.length === 0 ? <p>No hay elementos publicados en este catálogo.</p> : <div className="visual-builder-catalog-grid">{items.slice(0, limit).map((item, itemIndex) => {
    const slug = text(item.slug, `${itemIndex + 1}`);
    const name = language === "es" ? text(item.nameEs, text(item.titleEs, text(item.name, text(item.title, "Elemento")))) : text(item.name, text(item.title, text(item.nameEs, text(item.titleEs, "Item"))));
    const description = language === "es" ? text(item.descriptionEs, text(item.excerptEs, text(item.description, text(item.excerpt)))) : text(item.description, text(item.excerpt, text(item.descriptionEs, text(item.excerptEs))));
    const image = internalMedia(item.imageUrl);
    return <a className="visual-builder-catalog-card" href={`${basePath}/${encodeURIComponent(slug)}`} key={`${slug}-${itemIndex}`}><div className="visual-builder-catalog-image">{image ? <img src={image} alt="" width="640" height="480" loading="lazy" /> : <span aria-hidden="true">{String(itemIndex + 1).padStart(2, "0")}</span>}</div><h3>{name}</h3>{description && <p>{description}</p>}</a>;
  })}</div>}</div></section>;
}

function renderComponent(component: VisualComponent, index: number, catalogs: CatalogData | undefined, language: string, pageId: string) {
  const props = component.props as Record<string, unknown>;
  const id = typeof props.id === "string" ? props.id : `${component.type}-${index}`;
  switch (component.type) {
    case "HeroBlock":
      return pageId === "home" ? <HomeHeroPreview key={id} title={text(props.title)} description={text(props.description)} mediaPath={internalMedia(props.mediaPath)} /> : <section key={id} className={`visual-builder-surface visual-builder-surface--${tone(props.tone, "navy")}`}><div className="visual-builder-hero"><div><p className="visual-builder-eyebrow">{text(props.eyebrow, "Santos & Saucedo")}</p><h1>{text(props.title)}</h1><p>{text(props.description)}</p></div>{internalMedia(props.mediaPath) && <img src={internalMedia(props.mediaPath)} alt="" width="1200" height="700" loading="eager" fetchPriority="high" />}</div></section>;
    case "TextBlock":
      return pageId === "home" ? <HomeIntroPreview key={id} title={text(props.title)} body={text(props.body)} /> : <section key={id} className={`visual-builder-surface visual-builder-surface--${tone(props.tone)}`}><div className="visual-builder-copy"><h2>{text(props.title)}</h2><p>{text(props.body)}</p></div></section>;
    case "QuoteBlock":
      return pageId === "home" ? <HomeQuotePreview key={id} quote={text(props.quote)} author={text(props.author)} /> : <section key={id} className="visual-builder-surface visual-builder-surface--navy"><figure className="visual-builder-quote"><blockquote>“{text(props.quote)}”</blockquote><figcaption>{text(props.author)}</figcaption></figure></section>;
    case "StatsBlock": {
      const items = Array.isArray(props.items) ? props.items : [];
      return pageId === "home" ? null : <section key={id} className="visual-builder-surface visual-builder-surface--paper"><div className="visual-builder-stats"><h2>{text(props.title, "Cifras")}</h2><div>{items.map((item, itemIndex) => { const record = item && typeof item === "object" ? item as Record<string, unknown> : {}; return <article key={`${text(record.value)}-${itemIndex}`}><strong>{text(record.value)}</strong><span>{text(record.label)}</span></article>; })}</div></div></section>;
    }
    case "SectionBlock":
      return <section key={id} className="visual-builder-surface visual-builder-surface--paper"><div className="visual-builder-reference"><span>Fuente CMS · {text(props.sectionId)}</span><h2>{text(props.title)}</h2><p>{text(props.description)}</p></div></section>;
    case "MediaBlock":
      return <section key={id} className="visual-builder-surface visual-builder-surface--paper"><figure className="visual-builder-media"><div className="visual-builder-media-frame">{internalMedia(props.mediaPath) && <img src={internalMedia(props.mediaPath)} alt={text(props.alt)} width="1200" height="800" loading="lazy" />}</div>{text(props.caption) && <figcaption>{text(props.caption)}</figcaption>}</figure></section>;
    case "VideoBlock": {
      const videoPath = internalMedia(props.videoPath);
      const posterPath = internalMedia(props.posterPath);
      return <section key={id} className={`visual-builder-surface visual-builder-surface--${tone(props.tone)}`}><figure className="visual-builder-media"><div className="visual-builder-media-frame">{videoPath ? <video controls playsInline muted preload="metadata" poster={posterPath || undefined} aria-label={text(props.alt) || undefined} width="1200" height="675"><source src={videoPath} /></video> : <span>Video conectado a la Biblioteca de medios</span>}</div></figure></section>;
    }
    case "PracticesGrid":
      return pageId === "home" ? <HomeCatalogPreview key={id} source="practices" limit={number(props.limit, 6)} /> : catalogBlock(id, "Prácticas", props.source, catalogs?.practices, props.limit, language, "/practice-groups", tone(props.tone));
    case "IndustriesGrid":
      return pageId === "home" ? <HomeCatalogPreview key={id} source="industries" limit={number(props.limit, 6)} /> : catalogBlock(id, "Industrias", props.source, catalogs?.industries, props.limit, language, "/industry-groups", tone(props.tone));
    case "TeamGrid":
      return pageId === "home" ? <HomeCatalogPreview key={id} source="team" limit={number(props.limit, 6)} /> : catalogBlock(id, "Socios y equipo", props.source, catalogs?.team, props.limit, language, "/team", tone(props.tone));
    case "NewsFeed":
      return pageId === "home" ? <HomeCatalogPreview key={id} source="news" limit={number(props.limit, 3)} /> : catalogBlock(id, "Monitor Laboral", props.source, catalogs?.news, props.limit, language, "/news", tone(props.tone));
    case "Gallery":
      return referenceBlock(id, "Galería", props.source, tone(props.tone));
    case "Map":
      return referenceBlock(id, "Mapa y presencia", props.source, tone(props.tone));
    case "Form":
      return referenceBlock(id, "Formulario", props.formId, tone(props.tone));
    case "VisualSheet":
      return referenceBlock(id, "Lámina visual", props.sheetId, tone(props.tone, "navy"));
    case "Navigation":
      return referenceBlock(id, "Navegación", props.source, tone(props.tone, "navy"));
    case "Footer":
      return referenceBlock(id, "Pie de página", props.source, tone(props.tone, "navy"));
    case "Spacer":
      return <div key={id} className={`visual-builder-spacer visual-builder-spacer--${["small", "medium", "large"].includes(text(props.size)) ? text(props.size) : "medium"}`} aria-hidden="true" />;
    default:
      return null;
  }
}

export function VisualPagePublic({ pageId, language, fallback }: VisualPagePublicProps) {
  const [data, setData] = useState<VisualPageData | null>();
  const [catalogs, setCatalogs] = useState<CatalogData>();
  useEffect(() => {
    let active = true;
    setData(undefined);
    fetch(`/api/visual-pages/${encodeURIComponent(pageId)}/${encodeURIComponent(language)}`, { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<PublicResponse> : null)
      .then((payload) => { if (active) setData(payload?.data ?? null); })
      .catch(() => { if (active) setData(null); });
    return () => { active = false; };
  }, [pageId, language]);
  useEffect(() => {
    if (!data) return;
    let active = true;
    const endpoints = ["practices", "industries", "team", "news"] as const;
    Promise.all(endpoints.map(async (kind) => {
      const endpoint = kind === "practices" ? "/api/practice-groups" : kind === "industries" ? "/api/industry-groups" : kind === "team" ? "/api/team" : "/api/news";
      const response = await fetch(endpoint, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) return [kind, []] as const;
      const payload = await response.json();
      return [kind, Array.isArray(payload) ? payload as CatalogRecord[] : []] as const;
    })).then((entries) => {
      if (!active) return;
      setCatalogs(Object.fromEntries(entries) as CatalogData);
    }).catch(() => {
      if (active) setCatalogs({ practices: [], industries: [], team: [], news: [] });
    });
    return () => { active = false; };
  }, [data]);
  if (!data?.content?.length) return <>{fallback}</>;
  return <VisualBuilderPreviewContext.Provider value={{ pageId, language }}><div className="visual-builder-public" data-testid={`visual-page-${pageId}`}>{data.content.map((component, index) => renderComponent(component, index, catalogs, language, pageId))}</div></VisualBuilderPreviewContext.Provider>;
}
