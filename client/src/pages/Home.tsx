import defaults from "@shared/cms-defaults.json";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useEffect } from "react";
import Header26 from "@/components/home26/Header26";
import Telon from "@/v3/marca/Telon";
import { Extranjeras26, Monitor26 } from "@/components/home26/Sections26";
import { Band, FilosofiaBand, IndustriasBand, IntroBand } from "@/v3/home/Bands";
import { PracticasBaker, usePracticeItems } from "@/v3/home/Practicas";
import { SociosBand } from "@/v3/home/Socios";
import Footer26 from "@/components/home26/Footer26";
import JsonLdSchema from "@/components/JsonLdSchema";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { language, displayLanguage } = useLanguage();
  const layout = useCmsContent("layout",defaults.layout);
  const lang = displayLanguage === "es" ? "es" : "en";
  const practices = usePracticeItems(lang);
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
    <div className="ss26 hm-page min-h-screen" data-testid="page-home" {...shownAttrs}>
      {/* Título, descripción y datos estructurados en el idioma que la portada muestra (ES/EN) */}
      <SEOHead page="home" language={lang} />
      <JsonLdSchema language={lang} />

      {/* Transparente sobre el video del héroe hasta que se hace scroll */}
      <Header26 localized overlay={layout.home.hero} />

      {/* Inicio v3 (demo aprobada el 5-11-2026): tras el telón, bandas que alternan papel y azul.
          Cada banda v3 va en su envoltura .v3 (demo.css) y las piezas del sitio que se conservan
          (Empresas extranjeras, Monitor Laboral) quedan fuera de ella, con sus estilos. El panel
          decide qué se ve (layout.home) y en qué orden (layout.homeOrder): firma = la frase y las
          cifras; creemos = la filosofía; practicas = el bloque de Baker y, tras él, las industrias;
          socios = los cuatro socios. data-start/data-end: tono de cada banda (uniones en home.css). */}
      <main id="main-content">
        {layout.home.hero&&<Telon lang={lang} />}
        {layout.homeOrder.map(key=>{
          if(!layout.home[key as keyof typeof layout.home])return null;
          switch(key){
            case 'firma':return <Band key={key} name="intro" start="light"><IntroBand lang={lang} areas={practices.length||4}/></Band>;
            case 'creemos':return <Band key={key} name="filosofia" start="dark"><FilosofiaBand lang={lang}/></Band>;
            case 'practicas':return (
              <Band key={key} name="practicas" start="dark" end="light">
                <PracticasBaker lang={lang} items={practices}/>
                <IndustriasBand lang={lang}/>
              </Band>
            );
            case 'extranjeras':return <div key={key} className="hm-legacy" data-start="dark" data-end="dark"><Extranjeras26 lang={lang}/></div>;
            case 'socios':return <Band key={key} name="socios" start="light"><SociosBand lang={lang}/></Band>;
            case 'monitor':return <Monitor26 key={key} lang={lang} limit={layout.monitorLimit}/>;
            default:return null;
          }
        })}
      </main>

      <Footer26 localized />

    </div>
  );
}
