// Página «Industrias» (demo v3, aprobada el 5-11-2026): cabecera con Monterrey al atardecer, las cuatro
// industrias (foto fija en escritorio) y, al final, «Nuestros socios». El mapa de la red vive en Socios
// (/team#presencia) desde el 6-11-2026: el cliente lo vio repetido aquí.
// Todos los textos de la página se mantienen en el idioma seleccionado sin
// cambiar la estructura ni las dimensiones del módulo v3.
import Header26 from "@/components/home26/Header26";
import Footer26 from "@/components/home26/Footer26";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import defaults from "@shared/cms-defaults.json";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useQuery } from "@tanstack/react-query";
import type { IndustryGroup } from "@shared/schema";
import { V3Main, V3NextPage, V3PageHeader, useV3Lang } from "@/v3/shared";
import { Sectores } from "@/v3/industrias/Sectores";
import { INDUSTRIAS_TEXTS } from "@/v3/industrias/texts";
import type { IndustriasTexts } from "@/v3/industrias/texts";
import { v3Asset } from "@/v3/asset";

const H1 = "cab-industrias-h";

export default function Industries() {
  const { language } = useLanguage();
  const { lang, attrs } = useV3Lang();
  const selectedLang = language in INDUSTRIAS_TEXTS ? language : lang;
  const base = INDUSTRIAS_TEXTS[selectedLang];
  const industriesCms = useCmsContent("industries", defaults.industries as typeof defaults.industries);
  const { data: catalog = [] } = useQuery<IndustryGroup[]>({ queryKey: ["/api/industry-groups"] });
  const cmsText = industriesCms[language] ?? industriesCms.en;
  const editorial = (cmsText.v3 ?? base) as typeof base;
  const catalogBySlug = new Map(catalog.filter((group) => group.published !== false).map((group) => [group.slug, group]));
  const known = editorial.industrias
    .filter((item) => !catalog.length || catalogBySlug.has(item.id))
    .map((item) => {
      const group = catalogBySlug.get(item.id);
      return group ? { ...item, nombre: selectedLang === "es" ? group.nameEs : selectedLang === "en" ? group.name : item.nombre, linea: selectedLang === "es" ? group.descriptionEs : selectedLang === "en" ? group.description : item.linea, img: group.imageUrl || item.img } : item;
    });
  const extra = catalog.filter((group) => !editorial.industrias.some((item) => item.id === group.slug)).map((group) => ({
    id: group.slug,
    img: group.imageUrl || editorial.industrias[0]?.img || "",
    w: 2000,
    h: 1333,
    pos: "50% 50%",
    nombre: selectedLang === "es" ? group.nameEs : group.name,
    linea: selectedLang === "es" ? group.descriptionEs : group.description,
    lista: [selectedLang === "es" ? group.fullDescriptionEs || group.descriptionEs : group.fullDescription || group.description],
  }));
  const t = { ...editorial, cab: cmsText.hero ?? editorial.cab, sigue: cmsText.next ?? editorial.sigue, industrias: [...known, ...extra] } as unknown as IndustriasTexts;
  const localizedAttrs = { ...attrs, lang: selectedLang };

  return (
    <div className="ss26 min-h-screen" data-testid="page-industries">
      <SEOHead page="industries" language={language} />
      <Header26 localized />
      <V3Main vista="industrias">
        {/* Un solo bloque dentro de <main>: declara lang="en" a quien lee la página en otro idioma */}
        <div {...localizedAttrs}>
          <V3PageHeader
            id={H1}
            img={v3Asset("/v3/c-atardecer.webp")}
            alt={t.cab.alt}
            imgAttrs={localizedAttrs}
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
