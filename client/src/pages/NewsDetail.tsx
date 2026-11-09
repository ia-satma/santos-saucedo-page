// Nota del Monitor Laboral (/news/:slug) con el diseño de la demo v3 (aprobada el 5-11-2026): cabecera en
// la piedra con la vuelta al Monitor, el titular, la fecha y los autores y, al lado, la foto de la nota a
// color; el texto en su columna de lectura con compartir y el documento a la izquierda; los autores, «Más del
// Monitor Laboral», la banda de la suscripción y la página siguiente. SEO, JSON-LD (artículo y migas),
// traducción automática fuera de ES/EN y data-testid, como antes. Estilos: client/src/v3/paginas-sitio.
import { useContentEntity } from "@/features/admin/ContentPreview";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLdSchema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { LeadParagraph } from "@/components/editorial";
import { formatNewsDate } from "@/lib/newsDate";
import { chrome26 } from "@/components/home26/chrome26";
import { SectionMark } from "@/components/home26/primitives";
import { useCmsMedia } from "@/lib/cmsMedia";
import { copyToClipboard, emailShareHref, newsShareUrl, sourceLabel, whatsappShareHref } from "@/lib/shareNews";
import type { News, TeamMember } from "@shared/schema";
import { V3Main, V3NextPage } from "@/v3/shared";
import { MonitorNotas, MonitorSuscripcion, etiquetaSiguiente } from "@/v3/paginas-sitio/Monitor";
import { getHomeMonitorImage } from "@shared/monitorEditorial";

// Texto de origen en inglés mostrado en otro idioma (sin traducción, o en el sitio estático):
// lleva su propio idioma y dirección, para que :lang() (la romana, no la sans de CJK) y el
// algoritmo bidi (en árabe, el punto final al final) lo traten como inglés. El cuerpo largo del
// artículo va entero en LTR (EN_SOURCE). En los titulares el bloque solo lleva lang="en" y
// conserva la dirección de la página (en árabe, alineado a la derecha con la vuelta); el texto va
// aislado en <bdi lang="en" dir="ltr">, como en Team.tsx.
const EN_SOURCE = { lang: "en", dir: "ltr" } as const;

// Barra de lectura: filete lima de 2 px fijo arriba, sobre la cabecera azul del sitio, que crece con el
// avance de la página (scaleX). Sigue al desplazamiento del lector; no se mueve sola.
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-ss-lime rtl:origin-right"
      style={{ scaleX: scrollYProgress }}
      data-testid="news-reading-progress"
    />
  );
}

// Flecha de las filas de compartir
const Flecha = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 10h11M11 5.5l4.5 4.5-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Autor: retrato a color, nombre, cargo y el inicio de la biografía, con enlace a su ficha
function AuthorCard({
  author,
  getInitials,
  truncateBio,
}: {
  author: TeamMember;
  getInitials: (name: string) => string;
  truncateBio: (bio: string | null | undefined, maxLength?: number) => string;
}) {
  const { language } = useLanguage();
  const [photoFailed, setPhotoFailed] = useState(false);

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
    <Link href={`/team/${author.slug}`} className="ps-autor" data-testid={`card-author-${author.slug}`}>
      <span className="ps-autor__foto" data-testid={`avatar-author-${author.slug}`}>
        {author.imageUrl && !photoFailed ? (
          <img src={author.imageUrl} alt={author.name} loading="lazy" decoding="async" onError={() => setPhotoFailed(true)} />
        ) : (
          <span className="ps-autor__ini" aria-hidden="true">{getInitials(author.name)}</span>
        )}
      </span>
      <span className="ps-autor__txt">
        <h3 className="ps-autor__n" data-testid={`text-author-name-${author.slug}`}>{author.name}</h3>
        <span className="ps-k ps-autor__c" data-testid={`text-author-title-${author.slug}`}>
          {displayTitle}
          {isTranslating && <Loader2 className="ms-2 inline-block h-3 w-3 animate-spin" aria-hidden="true" />}
        </span>
        <span className="ps-autor__bio" data-testid={`text-author-bio-${author.slug}`}>{truncateBio(displayBio)}</span>
      </span>
    </Link>
  );
}

export default function NewsDetail() {
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();
  const { toast } = useToast();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: newsArticle, isLoading, error } = useContentEntity<News>("news",slug);
  // Foto de la nota que no cargó: la cabecera pasa a una sola columna (sin foto genérica de reemplazo)
  const [failedImage, setFailedImage] = useState<string | null>(null);
  // La estancia del mapamundi (panel → Medios), en la banda de la suscripción
  const media = useCmsMedia();

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
    /** Pie de una nota breve que comenta una noticia externa: "Fuente: El Economista" */
    source: string;
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
      source: "Source",
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
      source: "Fuente",
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
      source: "Quelle",
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
      source: "来源",
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
      source: "출처",
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
      source: "出典",
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
      source: "المصدر",
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
      source: "Источник",
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
      source: "Source",
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
      source: "Fonte",
      relatedNews: "Altre notizie",
      errorMessage: "Notizia non trovata",
      copyLink: "Copia link",
      linkCopied: "Link copiato.",
      aboutTheAuthor: "Sull’autore",
      aboutTheAuthors: "Sugli autori",
    },
  };

  const editableContent = useCmsContent("news-detail", content);
  const t = editableContent[language] || editableContent.en;
  // Nombre de la publicación: el rótulo del menú en cada idioma (h1 de /news, pestaña, vuelta)
  const newsLabel = (cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en).nav[3].label;

  // Formato único de fecha del Monitor (lib/newsDate): el mismo que el listado de /news
  const formatDate = (date: Date | string | null) => formatNewsDate(date, language);

  // Se comparte siempre el enlace público de la nota en el sitio de la firma (no el del medio
  // citado ni el de la vista previa); la tarjeta de WhatsApp sale de las etiquetas del servidor.
  const shareUrl = () => (newsArticle ? newsShareUrl(newsArticle.slug) : window.location.href);
  const shareTitle = () => translatedFields.title || newsArticle?.title || "";

  const handleShare = (platform: "whatsapp" | "email") => {
    const url = shareUrl();
    if (platform === "whatsapp") {
      window.open(whatsappShareHref(shareTitle(), url), "_blank", "noopener,noreferrer");
    } else {
      window.location.href = emailShareHref(shareTitle(), url, translatedFields.excerpt || newsArticle?.excerpt);
    }
  };

  const handleCopyLink = async () => {
    if (await copyToClipboard(shareUrl())) {
      toast({
        title: t.linkCopied,
        duration: 3000,
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const truncateBio = (bio: string | null | undefined, maxLength: number = 150) => {
    if (!bio) return '';
    if (bio.length <= maxLength) return bio;
    return bio.slice(0, maxLength).trim() + '…';
  };

  const nextLabel = etiquetaSiguiente(language);
  const estancia = media.photos.estancia;
  const estanciaSrcSet = estancia.smallUrl && estancia.smallUrl !== estancia.url ? `${estancia.smallUrl} 768w, ${estancia.url} 1536w` : undefined;

  // Nota inexistente (enlace viejo o mal escrito): la misma vista 404 que la ficha de socio
  // (not-found.tsx): SEOHead page="notFound" (título propio y noindex), "Error 404" y el mensaje como
  // h1. El enlace lleva al listado con el rótulo del menú (nav[3]).
  if (error) {
    return (
      <div className="ss26 min-h-screen flex flex-col" data-testid="page-news-error">
        <SEOHead page="notFound" language={language} />
        <Header />
        <V3Main vista="nota" className="flex-1">
          <div className="ps">
            <section className="sh-pp ps-error" data-testid="section-not-found-hero">
              <div className="sh-wrap ps-error__in">
                <p className="ps-k">Error 404</p>
                <h1 className="sh-h1" data-testid="text-error-title">{t.errorMessage}</h1>
                {/* Enlace del router (respeta la base de GitHub Pages), con el marco de la demo */}
                <Link href="/news" className="sh-boton" data-testid="button-back-to-news">{newsLabel}</Link>
              </div>
            </section>
          </div>
        </V3Main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="ss26 min-h-screen" data-testid="page-news-loading">
        <Header />
        {/* Carga con la forma de la vista final: vuelta, titular y fecha; luego el texto */}
        <V3Main vista="nota">
          <div className="ps">
            <section className="sh-pp ps-art__cab ps-carga" aria-busy="true">
              <div className="sh-wrap">
                <span className="ps-esq ps-esq--k" />
                <span className="ps-esq ps-esq--h" />
                <span className="ps-esq ps-esq--h ps-esq--h2" />
                <span className="ps-esq ps-esq--k" style={{ marginTop: 28 }} />
              </div>
            </section>
            <div className="ps-art__cuerpo">
              <div className="sh-wrap">
                <div className="ps-art__rejilla ps-carga">
                  <div className="ps-art__texto">
                    {[100, 100, 92, 100, 84, 100, 70].map((w, i) => <span key={i} className="ps-esq ps-esq--p" style={{ width: `${w}%` }} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </V3Main>
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
  // La misma foto que en la lista (las notas iniciales ya no llevan las ilustraciones hechas con IA)
  const heroImage = (newsArticle ? getHomeMonitorImage(newsArticle) : null) || "";
  const hasPhoto = !!heroImage && failedImage !== heroImage;

  const primaryAuthor = relatedAuthors && relatedAuthors.length > 0 ? relatedAuthors[0] : null;

  // Documento de la nota (PDF): el de su idioma si lo hay; el rótulo, en español o en inglés
  const documentHref = language === "es"
    ? newsArticle?.documentUrlEs || newsArticle?.documentUrl
    : newsArticle?.documentUrl || newsArticle?.documentUrlEs;
  const documentLabel = language === "es" ? "Consultar documento PDF" : "Read PDF document";

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
    <div className="ss26 min-h-screen" data-testid="page-news-detail">
      <Header />
      {newsArticle && <ReadingProgress />}

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
            imageUrl={heroImage || newsArticle.imageUrl}
            url={`https://www.santossaucedo.com/news/${newsArticle.slug}`}
            language={language}
          />
          <BreadcrumbJsonLd
            items={[
              { name: t.home, url: "https://www.santossaucedo.com" },
              // La publicación, con el nombre del menú, y su listado (/news)
              { name: newsLabel, url: "https://www.santossaucedo.com/news" },
              { name: language === "es" ? newsArticle.titleEs : newsArticle.title, url: `https://www.santossaucedo.com/news/${newsArticle.slug}` }
            ]}
            language={language}
          />
        </>
      )}

      <V3Main vista="nota">
        <div className="ps">
          {/* Cabecera en la piedra: la vuelta al Monitor, el titular y la fecha (con los autores, si la
              nota los tiene); a su lado, la foto de la nota a color. Sin foto, el titular solo. */}
          <header className="sh-pp ps-art__cab" aria-labelledby="art-h" data-testid="section-news-hero">
            <div className={`sh-wrap ps-art__cab-in${hasPhoto ? " ps-art__cab-in--foto" : ""}`}>
              <div className="ps-art__titulo">
                {/* Al listado del Monitor (/news) con el router: respeta la base de GitHub Pages */}
                <Link href="/news" className="ps-volver" data-testid="link-back-to-news">
                  <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
                  {newsLabel}
                </Link>
                <h1 id="art-h" className="ps-art__h" tabIndex={-1} data-testid="text-news-title" lang={titleIsSource ? "en" : undefined}>
                  {/* Titular de origen de inmediato; la traducción lo sustituye solo si llega */}
                  {titleIsSource ? <bdi lang="en" dir="ltr">{displayTitle}</bdi> : displayTitle}
                </h1>
                {/* Fecha bajo el titular, como en prensa; si la nota tiene autores capturados, sus
                    nombres (con enlace a su ficha) en la misma línea. Sin autor, ningún nombre. */}
                {(newsArticle?.date || primaryAuthor) && (
                  <p className="ps-art__meta">
                    {newsArticle?.date && (
                      <time
                        // Instante completo: no cambia con la zona del visitante
                        dateTime={new Date(newsArticle.date).toISOString()}
                        data-testid="text-news-date"
                      >
                        {formatDate(newsArticle.date)}
                      </time>
                    )}
                    {relatedAuthors?.map((author, i) => (
                      <span key={author.id} data-testid={`text-news-byline-${author.slug}`}>
                        {(i > 0 || newsArticle?.date) && <span aria-hidden="true">· </span>}
                        <Link href={`/team/${author.slug}`} className="inline-link">{author.name}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </div>
              {/* alt vacío: el h1 ya dice el título */}
              {hasPhoto && (
                <figure className="ps-art__foto">
                  <img
                    key={heroImage}
                    src={heroImage}
                    alt=""
                    width={1024}
                    height={1024}
                    loading="eager"
                    decoding="async"
                    onError={() => setFailedImage(heroImage)}
                    data-testid="img-news-hero"
                  />
                </figure>
              )}
            </div>
          </header>

          {/* El texto en su columna de lectura (~38rem) y, a su izquierda, el documento y compartir; en
              tableta y teléfono, debajo del texto */}
          <div className="ps-art__cuerpo">
            <div className="sh-wrap">
              <div className="ps-art__rejilla">
                <div className="ps-art__texto">
                  <div className="relative" data-testid="container-news-content">
                    {isTranslating && !displayContent && (
                      <div aria-hidden="true">
                        {[100, 100, 88, 100, 80].map((w, i) => <span key={i} className="ps-esq ps-esq--p" style={{ width: `${w}%` }} />)}
                      </div>
                    )}
                    {displayContent && (() => {
                      const paragraphs = displayContent.split('\n');
                      const firstIdx = paragraphs.findIndex((p) => p.trim().length > 0);
                      if (firstIdx === -1) return null;
                      const first = paragraphs[firstIdx];
                      const rest = paragraphs.slice(firstIdx + 1);
                      return (
                        <div className={isTranslating ? "ps-art__cargando" : ""} {...contentSource}>
                          <LeadParagraph
                            firstParagraph={first}
                            restParagraphs={rest}
                            testId="lead-news-content"
                          />
                          {/* Marca de fin: el § de la marca (archivo oficial) cierra el texto */}
                          <SectionMark className="ps-art__fin" />
                        </div>
                      );
                    })()}
                    {isTranslating && displayContent && (
                      <Loader2 className="ps-art__giro h-4 w-4 animate-spin" aria-hidden="true" />
                    )}
                  </div>

                  {/* Nota breve con fuente: el análisis es de la firma y la noticia comentada se cita
                      al pie ("Fuente: El Economista"), con enlace al medio en otra pestaña. */}
                  {newsArticle?.sourceUrl && (
                    <p className="ps-art__fuente" data-testid="text-news-source">
                      {t.source}:{" "}
                      <a href={newsArticle.sourceUrl} target="_blank" rel="noopener noreferrer" data-testid="link-news-source">
                        {sourceLabel(newsArticle.sourceName, newsArticle.sourceUrl)}
                      </a>
                    </p>
                  )}
                </div>

                <div className="ps-art__lado">
                  {documentHref && (
                    <div className="ps-doc">
                      <a
                        href={documentHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sh-boton"
                        lang={isOtherLanguage ? "en" : undefined}
                        data-testid="link-news-document"
                      >
                        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5.5 2.5h6l3.5 3.5v11.5h-9.5z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M11.5 2.5V6H15M7.5 10.5h5M7.5 13.5h5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                        {documentLabel}
                      </a>
                    </div>
                  )}
                  {/* Compartir: filas de texto (Copiar enlace · WhatsApp · Correo), sin contadores */}
                  <div className="ps-compartir" role="group" aria-labelledby="news-share-label" data-testid="section-share">
                    <p id="news-share-label" className="ps-k">{t.share}</p>
                    <ul className="ps-compartir__lista">
                      <li>
                        <button type="button" onClick={handleCopyLink} data-testid="button-share-copy-link">{t.copyLink}<Flecha /></button>
                      </li>
                      <li>
                        <button type="button" onClick={() => handleShare("whatsapp")} data-testid="button-share-whatsapp">WhatsApp<Flecha /></button>
                      </li>
                      <li>
                        <button type="button" onClick={() => handleShare("email")} data-testid="button-share-email">{t.shareEmail}<Flecha /></button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedAuthors && relatedAuthors.length > 0 && (
            <section className="ps-autores" aria-labelledby="art-autores-h" data-testid="section-related-authors">
              <div className="sh-wrap">
                <div className="ps-autores__in">
                  <h2 id="art-autores-h" className="sh-h2" data-testid="text-authors-title">
                    {relatedAuthors.length === 1 ? t.aboutTheAuthor : t.aboutTheAuthors}
                  </h2>
                  <ul className="ps-autores__lista">
                    {relatedAuthors.map((author) => (
                      <li key={author.id}>
                        <AuthorCard author={author} getInitials={getInitials} truncateBio={truncateBio} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Más del Monitor Laboral: las tres notas más recientes, con su foto */}
          {hasRelatedNews && (
            <section className="ps-rel" aria-labelledby="art-rel-h" data-testid="section-related-news">
              <div className="sh-wrap">
                <div className="ps-rel__cab">
                  <h2 id="art-rel-h" className="sh-h2" data-testid="text-related-news-title">{t.relatedNews}</h2>
                </div>
                <MonitorNotas
                  limit={3}
                  excludeId={newsArticle?.id}
                  headingLevel="h3"
                  testIds={{
                    row: (item) => `card-related-news-${item.id}`,
                    date: (item) => `text-related-news-date-${item.id}`,
                    title: (item) => `text-related-news-title-${item.id}`,
                  }}
                />
              </div>
            </section>
          )}

          {/* La suscripción al Monitor (/newsletter) */}
          <MonitorSuscripcion
            foto={{ src: estancia.url, srcSet: estanciaSrcSet }}
            testId="section-article-subscribe"
            linkTestId="link-article-subscribe"
          />

          {/* Página siguiente: el Monitor completo */}
          <V3NextPage href="/news" label={nextLabel} title={newsLabel} ariaLabel={nextLabel} />
        </div>
      </V3Main>

      <Footer />
    </div>
  );
}
