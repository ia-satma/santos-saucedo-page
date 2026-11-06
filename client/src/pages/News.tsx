// Monitor Laboral (/news) con el diseño de la demo v3 (aprobada el 5-11-2026): cabecera con la biblioteca
// jurídica de la oficina, las notas en tarjetas con su foto (la más reciente, destacada), filtros, búsqueda
// y páginas como antes, la banda azul de la suscripción con la estancia del mapamundi y la página siguiente.
// Textos: los del sitio en 10 idiomas (menú, portada, panel «news-intro», «monitor-ui», «monitor-subscribe»).
import { useCmsContent } from "@/hooks/useCmsContent";
import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { chrome26 } from "@/components/home26/chrome26";
import { useCmsMedia } from "@/lib/cmsMedia";
import { V3Main, V3NextPage, V3PageHeader } from "@/v3/shared";
import { MonitorNotas, MonitorSuscripcion, etiquetaSiguiente } from "@/v3/paginas-sitio/Monitor";
import { useMonitorIntro } from "@/v3/paginas-sitio/textos";

export default function NewsPage() {
  const { language } = useLanguage();
  // h1: el rótulo del menú en cada idioma (chrome26.ts), el mismo de la pestaña y del artículo
  // ("Monitor Laboral" en español, "Labor Monitor" en inglés). Subtítulo: la misma frase con que
  // la portada presenta el Monitor (home26.monitor.intro); en los demás idiomas, su traducción
  // (panel «news-intro»; v3/paginas-sitio/textos.ts).
  const subtitle = useMonitorIntro(language);

  // Aviso solo si de verdad llegó una traducción automática (nunca en español ni en inglés)
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
  // Idioma en que llegó la traducción: al cambiar de idioma el aviso no se arrastra
  const [translatedFor, setTranslatedFor] = useState<string | null>(null);
  const handleTranslated = useCallback(() => setTranslatedFor(language), [language]);

  const liveChrome = useCmsContent("chrome", chrome26);
  const nav = (liveChrome[language as keyof typeof chrome26] ?? liveChrome.en).nav;
  const title = nav[3].label;
  const translationBanner = translatedFor === language ? translationBannerMessages[language] ?? null : null;

  // Fotos de la oficina (panel → Medios): la biblioteca jurídica en la cabecera y la estancia del
  // mapamundi en la banda de la suscripción (la que antes cerraba la página)
  const media = useCmsMedia();
  const { biblioteca, estancia } = media.photos;
  const bibliotecaInfo = media.officeGallery.find((g) => g.photo === "biblioteca");
  const bibliotecaAlt = (language === "es" ? bibliotecaInfo?.altEs : bibliotecaInfo?.alt) || "";
  const srcSet = (p: { url: string; smallUrl?: string }) => (p.smallUrl && p.smallUrl !== p.url ? `${p.smallUrl} 768w, ${p.url} 1536w` : undefined);
  const nextLabel = etiquetaSiguiente(language);

  return (
    <div className="ss26 min-h-screen" data-testid="page-news">
      <SEOHead page="news" language={language} />
      <Header />

      <V3Main vista="monitor">
        <div className="ps">
          <div data-testid="section-news-hero">
            <V3PageHeader
              id="cab-monitor-h"
              img={biblioteca.url}
              alt={bibliotecaAlt}
              width={1536}
              height={1024}
              position="50% 58%"
              title={<span data-testid="text-news-title">{title}</span>}
              lead={subtitle ? <span data-testid="text-news-subtitle">{subtitle}</span> : undefined}
            >
              {translationBanner ? <p data-testid="text-translation-banner">{translationBanner}</p> : null}
            </V3PageHeader>
          </div>

          {/* Lista del Monitor. Los filtros solo aparecen si al menos dos categorías tienen notas
              publicadas (no se ofrece una categoría vacía); la búsqueda, desde 12 notas */}
          <section className="ps-monitor" aria-labelledby="cab-monitor-h">
            <div className="sh-wrap">
              <MonitorNotas
                archive
                filters
                search
                onTranslated={handleTranslated}
                testIds={{
                  row: (item) => `card-news-${item.slug}`,
                  category: (item) => `badge-category-${item.slug}`,
                  date: (item) => `text-news-date-${item.slug}`,
                  title: (item) => `text-news-title-${item.slug}`,
                  excerpt: (item) => `text-news-excerpt-${item.slug}`,
                  filters: "container-category-filters",
                  filter: (value) => `button-filter-${value}`,
                  search: "input-search-news",
                  error: "container-news-error",
                  errorText: "text-news-error",
                  empty: "container-news-empty",
                  noResults: "container-news-empty",
                  skeleton: (i) => `skeleton-news-${i}`,
                }}
              />
            </div>
          </section>

          {/* Al pie del Monitor: la suscripción por correo (/newsletter) */}
          <MonitorSuscripcion
            foto={{ src: estancia.url, srcSet: srcSet(estancia) }}
            testId="section-news-subscribe"
            linkTestId="link-news-subscribe"
            fotoTestId="band-news-office"
          />

          <V3NextPage href="/contact" label={nextLabel} title={nav[5].label} ariaLabel={nextLabel} />
        </div>
      </V3Main>

      <Footer />
    </div>
  );
}
