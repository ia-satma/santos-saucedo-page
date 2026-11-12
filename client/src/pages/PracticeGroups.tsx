import { useCmsContent } from "@/hooks/useCmsContent";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { useCmsMedia } from "@/lib/cmsMedia";
import { chrome26 } from "@/components/home26/chrome26";
import { practiceName, usePracticeNames } from "@/lib/practiceNames";
import { V3Main, useV3Lang } from "@/v3/shared";
import { PAGINA } from "@/v3/practicas/textos";
import { SiguientePractica } from "@/v3/practicas/Siguiente";
import { PracticasBaker, usePracticeItems, type PracticeItem } from "@/v3/home/Practicas";
import { LaminaReaccion } from "@/v3/firma/Firma";
import { TEXTOS as FIRMA_TEXTOS } from "@/v3/firma/textos";
import type { PracticeGroup } from "@shared/schema";
import "./PracticeGroups.css";

// Prácticas (/practice-groups): el bloque de prácticas del Inicio (el efecto «Trending Content» de Baker
// McKenzie, el que le gustó a Mario) como cabecera de la página, con el h1 y la entrada de la página; en
// teléfono y con toque cada cuadro muestra también su descripción. Debajo, la lámina 2/7 (la turbina que
// se vuelve avión: la capacidad de reacción, la ventaja de la firma), que antes iba en «Nuestra firma».
// Nombre, resumen y entrada siguen viniendo de la base y del panel, en los 10 idiomas.

type Traduccion = { name?: string; description?: string };

/** Fuera de ES/EN: la traducción guardada de cada práctica (no dibuja nada; avisa al listado). */
function TraduccionPractica({ group, onChange }: { group: PracticeGroup; onChange: (slug: string, t: Traduccion) => void }) {
  const { language } = useLanguage();
  const { translatedFields } = useTranslatedContent({
    contentType: "practice_group",
    entityId: String(group.id),
    fields: { name: group.name, nameEs: group.nameEs, description: group.description, descriptionEs: group.descriptionEs },
    enabled: !isNativeLanguage(language),
  });
  const { name, description } = translatedFields;
  useEffect(() => { onChange(group.slug, { name: name ?? undefined, description: description ?? undefined }); }, [group.slug, name, description, onChange]);
  return null;
}

const emptyMessages: Record<string, string> = {
  en: "There are no practice areas available at this time.",
  es: "No hay áreas de práctica disponibles en este momento.",
  de: "Derzeit sind keine Praxisbereiche verfügbar.",
  zh: "目前暂无可用的业务领域信息。",
  ko: "현재 제공되는 업무 분야 정보가 없습니다.",
  ja: "現在、取扱分野の情報はありません。",
  ar: "لا توجد مجالات ممارسة متاحة حاليًا.",
  ru: "В настоящее время информация о практиках недоступна.",
  fr: "Aucun domaine de pratique n’est disponible pour le moment.",
  it: "Al momento non sono disponibili aree di pratica.",
};

// Approved introductory copy, retained verbatim and editable through its existing CMS keys.
const content: Record<string, { subtitle: string; errorMessage: string }> = {
  en: {
    subtitle: "Around its labor practice, the firm has developed three complementary practices: corporate and contractual, immigration, and litigation and workplace criminal matters.",
    errorMessage: "Failed to load practice areas",
  },
  es: {
    subtitle: "Alrededor de su práctica laboral, la firma desarrolló tres prácticas complementarias: corporativa y contractual, migratoria, y de litigio y penal laboral.",
    errorMessage: "Error al cargar las áreas de práctica",
  },
  de: {
    subtitle: "Rund um ihre arbeitsrechtliche Praxis hat die Kanzlei drei ergänzende Praxisbereiche aufgebaut: Gesellschafts- und Vertragsrecht, Migrationsrecht sowie Prozessführung und Arbeitsstrafrecht.",
    errorMessage: "Fehler beim Laden der Praxisbereiche",
  },
  zh: {
    subtitle: "围绕劳动法这一核心业务，本所发展了三个互补的业务领域：公司与合同、移民以及诉讼与劳动刑事。",
    errorMessage: "加载业务领域失败",
  },
  ko: {
    subtitle: "법인은 노동법 업무를 중심으로 기업·계약, 이민, 소송 및 노동 형사의 세 가지 보완 업무 분야를 갖추고 있습니다.",
    errorMessage: "업무 분야 로드 실패",
  },
  ja: {
    subtitle: "当事務所は労働法を中核に、企業法務・契約、移民、訴訟・労働刑事の三つの補完的な分野を展開しています。",
    errorMessage: "取扱分野の読み込みに失敗しました",
  },
  ar: {
    subtitle: "حول ممارسته في قانون العمل، طوّر المكتب ثلاث ممارسات مكمّلة: الشركات والعقود، والهجرة، والتقاضي والقضايا الجنائية العمالية.",
    errorMessage: "فشل تحميل مجالات الممارسة",
  },
  ru: {
    subtitle: "Вокруг практики трудового права фирма развила три дополняющие её практики: корпоративную и договорную, миграционную и судебную, включая уголовные дела в сфере труда.",
    errorMessage: "Не удалось загрузить практики",
  },
  fr: {
    subtitle: "Autour de sa pratique en droit du travail, le cabinet a développé trois pratiques complémentaires : droit des sociétés et des contrats, immigration, contentieux et pénal du travail.",
    errorMessage: "Échec du chargement des domaines de pratique",
  },
  it: {
    subtitle: "Attorno alla sua pratica giuslavoristica, lo studio ha sviluppato tre aree complementari: societario e contrattuale, immigrazione, contenzioso e penale del lavoro.",
    errorMessage: "Impossibile caricare le aree di pratica",
  },
};

export default function PracticeGroups() {
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();
  const media = useCmsMedia();

  const { data: practiceGroups = [], isLoading } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const editableContent = useCmsContent("practices", content);
  const t = editableContent[language] || editableContent.en;
  const title = (cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en).nav[1].label;
  const emptyMessage = emptyMessages[language] || emptyMessages.en;
  const { lang: v3Lang, locale: v3Locale, attrs: v3Attrs } = useV3Lang();
  const P = PAGINA[v3Locale];
  // Industrias: el título de la demo en ES/EN; en los otros idiomas, el rótulo del sitio en ese idioma
  const chromeL = cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en;
  const industriesTitle = language === "es" || language === "en" ? P.industries : chromeL.search.groups.industryGroups;

  // Las prácticas del bloque (orden del panel, foto de cada una). En español e inglés, tal cual; en los
  // otros idiomas, el nombre del sitio en ese idioma (panel) y la descripción traducida si está guardada;
  // lo que se queda en inglés lo declara.
  const base = usePracticeItems(v3Lang);
  const { name: cmsPracticeName } = usePracticeNames();
  const [traducciones, setTraducciones] = useState<Record<string, Traduccion>>({});
  const alTraducir = useCallback((slug: string, tr: Traduccion) => {
    setTraducciones((prev) => (prev[slug]?.name === tr.name && prev[slug]?.description === tr.description ? prev : { ...prev, [slug]: tr }));
  }, []);
  const otroIdioma = language !== "es" && language !== "en";
  const items: PracticeItem[] = useMemo(() => {
    if (!otroIdioma) return base;
    return base.map((p) => {
      const group = practiceGroups.find((g) => g.slug === p.slug);
      const tr = traducciones[p.slug] ?? {};
      const local = cmsPracticeName(p.slug, language) ?? practiceName(p.slug, language);
      const name = local ?? tr.name ?? group?.name ?? p.name;
      const summary = tr.description || group?.description || p.summary;
      return {
        ...p,
        name,
        summary,
        nameLang: !local && name === (group?.name ?? p.name) ? "en" : undefined,
        summaryLang: summary === (group?.description || p.summary) ? "en" : undefined,
      };
    });
  }, [base, otroIdioma, practiceGroups, traducciones, cmsPracticeName, language]);

  return (
    <div className="ss26 min-h-screen" data-testid="page-practice-groups">
      <SEOHead page="practiceGroups" language={language} />
      <Header />

      <V3Main vista="practicas" className="pg">
        {otroIdioma && practiceGroups.map((g) => <TraduccionPractica key={g.id} group={g} onChange={alTraducir} />)}

        {items.length ? (
          <PracticasBaker
            lang={v3Lang}
            items={items}
            pagina={{ titulo: title, entrada: t.subtitle, id: "pg-h", verAttrs: v3Attrs }}
          />
        ) : (
          <header className="sh-pp sh-cab pg-cab" aria-labelledby="pg-h" aria-busy={isLoading} data-testid="section-practice-groups-hero">
            <div className="sh-wrap sh-pp__cuerpo">
              <div className="sh-pp__texto">
                <h1 id="pg-h" className="sh-h1" tabIndex={-1} data-testid="text-practice-groups-title">{title}</h1>
                <p className="sh-lead" data-testid="text-practice-groups-subtitle">{t.subtitle}</p>
                {!isLoading && <p className="pg-aviso" role="status" data-testid="container-practice-groups-empty">{emptyMessage}</p>}
              </div>
            </div>
          </header>
        )}

        {/* La ventaja de la firma: prevenir y reaccionar son la misma pieza (lámina 2/7) */}
        <LaminaReaccion t={FIRMA_TEXTOS[v3Locale]} attrs={v3Attrs} logo={media.brand.logoLight} />

        {/* Al final, como en cada página de la demo: la siguiente parte, Industrias. «Siguiente» va en
            inglés fuera de ES/EN, marcado como inglés (lang/dir) */}
        <SiguientePractica href="/industries" label={P.next} labelAttrs={v3Attrs} title={industriesTitle} />
      </V3Main>

      <Footer />
    </div>
  );
}
