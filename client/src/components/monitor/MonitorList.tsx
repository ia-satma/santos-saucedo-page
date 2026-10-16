import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { formatNewsDate } from "@/lib/newsDate";
import { newsCategories, type LanguageCode, type News } from "@shared/schema";

// Lista única del Monitor Laboral (/news, /articles, "Más del Monitor Laboral" del artículo y,
// si se quiere, la portada). Filas de filete: categoría · fecha en etiqueta, titular en la
// romana que es el enlace y entradilla. Sin foto ni loseta Hueso con §, sin "Leer más".
// Lee solo lo publicado en /api/news, del más reciente al más antiguo, con estados de
// carga, vacío y error.

interface MonitorStrings {
  all: string;
  /** Nombre accesible del grupo de filtros */
  filters: string;
  search: string;
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
    empty: "Aún no hay publicaciones.",
    noResults: "Ninguna publicación coincide con la búsqueda.",
    error: "No fue posible cargar las publicaciones.",
    categories: { press: "Prensa", insights: "Análisis", rankings: "Rankings", events: "Eventos", alerts: "Alertas" },
  },
  en: {
    all: "All",
    filters: "Filter by category",
    search: "Search the Labor Monitor",
    empty: "There are no publications yet.",
    noResults: "No publications match the search.",
    error: "The publications could not be loaded.",
    categories: { press: "Press", insights: "Analysis", rankings: "Rankings", events: "Events", alerts: "Alerts" },
  },
  de: {
    all: "Alle",
    filters: "Nach Kategorie filtern",
    search: "Suchen",
    empty: "Es gibt noch keine Veröffentlichungen.",
    noResults: "Keine Veröffentlichung entspricht der Suche.",
    error: "Die Veröffentlichungen konnten nicht geladen werden.",
    categories: { press: "Presse", insights: "Analysen", rankings: "Rankings", events: "Veranstaltungen", alerts: "Mitteilungen" },
  },
  zh: {
    all: "全部",
    filters: "按类别筛选",
    search: "搜索",
    empty: "暂无文章。",
    noResults: "没有符合搜索条件的文章。",
    error: "无法加载文章。",
    categories: { press: "新闻稿", insights: "分析", rankings: "排名", events: "活动", alerts: "公告" },
  },
  ko: {
    all: "전체",
    filters: "카테고리별 필터",
    search: "검색",
    empty: "아직 게시물이 없습니다.",
    noResults: "검색 결과가 없습니다.",
    error: "게시물을 불러오지 못했습니다.",
    categories: { press: "보도자료", insights: "분석", rankings: "순위", events: "이벤트", alerts: "공지" },
  },
  ja: {
    all: "すべて",
    filters: "カテゴリーで絞り込む",
    search: "検索",
    empty: "まだ記事はありません。",
    noResults: "検索に一致する記事はありません。",
    error: "記事を読み込めませんでした。",
    categories: { press: "プレス", insights: "分析", rankings: "ランキング", events: "イベント", alerts: "お知らせ" },
  },
  ar: {
    all: "الكل",
    filters: "تصفية حسب الفئة",
    search: "بحث",
    empty: "لا توجد منشورات بعد.",
    noResults: "لا توجد منشورات تطابق البحث.",
    error: "تعذّر تحميل المنشورات.",
    categories: { press: "صحافة", insights: "تحليلات", rankings: "تصنيفات", events: "فعاليات", alerts: "تنبيهات" },
  },
  ru: {
    all: "Все",
    filters: "Фильтр по категории",
    search: "Поиск",
    empty: "Публикаций пока нет.",
    noResults: "По запросу ничего не найдено.",
    error: "Не удалось загрузить публикации.",
    categories: { press: "Пресса", insights: "Аналитика", rankings: "Рейтинги", events: "Мероприятия", alerts: "Уведомления" },
  },
  fr: {
    all: "Tout",
    filters: "Filtrer par catégorie",
    search: "Rechercher",
    empty: "Aucune publication pour le moment.",
    noResults: "Aucune publication ne correspond à la recherche.",
    error: "Impossible de charger les publications.",
    categories: { press: "Presse", insights: "Analyses", rankings: "Classements", events: "Événements", alerts: "Alertes" },
  },
  it: {
    all: "Tutte",
    filters: "Filtra per categoria",
    search: "Cerca",
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
  /** Campo de búsqueda sobre titular y entradilla (español e inglés) */
  search?: boolean;
  /** Nivel del titular de cada fila: h2 bajo el h1 de la página, h3 bajo un h2 de sección */
  headingLevel?: "h2" | "h3";
  /** index: etiqueta a la izquierda y texto a la derecha desde lg · stacked: todo apilado */
  layout?: "index" | "stacked";
  /** Fondo: blanco (filete Línea) o Hueso (Azul Marino al 15 %, como la portada) */
  tone?: "light" | "paper";
  /** Estado vacío propio (p. ej. /articles conserva su bloque y sus testids) */
  empty?: ReactNode;
  testIds?: MonitorListTestIds;
  className?: string;
}

const TITLE_CLASS =
  "ss-display text-[clamp(22px,1.7vw,25px)] font-[450] leading-[1.25] tracking-[-0.01em] text-ss-marino";

function categoryLabel(item: News, language: LanguageCode, s: MonitorStrings): string | null {
  if (!item.category) return null;
  if (s.categories[item.category]) return s.categories[item.category];
  if (language === "es" && item.categoryEs) return item.categoryEs;
  return item.category.charAt(0).toUpperCase() + item.category.slice(1);
}

function MonitorRow({
  item,
  headingLevel,
  layout,
  rule,
  testIds,
}: {
  item: News;
  headingLevel: "h2" | "h3";
  layout: "index" | "stacked";
  rule: string;
  testIds: MonitorListTestIds;
}) {
  const { language } = useLanguage();
  const s = STRINGS[language] || STRINGS.en;
  const isSpanish = language === "es";

  // Sin traducción se muestra el inglés de origen. Fuera de ES/EN va marcado: lang="en" en el
  // bloque (la romana, no la sans de CJK) y el texto en <bdi lang="en" dir="ltr"> (en árabe el
  // bloque sigue alineado a la derecha y el punto final no salta al principio).
  const { translatedFields } = useTranslatedContent({
    contentType: "news",
    entityId: String(item.id),
    fields: {
      title: item.title,
      titleEs: item.titleEs,
      excerpt: item.excerpt,
      excerptEs: item.excerptEs,
    },
    enabled: !isSpanish,
  });

  const title = isSpanish ? item.titleEs || item.title : translatedFields.title || item.title;
  const excerpt = isSpanish ? item.excerptEs || item.excerpt : translatedFields.excerpt || item.excerpt;
  const isOtherLanguage = !isSpanish && language !== "en";
  const titleIsSource = isOtherLanguage && !!title && title === item.title;
  const excerptIsSource = isOtherLanguage && !!excerpt && excerpt === item.excerpt;
  const category = categoryLabel(item, language, s);
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
        {excerpt && (
          <p
            className="mt-3 text-[16px] leading-[1.55] text-ss-tinta [text-wrap:pretty]"
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
  testIds = {},
  className = "",
}: MonitorListProps) {
  const { language } = useLanguage();
  const s = STRINGS[language] || STRINGS.en;
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  // Solo lo publicado, del más reciente al más antiguo
  const items = useMemo(() => {
    const published = (data ?? []).filter((item) => item.published !== false && item.id !== excludeId);
    return [...published].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  }, [data, excludeId]);

  // Categorías con notas, en el orden del esquema; los filtros solo si hay al menos dos
  const presentCategories = useMemo(
    () => newsCategories.map((c) => c.value as string).filter((value) => items.some((item) => item.category === value)),
    [items],
  );
  const showFilters = filters && presentCategories.length >= 2;
  const activeCategory = showFilters && presentCategories.includes(category) ? category : "all";

  const q = query.trim().toLowerCase();
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
      {(showFilters || search) && !error && items.length > 0 && (
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
          {search && (
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
                  className="ps-9 bg-white border-ss-input text-ss-tinta focus-visible:ring-ss-marino focus-visible:border-ss-marino"
                  data-testid={testIds.search}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error ? (
        <div className={`border-t ${rule} py-12`} data-testid={testIds.error}>
          <p className="text-base text-ss-medio" data-testid={testIds.errorText}>
            {s.error}
          </p>
        </div>
      ) : isLoading ? (
        <ul className={`border-t ${rule}`} aria-busy="true">
          {Array.from({ length: Math.min(limit ?? 3, 3) }).map((_, i) => (
            <li key={i} className={`border-b ${rule} py-8`} data-testid={testIds.skeleton?.(i)}>
              <Skeleton className="h-3 w-40 mb-4 bg-ss-rule" />
              <Skeleton className="h-6 w-full max-w-xl mb-3 bg-ss-rule" />
              <Skeleton className="h-4 w-3/4 max-w-lg bg-ss-rule" />
            </li>
          ))}
        </ul>
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
      ) : (
        <ul className={`border-t ${rule}`}>
          {visible.map((item) => (
            <MonitorRow
              key={item.id}
              item={item}
              headingLevel={headingLevel}
              layout={layout}
              rule={rule}
              testIds={testIds}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default MonitorList;
