// Página no encontrada con el lenguaje de la demo v3 aprobada (5-11-2026), que no la tenía: sobre la piedra, el
// título y la entrada de una cabecera de la demo, los dos enlaces de siempre y, cerrando, la línea de cota con
// el «404» como una cifra del inicio. Textos de siempre (10 idiomas, panel: "not-found").
import { useCmsContent } from "@/hooks/useCmsContent";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { V3Main } from "@/v3/shared";
import { Flecha } from "@/v3/paginas-extra/piezas";

export default function NotFound() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Page not found",
      subtitle: "The page you are looking for does not exist or has been moved.",
      goHome: "Go to the home page",
      goBack: "Go back"
    },
    es: {
      title: "Página no encontrada",
      subtitle: "La página que busca no existe o ha sido movida.",
      goHome: "Ir al inicio",
      goBack: "Volver"
    },
    de: {
      title: "Seite nicht gefunden",
      subtitle: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
      goHome: "Zur Startseite",
      goBack: "Zurück"
    },
    zh: {
      title: "页面未找到",
      subtitle: "您访问的页面不存在或已被移动。",
      goHome: "返回首页",
      goBack: "返回"
    },
    ko: {
      title: "페이지를 찾을 수 없습니다",
      subtitle: "찾고 계신 페이지가 존재하지 않거나 이동되었습니다.",
      goHome: "홈으로 가기",
      goBack: "뒤로 가기"
    },
    ja: {
      title: "ページが見つかりません",
      subtitle: "お探しのページは存在しないか、移動されました。",
      goHome: "ホームに戻る",
      goBack: "戻る"
    },
    ar: {
      title: "الصفحة غير موجودة",
      subtitle: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
      goHome: "الذهاب إلى الرئيسية",
      goBack: "رجوع"
    },
    ru: {
      title: "Страница не найдена",
      subtitle: "Запрошенная страница не существует или была перемещена.",
      goHome: "На главную",
      goBack: "Назад"
    },
    fr: {
      title: "Page non trouvée",
      subtitle: "La page que vous recherchez n’existe pas ou a été déplacée.",
      goHome: "Aller à l’accueil",
      goBack: "Retour"
    },
    it: {
      title: "Pagina non trovata",
      subtitle: "La pagina che stai cercando non esiste o è stata spostata.",
      goHome: "Vai alla home",
      goBack: "Indietro"
    }
  };

  const editableContent = useCmsContent("not-found", content);
  const t = editableContent[language as keyof typeof content] || editableContent.en;
  const isRTL = language === "ar";

  return (
    <div className="ss26 min-h-[100dvh] flex flex-col" dir={isRTL ? "rtl" : "ltr"} data-testid="page-not-found">
      {/* Título de pestaña y descripción propios en el idioma de la página; noindex (SEOHead) */}
      <SEOHead page="notFound" language={language} />
      <Header />

      <V3Main vista="no-encontrada" className="px flex-1">
        <section className="px-404" aria-labelledby="px-404-h" data-testid="section-not-found-hero">
          <div className="sh-wrap px-404__in">
            <h1 id="px-404-h" className="sh-h1" data-testid="text-404-title">
              {t.title}
            </h1>
            <p className="sh-lead" data-testid="text-404-subtitle">{t.subtitle}</p>

            {/* Enlaces de texto, sin botones grandes: el inicio (con el marco de la demo) y volver */}
            <div className="px-404__enlaces">
              <Link href="/" className="sh-boton" data-testid="button-go-home">
                {t.goHome}
              </Link>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-404__volver"
                data-testid="button-go-back"
              >
                <Flecha c="←" />
                <span>{t.goBack}</span>
              </button>
            </div>

            {/* «Error 404» sobre la línea de cota, como las cifras de la firma */}
            <dl className="sh-cifras" dir="ltr">
              <div>
                <dt>Error</dt>
                <dd>404</dd>
              </div>
            </dl>
          </div>
        </section>
      </V3Main>

      <Footer />
    </div>
  );
}
