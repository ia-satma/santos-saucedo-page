import { useCmsContent } from "@/hooks/useCmsContent";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TextLink } from "@/components/home26/primitives";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { formatNewsDate } from "@/lib/newsDate";
import { isStaticSite } from "@/lib/queryClient";
import { newsCategories, type LanguageCode, type News } from "@shared/schema";

// Lista única del Monitor Laboral (/news, /articles, "Más del Monitor Laboral" del artículo y,
// si se quiere, la portada). Filas de filete: categoría · fecha en etiqueta, titular en la
// romana que es el enlace y entradilla. Sin foto ni loseta Hueso con §, sin "Leer más".
// Lee solo lo publicado en /api/news, del más reciente al más antiguo, con estados de
// carga, vacío y error (anunciados en un contenedor role="status").

interface MonitorStrings {
  all: string;
  /** Nombre accesible del grupo de filtros */
  filters: string;
  search: string;
  /** Estado de carga: texto oculto del contenedor de estado y nombre de la lista ocupada */
  loading: string;
  empty: string;
  noResults: string;
  error: string;
  categories: Record<string, string>;
}

const STRINGS: Record<LanguageCode, MonitorStrings> = {
  es: {
    all: "Todas",
    filters: "Filtrar por categoría",
    search: "Buscar en el Monitor Laboral",
    loading: "Cargando publicaciones…",
    empty: "Aún no hay publicaciones.",
    noResults: "Ninguna publicación coincide con la búsqueda.",
    error: "No fue posible cargar las publicaciones.",
    categories: { press: "Prensa", insights: "Análisis", rankings: "Rankings", events: "Eventos", alerts: "Alertas" },
  },
  en: {
    all: "All",
    filters: "Filter by category",
    search: "Search the Labor Monitor",
    loading: "Loading publications…",
    empty: "There are no publications yet.",
    noResults: "No publications match the search.",
    error: "The publications could not be loaded.",
    categories: { press: "Press", insights: "Analysis", rankings: "Rankings", events: "Events", alerts: "Alerts" },
  },
  de: {
    all: "Alle",
    filters: "Nach Kategorie filtern",
    search: "Suchen",
    loading: "Veröffentlichungen werden geladen…",
    empty: "Es gibt noch keine Veröffentlichungen.",
    noResults: "Keine Veröffentlichung entspricht der Suche.",
    error: "Die Veröffentlichungen konnten nicht geladen werden.",
    categories: { press: "Presse", insights: "Analysen", rankings: "Rankings", events: "Veranstaltungen", alerts: "Mitteilungen" },
  },
  zh: {
    all: "全部",
    filters: "按类别筛选",
    search: "搜索",
    loading: "正在加载文章…",
    empty: "暂无文章。",
    noResults: "没有符合搜索条件的文章。",
    error: "无法加载文章。",
    categories: { press: "新闻稿", insights: "分析", rankings: "排名", events: "活动", alerts: "公告" },
  },
  ko: {
    all: "전체",
    filters: "카테고리별 필터",
    search: "검색",
    loading: "게시물을 불러오는 중…",
    empty: "아직 게시물이 없습니다.",
    noResults: "검색 결과가 없습니다.",
    error: "게시물을 불러오지 못했습니다.",
    categories: { press: "보도자료", insights: "분석", rankings: "순위", events: "이벤트", alerts: "공지" },
  },
  ja: {
    all: "すべて",
    filters: "カテゴリーで絞り込む",
    search: "検索",
    loading: "記事を読み込んでいます…",
    empty: "まだ記事はありません。",
    noResults: "検索に一致する記事はありません。",
    error: "記事を読み込めませんでした。",
    categories: { press: "プレス", insights: "分析", rankings: "ランキング", events: "イベント", alerts: "お知らせ" },
  },
  ar: {
    all: "الكل",
    filters: "تصفية حسب الفئة",
    search: "بحث",
    loading: "جارٍ تحميل المنشورات…",
    empty: "لا توجد منشورات بعد.",
    noResults: "لا توجد منشورات تطابق البحث.",
    error: "تعذّر تحميل المنشورات.",
    categories: { press: "صحافة", insights: "تحليلات", rankings: "تصنيفات", events: "فعاليات", alerts: "تنبيهات" },
  },
  ru: {
    all: "Все",
    filters: "Фильтр по категории",
    search: "Поиск",
    loading: "Загрузка публикаций…",
    empty: "Публикаций пока нет.",
    noResults: "По запросу ничего не найдено.",
    error: "Не удалось загрузить публикации.",
    categories: { press: "Пресса", insights: "Аналитика", rankings: "Рейтинги", events: "Мероприятия", alerts: "Уведомления" },
  },
  fr: {
    all: "Tout",
    filters: "Filtrer par catégorie",
    search: "Rechercher",
    loading: "Chargement des publications…",
    empty: "Aucune publication pour le moment.",
    noResults: "Aucune publication ne correspond à la recherche.",
    error: "Impossible de charger les publications.",
    categories: { press: "Presse", insights: "Analyses", rankings: "Classements", events: "Événements", alerts: "Alertes" },
  },
  it: {
    all: "Tutte",
    filters: "Filtra per categoria",
    search: "Cerca",
    loading: "Caricamento delle pubblicazioni…",
    empty: "Non ci sono ancora pubblicazioni.",
    noResults: "Nessuna pubblicazione corrisponde alla ricerca.",
    error: "Impossibile caricare le pubblicazioni.",
    categories: { press: "Stampa", insights: "Analisi", rankings: "Classifiche", events: "Eventi", alerts: "Avvisi" },
  },
};

/** data-testid de cada pieza; las páginas conservan los suyos (card-news-…, card-article-…) */
export interface MonitorListTestIds {
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

interface MonitorListProps {
  /** Máximo de notas (la portada y los relacionados: 3) */
  limit?: number;
  /** Id de la nota que no se lista (el artículo abierto) */
  excludeId?: string;
  /** Filtros de categoría: solo aparecen si al menos dos categorías tienen notas */
  filters?: boolean;
  /** Campo de búsqueda sobre titular y entradilla (español e inglés); solo con 12 notas o más */
  search?: boolean;
  /** Nivel del titular de cada fila: h2 bajo el h1 de la página, h3 bajo un h2 de sección */
  headingLevel?: "h2" | "h3";
  /** index: etiqueta a la izquierda y texto a la derecha desde lg · stacked: todo apilado */
  layout?: "index" | "stacked";
  /** Fondo: blanco (filete Línea) o Hueso (Azul Marino al 15 %, como la portada) */
  tone?: "light" | "paper";
  /** Estado vacío propio (p. ej. /articles conserva su bloque y sus testids) */
  empty?: ReactNode;
  /** Idioma mostrado si no es el de la interfaz (la portada pasa es/en): etiquetas, fechas y
   *  traducción; en español e inglés no se traduce nada automáticamente */
  language?: LanguageCode;
  /** Avisa cuando llega de verdad la traducción automática de alguna fila */
  onTranslated?: () => void;
  testIds?: MonitorListTestIds;
  className?: string;
}

const TITLE_CLASS =
  "ss-display text-[clamp(22px,1.7vw,25px)] font-normal leading-[1.25] tracking-[-0.01em] text-ss-marino";

// Con 12 notas o más tiene sentido buscar; por debajo, la lista se lee de un vistazo
const SEARCH_MIN_ITEMS = 12;

function categoryLabel(item: News, language: LanguageCode, s: MonitorStrings): string | null {
  if (!item.category) return null;
  if (s.categories[item.category]) return s.categories[item.category];
  if (language === "es" && item.categoryEs) return item.categoryEs;
  return item.category.charAt(0).toUpperCase() + item.category.slice(1);
}

function MonitorRow({
  item,
  language,
  showCategory,
  headingLevel,
  layout,
  rule,
  testIds,
  onTranslated,
}: {
  item: News;
  language: LanguageCode;
  /** La categoría solo informa si hay al menos dos con notas; si no, la fila lleva solo la fecha */
  showCategory: boolean;
  headingLevel: "h2" | "h3";
  layout: "index" | "stacked";
  rule: string;
  testIds: MonitorListTestIds;
  onTranslated?: () => void;
}) {
  const liveStrings = useCmsContent("monitor-ui", STRINGS);
  const s = liveStrings[language] || liveStrings.en;
  const isSpanish = language === "es";

  // Sin traducción se muestra el inglés de origen. Fuera de ES/EN va marcado: lang="en" en el
  // bloque (la romana, no la sans de CJK) y el texto en <bdi lang="en" dir="ltr"> (en árabe el
  // bloque sigue alineado a la derecha y el punto final no salta al principio).
  // En inglés y en español no se pide traducción (el hook ya lo descarta por idioma)
  const { translatedFields, hasTranslation } = useTranslatedContent({
    contentType: "news",
    entityId: String(item.id),
    fields: {
      title: item.title,
      titleEs: item.titleEs,
      excerpt: item.excerpt,
      excerptEs: item.excerptEs,
    },
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
  const index = layout === "index";

  return (
    <li
      className={`grid grid-cols-1 gap-y-3 border-b ${rule} py-8 ${index ? "lg:grid-cols-12 lg:gap-x-6 lg:py-10" : ""}`}
      data-testid={testIds.row?.(item)}
    >
      <p className={`ss-label ss-num ${index ? "lg:col-span-4 lg:pt-2" : ""}`}>
        {category && (
          <span className="text-ss-marino" data-testid={testIds.category?.(item)}>
            {category}
          </span>
        )}
        {category && date && <span aria-hidden="true" className="text-ss-medio"> · </span>}
        {date && (
          <time
            className="text-ss-medio"
            // Instante completo: no cambia con la zona del visitante
            dateTime={item.date ? new Date(item.date).toISOString() : undefined}
            data-testid={testIds.date?.(item)}
          >
            {date}
          </time>
        )}
      </p>
      <div className={index ? "lg:col-span-7 lg:col-start-5 xl:col-span-6" : ""}>
        <Heading
          className={TITLE_CLASS}
          data-testid={testIds.title?.(item)}
          lang={titleIsSource ? "en" : undefined}
        >
          {/* inline-link: fuera de la regla móvil que vuelve inline-flex todo <a> */}
          <Link
            href={`/news/${item.slug}`}
            className="inline-link hover:underline decoration-1 underline-offset-4"
          >
            {titleIsSource ? <bdi lang="en" dir="ltr">{title}</bdi> : title}
          </Link>
        </Heading>
        {/* Índice: la entradilla con la medida de los cuerpos de las prácticas de la portada en
            todos los anchos (N9): 60ch a 17 px allí son 63,75ch a 16 px aquí, unos 507 px, el
            mismo borde derecho (entre 60 y 75 caracteres por línea). En el móvil, el contenedor */}
        {excerpt && (
          <p
            className={`mt-3 text-[16px] leading-[1.55] text-ss-tinta [text-wrap:pretty] ${index ? "max-w-[63.75ch]" : ""}`}
            data-testid={testIds.excerpt?.(item)}
            lang={excerptIsSource ? "en" : undefined}
          >
            {excerptIsSource ? <bdi lang="en" dir="ltr">{excerpt}</bdi> : excerpt}
          </p>
        )}
      </div>
    </li>
  );
}

export function MonitorList({
  limit,
  excludeId,
  filters = false,
  search = false,
  headingLevel = "h2",
  layout = "index",
  tone = "light",
  empty,
  language: languageProp,
  onTranslated,
  testIds = {},
  className = "",
}: MonitorListProps) {
  const { language: interfaceLanguage } = useLanguage();
  const language = languageProp ?? interfaceLanguage;
  const liveStrings = useCmsContent("monitor-ui", STRINGS);
  const s = liveStrings[language] || liveStrings.en;
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  // Solo lo publicado, del más reciente al más antiguo
  const items = useMemo(() => {
    const published = (data ?? []).filter((item) => item.published !== false && item.id !== excludeId);
    return [...published].sort((a, b) => (limit ? Number(b.featuredHome===true)-Number(a.featuredHome===true) : 0) || new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  }, [data, excludeId, limit]);

  // Categorías con notas, en el orden del esquema; los filtros solo si hay al menos dos
  const presentCategories = useMemo(
    () => newsCategories.map((c) => c.value as string).filter((value) => items.some((item) => item.category === value)),
    [items],
  );
  const showCategory = presentCategories.length >= 2;
  const showFilters = filters && showCategory;
  const showSearch = search && items.length >= SEARCH_MIN_ITEMS;
  const activeCategory = showFilters && presentCategories.includes(category) ? category : "all";

  const q = showSearch ? query.trim().toLowerCase() : "";
  const visible = items
    .filter((item) => activeCategory === "all" || item.category === activeCategory)
    .filter((item) =>
      !q || [item.titleEs, item.title, item.excerptEs, item.excerpt].some((text) => text?.toLowerCase().includes(q)),
    )
    .slice(0, limit);

  const rule = tone === "paper" ? "border-ss-marino/15" : "border-ss-rule";
  const narrowed = activeCategory !== "all" || q.length > 0;

  return (
    <div className={className}>
      {(showFilters || showSearch) && !error && items.length > 0 && (
        <div className="mb-10 space-y-6">
          {showFilters && (
            <div role="group" aria-label={s.filters} className="flex flex-wrap gap-x-6" data-testid={testIds.filters}>
              {["all", ...presentCategories].map((value) => {
                const active = activeCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    aria-pressed={active}
                    // Control, no navegación: botón de texto con objetivo de 44 px; la activa en
                    // Azul Marino con subrayado (sin botón Marino lleno, reservado a enviar)
                    className={`ss-label min-h-[44px] underline-offset-[6px] decoration-1 ${active ? "text-ss-marino underline" : "text-ss-medio hover:text-ss-marino"}`}
                    data-testid={testIds.filter?.(value)}
                  >
                    {value === "all" ? s.all : s.categories[value] || value}
                  </button>
                );
              })}
            </div>
          )}
          {showSearch && (
            // Etiqueta visible y sin marcador que la repita
            <div className="max-w-md">
              <label htmlFor="monitor-search" className="ss-label block mb-2 text-ss-medio">
                {s.search}
              </label>
              <div className="relative">
                <Search aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ss-medio" />
                <Input
                  id="monitor-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  // 44 px fijos: h-11 depende de rem y baja a 38,5 px bajo 360 px (html a 14 px).
                  // Borde de campo (--ss-field, 3,5:1 sobre blanco; WCAG 1.4.11)
                  className="h-[44px] ps-9 bg-white border-ss-field text-ss-tinta focus-visible:ring-ss-marino focus-visible:border-ss-marino"
                  data-testid={testIds.search}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estados de carga, vacío y error en una región viva: se anuncian sin mover el foco */}
      <div role="status" aria-live="polite">
        {error ? (
          <div className={`border-t ${rule} py-12`} data-testid={testIds.error}>
            <p className="text-base text-ss-medio" data-testid={testIds.errorText}>
              {s.error}
            </p>
          </div>
        ) : isLoading ? (
          <span className="sr-only">{s.loading}</span>
        ) : visible.length === 0 ? (
          narrowed ? (
            <div className={`border-t ${rule} py-12`} data-testid={testIds.noResults}>
              <p className="text-base text-ss-medio">{s.noResults}</p>
            </div>
          ) : (
            empty ?? (
              <div className={`border-t ${rule} py-12`} data-testid={testIds.empty}>
                <p className="text-base text-ss-medio">{s.empty}</p>
              </div>
            )
          )
        ) : null}
      </div>

      {!error && isLoading && (
        <ul className={`border-t ${rule}`} aria-busy="true" aria-label={s.loading}>
          {Array.from({ length: Math.min(limit ?? 3, 3) }).map((_, i) => (
            <li key={i} className={`border-b ${rule} py-8`} data-testid={testIds.skeleton?.(i)}>
              <Skeleton className="h-3 w-40 mb-4 bg-ss-rule" />
              <Skeleton className="h-6 w-full max-w-xl mb-3 bg-ss-rule" />
              <Skeleton className="h-4 w-3/4 max-w-lg bg-ss-rule" />
            </li>
          ))}
        </ul>
      )}

      {!error && !isLoading && visible.length > 0 && (
        <ul className={`border-t ${rule}`}>
          {visible.map((item) => (
            <MonitorRow
              key={item.id}
              item={item}
              language={language}
              showCategory={showCategory}
              headingLevel={headingLevel}
              layout={layout}
              rule={rule}
              testIds={testIds}
              onTranslated={onTranslated}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// Suscripción al pie del Monitor (/news y al final de cada nota): la frase y el botón de
// /newsletter, con las mismas cadenas que esa página en cada idioma. Sin caja; filete superior
// solo si se pide (rule): en /news cierra la lista su último filete y en la nota va en la fila de
// compartir. En el sitio estático no se pinta: allí /newsletter no puede dar de alta a nadie.
const SUBSCRIBE: Record<LanguageCode, { line: string; cta: string }> = {
  es: { line: "Recibir el Monitor Laboral por correo.", cta: "Suscribirme" },
  en: { line: "Receive the Labor Monitor by email.", cta: "Subscribe" },
  de: { line: "Die Nachrichten der Kanzlei per E-Mail erhalten.", cta: "Abonnieren" },
  zh: { line: "通过电子邮件接收本所新闻。", cta: "订阅" },
  ko: { line: "법인의 뉴스를 이메일로 받아 보실 수 있습니다.", cta: "구독" },
  ja: { line: "事務所のニュースをメールでお受け取りいただけます。", cta: "購読" },
  ar: { line: "تلقّي أخبار المكتب عبر البريد الإلكتروني.", cta: "اشترك" },
  ru: { line: "Получать новости фирмы по электронной почте.", cta: "Подписаться" },
  fr: { line: "Recevoir les actualités du cabinet par e-mail.", cta: "S’abonner" },
  it: { line: "Ricevere le notizie dello studio via e-mail.", cta: "Iscriversi" },
};

export function MonitorSubscribe({
  language: languageProp,
  rule = true,
  className = "",
  testId,
  linkTestId,
}: {
  language?: LanguageCode;
  /** Filete superior propio (por defecto sí) */
  rule?: boolean;
  className?: string;
  testId?: string;
  linkTestId?: string;
}) {
  const { language: interfaceLanguage } = useLanguage();
  const liveSubscribe = useCmsContent("monitor-subscribe", SUBSCRIBE);
  const t = liveSubscribe[languageProp ?? interfaceLanguage] || liveSubscribe.en;
  if (isStaticSite) return null;
  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-6 gap-y-4 ${rule ? "border-t border-ss-rule pt-8" : ""} ${className}`}
      data-testid={testId}
    >
      <p className="text-[16px] leading-[1.55] text-ss-tinta">{t.line}</p>
      <TextLink href="/newsletter" data-testid={linkTestId}>
        {t.cta}
      </TextLink>
    </div>
  );
}

export default MonitorList;
