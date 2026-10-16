import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import { MonitorList } from "@/components/monitor/MonitorList";
import { keepFirmName } from "@/lib/firmName";

export default function ArticlesPage() {
  const { language } = useLanguage();
  // Subtítulo sin "insights" ni "nuestros expertos": la publicación, como en español. Sin
  // artículos, una constatación neutra (no "regrese pronto").
  const content = {
    en: {
      title: "Articles",
      subtitle: "Analysis and publications from the Santos & Saucedo Labor Monitor",
      comingSoonMessage: "There are no publications in this section yet.",
    },
    es: {
      title: "Artículos",
      subtitle: "Análisis y publicaciones del Monitor Laboral de Santos & Saucedo",
      comingSoonMessage: "Aún no hay publicaciones en esta sección.",
    },
    de: {
      title: "Artikel",
      subtitle: "Analysen und Veröffentlichungen von Santos & Saucedo",
      comingSoonMessage: "In diesem Bereich gibt es noch keine Veröffentlichungen.",
    },
    zh: {
      title: "文章",
      subtitle: "Santos & Saucedo 的分析与出版物",
      comingSoonMessage: "本栏目尚无文章。",
    },
    ko: {
      title: "기사",
      subtitle: "Santos & Saucedo의 분석과 간행물",
      comingSoonMessage: "이 섹션에는 아직 게시물이 없습니다.",
    },
    ja: {
      title: "記事",
      subtitle: "Santos & Saucedoによる分析と刊行物",
      comingSoonMessage: "このセクションにはまだ記事がありません。",
    },
    ar: {
      title: "المقالات",
      subtitle: "تحليلات ومنشورات Santos & Saucedo",
      comingSoonMessage: "لا توجد منشورات في هذا القسم بعد.",
    },
    ru: {
      title: "Статьи",
      subtitle: "Аналитика и публикации Santos & Saucedo",
      comingSoonMessage: "В этом разделе пока нет публикаций.",
    },
    fr: {
      title: "Articles",
      subtitle: "Analyses et publications de Santos & Saucedo",
      comingSoonMessage: "Cette section ne contient encore aucune publication.",
    },
    it: {
      title: "Articoli",
      subtitle: "Analisi e pubblicazioni di Santos & Saucedo",
      comingSoonMessage: "Non ci sono ancora pubblicazioni in questa sezione.",
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
  // Aviso solo si de verdad llegó una traducción automática (nunca en español ni en inglés)
  const [translatedFor, setTranslatedFor] = useState<string | null>(null);
  const handleTranslated = useCallback(() => setTranslatedFor(language), [language]);
  const translationBanner = translatedFor === language ? translationBannerMessages[language] ?? null : null;

  return (
    <div className="min-h-screen bg-background" data-testid="page-articles">
      <SEOHead page="articles" language={language} />
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1); el relleno
          del cuerpo va en su propio envoltorio. ss-container: borde de logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-articles-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="04" tone="navy" className="mb-6" />
              <h1
                className="mb-5"
                data-testid="text-articles-title"
              >
                {t.title}
              </h1>
              {/* "Santos & Saucedo" sin partirse entre líneas */}
              <p
                data-testid="text-articles-subtitle"
              >
                {keepFirmName(t.subtitle)}
              </p>
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

        <div className="py-16 lg:py-20">
          <div className="ss-container">
            <MonitorList
              search
              onTranslated={handleTranslated}
              testIds={{
                row: (item) => `card-article-${item.slug}`,
                date: (item) => `text-article-date-${item.slug}`,
                title: (item) => `text-article-title-${item.slug}`,
                excerpt: (item) => `text-article-excerpt-${item.slug}`,
                search: "input-search-articles",
                error: "container-articles-error",
                errorText: "text-articles-error",
                noResults: "container-articles-empty",
                skeleton: (i) => `skeleton-article-${i}`,
              }}
              // Sin publicaciones: solo la constatación neutra, sin el título "Próximamente"
              // (el testid del título pasa al envoltorio de la frase)
              empty={
                <div className="py-16 border-t border-ss-rule" data-testid="container-articles-coming-soon">
                  <div className="max-w-md" data-testid="text-coming-soon-title">
                    <p className="text-base text-ss-tinta" data-testid="text-coming-soon-message">
                      {t.comingSoonMessage}
                    </p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
