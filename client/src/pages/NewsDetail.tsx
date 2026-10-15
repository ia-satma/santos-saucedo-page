import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Linkedin, Twitter, Mail, LinkIcon, MessageCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es, enUS, de, zhCN, ko, ja, arSA, ru, fr, it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLdSchema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow, LeadParagraph } from "@/components/editorial";
import type { News, TeamMember } from "@shared/schema";

// Imagen del artículo: figura al inicio del cuerpo, bajo el encabezado de papel, sin velo.
// Sin imagen, o si no carga, no se pinta nada (sin foto genérica de reemplazo).
// alt vacío: el h1 ya dice el título.
function NewsHeroImage({ src }: { src: string }) {
  const [hasError, setHasError] = useState(false);
  if (!src || hasError) return null;
  return (
    <figure className="mb-12">
      <img
        src={src}
        alt=""
        className="ss-photo--colour block w-full aspect-[16/9] object-cover"
        loading="eager"
        decoding="async"
        onError={() => setHasError(true)}
        data-testid="img-news-hero"
      />
    </figure>
  );
}

function NewsCardImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string; 
  alt: string; 
  className?: string;
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
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

function AuthorCard({
  author, 
  getInitials, 
  truncateBio 
}: { 
  author: TeamMember; 
  getInitials: (name: string) => string;
  truncateBio: (bio: string | null | undefined, maxLength?: number) => string;
}) {
  const { language } = useLanguage();
  
  const { translatedFields, isTranslating } = useTranslatedContent({
    contentType: 'team_member',
    entityId: author.id.toString(),
    fields: {
      title: author.title,
      titleEs: author.titleEs,
      bio: author.bio,
      bioEs: author.bioEs,
    },
    enabled: !isNativeLanguage(language),
  });

  const displayTitle = translatedFields.title || author.title;
  const displayBio = translatedFields.bio || author.bio;
  
  return (
    <Link 
      href={`/team/${author.slug}`}
      className="group block"
    >
      {/* Fila con filete superior, sin caja; retrato en grises como todos los retratos */}
      <div
        className="border-t border-ss-rule pt-6 pb-2"
        data-testid={`card-author-${author.slug}`}
      >
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 flex-shrink-0" data-testid={`avatar-author-${author.slug}`}>
            <AvatarImage 
              src={author.imageUrl || undefined} 
              alt={author.name}
              className="object-cover ss-photo"
            />
            <AvatarFallback className="bg-ss-paper text-ss-marino text-lg font-heading">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 
              className="ss-h3 text-[20px] transition-colors group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1"
              data-testid={`text-author-name-${author.slug}`}
            >
              {author.name}
            </h3>
            <p 
              className="ss-label text-ss-medio mt-1 mb-2"
              data-testid={`text-author-title-${author.slug}`}
            >
              {displayTitle}
              {isTranslating && (
                <Loader2 className="inline-block w-3 h-3 ml-2 animate-spin text-ss-medio" aria-hidden="true" />
              )}
            </p>
            <p 
              className="text-base leading-[1.55] text-ss-tinta line-clamp-3"
              data-testid={`text-author-bio-${author.slug}`}
            >
              {truncateBio(displayBio)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NewsDetail() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: newsArticle, isLoading, error } = useQuery<News>({
    queryKey: [`/api/news/${slug}`],
    enabled: !!slug,
  });

  const { data: allNews } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const { data: relatedAuthors } = useQuery<TeamMember[]>({
    queryKey: ['/api/news', slug, 'authors'],
    enabled: !!slug,
  });

  const { translatedFields, isTranslating } = useTranslatedContent({
    contentType: 'news',
    entityId: newsArticle?.id?.toString() || '',
    fields: {
      title: newsArticle?.title,
      titleEs: newsArticle?.titleEs,
      excerpt: newsArticle?.excerpt,
      excerptEs: newsArticle?.excerptEs,
      content: newsArticle?.content,
      contentEs: newsArticle?.contentEs,
    },
    enabled: !!newsArticle,
  });

  const content: Record<string, {
    backToNews: string;
    share: string;
    relatedNews: string;
    errorMessage: string;
    loading: string;
    readMore: string;
    copyLink: string;
    linkCopied: string;
    shareVia: string;
    aboutTheAuthor: string;
    aboutTheAuthors: string;
    publishedOn: string;
    author: string;
    topics: string;
    category: string;
  }> = {
    en: {
      backToNews: "Back to News",
      share: "Share this article",
      relatedNews: "Related News",
      errorMessage: "Article not found",
      loading: "Loading...",
      readMore: "Read More",
      copyLink: "Copy Link",
      linkCopied: "Link copied to clipboard!",
      shareVia: "Share via",
      aboutTheAuthor: "About the Author",
      aboutTheAuthors: "About the Authors",
      publishedOn: "Published on",
      author: "Author",
      topics: "Topics",
      category: "Category",
    },
    es: {
      backToNews: "Volver a noticias",
      share: "Compartir este artículo",
      relatedNews: "Noticias relacionadas",
      errorMessage: "Artículo no encontrado",
      loading: "Cargando...",
      readMore: "Leer más",
      copyLink: "Copiar enlace",
      linkCopied: "¡Enlace copiado al portapapeles!",
      shareVia: "Compartir vía",
      aboutTheAuthor: "Acerca del autor",
      aboutTheAuthors: "Acerca de los autores",
      publishedOn: "Publicado el",
      author: "Autor",
      topics: "Temas",
      category: "Categoría",
    },
    de: {
      backToNews: "Zurück zu Nachrichten",
      share: "Artikel teilen",
      relatedNews: "Ähnliche Nachrichten",
      errorMessage: "Nachricht nicht gefunden",
      loading: "Wird geladen...",
      readMore: "Weiterlesen",
      copyLink: "Link kopieren",
      linkCopied: "Link in die Zwischenablage kopiert!",
      shareVia: "Teilen über",
      aboutTheAuthor: "Über den Autor",
      aboutTheAuthors: "Über die Autoren",
      publishedOn: "Veröffentlicht am",
      author: "Autor",
      topics: "Themen",
      category: "Kategorie",
    },
    zh: {
      backToNews: "返回新闻",
      share: "分享文章",
      relatedNews: "相关新闻",
      errorMessage: "未找到新闻",
      loading: "加载中...",
      readMore: "阅读更多",
      copyLink: "复制链接",
      linkCopied: "链接已复制到剪贴板！",
      shareVia: "分享至",
      aboutTheAuthor: "关于作者",
      aboutTheAuthors: "关于作者们",
      publishedOn: "发布日期",
      author: "作者",
      topics: "主题",
      category: "类别",
    },
    ko: {
      backToNews: "뉴스로 돌아가기",
      share: "기사 공유",
      relatedNews: "관련 뉴스",
      errorMessage: "뉴스를 찾을 수 없습니다",
      loading: "로딩 중...",
      readMore: "더 읽기",
      copyLink: "링크 복사",
      linkCopied: "링크가 클립보드에 복사되었습니다!",
      shareVia: "공유하기",
      aboutTheAuthor: "저자 소개",
      aboutTheAuthors: "저자들 소개",
      publishedOn: "게시일",
      author: "저자",
      topics: "주제",
      category: "카테고리",
    },
    ja: {
      backToNews: "ニュースに戻る",
      share: "記事を共有",
      relatedNews: "関連ニュース",
      errorMessage: "ニュースが見つかりません",
      loading: "読み込み中...",
      readMore: "続きを読む",
      copyLink: "リンクをコピー",
      linkCopied: "リンクがクリップボードにコピーされました！",
      shareVia: "共有する",
      aboutTheAuthor: "著者について",
      aboutTheAuthors: "著者たちについて",
      publishedOn: "公開日",
      author: "著者",
      topics: "トピック",
      category: "カテゴリー",
    },
    ar: {
      backToNews: "العودة إلى الأخبار",
      share: "مشاركة المقال",
      relatedNews: "أخبار ذات صلة",
      errorMessage: "الخبر غير موجود",
      loading: "جاري التحميل...",
      readMore: "اقرأ المزيد",
      copyLink: "نسخ الرابط",
      linkCopied: "تم نسخ الرابط!",
      shareVia: "مشاركة عبر",
      aboutTheAuthor: "عن الكاتب",
      aboutTheAuthors: "عن الكتاب",
      publishedOn: "نُشر في",
      author: "المؤلف",
      topics: "المواضيع",
      category: "الفئة",
    },
    ru: {
      backToNews: "Назад к новостям",
      share: "Поделиться статьёй",
      relatedNews: "Похожие новости",
      errorMessage: "Новость не найдена",
      loading: "Загрузка...",
      readMore: "Читать далее",
      copyLink: "Скопировать ссылку",
      linkCopied: "Ссылка скопирована в буфер обмена!",
      shareVia: "Поделиться через",
      aboutTheAuthor: "Об авторе",
      aboutTheAuthors: "Об авторах",
      publishedOn: "Опубликовано",
      author: "Автор",
      topics: "Темы",
      category: "Категория",
    },
    fr: {
      backToNews: "Retour aux actualités",
      share: "Partager l'article",
      relatedNews: "Actualités similaires",
      errorMessage: "Actualité non trouvée",
      loading: "Chargement...",
      readMore: "Lire la suite",
      copyLink: "Copier le lien",
      linkCopied: "Lien copié dans le presse-papiers!",
      shareVia: "Partager via",
      aboutTheAuthor: "À propos de l'auteur",
      aboutTheAuthors: "À propos des auteurs",
      publishedOn: "Publié le",
      author: "Auteur",
      topics: "Sujets",
      category: "Catégorie",
    },
    it: {
      backToNews: "Torna alle notizie",
      share: "Condividi articolo",
      relatedNews: "Notizie correlate",
      errorMessage: "Notizia non trovata",
      loading: "Caricamento...",
      readMore: "Leggi di più",
      copyLink: "Copia link",
      linkCopied: "Link copiato negli appunti!",
      shareVia: "Condividi tramite",
      aboutTheAuthor: "Sull'autore",
      aboutTheAuthors: "Sugli autori",
      publishedOn: "Pubblicato il",
      author: "Autore",
      topics: "Argomenti",
      category: "Categoria",
    },
  };

  const t = content[language] || content.en;

  const getDateLocale = () => {
    const localeMap: Record<string, typeof enUS> = {
      en: enUS,
      es: es,
      de: de,
      zh: zhCN,
      ko: ko,
      ja: ja,
      ar: arSA,
      ru: ru,
      fr: fr,
      it: it,
    };
    return localeMap[language] || enUS;
  };

  const getDateFormatPattern = () => {
    const formatMap: Record<string, string> = {
      en: "MMMM d, yyyy",
      es: "d 'de' MMMM, yyyy",
      de: "d. MMMM yyyy",
      zh: "yyyy'年'M'月'd'日'",
      ko: "yyyy'년' M'월' d'일'",
      ja: "yyyy'年'M'月'd'日'",
      ar: "d MMMM yyyy",
      ru: "d MMMM yyyy 'г.'",
      fr: "d MMMM yyyy",
      it: "d MMMM yyyy",
    };
    return formatMap[language] || "MMMM d, yyyy";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, getDateFormatPattern(), {
      locale: getDateLocale(),
    });
  };

  const handleShare = (platform: "linkedin" | "twitter" | "whatsapp" | "email") => {
    const url = window.location.href;
    const shareTitle = translatedFields.title || newsArticle?.title;
    const shareExcerpt = translatedFields.excerpt || newsArticle?.excerpt;
    
    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTitle || "")}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle || "")}&body=${encodeURIComponent(`${shareExcerpt || ""}\n\n${url}`)}`,
    };
    
    if (platform === "email") {
      window.location.href = shareUrls[platform];
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t.linkCopied,
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Al listado del Monitor (/news) con el router: respeta la base de GitHub Pages
  // (/santos-saucedo-page/). Antes iba a "/#news" de la portada anterior.
  const [, navigate] = useLocation();
  const goToNewsList = () => navigate("/news");

  const relatedNews = allNews?.filter((item) => item.id !== newsArticle?.id).slice(0, 3);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const truncateBio = (bio: string | null | undefined, maxLength: number = 150) => {
    if (!bio) return '';
    if (bio.length <= maxLength) return bio;
    return bio.slice(0, maxLength).trim() + '...';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-news-error">
        <Header />
        {/* Cabecera sticky en flujo: ya no hace falta compensar el header fijo */}
        <main id="main-content" className="pt-16 pb-20 lg:pt-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <h2 className="ss-h2 mb-6" data-testid="text-error-title">
              {t.errorMessage}
            </h2>
            <Button 
              variant="outline" 
              onClick={goToNewsList}
              data-testid="button-back-to-news"
            >
              {t.backToNews}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-news-loading">
        <Header />
        {/* Carga con el mismo encabezado de papel que la vista final: mismo margen superior
            y marcadores de vuelta, eyebrow, titular y fecha */}
        <section className="pt-36 pb-20 editorial-page-hero editorial-page-hero--paper" aria-busy="true">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 w-full">
            <Skeleton className="h-4 w-36 mb-6 bg-ss-rule" />
            <Skeleton className="h-3 w-40 mb-5 bg-ss-rule" />
            <Skeleton className="h-12 w-full mb-3 bg-ss-rule" />
            <Skeleton className="h-12 w-2/3 bg-ss-rule" />
            <Skeleton className="h-3 w-32 mt-6 bg-ss-rule" />
          </div>
        </section>
        <main id="main-content" className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-3/4 mb-8" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayTitle = translatedFields.title || newsArticle?.title;
  const displayContent = translatedFields.content || translatedFields.excerpt || newsArticle?.content || newsArticle?.excerpt;
  const heroImage = newsArticle?.imageUrl || "";

  const primaryAuthor = relatedAuthors && relatedAuthors.length > 0 ? relatedAuthors[0] : null;

  return (
    <div className="min-h-screen bg-background" data-testid="page-news-detail">
      <Header />
      
      {newsArticle && (
        <>
          <ArticleJsonLd
            headline={language === "es" ? newsArticle.titleEs : newsArticle.title}
            description={language === "es" ? newsArticle.excerptEs : newsArticle.excerpt}
            datePublished={newsArticle.date}
            dateModified={newsArticle.date}
            authorName={primaryAuthor?.name}
            authorUrl={primaryAuthor ? `https://www.santossaucedo.com/team/${primaryAuthor.slug}` : undefined}
            imageUrl={newsArticle.imageUrl}
            url={`https://www.santossaucedo.com/news/${newsArticle.slug}`}
            language={language}
          />
          <BreadcrumbJsonLd
            items={[
              { name: language === "es" ? "Inicio" : "Home", url: "https://www.santossaucedo.com" },
              { name: language === "es" ? "Noticias" : "News", url: "https://www.santossaucedo.com/#news" },
              { name: language === "es" ? newsArticle.titleEs : newsArticle.title, url: `https://www.santossaucedo.com/news/${newsArticle.slug}` }
            ]}
            language={language}
          />
        </>
      )}
      
      {/* Encabezado de papel ("memorándum impreso"): Hueso, titular Azul Marino, etiquetas en
          Gris Medio y § en Azul Marino (index.css, .editorial-page-hero--paper). La foto del
          artículo, si la hay, abre el cuerpo. */}
      <section className="pt-36 pb-20 editorial-page-hero editorial-page-hero--paper" data-testid="section-news-hero">
        {/* Columna del artículo (max-w-4xl, ≈800 px útiles): vuelta, titular y cuerpo sobre el mismo borde */}
        <div className="max-w-4xl mx-auto px-6 lg:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={goToNewsList}
              className="inline-flex items-center gap-2 mb-6 cursor-pointer"
              data-testid="link-back-to-news"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t.backToNews}
            </button>

            {/* Eyebrow del expediente, como los encabezados internos: "§ 04 —— Noticia" */}
            <Eyebrow
              num="04"
              tone="paper"
              label={language === 'es' ? 'Noticia' : language === 'de' ? 'Nachrichten' : language === 'fr' ? 'Actualité' : language === 'it' ? 'Notizie' : 'News'}
              className="mb-4"
              testId="eyebrow-news"
            />

            <h1
              className="ss-news-title"
              data-testid="text-news-title"
            >
              {displayTitle}
              {isTranslating && (
                <Loader2 className="inline-block w-5 h-5 ml-3 animate-spin text-ss-medio" aria-hidden="true" />
              )}
            </h1>

            {/* Fecha bajo el titular, como en prensa */}
            {newsArticle?.date && (
              <p className="ss-label ss-num mt-6 text-ss-medio">
                <time
                  // Instante completo, como datePublished del JSON-LD: no cambia con la zona del visitante
                  dateTime={new Date(newsArticle.date).toISOString()}
                  data-testid="text-news-date"
                >
                  {formatDate(newsArticle.date)}
                </time>
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <main id="main-content" className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <NewsHeroImage key={heroImage} src={heroImage} />

            <div
              className="mb-12 relative"
              data-testid="container-news-content"
            >
              {isTranslating && !displayContent && (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-4/5" />
                </div>
              )}
              {displayContent && (() => {
                const paragraphs = displayContent.split('\n');
                const firstIdx = paragraphs.findIndex((p) => p.trim().length > 0);
                if (firstIdx === -1) return null;
                const first = paragraphs[firstIdx];
                const rest = paragraphs.slice(firstIdx + 1);
                return (
                  <div className={isTranslating ? "opacity-70" : ""}>
                    <LeadParagraph
                      firstParagraph={first}
                      restParagraphs={rest}
                      testId="lead-news-content"
                    />
                  </div>
                );
              })()}
              {isTranslating && displayContent && (
                <div className="absolute top-0 right-0">
                  <Loader2 className="w-4 h-4 animate-spin text-ss-medio" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Compartir: botones de solo icono, funcionales, con nombre accesible */}
            <div
              className="pt-8 mb-16 border-t border-ss-rule"
              data-testid="section-share"
            >
              <div className="flex flex-wrap items-center gap-4">
                <span className="ss-label text-ss-medio">{t.share}</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-ss-marino"
                    onClick={() => handleShare("linkedin")}
                    data-testid="button-share-linkedin"
                    title="LinkedIn"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-ss-marino"
                    onClick={() => handleShare("twitter")}
                    data-testid="button-share-twitter"
                    title="Twitter/X"
                    aria-label="Twitter/X"
                  >
                    <Twitter className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-ss-marino"
                    onClick={() => handleShare("whatsapp")}
                    data-testid="button-share-whatsapp"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-ss-marino"
                    onClick={() => handleShare("email")}
                    data-testid="button-share-email"
                    title="Email"
                    aria-label="Email"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-ss-marino"
                    onClick={handleCopyLink}
                    data-testid="button-share-copy-link"
                    title={t.copyLink}
                    aria-label={t.copyLink}
                  >
                    <LinkIcon className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {relatedAuthors && relatedAuthors.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-16"
              data-testid="section-related-authors"
            >
              <h2 
                className="ss-h2-sm mb-6"
                data-testid="text-authors-title"
              >
                {relatedAuthors.length === 1 ? t.aboutTheAuthor : t.aboutTheAuthors}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {relatedAuthors.map((author) => (
                  <AuthorCard 
                    key={author.id}
                    author={author}
                    getInitials={getInitials}
                    truncateBio={truncateBio}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {relatedNews && relatedNews.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              data-testid="section-related-news"
            >
              <h2 
                className="ss-h2-sm mb-6"
                data-testid="text-related-news-title"
              >
                {t.relatedNews}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
                {relatedNews.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/news/${item.slug}`}
                    className="group block"
                  >
                    {/* Sin caja: imagen (o Hueso con §), fecha como etiqueta y titular en la romana */}
                    <article data-testid={`card-related-news-${item.id}`}>
                      <div className="aspect-[16/10] overflow-hidden">
                        <NewsCardImage
                          src={item.imageUrl || ""}
                          alt={language === "es" ? item.titleEs : item.title}
                          className="ss-photo--colour w-full h-full object-cover"
                        />
                      </div>
                      <p className="ss-label ss-num text-ss-medio mt-4 mb-2" data-testid={`text-related-news-date-${item.id}`}>
                        {formatDate(item.date)}
                      </p>
                      <h3 
                        className="ss-h3 text-[20px] line-clamp-3 group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1"
                        data-testid={`text-related-news-title-${item.id}`}
                      >
                        {language === "es" ? item.titleEs : item.title}
                      </h3>
                    </article>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
