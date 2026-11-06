/* Textos de interfaz del Monitor Laboral en las páginas v3 (/news y las notas). Son los mismos de
   components/monitor/MonitorList.tsx, con las mismas claves del panel («monitor-ui» y
   «monitor-subscribe»): lo que se edite en el panel manda aquí también. Si cambian allí, cambian aquí. */
import type { LanguageCode } from "@shared/schema";
import i18n from "@/i18n";
import { useCmsContent } from "@/hooks/useCmsContent";
import { home26 } from "@/components/home26/content";

/** «Siguiente» en el idioma de la página (i18n cta.next, 10 idiomas), para la página siguiente (sh-sigue) */
export function etiquetaSiguiente(language: LanguageCode | string): string {
  return i18n.getFixedT(language)("cta.next");
}

export interface MonitorStrings {
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

export const MONITOR_UI: Record<LanguageCode, MonitorStrings> = {
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

export const MONITOR_SUBSCRIBE: Record<LanguageCode, { line: string; cta: string }> = {
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

/* La frase que presenta el Monitor (subtítulo de /news y entrada de /newsletter): en español e inglés, la
   de la portada (home26.monitor.intro, panel «home»); en los demás idiomas, su traducción (panel
   «news-intro»). */
export const MONITOR_INTRO: Record<string, string> = {
  es: home26.es.monitor.intro,
  en: home26.en.monitor.intro,
  de: "Analysen der Kanzlei zu den Änderungen, die Unternehmen betreffen.",
  zh: "本所对影响企业的各项变化的分析。",
  ko: "기업에 영향을 미치는 변화에 관한 법인의 분석.",
  ja: "企業に影響する変化についての事務所の分析。",
  ar: "تحليلات المكتب للتغييرات التي تمسّ الشركات.",
  ru: "Аналитика фирмы об изменениях, которые касаются компаний.",
  fr: "Les analyses du cabinet sur les évolutions qui concernent les entreprises.",
  it: "Le analisi dello studio sui cambiamenti che riguardano le imprese.",
};

export function useMonitorIntro(language: string): string {
  const liveSubtitles = useCmsContent("news-intro", MONITOR_INTRO);
  const liveHome = useCmsContent("home", home26);
  return language === "es" || language === "en"
    ? liveHome[language].monitor.intro
    : (liveSubtitles[language] || liveSubtitles.en);
}

/* «Más del Monitor Laboral» (las notas más recientes al pie de cada nota y de la suscripción): el mismo
   texto y la misma clave del panel («news-detail» → relatedNews) que pages/NewsDetail.tsx. */
export const MONITOR_RELATED: Record<string, { relatedNews: string }> = {
  en: { relatedNews: "More from the Labor Monitor" },
  es: { relatedNews: "Más del Monitor Laboral" },
  de: { relatedNews: "Weitere Nachrichten" },
  zh: { relatedNews: "更多新闻" },
  ko: { relatedNews: "뉴스 더 보기" },
  ja: { relatedNews: "その他のニュース" },
  ar: { relatedNews: "المزيد من الأخبار" },
  ru: { relatedNews: "Другие новости" },
  fr: { relatedNews: "Autres actualités" },
  it: { relatedNews: "Altre notizie" },
};
