import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Linkedin, Twitter, Mail, LinkIcon, AlertCircle, MessageCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es, enUS, de, zhCN, ko, ja, arSA, ru, fr, it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLdSchema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { LeadParagraph } from "@/components/editorial";
import type { News, TeamMember } from "@shared/schema";

// Imagen del artículo con su velo tinta. Sin imagen, o si no carga, no se pinta nada:
// queda el degradado de la marca de la sección (sin foto genérica de reemplazo).
// alt vacío: el h1 ya dice el título.
function NewsHeroImage({ src }: { src: string }) {
  const [hasError, setHasError] = useState(false);
  if (!src || hasError) return null;
  return (
    <>
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
        onError={() => setHasError(true)}
        data-testid="img-news-hero"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ss-deep/90 via-ss-deep/50 to-ss-deep/20" />
    </>
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
      <div className={`bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ${className}`}>
        <span className="text-3xl font-heading font-bold text-primary/30 tracking-wider">
          S&S
        </span>
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
      className="block"
    >
      <Card
        className="group overflow-visible transition-all duration-300 hover-elevate"
        data-testid={`card-author-${author.slug}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-border" data-testid={`avatar-author-${author.slug}`}>
              <AvatarImage 
                src={author.imageUrl || undefined} 
                alt={author.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                {getInitials(author.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-medium text-foreground group-hover:text-primary transition-colors"
                data-testid={`text-author-name-${author.slug}`}
              >
                {author.name}
              </h3>
              <p 
                className="text-sm text-primary font-medium mb-2"
                data-testid={`text-author-title-${author.slug}`}
              >
                {displayTitle}
                {isTranslating && (
                  <Loader2 className="inline-block w-3 h-3 ml-2 animate-spin text-primary/60" />
                )}
              </p>
              <p 
                className="text-sm text-muted-foreground leading-relaxed line-clamp-3"
                data-testid={`text-author-bio-${author.slug}`}
              >
                {truncateBio(displayBio)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
      backToNews: "Volver a Noticias",
      share: "Compartir este artículo",
      relatedNews: "Noticias Relacionadas",
      errorMessage: "Artículo no encontrado",
      loading: "Cargando...",
      readMore: "Leer Más",
      copyLink: "Copiar Enlace",
      linkCopied: "¡Enlace copiado al portapapeles!",
      shareVia: "Compartir vía",
      aboutTheAuthor: "Acerca del Autor",
      aboutTheAuthors: "Acerca de los Autores",
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
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-heading text-foreground mb-4" data-testid="text-error-title">
              {t.errorMessage}
            </h2>
            <Button 
              variant="outline" 
              onClick={goToNewsList}
              data-testid="button-back-to-news"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
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
        {/* Carga con la misma banda de marca que la vista final sin foto (el caso habitual):
            degradado, mismo margen superior y marcadores de vuelta, eyebrow, titular y fecha */}
        <section className="relative" aria-busy="true">
          <div className="ss-gradient bg-ss-navy bg-[length:100%_max(100%,56vw)] bg-left-top bg-no-repeat flex w-full">
            <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-[clamp(40px,8vw,112px)] pb-[clamp(56px,7vw,96px)] w-full">
              <Skeleton className="h-4 w-36 mb-6 bg-white/10" />
              <Skeleton className="h-3 w-40 mb-5 bg-white/10" />
              <Skeleton className="h-12 w-full mb-3 bg-white/10" />
              <Skeleton className="h-12 w-2/3 bg-white/10" />
              <Skeleton className="h-3 w-32 mt-6 bg-white/10" />
            </div>
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
      
      {/* La imagen arranca bajo la cabecera sticky; antes pt-24 compensaba el header fijo */}
      <section className="relative" data-testid="section-news-hero">
        {/* Fondo de la marca: franja superior del degradado de la portada (como los encabezados internos) */}
        {/* Alto mínimo (50vh, 400px) en vez de fijo y texto en el flujo: con el titular en Bebas
            un título largo hace crecer la banda en lugar de quedar recortado por arriba */}
        {/* La banda alta con el titular abajo solo tiene sentido sobre una foto. Sin foto, el
            titular arranca arriba como en los demás encabezados y su posición ya no depende del
            alto de la ventana (a 768×900 quedaba a 248 px de la cabecera). */}
        <div className={`ss-gradient bg-ss-navy bg-[length:100%_max(100%,56vw)] bg-left-top bg-no-repeat relative flex w-full overflow-hidden ${heroImage ? "min-h-[max(50vh,400px)] items-end" : ""}`}>
          <NewsHeroImage key={heroImage} src={heroImage} />
          
          <div className="relative w-full">
            <div className={`max-w-4xl mx-auto px-6 lg:px-12 w-full ${heroImage ? "pt-12 pb-12" : "pt-[clamp(40px,8vw,112px)] pb-[clamp(56px,7vw,96px)]"}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <button
                  onClick={goToNewsList}
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6 cursor-pointer text-sm"
                  data-testid="link-back-to-news"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  {t.backToNews}
                </button>
                
                {/* Eyebrow del expediente, como los encabezados internos: "§ 04 —— NOTICIA" */}
                <div
                  className="flex items-center gap-4 mb-4"
                  data-testid="eyebrow-news"
                >
                  <span aria-hidden="true" className="ss-label ss-num text-ss-lime">§ 04</span>
                  <span aria-hidden="true" className="h-0.5 w-7 shrink-0 bg-ss-lime" />
                  <span className="ss-label text-white/70">
                    {language === 'es' ? 'Noticia' : language === 'de' ? 'Nachrichten' : language === 'fr' ? 'Actualité' : language === 'it' ? 'Notizie' : 'News'}
                  </span>
                </div>

                <h1
                  className="ss-display ss-news-title text-[clamp(40px,4.4vw,64px)] leading-[0.95] text-white"
                  data-testid="text-news-title"
                >
                  {displayTitle}
                  {isTranslating && (
                    <Loader2 className="inline-block w-5 h-5 ml-3 animate-spin text-white/60" />
                  )}
                </h1>

                {/* Fecha bajo el titular, como en prensa: el titular sube y queda cerca de la cabecera */}
                {newsArticle?.date && (
                  <p className="ss-label ss-num mt-6 text-white/70">
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
          </div>
        </div>
      </section>

      <main id="main-content" className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
                  <Loader2 className="w-4 h-4 animate-spin text-primary/60" />
                </div>
              )}
            </div>

            <div
              className="pt-8 mb-16"
              data-testid="section-share"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.share}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => handleShare("linkedin")}
                    data-testid="button-share-linkedin"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => handleShare("twitter")}
                    data-testid="button-share-twitter"
                    title="Twitter/X"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => handleShare("whatsapp")}
                    data-testid="button-share-whatsapp"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => handleShare("email")}
                    data-testid="button-share-email"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={handleCopyLink}
                    data-testid="button-share-copy-link"
                    title={t.copyLink}
                  >
                    <LinkIcon className="w-4 h-4" />
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
                className="text-xl font-heading font-light text-foreground mb-8 uppercase tracking-[0.12em]"
                data-testid="text-authors-title"
              >
                {relatedAuthors.length === 1 ? t.aboutTheAuthor : t.aboutTheAuthors}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="text-xl font-heading font-light text-foreground mb-8 uppercase tracking-[0.12em]"
                data-testid="text-related-news-title"
              >
                {t.relatedNews}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/news/${item.slug}`}
                    className="block"
                  >
                    <Card
                      className="group overflow-hidden transition-all duration-300 hover-elevate"
                      data-testid={`card-related-news-${item.id}`}
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <NewsCardImage
                          src={item.imageUrl || ""}
                          alt={language === "es" ? item.titleEs : item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" data-testid={`text-related-news-date-${item.id}`}>
                          {formatDate(item.date)}
                        </p>
                        <h3 
                          className="text-base font-serif text-foreground leading-relaxed line-clamp-2"
                          data-testid={`text-related-news-title-${item.id}`}
                        >
                          {language === "es" ? item.titleEs : item.title}
                        </h3>
                      </CardContent>
                    </Card>
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
