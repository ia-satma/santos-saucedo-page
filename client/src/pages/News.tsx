import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { MonitorList } from "@/components/monitor/MonitorList";
import { chrome26 } from "@/components/home26/chrome26";

export default function NewsPage() {
  const { language } = useLanguage();
  // h1: el rótulo del menú en cada idioma (chrome26.ts), el mismo de la pestaña y del artículo
  // ("Monitor Laboral" en español, "Labor Monitor" en inglés). El subtítulo es una etiqueta: sin punto.
  const subtitles: Record<string, string> = {
    en: "News and analysis",
    es: "Noticias y análisis",
    de: "Neuigkeiten und Analysen",
    zh: "新闻与分析",
    ko: "뉴스와 분석",
    ja: "ニュースと分析",
    ar: "الأخبار والتحليلات",
    ru: "Новости и аналитика",
    fr: "Actualités et analyses",
    it: "Notizie e analisi",
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

  const title = (chrome26[language as keyof typeof chrome26] ?? chrome26.en).nav[3].label;
  const subtitle = subtitles[language] || subtitles.en;
  const isNonNativeLanguage = language !== 'es';
  const translationBanner = isNonNativeLanguage ? (translationBannerMessages[language] || (language === 'en' ? "Content is automatically translated from Spanish." : null)) : null;

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
                {title}
              </h1>
              <p
                data-testid="text-news-subtitle"
              >
                {subtitle}
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

        {/* Lista única del Monitor (filas de filete). Los filtros solo aparecen si al menos dos
            categorías tienen notas publicadas: no se ofrece una categoría vacía ("Rankings") */}
        <div className="py-16 lg:py-20">
          <div className="ss-container">
            <MonitorList
              filters
              search
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
