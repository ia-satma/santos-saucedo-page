import { useCmsContent } from "@/hooks/useCmsContent";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow } from "@/components/editorial";
import { chrome26 } from "@/components/home26/chrome26";
import { usePracticeNames } from "@/lib/practiceNames";
import type { PracticeGroup } from "@shared/schema";

// Texto de origen en inglés mostrado en otro idioma (sin traducción, o en el sitio estático):
// el bloque lleva lang="en" (para :lang(): la romana, no la sans de CJK y árabe) y conserva la
// dirección de la página (en árabe, alineado a la derecha junto al número de fila); el texto va
// aislado en <bdi lang="en" dir="ltr">, como en Team.tsx.
function EnglishSource({ children }: { children: ReactNode }) {
  return <bdi lang="en" dir="ltr">{children}</bdi>;
}

interface PracticeGroupRowProps {
  group: PracticeGroup;
  index: number;
}

// Fila de filete como #practicas de la portada: numeración simple 01–04 (sin § 2.n),
// nombre en romana Azul Marino, descripción completa (sin recorte) y flecha. Sin foto: la
// lista tipográfica sustituye a las fotos de archivo. Toda la fila es el enlace.
function PracticeGroupRow({ group, index }: PracticeGroupRowProps) {
  const { name: practiceName } = usePracticeNames();
  const { language } = useLanguage();

  const { translatedFields, isLoading, isTranslating } = useTranslatedContent({
    contentType: 'practice_group',
    entityId: String(group.id),
    fields: {
      name: group.name,
      nameEs: group.nameEs,
      description: group.description,
      descriptionEs: group.descriptionEs,
    },
    enabled: !isNativeLanguage(language),
  });

  const isOtherLanguage = language !== "es" && language !== "en";
  // Fuera de ES/EN, el nombre de la práctica en el idioma de la página (practiceNames.ts, el
  // mismo término de la descripción SEO y del select de Contacto), no el inglés de la base
  const localName = isOtherLanguage ? practiceName(group.slug, language) : undefined;
  const displayName = localName ?? (translatedFields.name || group.name);
  const displayDescription = translatedFields.description || group.description;
  const showTranslatingIndicator = isLoading || isTranslating;

  // Con nombre propio del idioma no es texto de origen (fr "Immigration" coincide con el inglés)
  const nameIsSource = isOtherLanguage && !localName && displayName === group.name;
  const descriptionIsSource = isOtherLanguage && displayDescription === group.description;

  const nameId = `practice-name-${group.slug}`;
  const descriptionId = `practice-desc-${group.slug}`;

  return (
    <li
      className="ss-row relative border-b border-ss-rule"
      data-testid={`card-practice-group-${group.slug}`}
    >
      {/* inline-link: fuera de la regla móvil de index.css que vuelve inline-flex todo <a>.
          Nombre del enlace = título; la descripción va como descripción accesible. */}
      <Link
        href={`/practice-groups/${group.slug}`}
        aria-labelledby={nameId}
        aria-describedby={descriptionId}
        className="inline-link grid grid-cols-1 gap-y-3 py-8 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-8 lg:grid-cols-[88px_minmax(0,5fr)_minmax(0,7fr)_auto] lg:gap-x-12 lg:py-10"
        data-testid={`link-practice-group-${group.slug}`}
      >
        <span aria-hidden="true" className="ss-row-num ss-label ss-num sm:col-start-1 sm:row-start-1">
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* h2 bajo el h1 de la página: escala de sub-bloque (.ss-h2-sm, romana 400) */}
        <h2
          id={nameId}
          className="ss-h2-sm sm:col-start-2 sm:row-start-1"
          data-testid={`text-practice-group-name-${group.slug}`}
          lang={nameIsSource ? "en" : undefined}
        >
          {nameIsSource ? <EnglishSource>{displayName}</EnglishSource> : displayName}
          {showTranslatingIndicator && (
            <Loader2 className="inline-block w-4 h-4 ms-3 align-middle animate-spin text-ss-medio" aria-hidden="true" />
          )}
        </h2>
        <p
          id={descriptionId}
          className="ss-prose max-w-[60ch] text-[19px] text-ss-tinta sm:col-start-2 sm:row-start-2 lg:col-start-3 lg:row-start-1"
          data-testid={`text-practice-group-desc-${group.slug}`}
          lang={descriptionIsSource ? "en" : undefined}
        >
          {descriptionIsSource ? <EnglishSource>{displayDescription}</EnglishSource> : displayDescription}
        </p>
        <span aria-hidden="true" className="ss-arrow hidden text-[25px] text-ss-marino sm:block sm:col-start-3 sm:row-start-1 lg:col-start-4">
          →
        </span>
      </Link>
      <span aria-hidden="true" className="ss-row-rule absolute -bottom-px left-0 h-[2px] w-full bg-ss-marino" />
    </li>
  );
}

export default function PracticeGroups() {
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();

  const { data: practiceGroups, isLoading, error } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  // Subtítulo: de la redacción aprobada (Nuestra firma): una práctica laboral central y
  // tres complementarias. Sustituye a "cubre todas las principales áreas legales".
  // h1: la etiqueta del menú en cada idioma (chrome26 nav[1]), la misma de la pestaña
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
      subtitle: "Autour de sa pratique en droit du travail, le cabinet a développé trois pratiques complémentaires\u202f: droit des sociétés et des contrats, immigration, contentieux et pénal du travail.",
      errorMessage: "Échec du chargement des domaines de pratique",
    },
    it: {
      subtitle: "Attorno alla sua pratica giuslavoristica, lo studio ha sviluppato tre aree complementari: societario e contrattuale, immigrazione, contenzioso e penale del lavoro.",
      errorMessage: "Impossibile caricare le aree di pratica",
    },
  };

  const editableContent = useCmsContent("practices", content);
  const t = editableContent[language] || editableContent.en;
  const title = (cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en).nav[1].label;

  return (
    <div className="min-h-screen bg-background" data-testid="page-practice-groups">
      <SEOHead page="practiceGroups" language={language} />
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1); el relleno
          del cuerpo va en su propio envoltorio. ss-container: borde de logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-practice-groups-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="02" tone="navy" className="mb-6" />
              <h1
                className="mb-5"
                data-testid="text-practice-groups-title"
              >
                {title}
              </h1>
              <p
                data-testid="text-practice-groups-subtitle"
              >
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>

        <div className="py-16 lg:py-20">
          {/* Lista a todo el ancho del contenedor: en escritorio, nombre y descripción en
              columnas; en teléfono, apilados */}
          <div className="ss-container">
            {error ? (
              <div className="py-12" data-testid="container-practice-groups-error">
                <p className="text-base text-ss-medio" data-testid="text-practice-groups-error">
                  {t.errorMessage}
                </p>
              </div>
            ) : isLoading ? (
              <div className="border-t border-ss-rule">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-y-3 border-b border-ss-rule py-8 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-x-8 lg:py-10"
                    data-testid={`skeleton-practice-group-${i}`}
                  >
                    <Skeleton className="h-3 w-10 bg-ss-rule" />
                    <div>
                      <Skeleton className="h-8 w-2/3 max-w-sm mb-4 bg-ss-rule" />
                      <Skeleton className="h-4 w-full max-w-xl mb-2 bg-ss-rule" />
                      <Skeleton className="h-4 w-5/6 max-w-lg bg-ss-rule" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ol className="border-t border-ss-rule">
                {practiceGroups?.map((group, idx) => (
                  <PracticeGroupRow key={group.id} group={group} index={idx} />
                ))}
              </ol>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
