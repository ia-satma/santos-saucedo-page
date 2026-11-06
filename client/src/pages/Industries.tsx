// Página «Industrias» (demo v3, aprobada el 5-11-2026): cabecera con Monterrey al atardecer, las cuatro
// industrias (foto fija en escritorio) y, al final, «Nuestros socios». El mapa de la red vive en Socios
// (/team#presencia) desde el 6-11-2026: el cliente lo vio repetido aquí.
// Textos en español e inglés (los demás idiomas ven el inglés con lang="en"): client/src/v3/industrias/texts.ts.
import Header26 from "@/components/home26/Header26";
import Footer26 from "@/components/home26/Footer26";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { V3Main, V3NextPage, V3PageHeader, useV3Lang } from "@/v3/shared";
import { Sectores } from "@/v3/industrias/Sectores";
import { INDUSTRIAS_TEXTS } from "@/v3/industrias/texts";
import { v3Asset } from "@/v3/asset";

const H1 = "cab-industrias-h";

export default function Industries() {
  const { language } = useLanguage();
  const { lang, attrs } = useV3Lang();
  const t = INDUSTRIAS_TEXTS[lang];

  return (
    <div className="ss26 min-h-screen" data-testid="page-industries">
      <SEOHead page="industries" language={language} />
      <Header26 localized />
      <V3Main vista="industrias">
        {/* Un solo bloque dentro de <main>: declara lang="en" a quien lee la página en otro idioma */}
        <div {...attrs}>
          <V3PageHeader
            id={H1}
            img={v3Asset("/v3/c-atardecer.webp")}
            alt={t.cab.alt}
            imgAttrs={attrs}
            width={1800}
            height={1350}
            position="50% 64%"
            title={t.cab.title}
            lead={t.cab.lead}
          >
            <p>{t.cab.text}</p>
          </V3PageHeader>
          <Sectores t={t} headingId={H1} />
          <V3NextPage href="/team" label={t.sigue.label} title={t.sigue.title} ariaLabel={t.sigue.aria} />
        </div>
      </V3Main>
      <Footer26 localized />
    </div>
  );
}
