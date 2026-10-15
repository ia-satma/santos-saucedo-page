import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Page Not Found",
      subtitle: "The page you are looking for does not exist or has been moved",
      goHome: "Go to Home",
      goBack: "Go Back"
    },
    es: {
      title: "Página no encontrada",
      subtitle: "La página que busca no existe o ha sido movida",
      goHome: "Ir al inicio",
      goBack: "Volver"
    },
    de: {
      title: "Seite nicht gefunden",
      subtitle: "Die gesuchte Seite existiert nicht oder wurde verschoben",
      goHome: "Zur Startseite",
      goBack: "Zurück"
    },
    zh: {
      title: "页面未找到",
      subtitle: "您访问的页面不存在或已被移动",
      goHome: "返回首页",
      goBack: "返回"
    },
    ko: {
      title: "페이지를 찾을 수 없습니다",
      subtitle: "찾고 계신 페이지가 존재하지 않거나 이동되었습니다",
      goHome: "홈으로 가기",
      goBack: "뒤로 가기"
    },
    ja: {
      title: "ページが見つかりません",
      subtitle: "お探しのページは存在しないか、移動されました",
      goHome: "ホームに戻る",
      goBack: "戻る"
    },
    ar: {
      title: "الصفحة غير موجودة",
      subtitle: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها",
      goHome: "الذهاب إلى الرئيسية",
      goBack: "رجوع"
    },
    ru: {
      title: "Страница не найдена",
      subtitle: "Запрошенная страница не существует или была перемещена",
      goHome: "На главную",
      goBack: "Назад"
    },
    fr: {
      title: "Page non trouvée",
      subtitle: "La page que vous recherchez n'existe pas ou a été déplacée",
      goHome: "Aller à l'accueil",
      goBack: "Retour"
    },
    it: {
      title: "Pagina non trovata",
      subtitle: "La pagina che stai cercando non esiste o è stata spostata",
      goHome: "Vai alla home",
      goBack: "Indietro"
    }
  };

  const t = content[language as keyof typeof content] || content.en;
  const isRTL = language === "ar";

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? "rtl" : "ltr"} data-testid="page-not-found">
      <Header />

      {/* Mismo encabezado de marca que las páginas internas (Azul Profundo, eyebrow §, titular en romana),
          con enlaces de texto en vez de botones */}
      <main id="main-content" className="flex-1 pt-36 pb-20 editorial-page-hero" data-testid="section-not-found-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="flex items-center gap-4 mb-6">
            <span className="h-0.5 w-12 bg-brand" aria-hidden="true" />
            <span className="ss-label text-white/75">Error 404</span>
          </p>

          <h1 className="mb-5" data-testid="text-404-title">
            {t.title}
          </h1>

          <p data-testid="text-404-subtitle">{t.subtitle}</p>

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-2">
            <Link
              href="/"
              className="ss-label group inline-flex min-h-[44px] items-center gap-3 text-white"
              data-testid="button-go-home"
            >
              <span className="ss-link">{t.goHome}</span>
              {/* Siempre "→": en árabe la espeja .ss-arrow:dir(rtl) (ss26.css), como en Carreras */}
              <span aria-hidden="true" className="ss-arrow">
                →
              </span>
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="ss-label group inline-flex min-h-[44px] items-center gap-3 text-white/75 transition-colors hover:text-white"
              data-testid="button-go-back"
            >
              <span aria-hidden="true">
                {isRTL ? "→" : "←"}
              </span>
              <span className="ss-link group-hover:[background-size:100%_1px] group-focus-visible:[background-size:100%_1px]">
                {t.goBack}
              </span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
