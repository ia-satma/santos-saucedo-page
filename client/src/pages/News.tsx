import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow } from "@/components/editorial";
import { formatNewsDate } from "@/lib/newsDate";
import { newsCategories, type News } from "@shared/schema";

function NewsImageWithFallback({ 
  src, 
  alt, 
  className,
  lang,
}: { 
  src: string; 
  alt: string; 
  className?: string;
  /** Idioma del texto alternativo cuando es el inglés de origen */
  lang?: string;
}) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError || !src) {
    return (
      // Sin imagen: Hueso con un § tonal en Línea (en vez del "S&S")
      <div aria-hidden="true" className={`bg-ss-paper flex items-center justify-center ${className}`}>
        <span className="font-heading font-normal text-5xl text-ss-rule leading-none">§</span>
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      lang={lang}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

interface NewsCardProps {
  article: News;
  readMoreText: string;
  /** Categorías en el idioma de la página (las mismas de los filtros) */
  categoryLabels: Record<string, string>;
}

function NewsCard({ article, readMoreText, categoryLabels }: NewsCardProps) {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  
  // Mismo origen y misma vuelta atrás que el artículo (NewsDetail): sin traducción se muestra
  // el inglés de origen (antes, el español sin marcar). Fuera de ES/EN ese inglés va marcado:
  // lang="en" en el bloque (la romana, no la sans de CJK) y el texto en <bdi lang="en" dir="ltr">
  // (en árabe el bloque sigue alineado a la derecha y el punto final no salta al principio).
  const { translatedFields, isLoading, isTranslating } = useTranslatedContent({
    contentType: 'news',
    entityId: String(article.id),
    fields: {
      title: article.title,
      titleEs: article.titleEs,
      excerpt: article.excerpt,
      excerptEs: article.excerptEs,
    },
    enabled: !isSpanish,
  });

  const displayTitle = isSpanish 
    ? (article.titleEs || article.title)
    : (translatedFields.title || article.title);
  const displayExcerpt = isSpanish
    ? (article.excerptEs || article.excerpt)
    : (translatedFields.excerpt || article.excerpt);
  const isOtherLanguage = !isSpanish && language !== 'en';
  const titleIsSource = isOtherLanguage && !!displayTitle && displayTitle === article.title;
  const excerptIsSource = isOtherLanguage && !!displayExcerpt && displayExcerpt === article.excerpt;
  
  const getCategoryLabel = () => {
    if (!article.category) return null;
    if (categoryLabels[article.category]) {
      return categoryLabels[article.category];
    }
    if (language === "es" && article.categoryEs) {
      return article.categoryEs;
    }
    return article.category.charAt(0).toUpperCase() + article.category.slice(1);
  };

  const showTranslatingIndicator = isLoading || isTranslating;

  // Fila abierta: foto sin velo, categoría y fecha como etiquetas, titular en romana
  // Azul Marino, extracto de 16 px y enlace de texto. Sin caja, sombra ni iconos.
  return (
    <Link href={`/news/${article.slug}`}>
      <article
        className="group h-full flex flex-col cursor-pointer"
        data-testid={`card-news-${article.slug}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-ss-paper mb-5">
          <NewsImageWithFallback
            src={article.imageUrl || ""}
            alt={displayTitle}
            lang={titleIsSource ? "en" : undefined}
            className="ss-photo--colour w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {showTranslatingIndicator && (
            <div className="absolute top-3 end-3 flex items-center px-2 py-1 bg-ss-navy/80 text-white">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
          {article.category && (
            <span
              className="ss-label text-ss-marino"
              data-testid={`badge-category-${article.slug}`}
            >
              {getCategoryLabel()}
            </span>
          )}
          <span className="ss-label text-ss-medio" data-testid={`text-news-date-${article.slug}`}>
            {formatNewsDate(article.date, language)}
          </span>
        </div>
        {/* h2 con el aspecto de h3: bajo el h1 de la página no hay otro nivel intermedio */}
        <h2
          className="ss-h3 text-[20px] mb-2 line-clamp-3 group-hover:underline decoration-1 underline-offset-4"
          data-testid={`text-news-title-${article.slug}`}
          lang={titleIsSource ? "en" : undefined}
        >
          {titleIsSource ? <bdi lang="en" dir="ltr">{displayTitle}</bdi> : displayTitle}
        </h2>
        <p
          className="text-base leading-[1.55] text-ss-tinta line-clamp-3 mb-4"
          data-testid={`text-news-excerpt-${article.slug}`}
          lang={excerptIsSource ? "en" : undefined}
        >
          {excerptIsSource ? <bdi lang="en" dir="ltr">{displayExcerpt}</bdi> : displayExcerpt}
        </p>
        <span className="mt-auto inline-flex items-center gap-2 text-[15px] font-semibold text-ss-marino">
          {readMoreText}
          <span aria-hidden="true" className="text-[15px] inline-block transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>
        </span>
      </article>
    </Link>
  );
}

export default function NewsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: news, isLoading, error } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const content: Record<string, {
    title: string;
    subtitle: string;
    errorMessage: string;
    searchPlaceholder: string;
    readMore: string;
    noResults: string;
    published: string;
    all: string;
    press: string;
    insights: string;
    rankings: string;
    events: string;
    alerts: string;
    filterBy: string;
    category: string;
    allCategories: string;
  }> = {
    en: {
      title: "Labor Monitor",
      subtitle: "News and analysis",
      errorMessage: "Failed to load news",
      searchPlaceholder: "Search...",
      readMore: "Read More",
      noResults: "No news found",
      published: "Published",
      all: "All",
      press: "Press",
      insights: "Analysis",
      rankings: "Rankings",
      events: "Events",
      alerts: "Alerts",
      filterBy: "Filter by",
      category: "Category",
      allCategories: "All Categories",
    },
    es: {
      // El nombre de la publicación, como en el menú (conserva sus mayúsculas)
      title: "Monitor Laboral",
      subtitle: "Noticias y análisis",
      errorMessage: "Error al cargar las noticias",
      searchPlaceholder: "Buscar...",
      readMore: "Leer más",
      noResults: "No se encontraron noticias",
      published: "Publicado",
      all: "Todos",
      press: "Prensa",
      insights: "Análisis",
      rankings: "Rankings",
      events: "Eventos",
      alerts: "Alertas",
      filterBy: "Filtrar por",
      category: "Categoría",
      allCategories: "Todas las categorías",
    },
    de: {
      title: "Nachrichten",
      subtitle: "Neuigkeiten und Analysen",
      errorMessage: "Nachrichten konnten nicht geladen werden",
      searchPlaceholder: "Suchen...",
      readMore: "Weiterlesen",
      noResults: "Keine Nachrichten gefunden",
      published: "Veröffentlicht",
      all: "Alle",
      press: "Presse",
      insights: "Analysen",
      rankings: "Rankings",
      events: "Veranstaltungen",
      alerts: "Mitteilungen",
      filterBy: "Filtern nach",
      category: "Kategorie",
      allCategories: "Alle Kategorien",
    },
    zh: {
      title: "新闻",
      subtitle: "新闻与分析",
      errorMessage: "加载新闻失败",
      searchPlaceholder: "搜索...",
      readMore: "阅读更多",
      noResults: "未找到新闻",
      published: "发布于",
      all: "全部",
      press: "新闻稿",
      insights: "分析",
      rankings: "排名",
      events: "活动",
      alerts: "公告",
      filterBy: "筛选",
      category: "类别",
      allCategories: "所有类别",
    },
    ko: {
      title: "뉴스",
      subtitle: "뉴스와 분석",
      errorMessage: "뉴스 로드 실패",
      searchPlaceholder: "검색...",
      readMore: "더 읽기",
      noResults: "뉴스를 찾을 수 없습니다",
      published: "게시일",
      all: "전체",
      press: "보도자료",
      insights: "분석",
      rankings: "순위",
      events: "이벤트",
      alerts: "공지",
      filterBy: "필터",
      category: "카테고리",
      allCategories: "모든 카테고리",
    },
    ja: {
      title: "ニュース",
      subtitle: "ニュースと分析",
      errorMessage: "ニュースの読み込みに失敗しました",
      searchPlaceholder: "検索...",
      readMore: "続きを読む",
      noResults: "ニュースが見つかりません",
      published: "公開日",
      all: "すべて",
      press: "プレス",
      insights: "分析",
      rankings: "ランキング",
      events: "イベント",
      alerts: "お知らせ",
      filterBy: "フィルター",
      category: "カテゴリー",
      allCategories: "すべてのカテゴリー",
    },
    ar: {
      title: "الأخبار",
      subtitle: "الأخبار والتحليلات",
      errorMessage: "فشل تحميل الأخبار",
      searchPlaceholder: "بحث...",
      readMore: "اقرأ المزيد",
      noResults: "لم يتم العثور على أخبار",
      published: "نُشر",
      all: "الكل",
      press: "صحافة",
      insights: "تحليلات",
      rankings: "تصنيفات",
      events: "فعاليات",
      alerts: "تنبيهات",
      filterBy: "تصفية حسب",
      category: "الفئة",
      allCategories: "جميع الفئات",
    },
    ru: {
      title: "Новости",
      subtitle: "Новости и аналитика",
      errorMessage: "Не удалось загрузить новости",
      searchPlaceholder: "Поиск...",
      readMore: "Читать далее",
      noResults: "Новости не найдены",
      published: "Опубликовано",
      all: "Все",
      press: "Пресса",
      insights: "Аналитика",
      rankings: "Рейтинги",
      events: "Мероприятия",
      alerts: "Уведомления",
      filterBy: "Фильтр",
      category: "Категория",
      allCategories: "Все категории",
    },
    fr: {
      title: "Actualités",
      subtitle: "Actualités et analyses",
      errorMessage: "Échec du chargement des actualités",
      searchPlaceholder: "Rechercher...",
      readMore: "Lire la suite",
      noResults: "Aucune actualité trouvée",
      published: "Publié",
      all: "Tout",
      press: "Presse",
      insights: "Analyses",
      rankings: "Classements",
      events: "Événements",
      alerts: "Alertes",
      filterBy: "Filtrer par",
      category: "Catégorie",
      allCategories: "Toutes les catégories",
    },
    it: {
      title: "Notizie",
      subtitle: "Notizie e analisi",
      errorMessage: "Impossibile caricare le notizie",
      searchPlaceholder: "Cerca...",
      readMore: "Leggi di più",
      noResults: "Nessuna notizia trovata",
      published: "Pubblicato",
      all: "Tutto",
      press: "Stampa",
      insights: "Analisi",
      rankings: "Classifiche",
      events: "Eventi",
      alerts: "Avvisi",
      filterBy: "Filtra per",
      category: "Categoria",
      allCategories: "Tutte le categorie",
    },
  };

  const translationBannerMessages: Record<string, string> = {
    de: "Inhalte werden automatisch übersetzt.",
    zh: "内容正在自动翻译中。",
    ko: "콘텐츠가 자동으로 번역됩니다.",
    ja: "コンテンツは自動翻訳されています。",
    ar: "يتم ترجمة المحتوى تلقائياً.",
    ru: "Содержимое автоматически переводится.",
    fr: "Le contenu est traduit automatiquement.",
    it: "Il contenuto viene tradotto automaticamente.",
  };

  const t = content[language] || content.en;
  const isNonNativeLanguage = language !== 'es';
  const translationBanner = isNonNativeLanguage ? (translationBannerMessages[language] || (language === 'en' ? "Content is automatically translated from Spanish." : null)) : null;

  // Categorías en el idioma de la página (antes solo ES/EN, con "Insights" en ambos)
  const categoryLabels: Record<string, string> = {
    press: t.press,
    insights: t.insights,
    rankings: t.rankings,
    events: t.events,
    alerts: t.alerts,
  };

  const categoryFilters = [
    { value: "all", label: t.all },
    ...newsCategories.map(cat => ({
      value: cat.value,
      label: categoryLabels[cat.value] || cat.en,
    })),
  ];

  const filteredNews = news?.filter(article => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    if (!searchQuery) return matchesCategory;
    
    const query = searchQuery.toLowerCase();
    const title = language === "es" ? article.titleEs : article.title;
    const excerpt = language === "es" ? article.excerptEs : article.excerpt;
    const matchesSearch = title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query);
    
    return matchesCategory && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-news">
      <SEOHead page="news" language={language} />
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1); el relleno
          del cuerpo va en su propio envoltorio. ss-container: borde de logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-news-hero">
          <div className="ss-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <Eyebrow num="04" tone="navy" className="mb-6" />
              <h1
                className="mb-5"
                data-testid="text-news-title"
              >
                {t.title}
              </h1>
              <p
                data-testid="text-news-subtitle"
              >
                {t.subtitle}
              </p>
              {translationBanner && (
                <p
                  className="mt-4 text-sm"
                  data-testid="text-translation-banner"
                >
                  {translationBanner}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        <div className="py-16 lg:py-20">
          <div className="ss-container">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-10 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-2" data-testid="container-category-filters">
                {categoryFilters.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    aria-pressed={selectedCategory === cat.value}
                    className={
                      selectedCategory === cat.value
                        ? "text-sm"
                        : "text-sm font-normal border-ss-input text-ss-tinta hover:border-ss-marino hover:text-ss-marino"
                    }
                    data-testid={`button-filter-${cat.value}`}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              <div className="relative max-w-md">
                <Search aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ss-medio" />
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 bg-white border-ss-input text-ss-tinta placeholder:text-ss-medio focus-visible:ring-ss-marino focus-visible:border-ss-marino"
                  data-testid="input-search-news"
                />
              </div>
            </motion.div>

            {error ? (
              <div className="py-12" data-testid="container-news-error">
                <p className="text-base text-ss-medio" data-testid="text-news-error">
                  {t.errorMessage}
                </p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    data-testid={`skeleton-news-${i}`}
                  >
                    <Skeleton className="aspect-[16/10] w-full bg-ss-paper mb-5" />
                    <Skeleton className="h-4 w-24 mb-3 bg-ss-rule" />
                    <Skeleton className="h-6 w-full mb-2 bg-ss-rule" />
                    <Skeleton className="h-4 w-full mb-1 bg-ss-rule" />
                    <Skeleton className="h-4 w-3/4 bg-ss-rule" />
                  </div>
                ))}
              </div>
            ) : filteredNews && filteredNews.length === 0 ? (
              <div className="py-12" data-testid="container-news-empty">
                <p className="text-base text-ss-medio">
                  {t.noResults}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
              >
                {filteredNews?.map((article) => (
                  <motion.div key={article.id} variants={itemVariants}>
                    <NewsCard article={article} readMoreText={t.readMore} categoryLabels={categoryLabels} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
