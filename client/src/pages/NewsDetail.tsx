import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLdSchema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow, LeadParagraph } from "@/components/editorial";
import { formatNewsDate } from "@/lib/newsDate";
import { MonitorList, MonitorSubscribe } from "@/components/monitor/MonitorList";
import { chrome26 } from "@/components/home26/chrome26";
import type { News, TeamMember } from "@shared/schema";

// Texto de origen en inglés mostrado en otro idioma (sin traducción, o en el sitio estático):
// lleva su propio idioma y dirección, para que :lang() (la romana, no la sans de CJK) y el
// algoritmo bidi (en árabe, el punto final al final) lo traten como inglés. El cuerpo largo del
// artículo va entero en LTR (EN_SOURCE). En los titulares el bloque solo lleva lang="en" y
// conserva la dirección de la página (en árabe, alineado a la derecha con el eyebrow y la
// vuelta); el texto va aislado en <bdi lang="en" dir="ltr">, como en Team.tsx.
const EN_SOURCE = { lang: "en", dir: "ltr" } as const;

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
  // "Más del Monitor Laboral" solo si hay otras notas publicadas
  const hasRelatedNews = !!allNews?.some((item) => item.id !== newsArticle?.id && item.published !== false);

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

  // Relacionados con el nombre de la publicación: "Monitor Laboral" en español, "Labor Monitor"
  // en inglés. La vuelta es el rótulo del menú (chrome26 nav[3]), como "← Socios" y
  // "← Prácticas". Inglés en minúscula inicial, como el español.
  const content: Record<string, {
    /** Primer paso de las migas (JSON-LD) */
    home: string;
    share: string;
    /** Compartir por correo (mailto) */
    shareEmail: string;
    relatedNews: string;
    errorMessage: string;
    copyLink: string;
    linkCopied: string;
    aboutTheAuthor: string;
    aboutTheAuthors: string;
  }> = {
    en: {
      home: "Home",
      share: "Share",
      shareEmail: "Email",
      relatedNews: "More from the Labor Monitor",
      errorMessage: "Article not found",
      copyLink: "Copy link",
      linkCopied: "Link copied.",
      aboutTheAuthor: "About the author",
      aboutTheAuthors: "About the authors",
    },
    es: {
      home: "Inicio",
      share: "Compartir",
      shareEmail: "Correo",
      relatedNews: "Más del Monitor Laboral",
      errorMessage: "Artículo no encontrado",
      copyLink: "Copiar enlace",
      linkCopied: "Enlace copiado.",
      aboutTheAuthor: "Acerca del autor",
      aboutTheAuthors: "Acerca de los autores",
    },
    de: {
      home: "Startseite",
      share: "Teilen",
      shareEmail: "E-Mail",
      relatedNews: "Weitere Nachrichten",
      errorMessage: "Nachricht nicht gefunden",
      copyLink: "Link kopieren",
      linkCopied: "Link kopiert.",
      aboutTheAuthor: "Über den Autor",
      aboutTheAuthors: "Über die Autoren",
    },
    zh: {
      home: "首页",
      share: "分享",
      shareEmail: "邮件",
      relatedNews: "更多新闻",
      errorMessage: "未找到新闻",
      copyLink: "复制链接",
      linkCopied: "链接已复制。",
      aboutTheAuthor: "关于作者",
      aboutTheAuthors: "关于作者们",
    },
    ko: {
      home: "홈",
      share: "공유",
      shareEmail: "이메일",
      relatedNews: "뉴스 더 보기",
      errorMessage: "뉴스를 찾을 수 없습니다",
      copyLink: "링크 복사",
      linkCopied: "링크가 복사되었습니다.",
      aboutTheAuthor: "저자 소개",
      aboutTheAuthors: "저자들 소개",
    },
    ja: {
      home: "ホーム",
      share: "共有",
      shareEmail: "メール",
      relatedNews: "その他のニュース",
      errorMessage: "ニュースが見つかりません",
      copyLink: "リンクをコピー",
      linkCopied: "リンクをコピーしました。",
      aboutTheAuthor: "著者について",
      aboutTheAuthors: "著者たちについて",
    },
    ar: {
      home: "الرئيسية",
      share: "مشاركة",
      shareEmail: "البريد الإلكتروني",
      relatedNews: "المزيد من الأخبار",
      errorMessage: "الخبر غير موجود",
      copyLink: "نسخ الرابط",
      linkCopied: "تم نسخ الرابط.",
      aboutTheAuthor: "عن الكاتب",
      aboutTheAuthors: "عن الكتاب",
    },
    ru: {
      home: "Главная",
      share: "Поделиться",
      shareEmail: "Эл. почта",
      relatedNews: "Другие новости",
      errorMessage: "Новость не найдена",
      copyLink: "Скопировать ссылку",
      linkCopied: "Ссылка скопирована.",
      aboutTheAuthor: "Об авторе",
      aboutTheAuthors: "Об авторах",
    },
    fr: {
      home: "Accueil",
      share: "Partager",
      shareEmail: "E-mail",
      relatedNews: "Autres actualités",
      errorMessage: "Actualité non trouvée",
      copyLink: "Copier le lien",
      linkCopied: "Lien copié.",
      aboutTheAuthor: "À propos de l’auteur",
      aboutTheAuthors: "À propos des auteurs",
    },
    it: {
      home: "Home",
      share: "Condividi",
      shareEmail: "E-mail",
      relatedNews: "Altre notizie",
      errorMessage: "Notizia non trovata",
      copyLink: "Copia link",
      linkCopied: "Link copiato.",
      aboutTheAuthor: "Sull'autore",
      aboutTheAuthors: "Sugli autori",
    },
  };

  const t = content[language] || content.en;
  // Nombre de la publicación: el rótulo del menú en cada idioma (h1 de /news, pestaña, vuelta)
  const newsLabel = (chrome26[language as keyof typeof chrome26] ?? chrome26.en).nav[3].label;

  // Formato único de fecha del Monitor (lib/newsDate): el mismo que el listado de /news
  const formatDate = (date: Date | string | null) => formatNewsDate(date, language);

  const handleShare = (platform: "linkedin" | "email") => {
    const url = window.location.href;
    const shareTitle = translatedFields.title || newsArticle?.title;
    const shareExcerpt = translatedFields.excerpt || newsArticle?.excerpt;
    
    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
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
          <div className="max-w-4xl mx-auto px-[var(--ss-pad)] lg:px-12">
            <h2 className="ss-h2 mb-6" data-testid="text-error-title">
              {t.errorMessage}
            </h2>
            {/* Navegación: enlace del router (respeta la base de GitHub Pages), no botón */}
            <Link
              href="/news"
              className="ss-label inline-flex items-center gap-2 text-ss-marino hover:underline decoration-1 underline-offset-4"
              data-testid="button-back-to-news"
            >
              <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" />
              {newsLabel}
            </Link>
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
        <main id="main-content">
          <section className="pt-36 pb-20 editorial-page-hero editorial-page-hero--paper" aria-busy="true">
            <div className="max-w-4xl mx-auto px-[var(--ss-pad)] lg:px-12 w-full">
              <Skeleton className="h-4 w-36 mb-6 bg-ss-rule" />
              <Skeleton className="h-3 w-40 mb-5 bg-ss-rule" />
              <Skeleton className="h-12 w-full mb-3 bg-ss-rule" />
              <Skeleton className="h-12 w-2/3 bg-ss-rule" />
              <Skeleton className="h-3 w-32 mt-6 bg-ss-rule" />
            </div>
          </section>
          <div className="py-16 lg:py-20">
            <div className="max-w-4xl mx-auto px-[var(--ss-pad)] lg:px-12">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-3/4 mb-8" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-5/6 mb-4" />
              <Skeleton className="h-6 w-full mb-4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayTitle = translatedFields.title || newsArticle?.title;
  const displayContent = translatedFields.content || translatedFields.excerpt || newsArticle?.content || newsArticle?.excerpt;
  // Fuera de ES/EN, sin traducción se muestra el inglés de origen (y los relacionados siempre)
  const isOtherLanguage = language !== "es" && language !== "en";
  const titleIsSource = isOtherLanguage && !!displayTitle && displayTitle === newsArticle?.title;
  const contentSource = isOtherLanguage && !!displayContent &&
    (displayContent === newsArticle?.content || displayContent === newsArticle?.excerpt) ? EN_SOURCE : undefined;
  const heroImage = newsArticle?.imageUrl || "";

  const primaryAuthor = relatedAuthors && relatedAuthors.length > 0 ? relatedAuthors[0] : null;

  // Pestaña y descripción en el idioma de la página: el titular que muestra el h1 y la
  // entradilla traducida; sin traducción (fuera de ES/EN), la descripción general del Monitor
  // en ese idioma (SEOHead) en lugar del inglés de origen.
  const seoExcerpt = language === "es"
    ? newsArticle?.excerptEs || newsArticle?.excerpt
    : language === "en"
      ? newsArticle?.excerpt
      : translatedFields.excerpt && translatedFields.excerpt !== newsArticle?.excerpt
        ? translatedFields.excerpt
        : undefined;

  return (
    <div className="min-h-screen bg-background" data-testid="page-news-detail">
      <Header />
      
      {newsArticle && (
        <>
          <SEOHead
            page="news"
            language={language}
            customTitle={displayTitle ? `${displayTitle} | ${newsLabel}` : undefined}
            customDescription={seoExcerpt || undefined}
            customPath={`/news/${newsArticle.slug}`}
          />
          <ArticleJsonLd
            headline={language === "es" ? newsArticle.titleEs : newsArticle.title}
            description={language === "es" ? newsArticle.excerptEs : newsArticle.excerpt}
            // Sin datePublished: las fechas de las notas son las de la carga inicial (E9)
            authorName={primaryAuthor?.name}
            authorUrl={primaryAuthor ? `https://www.santossaucedo.com/team/${primaryAuthor.slug}` : undefined}
            imageUrl={newsArticle.imageUrl}
            url={`https://www.santossaucedo.com/news/${newsArticle.slug}`}
            language={language}
          />
          <BreadcrumbJsonLd
            items={[
              { name: t.home, url: "https://www.santossaucedo.com" },
              // La publicación, con el nombre del eyebrow y del menú, y su listado (/news)
              { name: newsLabel, url: "https://www.santossaucedo.com/news" },
              { name: language === "es" ? newsArticle.titleEs : newsArticle.title, url: `https://www.santossaucedo.com/news/${newsArticle.slug}` }
            ]}
            language={language}
          />
        </>
      )}
      
      {/* Encabezado de papel ("memorándum impreso"): Hueso, titular Azul Marino, etiquetas en
          Gris Medio y § en Azul Marino (index.css, .editorial-page-hero--paper). La foto del
          artículo, si la hay, abre el cuerpo. Va dentro de <main> (el salto al contenido no se
          salta el h1); el relleno del cuerpo va en su propio envoltorio. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero editorial-page-hero--paper" data-testid="section-news-hero">
          {/* Columna del artículo (max-w-4xl, ≈800 px útiles): vuelta, titular y cuerpo sobre el mismo borde.
              Hasta lg, el margen lateral es el de ss-container (--ss-pad): en teléfono el texto
              empieza bajo el logotipo (x = 20 a 390 px); desde lg la columna va centrada. */}
          <div className="max-w-4xl mx-auto px-[var(--ss-pad)] lg:px-12 w-full">
            <div>
              {/* Al listado del Monitor (/news) con el router: respeta la base de GitHub Pages.
                  Texto: el rótulo del menú, como la vuelta de socios y prácticas */}
              <Link
                href="/news"
                className="inline-flex items-center gap-2 mb-6"
                data-testid="link-back-to-news"
              >
                <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" />
                {newsLabel}
              </Link>

              {/* Eyebrow del expediente solo con el número, como en la ficha de práctica: la
                  vuelta ya nombra la publicación */}
              <Eyebrow
                num="04"
                tone="paper"
                className="mb-4"
                testId="eyebrow-news"
              />

              <h1
                className="ss-news-title"
                data-testid="text-news-title"
                lang={titleIsSource ? "en" : undefined}
              >
                {/* Titular de origen de inmediato; la traducción lo sustituye solo si llega */}
                {titleIsSource ? <bdi lang="en" dir="ltr">{displayTitle}</bdi> : displayTitle}
              </h1>

              {/* Fecha bajo el titular, como en prensa */}
              {newsArticle?.date && (
                <p className="ss-label ss-num mt-6 text-ss-medio">
                  <time
                    // Instante completo: no cambia con la zona del visitante
                    dateTime={new Date(newsArticle.date).toISOString()}
                    data-testid="text-news-date"
                  >
                    {formatDate(newsArticle.date)}
                  </time>
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-[var(--ss-pad)] lg:px-12">
            <div>
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
                    <div className={isTranslating ? "opacity-70" : ""} {...contentSource}>
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

              {/* Compartir y suscribirse en una sola fila bajo un solo filete. Desde md, compartir a
                  un lado y la suscripción al otro; en teléfono, apilados sin otro filete. En el
                  sitio estático MonitorSubscribe no se pinta y queda solo compartir. */}
              <div className="mb-16 border-t border-ss-rule pt-8 md:flex md:flex-wrap md:items-center md:justify-between md:gap-x-10 md:gap-y-2">
                {/* Compartir: fila de etiqueta con botones de texto (LinkedIn · Correo · Copiar
                    enlace), sin bordes ni iconos; 44 px de alto útil por el relleno. Cada "·" va
                    unido al botón que sigue (whitespace-nowrap): ninguno queda al final de una
                    línea. Bajo sm, "Compartir" en su propia línea. */}
                <div data-testid="section-share">
                  <div
                    role="group"
                    aria-labelledby="news-share-label"
                    className="ss-label flex flex-wrap items-center gap-x-2"
                  >
                    <span id="news-share-label" className="basis-full text-ss-medio sm:basis-auto sm:me-2">{t.share}</span>
                    <button
                      type="button"
                      className="ss-label inline-flex min-h-[44px] items-center text-ss-marino underline-offset-[6px] decoration-1 hover:underline"
                      onClick={() => handleShare("linkedin")}
                      data-testid="button-share-linkedin"
                    >
                      LinkedIn
                    </button>
                    <span className="inline-flex items-center gap-x-2 whitespace-nowrap">
                      <span aria-hidden="true" className="text-ss-medio">·</span>
                      <button
                        type="button"
                        className="ss-label inline-flex min-h-[44px] items-center text-ss-marino underline-offset-[6px] decoration-1 hover:underline"
                        onClick={() => handleShare("email")}
                        data-testid="button-share-email"
                      >
                        {t.shareEmail}
                      </button>
                    </span>
                    <span className="inline-flex items-center gap-x-2 whitespace-nowrap">
                      <span aria-hidden="true" className="text-ss-medio">·</span>
                      <button
                        type="button"
                        className="ss-label inline-flex min-h-[44px] items-center text-ss-marino underline-offset-[6px] decoration-1 hover:underline"
                        onClick={handleCopyLink}
                        data-testid="button-share-copy-link"
                      >
                        {t.copyLink}
                      </button>
                    </span>
                  </div>
                </div>

                {/* La suscripción al Monitor (/newsletter), sin filete propio */}
                <MonitorSubscribe
                  rule={false}
                  className="mt-4 md:mt-0"
                  testId="section-article-subscribe"
                  linkTestId="link-article-subscribe"
                />
              </div>
            </div>

            {relatedAuthors && relatedAuthors.length > 0 && (
              <section
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
              </section>
            )}

            {hasRelatedNews && (
              <section
                data-testid="section-related-news"
              >
                <h2 
                  className="ss-h2-sm mb-6"
                  data-testid="text-related-news-title"
                >
                  {t.relatedNews}
                </h2>
                <MonitorList
                  limit={3}
                  excludeId={newsArticle?.id}
                  headingLevel="h3"
                  layout="stacked"
                  testIds={{
                    row: (item) => `card-related-news-${item.id}`,
                    date: (item) => `text-related-news-date-${item.id}`,
                    title: (item) => `text-related-news-title-${item.id}`,
                  }}
                />
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
