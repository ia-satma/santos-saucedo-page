import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow } from "@/components/editorial";
import { formatNewsDate } from "@/lib/newsDate";
import { type News } from "@shared/schema";

function ArticleImageWithFallback({ 
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
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

interface ArticleCardProps {
  article: News;
  readMoreText: string;
}

function ArticleCard({ article, readMoreText }: ArticleCardProps) {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  
  // Como /news y el artículo (NewsDetail): sin traducción, el inglés de origen; fuera de ES/EN,
  // marcado con lang="en" en el bloque y el texto en <bdi lang="en" dir="ltr">.
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
  
  const showTranslatingIndicator = isLoading || isTranslating;

  // Fila abierta: foto sin velo, fecha como etiqueta, titular en romana Azul Marino,
  // extracto de 16 px y enlace de texto. Sin caja, sombra ni iconos.
  return (
    <Link href={`/news/${article.slug}`}>
      <article
        className="group h-full flex flex-col cursor-pointer"
        data-testid={`card-article-${article.slug}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-ss-paper mb-5">
          <ArticleImageWithFallback
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
        <p className="ss-label text-ss-medio mb-2">
          <span className="ss-label" data-testid={`text-article-date-${article.slug}`}>
            {formatNewsDate(article.date, language)}
          </span>
        </p>
        {/* h2 con el aspecto de h3: bajo el h1 de la página no hay otro nivel intermedio */}
        <h2
          className="ss-h3 text-[20px] mb-2 line-clamp-3 group-hover:underline decoration-1 underline-offset-4"
          data-testid={`text-article-title-${article.slug}`}
          lang={titleIsSource ? "en" : undefined}
        >
          {titleIsSource ? <bdi lang="en" dir="ltr">{displayTitle}</bdi> : displayTitle}
        </h2>
        <p
          className="text-base leading-[1.55] text-ss-tinta line-clamp-3 mb-4"
          data-testid={`text-article-excerpt-${article.slug}`}
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

export default function ArticlesPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles, isLoading, error } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  // Subtítulo sin "insights" ni "nuestros expertos": la publicación, como en español. Sin
  // artículos, una constatación neutra (no "regrese pronto").
  const content = {
    en: {
      title: "Articles",
      subtitle: "Analysis and publications from the Santos & Saucedo Labor Monitor",
      errorMessage: "Failed to load articles",
      searchPlaceholder: "Search articles...",
      readMore: "Read More",
      noResults: "No articles match your search",
      comingSoon: "Coming Soon",
      comingSoonMessage: "There are no publications in this section yet.",
      published: "Published",
    },
    es: {
      title: "Artículos",
      subtitle: "Análisis y publicaciones del Monitor Laboral de Santos & Saucedo",
      errorMessage: "Error al cargar los artículos",
      searchPlaceholder: "Buscar artículos...",
      readMore: "Leer más",
      noResults: "No hay artículos que coincidan con su búsqueda",
      comingSoon: "Próximamente",
      comingSoonMessage: "Aún no hay publicaciones en esta sección.",
      published: "Publicado",
    },
    de: {
      title: "Artikel",
      subtitle: "Analysen und Veröffentlichungen von Santos & Saucedo",
      errorMessage: "Artikel konnten nicht geladen werden",
      searchPlaceholder: "Artikel suchen...",
      readMore: "Weiterlesen",
      noResults: "Keine Artikel entsprechen Ihrer Suche",
      comingSoon: "Demnächst",
      comingSoonMessage: "In diesem Bereich gibt es noch keine Veröffentlichungen.",
      published: "Veröffentlicht",
    },
    zh: {
      title: "文章",
      subtitle: "Santos & Saucedo 的分析与出版物",
      errorMessage: "文章加载失败",
      searchPlaceholder: "搜索文章...",
      readMore: "阅读更多",
      noResults: "没有符合搜索条件的文章",
      comingSoon: "即将推出",
      comingSoonMessage: "本栏目尚无文章。",
      published: "发布日期",
    },
    ko: {
      title: "기사",
      subtitle: "Santos & Saucedo의 분석과 간행물",
      errorMessage: "기사를 불러오지 못했습니다",
      searchPlaceholder: "기사 검색...",
      readMore: "자세히 보기",
      noResults: "검색 결과가 없습니다",
      comingSoon: "곧 출시",
      comingSoonMessage: "이 섹션에는 아직 게시물이 없습니다.",
      published: "게시일",
    },
    ja: {
      title: "記事",
      subtitle: "Santos & Saucedoによる分析と刊行物",
      errorMessage: "記事の読み込みに失敗しました",
      searchPlaceholder: "記事を検索...",
      readMore: "続きを読む",
      noResults: "検索に一致する記事がありません",
      comingSoon: "近日公開",
      comingSoonMessage: "このセクションにはまだ記事がありません。",
      published: "公開日",
    },
    ar: {
      title: "المقالات",
      subtitle: "تحليلات ومنشورات Santos & Saucedo",
      errorMessage: "فشل تحميل المقالات",
      searchPlaceholder: "البحث في المقالات...",
      readMore: "اقرأ المزيد",
      noResults: "لا توجد مقالات تطابق بحثك",
      comingSoon: "قريباً",
      comingSoonMessage: "لا توجد منشورات في هذا القسم بعد.",
      published: "تاريخ النشر",
    },
    ru: {
      title: "Статьи",
      subtitle: "Аналитика и публикации Santos & Saucedo",
      errorMessage: "Не удалось загрузить статьи",
      searchPlaceholder: "Поиск статей...",
      readMore: "Читать далее",
      noResults: "Статьи по вашему запросу не найдены",
      comingSoon: "Скоро",
      comingSoonMessage: "В этом разделе пока нет публикаций.",
      published: "Опубликовано",
    },
    fr: {
      title: "Articles",
      subtitle: "Analyses et publications de Santos & Saucedo",
      errorMessage: "Échec du chargement des articles",
      searchPlaceholder: "Rechercher des articles...",
      readMore: "Lire la suite",
      noResults: "Aucun article ne correspond à votre recherche",
      comingSoon: "Bientôt disponible",
      comingSoonMessage: "Cette section ne contient encore aucune publication.",
      published: "Publié le",
    },
    it: {
      title: "Articoli",
      subtitle: "Analisi e pubblicazioni di Santos & Saucedo",
      errorMessage: "Impossibile caricare gli articoli",
      searchPlaceholder: "Cerca articoli...",
      readMore: "Leggi di più",
      noResults: "Nessun articolo corrisponde alla tua ricerca",
      comingSoon: "Prossimamente",
      comingSoonMessage: "Non ci sono ancora pubblicazioni in questa sezione.",
      published: "Pubblicato il",
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

  const filteredArticles = articles?.filter(article => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const title = language === "es" ? article.titleEs : article.title;
    const excerpt = language === "es" ? article.excerptEs : article.excerpt;
    return title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query);
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
    <div className="min-h-screen bg-background" data-testid="page-articles">
      <SEOHead page="articles" language={language} />
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1); el relleno
          del cuerpo va en su propio envoltorio. ss-container: borde de logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-articles-hero">
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
                data-testid="text-articles-title"
              >
                {t.title}
              </h1>
              <p
                data-testid="text-articles-subtitle"
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
              className="mb-10"
            >
              <div className="relative max-w-md">
                <Search aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ss-medio" />
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 bg-white border-ss-input text-ss-tinta placeholder:text-ss-medio focus-visible:ring-ss-marino focus-visible:border-ss-marino"
                  data-testid="input-search-articles"
                />
              </div>
            </motion.div>

            {error ? (
              <div className="py-12" data-testid="container-articles-error">
                <p className="text-base text-ss-medio" data-testid="text-articles-error">
                  {t.errorMessage}
                </p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    data-testid={`skeleton-article-${i}`}
                  >
                    <Skeleton className="aspect-[16/10] w-full bg-ss-paper mb-5" />
                    <Skeleton className="h-4 w-24 mb-3 bg-ss-rule" />
                    <Skeleton className="h-6 w-full mb-2 bg-ss-rule" />
                    <Skeleton className="h-4 w-full mb-1 bg-ss-rule" />
                    <Skeleton className="h-4 w-3/4 bg-ss-rule" />
                  </div>
                ))}
              </div>
            ) : !filteredArticles || filteredArticles.length === 0 ? (
              searchQuery ? (
                <div className="py-12" data-testid="container-articles-empty">
                  <p className="text-base text-ss-medio">
                    {t.noResults}
                  </p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="py-16 border-t border-ss-rule"
                  data-testid="container-articles-coming-soon"
                >
                  <h2
                    className="ss-h2-sm mb-4"
                    data-testid="text-coming-soon-title"
                  >
                    {t.comingSoon}
                  </h2>
                  <p
                    className="text-base text-ss-tinta max-w-md"
                    data-testid="text-coming-soon-message"
                  >
                    {t.comingSoonMessage}
                  </p>
                </motion.div>
              )
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
              >
                {filteredArticles?.map((article) => (
                  <motion.div key={article.id} variants={itemVariants}>
                    <ArticleCard article={article} readMoreText={t.readMore} />
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
