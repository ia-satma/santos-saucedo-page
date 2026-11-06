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
import { chrome26 } from "@/components/home26/chrome26";
import { usePracticeNames } from "@/lib/practiceNames";
import { getPracticeImage } from "@/lib/practiceIndustryImages";
import { V3Main, useV3Lang } from "@/v3/shared";
import { PAGINA } from "@/v3/practicas/textos";
import { SiguientePractica } from "@/v3/practicas/Siguiente";
import { PRACTICE_PHOTOS } from "@/v3/home/copy";
import type { PracticeGroup } from "@shared/schema";
import "./PracticeGroups.css";

// Listado de prácticas con el diseño de la demo v3 (como sus cuatro páginas): título y entrada de la
// página, y las cuatro prácticas en una retícula de dos, cada una con la misma foto que tiene en el
// bloque de prácticas del Inicio (PRACTICE_PHOTOS, client/src/v3/home/copy.ts). Nombre, resumen y
// entrada siguen viniendo de la base y del panel, en los 10 idiomas.

// English source copy stays explicitly isolated from the active page language and direction.
function EnglishSource({ children }: { children: ReactNode }) {
  return <bdi lang="en" dir="ltr">{children}</bdi>;
}

interface PracticeGroupRowProps {
  group: PracticeGroup;
  index: number;
}

function PracticeGroupRow({ group, index }: PracticeGroupRowProps) {
  const { name: practiceName } = usePracticeNames();
  const { language } = useLanguage();

  const { translatedFields, isLoading, isTranslating } = useTranslatedContent({
    contentType: "practice_group",
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
  const localName = isOtherLanguage ? practiceName(group.slug, language) : undefined;
  const displayName = localName ?? (translatedFields.name || group.name);
  const displayDescription = translatedFields.description || group.description;
  const showTranslatingIndicator = isLoading || isTranslating;
  const nameIsSource = isOtherLanguage && !localName && displayName === group.name;
  const descriptionIsSource = isOtherLanguage && displayDescription === group.description;

  const nameId = `practice-name-${group.slug}`;
  const descriptionId = `practice-desc-${group.slug}`;
  // La foto del bloque de prácticas del Inicio; una práctica nueva del panel, la del catálogo
  const photo = PRACTICE_PHOTOS[group.slug];
  const imageUrl = photo?.img ?? getPracticeImage(group.slug);

  return (
    <li className={index === 0 ? "pg-item pg-item--lead" : "pg-item"} data-testid={`card-practice-group-${group.slug}`}>
      <Link
        href={`/practice-groups/${group.slug}`}
        aria-labelledby={nameId}
        aria-describedby={descriptionId}
        className="pg-a inline-link"
        data-testid={`link-practice-group-${group.slug}`}
      >
        <span className="pg-foto">
          <img src={imageUrl} alt="" width={photo?.w ?? 1536} height={photo?.h ?? 1024} loading="lazy" decoding="async" />
        </span>
        <span aria-hidden="true" className="pg-n">{String(index + 1).padStart(2, "0")}</span>
        <h2
          id={nameId}
          className="pg-t"
          data-testid={`text-practice-group-name-${group.slug}`}
          lang={nameIsSource ? "en" : undefined}
        >
          <span className="pg-t-txt">{nameIsSource ? <EnglishSource>{displayName}</EnglishSource> : displayName}</span>
          {showTranslatingIndicator && (
            <Loader2 className="ms-3 inline-block h-4 w-4 animate-spin align-middle" aria-hidden="true" />
          )}
        </h2>
        <p
          id={descriptionId}
          className="pg-d"
          data-testid={`text-practice-group-desc-${group.slug}`}
          lang={descriptionIsSource ? "en" : undefined}
        >
          {descriptionIsSource ? <EnglishSource>{displayDescription}</EnglishSource> : displayDescription}
        </p>
      </Link>
    </li>
  );
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

function PracticeGroupSkeleton({ index }: { index: number }) {
  return (
    <li className={`pg-item pg-item--esqueleto${index === 0 ? " pg-item--lead" : ""}`} data-testid={`skeleton-practice-group-${index}`} aria-hidden="true">
      <div className="pg-a">
        <Skeleton className="pg-foto bg-[rgba(15,63,107,.08)]" />
        <Skeleton className="mt-6 h-3 w-10 bg-[rgba(15,63,107,.08)]" />
        <Skeleton className="mt-4 h-8 w-4/5 max-w-md bg-[rgba(15,63,107,.08)]" />
        <Skeleton className="mt-4 h-4 w-full bg-[rgba(15,63,107,.08)]" />
        <Skeleton className="mt-2 h-4 w-3/4 bg-[rgba(15,63,107,.08)]" />
      </div>
    </li>
  );
}

export default function PracticeGroups() {
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();

  const { data: practiceGroups, isLoading, error } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const editableContent = useCmsContent("practices", content);
  const t = editableContent[language] || editableContent.en;
  const title = (cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en).nav[1].label;
  const emptyMessage = emptyMessages[language] || emptyMessages.en;
  const { lang: v3Lang, attrs: v3Attrs } = useV3Lang();
  const P = PAGINA[v3Lang];
  // Industrias: el título de la demo en ES/EN; en los otros idiomas, el rótulo del sitio en ese idioma
  const chromeL = cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en;
  const industriesTitle = language === "es" || language === "en" ? P.industries : chromeL.search.groups.industryGroups;

  return (
    <div className="ss26 min-h-screen" data-testid="page-practice-groups">
      <SEOHead page="practiceGroups" language={language} />
      <Header />

      <V3Main vista="practicas" className="pg">
        {/* Cabecera de página de la demo, sin foto: las fotos van en cada práctica */}
        <header className="sh-pp sh-cab pg-cab" aria-labelledby="pg-h" data-testid="section-practice-groups-hero">
          <div className="sh-wrap sh-pp__cuerpo">
            <div className="sh-pp__texto">
              <h1 id="pg-h" className="sh-h1" tabIndex={-1} data-testid="text-practice-groups-title">{title}</h1>
              <p className="sh-lead" data-testid="text-practice-groups-subtitle">{t.subtitle}</p>
            </div>
          </div>
        </header>

        <section className="pg-lista" aria-label={title} aria-busy={isLoading}>
          <div className="sh-wrap">
            {error ? (
              <div className="pg-aviso" role="alert" data-testid="container-practice-groups-error">
                <p data-testid="text-practice-groups-error">{t.errorMessage}</p>
              </div>
            ) : isLoading ? (
              <ol className="pg-grid" aria-label={title}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <PracticeGroupSkeleton key={index} index={index} />
                ))}
              </ol>
            ) : practiceGroups?.length ? (
              <ol className="pg-grid">
                {practiceGroups.map((group, index) => (
                  <PracticeGroupRow key={group.id} group={group} index={index} />
                ))}
              </ol>
            ) : (
              <div className="pg-aviso" role="status" data-testid="container-practice-groups-empty">
                <p>{emptyMessage}</p>
              </div>
            )}
          </div>
        </section>

        {/* Al final, como en cada página de la demo: la siguiente parte, Industrias. «Siguiente» va en
            inglés fuera de ES/EN, marcado como inglés (lang/dir) */}
        <SiguientePractica href="/industries" label={P.next} labelAttrs={v3Attrs} title={industriesTitle} />
      </V3Main>

      <Footer />
    </div>
  );
}
