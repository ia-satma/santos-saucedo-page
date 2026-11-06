/* El Monitor Laboral con el diseño de la demo v3: la lista de notas (/news y «Más del Monitor Laboral»
   en cada nota) y la banda de la suscripción. La lógica es la de components/monitor/MonitorList.tsx
   (solo lo publicado, del más reciente al más antiguo; filtros si hay al menos dos categorías con notas;
   búsqueda desde 12 notas; páginas de 12; traducción automática fuera de ES/EN); cambia la forma:
   tarjetas con la foto de cada nota a color, como «Industrias que asesoramos» (sh-indi) en la demo.
   Clases propias con el prefijo ps- (./paginas.css). */
import "./paginas.css";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { formatNewsDate } from "@/lib/newsDate";
import { isStaticSite } from "@/lib/queryClient";
import { newsCategories, type LanguageCode, type News } from "@shared/schema";
import { getHomeMonitorImage } from "@shared/monitorEditorial";
import { MONITOR_SUBSCRIBE, MONITOR_UI, type MonitorStrings } from "./textos";

export { etiquetaSiguiente } from "./textos";

/** data-testid de cada pieza: los de la página anterior (card-news-…, card-related-news-…) */
export interface NotasTestIds {
  row?: (item: News) => string;
  category?: (item: News) => string;
  date?: (item: News) => string;
  title?: (item: News) => string;
  excerpt?: (item: News) => string;
  filters?: string;
  filter?: (value: string) => string;
  search?: string;
  error?: string;
  errorText?: string;
  empty?: string;
  noResults?: string;
  skeleton?: (index: number) => string;
}

// Con 12 notas o más tiene sentido buscar; por debajo, la lista se lee de un vistazo
const SEARCH_MIN_ITEMS = 12;
const PAGE_SIZE = 12;

function categoryLabel(item: News, language: LanguageCode, s: MonitorStrings): string | null {
  if (!item.category) return null;
  if (s.categories[item.category]) return s.categories[item.category];
  if (language === "es" && item.categoryEs) return item.categoryEs;
  return item.category.charAt(0).toUpperCase() + item.category.slice(1);
}

/* Foto de la nota (la del panel, a color). Sin foto, o si no carga: una lámina azul con el número de
   la nota en el Monitor, como las láminas de la demo; nunca una foto genérica de reemplazo. */
/* La foto de la nota (la que eligió el editor o, en las tres primeras notas, su ilustración, como en la
   portada). Sin foto: una lámina azul con el número de la nota. Si la foto no carga: la lámina con el
   aviso «Imagen no disponible». */
function NotaFoto({ src, folio, unavailable }: { src: string; folio?: number; unavailable: string }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <span className={`ps-nota__m ps-nota__m--lamina${fallo ? " ps-nota__m--fallo" : ""}`} aria-hidden="true">
        {fallo ? <span className="ps-nota__aviso">{unavailable}</span>
          : folio !== undefined ? <span className="ps-nota__folio">{String(folio).padStart(2, "0")}</span> : null}
      </span>
    );
  }
  return (
    <span className="ps-nota__m">
      <img src={src} alt="" loading="lazy" decoding="async" width={1024} height={1024} onError={() => setFallo(true)} />
    </span>
  );
}

function Nota({
  item, language, showCategory, headingLevel, destacada, testIds, onTranslated, folio,
}: {
  item: News;
  language: LanguageCode;
  showCategory: boolean;
  headingLevel: "h2" | "h3";
  destacada: boolean;
  testIds: NotasTestIds;
  onTranslated?: () => void;
  folio?: number;
}) {
  const s = useCmsContent("monitor-ui", MONITOR_UI)[language] || MONITOR_UI.en;
  const isSpanish = language === "es";

  // Sin traducción se muestra el inglés de origen. Fuera de ES/EN va marcado: lang="en" en el bloque y
  // el texto en <bdi lang="en" dir="ltr"> (en árabe el bloque sigue alineado a la derecha).
  const { translatedFields, hasTranslation } = useTranslatedContent({
    contentType: "news",
    entityId: String(item.id),
    fields: { title: item.title, titleEs: item.titleEs, excerpt: item.excerpt, excerptEs: item.excerptEs },
    enabled: !isSpanish && language !== "en",
    language,
  });
  useEffect(() => {
    if (hasTranslation) onTranslated?.();
  }, [hasTranslation, onTranslated]);

  const title = isSpanish ? item.titleEs || item.title : translatedFields.title || item.title;
  const excerpt = isSpanish ? item.excerptEs || item.excerpt : translatedFields.excerpt || item.excerpt;
  const isOtherLanguage = !isSpanish && language !== "en";
  const titleIsSource = isOtherLanguage && !!title && title === item.title;
  const excerptIsSource = isOtherLanguage && !!excerpt && excerpt === item.excerpt;
  const category = showCategory ? categoryLabel(item, language, s) : null;
  const date = formatNewsDate(item.date, language);
  const Heading = headingLevel;
  const foto = getHomeMonitorImage(item) ?? "";

  return (
    <li className={`ps-nota${destacada ? " ps-nota--destacada" : ""}`} data-testid={testIds.row?.(item)}>
      <NotaFoto key={foto} src={foto} folio={folio} unavailable={s.imageUnavailable} />
      <div className="ps-nota__txt">
        {category || date ? (
          <p className="ps-nota__meta">
            {category ? <span data-testid={testIds.category?.(item)}>{category}</span> : null}
            {category && date ? <span aria-hidden="true" className="ps-nota__sep">·</span> : null}
            {date ? (
              // Instante completo: no cambia con la zona del visitante
              <time dateTime={item.date ? new Date(item.date).toISOString() : undefined} data-testid={testIds.date?.(item)}>{date}</time>
            ) : null}
          </p>
        ) : null}
        <Heading className="ps-nota__t" data-testid={testIds.title?.(item)} lang={titleIsSource ? "en" : undefined}>
          {/* El enlace cubre toda la tarjeta (::after); el titular se subraya al pasar */}
          <Link href={`/news/${item.slug}`} className="ps-nota__a inline-link">
            {titleIsSource ? <bdi lang="en" dir="ltr">{title}</bdi> : title}
          </Link>
        </Heading>
        {excerpt ? (
          <p className="ps-nota__p" data-testid={testIds.excerpt?.(item)} lang={excerptIsSource ? "en" : undefined}>
            {excerptIsSource ? <bdi lang="en" dir="ltr">{excerpt}</bdi> : excerpt}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function MonitorNotas({
  limit, excludeId, filters = false, search = false, headingLevel = "h2", archive = false,
  testIds = {}, onTranslated, empty,
}: {
  /** Máximo de notas (relacionados: 3) */
  limit?: number;
  /** La nota abierta, que no se lista */
  excludeId?: string;
  /** Filtros de categoría: solo si al menos dos categorías tienen notas */
  filters?: boolean;
  /** Búsqueda en titular y entradilla (español e inglés): solo con 12 notas o más */
  search?: boolean;
  headingLevel?: "h2" | "h3";
  /** Archivo (/news): páginas de 12, la primera nota destacada, la categoría siempre visible */
  archive?: boolean;
  testIds?: NotasTestIds;
  onTranslated?: () => void;
  empty?: ReactNode;
}) {
  const { language } = useLanguage();
  const s = useCmsContent("monitor-ui", MONITOR_UI)[language] || MONITOR_UI.en;
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<News[]>({ queryKey: ["/api/news"] });

  // Solo lo publicado, del más reciente al más antiguo (con límite, primero las destacadas en portada)
  const items = useMemo(() => {
    const published = (data ?? []).filter((item) => item.published !== false && item.id !== excludeId);
    return [...published].sort((a, b) =>
      (limit ? Number(b.featuredHome === true) - Number(a.featuredHome === true) : 0) ||
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  }, [data, excludeId, limit]);

  // Categorías con notas, en el orden del esquema
  const presentCategories = useMemo(
    () => newsCategories.map((c) => c.value as string).filter((value) => items.some((item) => item.category === value)),
    [items],
  );
  const showCategory = archive || presentCategories.length >= 2;
  const showFilters = filters && presentCategories.length >= 2;
  const showSearch = search && items.length >= SEARCH_MIN_ITEMS;
  const activeCategory = showFilters && presentCategories.includes(category) ? category : "all";

  const q = showSearch ? query.trim().toLowerCase() : "";
  const filteredItems = items
    .filter((item) => activeCategory === "all" || item.category === activeCategory)
    .filter((item) => !q || [item.titleEs, item.title, item.excerptEs, item.excerpt].some((text) => text?.toLowerCase().includes(q)));
  const pageCount = archive ? Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE)) : 1;
  const currentPage = Math.min(page, pageCount);
  const visible = archive
    ? filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filteredItems.slice(0, limit);
  // Cada nota conserva su número aunque se filtre o se pagine (la más antigua es la 1)
  const folios = useMemo(() => new Map(items.map((item, i) => [item.id, items.length - i])), [items]);
  const narrowed = activeCategory !== "all" || q.length > 0;
  const paginationText = s.pageOf.replace("{page}", String(currentPage)).replace("{count}", String(pageCount));
  // La primera nota del archivo va destacada (foto grande y titular mayor) en la primera página
  const destacar = archive && currentPage === 1 && visible.length > 1;
  // Columnas de las demás tarjetas (1, 2 o 3): la rejilla no deja huecos con pocas notas; una sola va apaisada
  const columnas = Math.max(1, Math.min(3, visible.length - (destacar ? 1 : 0)));
  const cambiarPagina = (n: number) => {
    setPage(n);
    // Al cambiar de página, la lista vuelve a empezar arriba (sin salto si no hace falta)
    if (typeof document !== "undefined") document.getElementById("ps-mon-lista")?.scrollIntoView({ block: "start" });
  };

  return (
    <div className="ps-mon">
      {(showFilters || showSearch) && !error && items.length > 0 ? (
        <div className="ps-mon__barra">
          {showFilters ? (
            <div role="group" aria-label={s.filters} className="ps-filtros" data-testid={testIds.filters}>
              {["all", ...presentCategories].map((value) => {
                const active = activeCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className="ps-filtro"
                    onClick={() => { setCategory(value); setPage(1); }}
                    aria-pressed={active}
                    data-testid={testIds.filter?.(value)}
                  >
                    {value === "all" ? s.all : s.categories[value] || value}
                  </button>
                );
              })}
            </div>
          ) : null}
          {showSearch ? (
            <div className="ps-buscar">
              <label htmlFor="monitor-search" className="ps-buscar__l">{s.search}</label>
              <div className="ps-buscar__campo">
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <input
                  id="monitor-search"
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  data-testid={testIds.search}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Carga, vacío y error en una región viva: se anuncian sin mover el foco */}
      <div role="status" aria-live="polite">
        {error ? (
          <div className="ps-mon__estado" data-testid={testIds.error}>
            <p data-testid={testIds.errorText}>{s.error}</p>
          </div>
        ) : isLoading ? (
          <span className="sr-only">{s.loading}</span>
        ) : visible.length === 0 ? (
          narrowed ? (
            <div className="ps-mon__estado" data-testid={testIds.noResults}><p>{s.noResults}</p></div>
          ) : (
            empty ?? <div className="ps-mon__estado" data-testid={testIds.empty}><p>{s.empty}</p></div>
          )
        ) : null}
      </div>

      {!error && isLoading ? (
        <ul className="ps-notas" aria-busy="true" aria-label={s.loading}>
          {Array.from({ length: archive ? 3 : Math.min(limit ?? 3, 3) }).map((_, i) => (
            <li key={i} className="ps-nota ps-nota--carga" data-testid={testIds.skeleton?.(i)}>
              <span className="ps-nota__m ps-esq" />
              <div className="ps-nota__txt">
                <span className="ps-esq ps-esq--meta" />
                <span className="ps-esq ps-esq--t" />
                <span className="ps-esq ps-esq--t ps-esq--corto" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!error && !isLoading && visible.length > 0 ? (
        <ul id="ps-mon-lista" className={`ps-notas ps-notas--c${columnas}${destacar ? " ps-notas--con-destacada" : ""}`}>
          {visible.map((item, i) => (
            <Nota
              key={item.id}
              item={item}
              language={language}
              showCategory={showCategory}
              headingLevel={headingLevel}
              destacada={(destacar && i === 0) || visible.length === 1}
              testIds={testIds}
              onTranslated={onTranslated}
              folio={folios.get(item.id)}
            />
          ))}
        </ul>
      ) : null}

      {/* Páginas: sobre la línea de cota de la demo (el filete con sus dos remates) */}
      {archive && !error && !isLoading && filteredItems.length > PAGE_SIZE ? (
        <nav aria-label={s.pagination} className="ps-paginas">
          <button type="button" className="ps-paginas__paso" onClick={() => cambiarPagina(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            {s.previous}
          </button>
          <div className="ps-paginas__nums" aria-label={paginationText}>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                className="ps-paginas__n"
                onClick={() => cambiarPagina(number)}
                aria-label={`${s.page} ${number}`}
                aria-current={currentPage === number ? "page" : undefined}
              >
                {number}
              </button>
            ))}
          </div>
          <span className="sr-only" aria-live="polite">{paginationText}</span>
          <button type="button" className="ps-paginas__paso" onClick={() => cambiarPagina(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>
            {s.next}
          </button>
        </nav>
      ) : null}
    </div>
  );
}

/* La suscripción al Monitor (/newsletter) en una banda azul, como la de la filosofía en el inicio de la
   demo (sh-filo): la frase y el botón a la izquierda y, a la derecha, la estancia del mapamundi a color,
   fundida con el azul. En el sitio estático no se pinta: allí /newsletter no puede dar de alta a nadie. */
export function MonitorSuscripcion({
  foto, testId, linkTestId, fotoTestId,
}: {
  foto: { src: string; srcSet?: string };
  testId?: string;
  linkTestId?: string;
  fotoTestId?: string;
}) {
  const { language } = useLanguage();
  const t = useCmsContent("monitor-subscribe", MONITOR_SUBSCRIBE)[language] || MONITOR_SUBSCRIBE.en;
  if (isStaticSite) return null;
  return (
    <section className="ps-sus sobre-azul" data-testid={testId}>
      <figure className="ps-sus__foto" aria-hidden="true" data-testid={fotoTestId}>
        <img src={foto.src} srcSet={foto.srcSet} sizes="(min-width: 1001px) 60vw, 100vw" alt="" width={1536} height={920} loading="lazy" decoding="async" />
      </figure>
      <div className="sh-wrap ps-sus__in">
        <p className="ps-sus__frase">{t.line}</p>
        <Link href="/newsletter" className="sh-boton ps-sus__boton" data-testid={linkTestId}>{t.cta}</Link>
      </div>
    </section>
  );
}
