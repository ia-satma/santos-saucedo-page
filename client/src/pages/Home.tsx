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

  return (
    <div className="ss26 min-h-screen" data-testid="page-home">
      {/* Título, descripción y datos estructurados en el idioma que la portada muestra (ES/EN) */}
      <SEOHead page="home" language={lang} />
      <JsonLdSchema language={lang} />

      <Header26 />

      <main id="main-content">
        {/* Expediente §: cada sección es un § numerado */}
        <Hero26 lang={lang} />
        <Firma26 lang={lang} />
        <Creemos26 lang={lang} />
        <Practicas26 lang={lang} />
        <Extranjeras26 lang={lang} />
        <Monitor26 lang={lang} />
        <Socios26 lang={lang} />
      </main>

      <Footer26 />

      <CookieBanner language={language} />
    </div>
  );
}
