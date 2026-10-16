import { useCmsContent } from "@/hooks/useCmsContent";
import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { MonitorList, MonitorSubscribe } from "@/components/monitor/MonitorList";
import { chrome26 } from "@/components/home26/chrome26";
import { home26 } from "@/components/home26/content";

export default function NewsPage() {
  const { language } = useLanguage();
  // h1: el rótulo del menú en cada idioma (chrome26.ts), el mismo de la pestaña y del artículo
  // ("Monitor Laboral" en español, "Labor Monitor" en inglés). Subtítulo: la misma frase con que
  // la portada presenta el Monitor (home26.monitor.intro); en los demás idiomas, su traducción.
  const subtitles: Record<string, string> = {
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
  const title = (liveChrome[language as keyof typeof chrome26] ?? liveChrome.en).nav[3].label;
  const liveSubtitles = useCmsContent("news-intro", subtitles);
  const liveHome = useCmsContent("home", home26);
  const subtitle = language === "es" || language === "en" ? liveHome[language].monitor.intro : (liveSubtitles[language] || liveSubtitles.en);
  const translationBanner = translatedFor === language ? translationBannerMessages[language] ?? null : null;

  return (
    <div className="min-h-screen bg-background" data-testid="page-news">
      <SEOHead page="news" language={language} />
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1); el relleno
          del cuerpo va en su propio envoltorio. ss-container: borde de logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-news-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="04" tone="navy" className="mb-6" />
              <h1
                className="mb-5"
                data-testid="text-news-title"
              >
                {title}
              </h1>
              {subtitle && (
                <p data-testid="text-news-subtitle">
                  {subtitle}
                </p>
              )}
              {translationBanner && (
                <p
                  className="mt-4 text-sm"
                  data-testid="text-translation-banner"
                >
                  {translationBanner}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Lista única del Monitor (filas de filete). Los filtros solo aparecen si al menos dos
            categorías tienen notas publicadas: no se ofrece una categoría vacía ("Rankings") */}
        <div className="py-16 lg:py-20">
          <div className="ss-container">
            <MonitorList
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

            {/* Al pie del Monitor: la suscripción por correo (/newsletter), sin filete propio: el
                último filete de la lista es el único cierre */}
            <MonitorSubscribe rule={false} className="mt-8 lg:mt-10" testId="section-news-subscribe" linkTestId="link-news-subscribe" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
