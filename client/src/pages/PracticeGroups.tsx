import { useCmsContent } from "@/hooks/useCmsContent";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PhotoBand } from "@/components/home26/PhotoBand";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow } from "@/components/editorial";
import { PhotoPageHeader } from "@/components/editorial/PhotoPageHeader";
import { chrome26 } from "@/components/home26/chrome26";
import { usePracticeNames } from "@/lib/practiceNames";
import { getPracticeImage } from "@/lib/practiceIndustryImages";
import type { PracticeGroup } from "@shared/schema";
import "./PracticeGroups.css";

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
  // Misma serie aprobada que en el inicio; conservar las imágenes guardadas sin borrarlas.
  const imageUrl = getPracticeImage(group.slug);

  return (
    <li
      className="practice-entry border-b border-ss-rule"
      data-testid={`card-practice-group-${group.slug}`}
    >
      <Link
        href={`/practice-groups/${group.slug}`}
        aria-labelledby={nameId}
        aria-describedby={descriptionId}
        className="practice-entry-link group inline-link"
        data-testid={`link-practice-group-${group.slug}`}
      >
        <div className="practice-entry-image">
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="practice-entry-photo"
          />
        </div>

        <div className="practice-entry-copy">
          <span aria-hidden="true" className="practice-entry-number ss-label ss-num">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="practice-entry-heading">
            <h2
              id={nameId}
              className="practice-entry-title ss-h2-sm"
              data-testid={`text-practice-group-name-${group.slug}`}
              lang={nameIsSource ? "en" : undefined}
            >
              {nameIsSource ? <EnglishSource>{displayName}</EnglishSource> : displayName}
              {showTranslatingIndicator && (
                <Loader2
                  className="ms-3 inline-block h-4 w-4 animate-spin align-middle text-ss-medio"
                  aria-hidden="true"
                />
              )}
            </h2>
            <span aria-hidden="true" className="practice-entry-arrow ss-arrow">→</span>
          </div>
          <p
            id={descriptionId}
            className="practice-entry-description ss-prose"
            data-testid={`text-practice-group-desc-${group.slug}`}
            lang={descriptionIsSource ? "en" : undefined}
          >
            {descriptionIsSource ? <EnglishSource>{displayDescription}</EnglishSource> : displayDescription}
          </p>
        </div>
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
    <li
      className="practice-entry practice-entry-skeleton border-b border-ss-rule"
      data-testid={`skeleton-practice-group-${index}`}
      aria-hidden="true"
    >
      <div className="practice-entry-link">
        <Skeleton className="practice-skeleton-image bg-ss-paper" />
        <div className="practice-entry-copy">
          <Skeleton className="mb-5 h-3 w-10 bg-ss-rule" />
          <Skeleton className="mb-4 h-8 w-4/5 max-w-md bg-ss-rule" />
          <Skeleton className="mb-2 h-4 w-full bg-ss-rule" />
          <Skeleton className="mb-2 h-4 w-11/12 bg-ss-rule" />
          <Skeleton className="h-4 w-3/4 bg-ss-rule" />
        </div>
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

  return (
    <div className="min-h-screen bg-background" data-testid="page-practice-groups">
      <SEOHead page="practiceGroups" language={language} />
      <Header />

      <main id="main-content">
        <section className="practice-directory-hero editorial-page-hero ss-photo-page-hero" data-testid="section-practice-groups-hero">
          <PhotoPageHeader src={getPracticeImage("laboral-seguridad-social")} position="50% 44%" />
          <div className="ss-container">
            <div className="practice-directory-intro">
              <Eyebrow num="02" tone="navy" className="mb-6" />
              <h1 data-testid="text-practice-groups-title">{title}</h1>
              <p className="practice-directory-subtitle ss-lead" data-testid="text-practice-groups-subtitle">
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="practice-directory-list" aria-label={title} aria-busy={isLoading}>
          <div className="ss-container">
            {error ? (
              <div className="py-12" role="alert" data-testid="container-practice-groups-error">
                <p className="text-base text-ss-medio" data-testid="text-practice-groups-error">
                  {t.errorMessage}
                </p>
              </div>
            ) : isLoading ? (
              <ol className="practice-directory-entries border-t border-ss-rule" aria-label={title}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <PracticeGroupSkeleton key={index} index={index} />
                ))}
              </ol>
            ) : practiceGroups?.length ? (
              <ol className="practice-directory-entries border-t border-ss-rule">
                {practiceGroups.map((group, index) => (
                  <PracticeGroupRow key={group.id} group={group} index={index} />
                ))}
              </ol>
            ) : (
              <div className="practice-directory-empty" role="status" data-testid="container-practice-groups-empty">
                <p>{emptyMessage}</p>
              </div>
            )}
          </div>
        </section>

        <PhotoBand photo="biblioteca" height="medium" position="object-[50%_45%]" testId="band-practices-office" />
      </main>

      <Footer />
    </div>
  );
}
