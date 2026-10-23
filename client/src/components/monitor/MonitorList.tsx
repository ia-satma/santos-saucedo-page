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
import { getHomeMonitorImage } from "@shared/monitorEditorial";

// Lista del Monitor Laboral: archivo editorial optativo en /news y /articles;
// filas de texto por defecto en los relacionados, sin alterar la portada.
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
  imageUnavailable: string;
  pagination: string;
  previous: string;
  next: string;
  page: string;
  pageOf: string;
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
    imageUnavailable: "Imagen no disponible",
    pagination: "Paginación de publicaciones",
    previous: "Anterior",
    next: "Siguiente",
    page: "Página",
    pageOf: "Página {page} de {count}",
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
    imageUnavailable: "Image unavailable",
    pagination: "Publication pagination",
    previous: "Previous",
    next: "Next",
    page: "Page",
    pageOf: "Page {page} of {count}",
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
    imageUnavailable: "Bild nicht verfügbar",
    pagination: "Seitennavigation für Veröffentlichungen",
    previous: "Zurück",
    next: "Weiter",
    page: "Seite",
    pageOf: "Seite {page} von {count}",
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
    imageUnavailable: "图片不可用",
    pagination: "文章分页",
    previous: "上一页",
    next: "下一页",
    page: "页",
    pageOf: "第 {page} 页，共 {count} 页",
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
    imageUnavailable: "이미지를 사용할 수 없습니다",
    pagination: "게시물 페이지 이동",
    previous: "이전",
    next: "다음",
    page: "페이지",
    pageOf: "{count}페이지 중 {page}페이지",
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
    imageUnavailable: "画像を表示できません",
    pagination: "記事のページ移動",
    previous: "前へ",
    next: "次へ",
    page: "ページ",
    pageOf: "{count}ページ中{page}ページ",
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
    imageUnavailable: "الصورة غير متاحة",
    pagination: "التنقل بين صفحات المنشورات",
    previous: "السابق",
    next: "التالي",
    page: "الصفحة",
    pageOf: "الصفحة {page} من {count}",
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
    imageUnavailable: "Изображение недоступно",
    pagination: "Пагинация публикаций",
    previous: "Назад",
    next: "Далее",
    page: "Страница",
    pageOf: "Страница {page} из {count}",
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
    imageUnavailable: "Image indisponible",
    pagination: "Pagination des publications",
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    pageOf: "Page {page} sur {count}",
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
    imageUnavailable: "Immagine non disponibile",
    pagination: "Paginazione delle pubblicazioni",
    previous: "Precedente",
    next: "Successiva",
    page: "Pagina",
    pageOf: "Pagina {page} di {count}",
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
  /** index: etiqueta a la izquierda y texto a la derecha desde lg · stacked: todo apilado ·
   *  bulletin (portada, idea 4): la primera nota grande a la izquierda con § y las otras a la
   *  derecha, como el boletín de un despacho */
  layout?: "index" | "stacked" | "bulletin";
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
  /** Editorial archive layout for /news and /articles only. */
  presentation?: "default" | "archive";
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
  lead = false,
  testIds,
  onTranslated,
  editorial,
  imageUnavailable,
}: {
  item: News;
  language: LanguageCode;
  /** La categoría solo informa si hay al menos dos con notas; si no, la fila lleva solo la fecha */
  showCategory: boolean;
  headingLevel: "h2" | "h3";
  layout: "index" | "stacked" | "bulletin";
  rule: string;
  /** Primera nota del boletín: titular grande, § y fuente al pie */
  lead?: boolean;
  testIds: MonitorListTestIds;
  onTranslated?: () => void;
  editorial: boolean;
  imageUnavailable: string;
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
  const bulletin = layout === "bulletin";

  if (bulletin) {
    return (
      <li
        className={`flex flex-col gap-y-4 border-b ${rule} py-8 lg:py-10 ${
          lead ? "lg:col-span-7 lg:row-span-2 lg:border-e lg:pe-12" : "lg:col-span-5 lg:ps-12"
        }`}
        data-testid={testIds.row?.(item)}
      >
        {lead && (
          <span aria-hidden="true" className="ss-display block text-[88px] leading-[0.8] text-ss-marino opacity-[0.14]">
            §
          </span>
        )}
        <p className="ss-label ss-num">
          {category && <span className="text-ss-marino">{category}</span>}
          {category && date && <span aria-hidden="true" className="text-ss-medio"> · </span>}
          {date && (
            <time className="text-ss-medio" dateTime={item.date ? new Date(item.date).toISOString() : undefined}>
              {date}
            </time>
          )}
        </p>
        <Heading
          className={`ss-display font-normal tracking-[-0.01em] text-ss-marino ${
            lead ? "text-[clamp(30px,3.2vw,40px)] leading-[1.15]" : "text-[clamp(22px,1.9vw,26px)] leading-[1.22]"
          }`}
          data-testid={testIds.title?.(item)}
          lang={titleIsSource ? "en" : undefined}
        >
          {/* Subrayado que se dibuja de izquierda a derecha al pasar el cursor o con el foco */}
          <Link
            href={`/news/${item.slug}`}
            className="inline-link bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-700 ease-[cubic-bezier(.77,0,.18,1)] hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px] motion-reduce:transition-none"
          >
            {titleIsSource ? <bdi lang="en" dir="ltr">{title}</bdi> : title}
          </Link>
        </Heading>
        {excerpt && (
          <p
            className="max-w-[46ch] text-[17px] leading-[1.55] text-ss-tinta [text-wrap:pretty]"
            lang={excerptIsSource ? "en" : undefined}
          >
            {excerptIsSource ? <bdi lang="en" dir="ltr">{excerpt}</bdi> : excerpt}
          </p>
        )}
        {/* La fuente solo si la nota la tiene capturada en el panel; nunca una inventada */}
        {lead && item.sourceName && (
          <p className="mt-auto border-t border-ss-rule pt-4 text-[14px] text-ss-medio">
            <span className="font-semibold text-ss-marino">{language === "es" ? "Fuente:" : "Source:"}</span> {item.sourceName}
          </p>
        )}
      </li>
    );
  }

  return (
    <li
      className={editorial
        ? `grid grid-cols-1 gap-5 border-b ${rule} py-8 md:grid-cols-[minmax(220px,0.78fr)_minmax(0,1fr)] md:gap-8 md:py-9 lg:gap-12`
        : `grid grid-cols-1 gap-y-3 border-b ${rule} py-8 ${index ? "lg:grid-cols-12 lg:gap-x-6 lg:py-10" : ""}`}
      data-testid={testIds.row?.(item)}
    >
      {editorial && <ArchiveImage key={getHomeMonitorImage(item)} item={item} label={imageUnavailable} />}
      <div className={editorial ? "min-w-0 self-center" : "contents"}>
      <p className={`ss-label ss-num ${index && !editorial ? "lg:col-span-4 lg:pt-2" : ""}`}>
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
      <div className={index && !editorial ? "lg:col-span-7 lg:col-start-5 xl:col-span-6" : ""}>
        <Heading
            className={`${TITLE_CLASS} ${editorial ? "text-[clamp(25px,2.1vw,32px)] leading-[1.18] tracking-[-0.015em]" : ""}`}
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
            className={`mt-3 text-[18px] leading-[1.55] text-ss-tinta [text-wrap:pretty] ${index || editorial ? "max-w-[63.75ch]" : ""}`}
            data-testid={testIds.excerpt?.(item)}
            lang={excerptIsSource ? "en" : undefined}
          >
            {excerptIsSource ? <bdi lang="en" dir="ltr">{excerpt}</bdi> : excerpt}
          </p>
        )}
      </div>
      </div>
    </li>
  );
}

function ArchiveImage({ item, label }: { item: News; label: string }) {
  const image = getHomeMonitorImage(item);
  const [failed, setFailed] = useState(false);
  if (!image || failed) {
    return (
      <div aria-hidden="true" className="flex aspect-[16/9] min-h-[150px] items-end border-l-2 border-ss-rule bg-ss-paper p-4 md:min-h-[180px]">
        <span className="ss-label text-[10px] tracking-[0.12em] text-ss-medio">{label}</span>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-[8px] bg-ss-paper">
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        width={1024}
        height={1024}
        className="block aspect-[16/9] min-h-[150px] w-full object-cover object-[50%_40%] md:min-h-[180px]"
      />
    </div>
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
  presentation = "default",
}: MonitorListProps) {
  const { language: interfaceLanguage } = useLanguage();
  const language = languageProp ?? interfaceLanguage;
  const liveStrings = useCmsContent("monitor-ui", STRINGS);
  const s = liveStrings[language] || liveStrings.en;
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const editorial = presentation === "archive";
  const pageSize = 12;

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
  const filteredItems = items
    .filter((item) => activeCategory === "all" || item.category === activeCategory)
    .filter((item) =>
      !q || [item.titleEs, item.title, item.excerptEs, item.excerpt].some((text) => text?.toLowerCase().includes(q)),
    );
  const pageCount = editorial ? Math.max(1, Math.ceil(filteredItems.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const visible = editorial
    ? filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredItems.slice(0, limit);

  const rule = tone === "paper" ? "border-ss-marino/15" : "border-ss-rule";
  const narrowed = activeCategory !== "all" || q.length > 0;
  const paginationText = s.pageOf.replace("{page}", String(currentPage)).replace("{count}", String(pageCount));

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
                    onClick={() => { setCategory(value); setPage(1); }}
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
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
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
          {Array.from({ length: editorial ? 4 : Math.min(limit ?? 3, 3) }).map((_, i) => (
            <li key={i} className={`border-b ${rule} py-8`} data-testid={testIds.skeleton?.(i)}>
              <Skeleton className="h-3 w-40 mb-4 bg-ss-rule" />
              <Skeleton className="h-6 w-full max-w-xl mb-3 bg-ss-rule" />
              <Skeleton className="h-4 w-3/4 max-w-lg bg-ss-rule" />
            </li>
          ))}
        </ul>
      )}

      {!error && !isLoading && visible.length > 0 && (
        <ul className={`border-t ${layout === "bulletin" ? "border-ss-marino lg:grid lg:grid-cols-12" : rule}`}>
          {visible.map((item, i) => (
            <MonitorRow
              key={item.id}
              item={item}
              language={language}
              showCategory={showCategory}
              headingLevel={headingLevel}
              layout={layout}
              rule={rule}
              lead={layout === "bulletin" && i === 0}
              testIds={testIds}
              onTranslated={onTranslated}
              editorial={editorial}
              imageUnavailable={s.imageUnavailable}
            />
          ))}
        </ul>
      )}
      {editorial && !error && !isLoading && filteredItems.length > pageSize && (
        <nav aria-label={s.pagination} className="flex flex-wrap items-center justify-between gap-4 border-b border-ss-rule py-6">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="ss-label min-h-[44px] px-2 text-ss-marino underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ss-marino disabled:cursor-not-allowed disabled:text-ss-medio disabled:no-underline"
          >
            {s.previous}
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1" aria-label={paginationText}>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                aria-label={`${s.page} ${number}`}
                aria-current={currentPage === number ? "page" : undefined}
                className={`ss-label min-h-[44px] min-w-[44px] px-3 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ss-marino ${currentPage === number ? "text-ss-marino underline" : "text-ss-medio hover:text-ss-marino hover:underline"}`}
              >
                {number}
              </button>
            ))}
          </div>
          <span className="sr-only" aria-live="polite">{paginationText}</span>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage === pageCount}
            className="ss-label min-h-[44px] px-2 text-ss-marino underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ss-marino disabled:cursor-not-allowed disabled:text-ss-medio disabled:no-underline"
          >
            {s.next}
          </button>
        </nav>
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
      <p className="text-[18px] leading-[1.55] text-ss-tinta">{t.line}</p>
      <TextLink href="/newsletter" data-testid={linkTestId}>
        {t.cta}
      </TextLink>
    </div>
  );
}

export default MonitorList;
