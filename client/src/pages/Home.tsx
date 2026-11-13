import { useCmsContent } from "@/hooks/useCmsContent";
import { layoutDefaults } from "@/lib/cmsLightDefaults";
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
  const layout = useCmsContent("layout", layoutDefaults);
  const lang = displayLanguage === "es" ? "es" : "en";
  const practices = usePracticeItems(lang);

  return (
    <div className="ss26 hm-page min-h-screen" data-testid="page-home">
      {/* SEO, JSON-LD y el árbol accesible siguen el idioma de la ruta /<lang>/. */}
      <SEOHead page="home" language={language} />
      <JsonLdSchema language={language} />

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
