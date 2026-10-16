import { useEffect } from "react";
import Header26 from "@/components/home26/Header26";
import Hero26 from "@/components/home26/Hero26";
import {
  Firma26,
  Creemos26,
  Practicas26,
  Extranjeras26,
  Monitor26,
  Socios26,
} from "@/components/home26/Sections26";
import Footer26 from "@/components/home26/Footer26";
import JsonLdSchema from "@/components/JsonLdSchema";
import CookieBanner from "@/components/CookieBanner";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { language, displayLanguage } = useLanguage();
  const lang = displayLanguage === "es" ? "es" : "en";
  // La portada en inglés para quien eligió otro idioma (ar, ja, de…): <html> lleva su idioma
  // (y rtl en árabe), así que la página declara el que de verdad muestra (WCAG 3.1.1).
  // El aviso de cookies, en el idioma del visitante, declara el suyo (CookieBanner).
  const showsOther = lang === "en" && language !== "en";
  const shownAttrs = showsOther ? ({ lang: "en", dir: "ltr" } as const) : {};

  // El documento también: mientras la portada se muestra en inglés, <html lang="en" dir="ltr">,
  // para que título y descripción (en inglés) se anuncien con la voz correcta. Al salir de la
  // portada (o al cambiar de idioma) vuelve lo que había puesto LanguageContext. Va en una
  // microtarea: el efecto de LanguageContext (padre) corre después que este en el mismo commit
  // y, si no, volvería a escribir el idioma del visitante.
  useEffect(() => {
    if (!showsOther) return;
    const html = document.documentElement;
    let saved: { lang: string | null; dir: string | null } | null = null;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      saved = { lang: html.getAttribute("lang"), dir: html.getAttribute("dir") };
      html.setAttribute("lang", "en");
      html.setAttribute("dir", "ltr");
    });
    return () => {
      cancelled = true;
      if (!saved) return;
      // Solo se restaura lo que sigue siendo nuestro: si otro ya lo cambió, se respeta
      if (html.getAttribute("lang") === "en") {
        if (saved.lang === null) html.removeAttribute("lang");
        else html.setAttribute("lang", saved.lang);
      }
      if (html.getAttribute("dir") === "ltr") {
        if (saved.dir === null) html.removeAttribute("dir");
        else html.setAttribute("dir", saved.dir);
      }
    };
  }, [showsOther, language]);

  return (
    <div className="ss26 min-h-screen" data-testid="page-home" {...shownAttrs}>
      {/* Título, descripción y datos estructurados en el idioma que la portada muestra (ES/EN) */}
      <SEOHead page="home" language={lang} />
      <JsonLdSchema language={lang} />

      {/* Transparente sobre el video del héroe hasta que se hace scroll */}
      <Header26 overlay />

      <main id="main-content">
        {/* Expediente §: cada sección es un § numerado */}
        <Hero26 lang={lang} />
        <Firma26 lang={lang} />
        <Creemos26 lang={lang} />
        <Practicas26 lang={lang} />
        <Extranjeras26 lang={lang} />
        <Socios26 lang={lang} />
        <Monitor26 lang={lang} />
      </main>

      <Footer26 />

      <CookieBanner language={language} />
    </div>
  );
}
