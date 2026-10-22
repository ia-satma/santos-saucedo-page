import { useContentEntity, useContentPreview } from "@/features/admin/ContentPreview";
import { useCmsContent } from "@/hooks/useCmsContent";
import { lazy, Suspense, useState, useMemo, type ReactNode, type SyntheticEvent } from "react";
import { Link, useParams } from "wouter";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead, { detailTitle, metaDescription } from "@/components/SEOHead";
import { PersonJsonLd, BreadcrumbJsonLd } from "@/components/JsonLdSchema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isStaticSite } from "@/lib/queryClient";
import { formatNewsDate } from "@/lib/newsDate";
import { getTeamPhotoObjectPosition } from "@/lib/teamPhotoPosition";
import { fallbackToOriginalSrc, getTeamPhotoSrcSet, getTeamPhotoThumb, highFetchPriority, isNamedOnTeamPage } from "@/lib/teamPhotoSources";
import { Eyebrow, LeadParagraph } from "@/components/editorial";
import { chrome26 } from "@/components/home26/chrome26";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { SplitSection } from "@/components/home26/primitives";
import { directContact, isInMemoriamMember } from "@/lib/partnerContact";
import { keepFirmName } from "@/lib/firmName";
import type { TeamMember, PracticeGroup, IndustryGroup, Education, Affiliation, Ranking, Publication, RepresentativeMatter, BarAdmission, News, LanguageCode } from "@shared/schema";

// Vista 404 del sitio (la misma carga diferida que usa App): fichas que no existen y personas
// que el sitio no nombra (E11)
const NotFound = lazy(() => import("@/pages/not-found"));

// Retícula del encabezado del perfil, compartida por la vista y su carga para que no se
// desalineen (cada bloque se coloca en su celda; el DOM sigue nombre, botones, foto).
// Teléfono: retrato 4/5 de 112 px al lado del nombre y el cargo, como la tarjeta de /team
// (grid-cols-[112px_1fr], al pie de la fila), y los botones debajo de ese bloque, a todo lo
// ancho. Bajo 360 px el retrato baja a 88 px: a 320 la columna del nombre no llegaba a la
// palabra más larga ("Montemayor") y el h1 la partía por dentro. md: foto en la columna 1 (dos
// filas, al menos cuadrada), filete de 1 px y el texto en
// la 3 alineado con la foto; los botones debajo, en una fila a todo lo ancho. lg: los botones
// vuelven a la columna del texto, al pie, alineados con el borde inferior del retrato (240 px
// en md, 260 en lg).
const PROFILE_GRID = "grid grid-cols-[112px_minmax(0,1fr)] items-end gap-x-5 max-[359px]:grid-cols-[88px_minmax(0,1fr)] max-[359px]:gap-x-4 md:grid-cols-[240px_1px_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:items-stretch md:gap-x-0 lg:grid-cols-[260px_1px_minmax(0,1fr)]";
const PROFILE_PHOTO_CELL = "col-start-1 row-start-1 aspect-[4/5] w-full md:row-span-2 md:aspect-auto md:min-h-[240px] lg:min-h-[260px]";
// Ancho del retrato en cada tramo, para que srcset elija la variante WebP adecuada
const PROFILE_PHOTO_SIZES = "(min-width: 1024px) 260px, (min-width: 768px) 240px, 112px";
const PROFILE_IDENTITY_CELL = "col-start-2 row-start-1 md:col-start-3 md:px-10 md:pb-6";
const PROFILE_ACTIONS_CELL = "col-span-2 col-start-1 row-start-2 pt-6 md:col-span-3 md:row-start-3 md:pt-8 lg:col-span-1 lg:col-start-3 lg:row-start-2 lg:self-end lg:px-10 lg:pt-0";
// Columnas de la fila de botones: hoy solo "Descargar vCard" (G6), de 240 px (en lg la celda
// suma 80 px de relleno lateral)
const ACTIONS_COLUMNS = ["sm:max-w-[15rem] lg:max-w-[20rem]", "sm:grid-cols-2 lg:max-w-[32rem]", "sm:grid-cols-3 lg:max-w-[48rem]"] as const;

// Relleno del encabezado: el mismo de los demás encabezados internos, escrito aquí y sin las
// clases pt-36/pb-20 (la regla propia de la ficha en index.css dejaba 86/64 px a 1440).
const PROFILE_HERO = "pt-[clamp(56px,4vw,72px)] pb-[clamp(40px,3.6vw,56px)]";
// Botones sobre Hueso: contorno y texto Azul Marino; relleno Azul Marino al pasar el cursor
// (twMerge sustituye el border-primary/text-primary de la variante outline)
const PROFILE_BUTTON = "min-h-[44px] w-full whitespace-normal text-center leading-[1.2] border-ss-marino text-ss-marino transition-colors duration-200 hover:bg-ss-marino hover:text-white";

// Texto sin traducción (la traducción automática falló o no llegó): se muestra el original
// en inglés, marcado lang="en"; si tampoco hay inglés, el español (lang="es"). `translated`
// solo cuando el hook dice que llegó una traducción (hasTranslation): mientras tanto devuelve
// el texto de origen, que aquí es el español.
type LocalizedText = { text: string | null | undefined; lang?: "en" | "es" };
function pickLocalized(
  language: LanguageCode,
  translated: string | null | undefined,
  en: string | null | undefined,
  es: string | null | undefined,
): LocalizedText {
  if (language === "es") return { text: es || en };
  if (language === "en") return en ? { text: en } : { text: es, lang: es ? "es" : undefined };
  if (translated) return { text: translated };
  if (en) return { text: en, lang: "en" };
  return { text: es, lang: es ? "es" : undefined };
}
// Textos cortos de respaldo (cargo, práctica): aislados en <bdi lang dir="ltr">, como en las
// prácticas. El bloque conserva la dirección de la página (en árabe, alineado a la derecha
// como el eyebrow y el nombre) y el punto final no salta al otro extremo.
// "(in memoriam)" sin partirse entre líneas, en todos los idiomas (espacio duro): a 320 y 390 px
// quedaba "Socio fundador (in / memoriam)"
const keepInMemoriam = (text: string | null | undefined) =>
  text?.replace(/\((in)\s+(memoriam)\)/gi, "($1\u00a0$2)");
function LocalizedRun({ value }: { value: LocalizedText }) {
  const text = keepInMemoriam(value.text);
  return value.lang ? <bdi lang={value.lang} dir="ltr">{text}</bdi> : <>{text}</>;
}

// Enlace de vuelta con el lenguaje de TextLink (home26/primitives): etiqueta y flecha, sin
// botón. La flecha apunta hacia atrás (en árabe, a la derecha). inline-link: fuera de la regla
// móvil que vuelve inline-flex todo <a>; el área táctil la amplía before (~44 px). [&_span]: la
// regla móvil que pone todo span a 16 px no agranda la etiqueta.
function BackTextLink({ href, children, testId }: { href: string; children: ReactNode; testId?: string }) {
  return (
    <Link
      href={href}
      className="inline-link ss-label relative inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3 [&_span]:[font-size:inherit]"
      data-testid={testId}
    >
      <span aria-hidden="true" className="inline-block rtl:-scale-x-100">←</span>
      <span className="ss-link">{children}</span>
    </Link>
  );
}

// Retícula de "Equipo relacionado" (vista, carga y espera de /api/team): una columna con filete
// final en el teléfono; tres iguales en tableta; desde lg, en las ocho columnas del cuerpo, otra
// vez una lista de filas con filete final, como las prácticas de la portada (en tres columnas los
// nombres y cargos se partían en dos y tres líneas)
const RELATED_GRID = "grid grid-cols-1 md:grid-cols-3 gap-x-8 lg:grid-cols-1 border-b border-ss-rule md:border-b-0 lg:border-b";

// "Equipo relacionado" mientras carga: tres filas del mismo alto (filete, retrato de 56 px y dos
// líneas), para que el pie no salte cuando llegan la ficha o la lista del equipo
function RelatedTeamSkeleton() {
  return (
    <SplitSection aside={<Skeleton className="h-7 w-48 bg-ss-rule" />}>
      <div className={RELATED_GRID} aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 py-4 border-t border-ss-rule">
            <Skeleton className="h-14 w-14 shrink-0 rounded-none bg-ss-rule" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-1/2 mb-2 bg-ss-rule" />
              <Skeleton className="h-3 w-1/3 bg-ss-rule" />
            </div>
          </div>
        ))}
      </div>
    </SplitSection>
  );
}

function RelatedTeamMemberCard({
  relatedMember,
  language,
  getInitials,
}: {
  relatedMember: TeamMember;
  language: LanguageCode;
  getInitials: (name: string) => string;
}) {
  const { translatedFields, hasTranslation } = useTranslatedContent({
    contentType: 'team_member',
    entityId: relatedMember.id.toString(),
    fields: { title: relatedMember.titleEs || relatedMember.title, titleEs: relatedMember.titleEs },
    // En inglés basta el campo inglés; solo se pide traducción si falta
    enabled: language !== 'es' && !(language === 'en' && relatedMember.title),
  });

  // Inglés: title tal cual. Otros idiomas: traducción, o el inglés antes que el español
  const displayTitle = pickLocalized(language, hasTranslation ? translatedFields.title : null, relatedMember.title, relatedMember.titleEs);

  // Miniatura WebP de 128 px; si no existe donde se sirven las fotos, el original; si tampoco,
  // quedan las iniciales sobre Hueso
  const originalSrc = relatedMember.imageUrl || undefined;
  const [avatarSrc, setAvatarSrc] = useState(() => getTeamPhotoThumb(originalSrc));

  return (
    <Link href={`/team/${relatedMember.slug}`} className="inline-link block w-full">
      {/* Fila con filete superior a todo lo ancho; retrato cuadrado de 56 px (sin círculo), en
          grises como todos los retratos */}
      <div
        className="group flex w-full items-start gap-4 py-4 border-t border-ss-rule cursor-pointer"
        data-testid={`card-related-member-${relatedMember.slug}`}
      >
        <span className="relative block h-14 w-14 shrink-0 overflow-hidden bg-ss-paper">
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-heading text-sm text-ss-marino">
            {getInitials(relatedMember.name)}
          </span>
          {avatarSrc && (
            <img
              src={avatarSrc}
              data-portrait-slug={relatedMember.slug}
              // alt vacío: el nombre ya es el texto del enlace (antes se leía dos veces)
              alt=""
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="ss-photo absolute inset-0 h-full w-full object-cover object-top"
              onError={(e) => {
                if (avatarSrc !== originalSrc) setAvatarSrc(originalSrc);
                else e.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
        <div className="flex-1 min-w-0">
          {/* Nombre y cargo completos: si no caben, pasan a una segunda línea (antes "Mario Saucedo M…") */}
          <p className="font-heading text-[17px] leading-[1.2] tracking-[-0.01em] text-ss-marino group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1">
            {relatedMember.name}
          </p>
          {/* Sin traducción, el cargo en inglés va en <bdi>: aislado del árabe sin cambiar la alineación */}
          <p className="ss-label text-ss-medio mt-1">
            <LocalizedRun value={displayTitle} />
          </p>
        </div>
      </div>
    </Link>
  );
}

function EducationItemTranslated({
  edu,
  index,
  language,
  memberId,
}: {
  edu: Education;
  index: number;
  language: LanguageCode;
  memberId: string;
}) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: `${memberId}_edu_${index}`,
    fields: { 
      degree: edu.degreeEs || edu.degree,
      degreeEs: edu.degreeEs,
    },
    enabled: language !== 'es',
  });

  const displayDegree = language === 'es' && edu.degreeEs
    ? edu.degreeEs
    : (translatedFields.degree || edu.degreeEs || edu.degree);

  const displaySchool = language === 'es' && edu.schoolEs ? edu.schoolEs : edu.school;

  return (
    <div 
      className="border-s border-ss-rule ps-4 py-1"
      data-testid={`item-education-${index}`}
    >
      <p className="font-semibold text-ss-tinta">
        {displayDegree}
      </p>
      <p className="text-ss-medio">
        {displaySchool}
        {edu.year && <span className="ml-2 text-base">({edu.year})</span>}
      </p>
    </div>
  );
}

function PracticeGroupBadge({
  group,
  language,
}: {
  group: PracticeGroup;
  language: LanguageCode;
}) {
  const { translatedFields, hasTranslation } = useTranslatedContent({
    contentType: 'practice_group',
    entityId: group.id.toString(),
    fields: { name: group.nameEs || group.name, nameEs: group.nameEs },
    enabled: language !== 'es' && !(language === 'en' && group.name),
  });

  // Inglés: name tal cual. Otros idiomas: traducción, o el inglés antes que el español
  const displayName = pickLocalized(language, hasTranslation ? translatedFields.name : null, group.name, group.nameEs);

  return (
    <Link href={`/practice-groups/${group.slug}`}>
      {/* Chip de 14 px con filete Línea; al pasar el cursor, filete y texto Azul Marino */}
      <Badge
        variant="outline"
        className="cursor-pointer px-3 py-1.5 no-default-hover-elevate no-default-active-elevate transition-colors duration-200 hover:border-ss-marino hover:text-ss-marino"
        data-testid={`badge-practice-group-${group.slug}`}
      >
        <LocalizedRun value={displayName} />
      </Badge>
    </Link>
  );
}

function IndustryGroupBadge({
  group,
  language,
}: {
  group: IndustryGroup;
  language: LanguageCode;
}) {
  const { translatedFields, hasTranslation } = useTranslatedContent({
    contentType: 'industry_group',
    entityId: group.id.toString(),
    fields: { name: group.nameEs || group.name, nameEs: group.nameEs },
    enabled: language !== 'es' && !(language === 'en' && group.name),
  });

  const displayName = pickLocalized(language, hasTranslation ? translatedFields.name : null, group.name, group.nameEs);

  // Sin enlace: el sitio no tiene páginas públicas de industrias (rutas retiradas en 4f995a6)
  return (
    <Badge
      variant="outline"
      className="px-3 py-1.5 no-default-hover-elevate no-default-active-elevate"
      data-testid={`badge-industry-group-${group.slug}`}
    >
      <LocalizedRun value={displayName} />
    </Badge>
  );
}

function RankingItemTranslated({
  ranking,
  index,
  language,
  memberId,
  isTiered,
  getPublicationIcon,
}: {
  ranking: Ranking;
  index: number;
  language: LanguageCode;
  memberId: string;
  isTiered: boolean;
  getPublicationIcon: (publication: string) => JSX.Element | null;
}) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: `${memberId}_ranking_${index}`,
    fields: { 
      ranking: ranking.rankingEs || ranking.ranking,
      rankingEs: ranking.rankingEs,
      area: ranking.areaEs || ranking.area,
      areaEs: ranking.areaEs,
    },
    enabled: language !== 'es',
  });

  const displayRanking = language === 'es' && ranking.rankingEs
    ? ranking.rankingEs
    : (translatedFields.ranking || ranking.rankingEs || ranking.ranking);

  const displayArea = language === 'es' && ranking.areaEs
    ? ranking.areaEs
    : (translatedFields.area || ranking.areaEs || ranking.area);

  if (isTiered) {
    return (
      // Fila con filete superior: publicación, banda en chip, año como etiqueta
      <div 
        className="border-t border-ss-rule py-4"
        data-testid={`card-ranking-tiered-${index}`}
      >
        <div className="flex items-start gap-3">
          {getPublicationIcon(ranking.publication)}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ss-tinta">
              {ranking.publication}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge 
                variant="outline"
                data-testid={`badge-ranking-band-${index}`}
              >
                {displayRanking}
              </Badge>
              {ranking.year && (
                <span className="ss-label ss-num text-ss-medio">
                  {ranking.year}
                </span>
              )}
            </div>
            {displayArea && (
              <p className="text-base text-ss-tinta mt-2">
                {displayArea}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 py-3 border-t border-ss-rule"
      data-testid={`item-ranking-simple-${index}`}
    >
      {getPublicationIcon(ranking.publication)}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ss-tinta truncate">
          {ranking.publication}
        </p>
        {ranking.year && (
          <p className="ss-label ss-num text-ss-medio mt-1">
            {ranking.year}
          </p>
        )}
      </div>
    </div>
  );
}

function PublicationItemTranslated({
  pub,
  index,
  language,
  memberId,
  viewPublicationText,
}: {
  pub: Publication;
  index: number;
  language: LanguageCode;
  memberId: string;
  viewPublicationText: string;
}) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: `${memberId}_pub_${index}`,
    fields: { 
      title: pub.titleEs || pub.title,
      titleEs: pub.titleEs,
    },
    enabled: language !== 'es',
  });

  const displayTitle = language === 'es' && pub.titleEs
    ? pub.titleEs
    : (translatedFields.title || pub.titleEs || pub.title);

  return (
    <div 
      className="border-s border-ss-rule ps-4 py-1"
      data-testid={`item-publication-${index}`}
    >
      <p className="font-semibold text-ss-tinta">
        {displayTitle}
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-1 text-base text-ss-medio">
        {pub.journal && <span>{pub.journal}</span>}
        {pub.year && <span>• {pub.year}</span>}
        {pub.url && (
          <a 
            href={pub.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-ss-marino underline-offset-4 hover:underline"
          >
            {viewPublicationText}
          </a>
        )}
      </div>
    </div>
  );
}

function AffiliationItemTranslated({
  affiliation,
  index,
  language,
  memberId,
}: {
  affiliation: Affiliation;
  index: number;
  language: LanguageCode;
  memberId: string;
}) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: `${memberId}_affil_${index}`,
    fields: { 
      organization: affiliation.organizationEs || affiliation.organization,
      organizationEs: affiliation.organizationEs,
      role: affiliation.roleEs || affiliation.role,
      roleEs: affiliation.roleEs,
    },
    enabled: language !== 'es',
  });

  const displayOrganization = language === 'es' && affiliation.organizationEs
    ? affiliation.organizationEs
    : (translatedFields.organization || affiliation.organizationEs || affiliation.organization);

  const displayRole = affiliation.role
    ? (language === 'es' && affiliation.roleEs
        ? affiliation.roleEs
        : (translatedFields.role || affiliation.roleEs || affiliation.role))
    : null;

  return (
    <div 
      className="border-t border-ss-rule pt-3"
      data-testid={`item-affiliation-${index}`}
    >
      <div>
        <p className="text-ss-tinta">
          {displayOrganization}
        </p>
        {displayRole && (
          <p className="text-base text-ss-medio">
            {displayRole}
          </p>
        )}
      </div>
    </div>
  );
}

function BarAdmissionItemTranslated({
  admission,
  index,
  language,
  memberId,
}: {
  admission: BarAdmission;
  index: number;
  language: LanguageCode;
  memberId: string;
}) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: `${memberId}_bar_${index}`,
    fields: { 
      jurisdiction: admission.jurisdictionEs || admission.jurisdiction,
      jurisdictionEs: admission.jurisdictionEs,
    },
    enabled: language !== 'es',
  });

  const displayJurisdiction = language === 'es' && admission.jurisdictionEs
    ? admission.jurisdictionEs
    : (translatedFields.jurisdiction || admission.jurisdictionEs || admission.jurisdiction);

  return (
    <Badge 
      variant="outline"
      className="px-3 py-1.5"
      data-testid={`badge-bar-admission-${index}`}
    >
      {displayJurisdiction}
      {admission.year && <span className="ml-1 opacity-70">({admission.year})</span>}
    </Badge>
  );
}

function LanguageItemTranslated({
  lang,
  index,
  language,
  memberId,
}: {
  lang: string;
  index: number;
  language: LanguageCode;
  memberId: string;
}) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: `${memberId}_lang_${index}`,
    fields: { 
      language: lang,
    },
    enabled: language !== 'es',
  });

  const displayLanguage = language === 'es'
    ? lang
    : (translatedFields.language || lang);

  return (
    <Badge 
      variant="outline"
      className="px-3 py-1.5"
      data-testid={`badge-language-${index}`}
    >
      {displayLanguage}
    </Badge>
  );
}

function RepresentativeMatterTranslated({
  matter,
  index,
  language,
  memberId,
}: {
  matter: RepresentativeMatter;
  index: number;
  language: LanguageCode;
  memberId: string;
}) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: `${memberId}_matter_${index}`,
    fields: { 
      description: matter.descriptionEs || matter.description,
      descriptionEs: matter.descriptionEs,
    },
    enabled: language !== 'es',
  });

  const displayDescription = language === 'es' && matter.descriptionEs
    ? matter.descriptionEs
    : (translatedFields.description || matter.descriptionEs || matter.description);

  return (
    <div 
      className="border-t border-ss-rule pt-3"
      data-testid={`item-representative-matter-${index}`}
    >
      <div>
        <p className="text-ss-tinta">
          {displayDescription}
        </p>
        {(matter.client || matter.year) && (
          <p className="text-base text-ss-medio mt-1">
            {matter.client && <span>{matter.client}</span>}
            {matter.client && matter.year && <span> • </span>}
            {matter.year && <span>{matter.year}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TeamMemberDetail() {
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: member, isLoading, error } = useContentEntity<TeamMember>("team",slug);

  const { data: practiceGroups } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const { data: industryGroups } = useQuery<IndustryGroup[]>({
    queryKey: ["/api/industry-groups"],
  });

  const { data: allTeamMembers, isLoading: isLoadingTeam } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: relatedNews } = useQuery<News[]>({
    queryKey: ['/api/team', slug, 'news'],
    enabled: !!slug,
  });

  // Quien el sitio no nombra (E11) recibe la 404: no se pide traducción de su ficha
  const preview = useContentPreview();
  const isNamed = !!member && (preview || isNamedOnTeamPage(member));

  const { translatedFields, isTranslating, hasTranslation } = useTranslatedContent({
    contentType: 'team_member',
    entityId: member?.id?.toString() || '',
    fields: { 
      title: member?.titleEs || member?.title, 
      titleEs: member?.titleEs,
      role: member?.roleEs || member?.role, 
      roleEs: member?.roleEs,
      bio: member?.bioEs || member?.bio,
      bioEs: member?.bioEs,
    },
    enabled: isNamed && !!member?.bio && language !== 'es',
  });

  // Teléfono y correo generales de la firma (pie y /contact): si la ficha solo repite esos
  // datos, no lleva bloque de contacto ni botones "Enviar correo"/"Llamar" (E7, G6)
  const firmContact = useSiteContact(language === "en" ? "en" : "es");

  const content: Record<string, {
    partner: string;
    ofCounsel: string;
    associate: string;
    contactInfo: string;
    practiceAreas: string;
    industryGroups: string;
    biography: string;
    education: string;
    barAdmissions: string;
    languages: string;
    affiliations: string;
    rankings: string;
    publications: string;
    representativeMatters: string;
    experience: string;
    contactCta: string;
    officeLabel: string;
    phoneLabel: string;
    emailLabel: string;
    emailUs: string;
    callUs: string;
    downloadVCard: string;
    errorMessage: string;
    loading: string;
    relatedTeam: string;
    viewProfile: string;
    relatedNews: string;
    featuredRecognition: string;
    totalRecognitions: string;
    topPublications: string;
    tieredRankings: string;
    otherRecognitions: string;
    band: string;
    viewPublication: string;
    // Primer nivel de la miga de pan (JSON-LD), como en las notas del Monitor
    home: string;
    positions: {
      foundingPartner: string;
      partner: string;
      ofCounsel: string;
      seniorAssociate: string;
      associate: string;
    };
  }> = {
    en: {
      partner: "Partner",
      ofCounsel: "Of Counsel",
      associate: "Associate",
      contactInfo: "Contact information",
      practiceAreas: "Practice areas",
      industryGroups: "Industry groups",
      biography: "Biography",
      education: "Education",
      barAdmissions: "Bar admissions",
      languages: "Languages",
      affiliations: "Professional affiliations",
      rankings: "Rankings and recognition",
      publications: "Publications",
      representativeMatters: "Representative matters",
      experience: "Professional experience",
      contactCta: "Contact",
      officeLabel: "Office",
      phoneLabel: "Telephone",
      emailLabel: "Email",
      emailUs: "Send email",
      callUs: "Call",
      downloadVCard: "Download vCard",
      errorMessage: "Team member not found",
      loading: "Loading…",
      relatedTeam: "Related team members",
      viewProfile: "View profile",
      relatedNews: "Latest news and articles",
      featuredRecognition: "Featured recognition",
      totalRecognitions: "Total recognitions",
      topPublications: "Top publications",
      tieredRankings: "Tiered rankings",
      otherRecognitions: "Other recognitions",
      band: "Band",
      viewPublication: "View publication",
      home: "Home",
      positions: {
        foundingPartner: "Founding partner",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior associate",
        associate: "Associate",
      },
    },
    es: {
      partner: "Socio",
      ofCounsel: "Of Counsel",
      associate: "Asociado",
      contactInfo: "Información de contacto",
      practiceAreas: "Áreas de práctica",
      industryGroups: "Grupos industriales",
      biography: "Biografía",
      education: "Formación académica",
      barAdmissions: "Admisiones al colegio",
      languages: "Idiomas",
      affiliations: "Afiliaciones profesionales",
      rankings: "Rankings y reconocimientos",
      publications: "Publicaciones",
      representativeMatters: "Asuntos representativos",
      experience: "Experiencia profesional",
      contactCta: "Contacto",
      officeLabel: "Oficina",
      phoneLabel: "Teléfono",
      emailLabel: "Correo",
      emailUs: "Enviar correo",
      callUs: "Llamar",
      downloadVCard: "Descargar vCard",
      errorMessage: "Miembro del equipo no encontrado",
      loading: "Cargando…",
      relatedTeam: "Equipo relacionado",
      viewProfile: "Ver perfil",
      relatedNews: "Últimas noticias y artículos",
      featuredRecognition: "Reconocimiento destacado",
      totalRecognitions: "Total de reconocimientos",
      topPublications: "Publicaciones principales",
      tieredRankings: "Rankings por nivel",
      otherRecognitions: "Otros reconocimientos",
      band: "Banda",
      viewPublication: "Ver publicación",
      home: "Inicio",
      positions: {
        foundingPartner: "Socio fundador",
        partner: "Socio",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Asociado senior",
        associate: "Asociado",
      },
    },
    de: {
      partner: "Partner",
      ofCounsel: "Of Counsel",
      associate: "Associate",
      contactInfo: "Kontakt",
      practiceAreas: "Praxisbereiche",
      industryGroups: "Branchengruppen",
      biography: "Biografie",
      education: "Ausbildung",
      barAdmissions: "Zulassungen",
      languages: "Sprachen",
      affiliations: "Berufsverbände",
      rankings: "Rankings & Auszeichnungen",
      publications: "Publikationen",
      representativeMatters: "Referenzmandate",
      experience: "Erfahrung",
      contactCta: "Kontakt",
      officeLabel: "Büro",
      phoneLabel: "Telefon",
      emailLabel: "E-Mail",
      emailUs: "E-Mail senden",
      callUs: "Anrufen",
      downloadVCard: "vCard herunterladen",
      errorMessage: "Teammitglied nicht gefunden",
      loading: "Wird geladen…",
      relatedTeam: "Weitere Teammitglieder",
      viewProfile: "Profil anzeigen",
      relatedNews: "Aktuelle Nachrichten & Artikel",
      featuredRecognition: "Hervorgehobene Anerkennung",
      totalRecognitions: "Gesamte Anerkennungen",
      topPublications: "Top-Publikationen",
      tieredRankings: "Ranking-Einstufungen",
      otherRecognitions: "Weitere Auszeichnungen",
      band: "Band",
      viewPublication: "Publikation ansehen",
      home: "Startseite",
      positions: {
        foundingPartner: "Gründungspartner",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associate",
      },
    },
    zh: {
      partner: "合伙人",
      ofCounsel: "法律顾问",
      associate: "律师",
      contactInfo: "联系方式",
      practiceAreas: "业务领域",
      industryGroups: "行业领域",
      biography: "简介",
      education: "教育背景",
      barAdmissions: "执业资格",
      languages: "语言",
      affiliations: "专业协会",
      rankings: "排名与认可",
      publications: "出版物",
      representativeMatters: "代表案例",
      experience: "工作经历",
      contactCta: "联系方式",
      officeLabel: "办公室",
      phoneLabel: "电话",
      emailLabel: "电子邮件",
      emailUs: "发送邮件",
      callUs: "电话联系",
      downloadVCard: "下载名片",
      errorMessage: "未找到团队成员",
      loading: "加载中…",
      relatedTeam: "相关团队成员",
      viewProfile: "查看简介",
      relatedNews: "最新新闻与文章",
      featuredRecognition: "重点认可",
      totalRecognitions: "认可总数",
      topPublications: "主要出版物",
      tieredRankings: "分级排名",
      otherRecognitions: "其他认可",
      band: "等级",
      viewPublication: "查看出版物",
      home: "首页",
      positions: {
        foundingPartner: "创始合伙人",
        partner: "合伙人",
        ofCounsel: "法律顾问",
        seniorAssociate: "高级律师",
        associate: "律师",
      },
    },
    ko: {
      partner: "파트너",
      ofCounsel: "고문",
      associate: "어소시에이트",
      contactInfo: "연락처",
      practiceAreas: "업무 분야",
      industryGroups: "산업 분야",
      biography: "약력",
      education: "학력",
      barAdmissions: "변호사 자격",
      languages: "사용 언어",
      affiliations: "전문 협회",
      rankings: "순위 및 인정",
      publications: "출판물",
      representativeMatters: "대표 사건",
      experience: "경력",
      contactCta: "연락처",
      officeLabel: "사무소",
      phoneLabel: "전화",
      emailLabel: "이메일",
      emailUs: "이메일 보내기",
      callUs: "전화하기",
      downloadVCard: "명함 다운로드",
      errorMessage: "팀원을 찾을 수 없습니다",
      loading: "로딩 중…",
      relatedTeam: "관련 팀원",
      viewProfile: "프로필 보기",
      relatedNews: "최신 뉴스 및 기사",
      featuredRecognition: "주요 인정",
      totalRecognitions: "총 인정",
      topPublications: "주요 출판물",
      tieredRankings: "등급별 순위",
      otherRecognitions: "기타 인정",
      band: "등급",
      viewPublication: "출판물 보기",
      home: "홈",
      positions: {
        foundingPartner: "창립 파트너",
        partner: "파트너",
        ofCounsel: "고문",
        seniorAssociate: "시니어 어소시에이트",
        associate: "어소시에이트",
      },
    },
    ja: {
      partner: "パートナー",
      ofCounsel: "オブ・カウンセル",
      associate: "アソシエイト",
      contactInfo: "連絡先",
      practiceAreas: "取扱分野",
      industryGroups: "業界グループ",
      biography: "経歴",
      education: "学歴",
      barAdmissions: "弁護士資格",
      languages: "使用言語",
      affiliations: "所属団体",
      rankings: "ランキング・受賞歴",
      publications: "出版物",
      representativeMatters: "代表的案件",
      experience: "経験",
      contactCta: "連絡先",
      officeLabel: "事務所",
      phoneLabel: "電話",
      emailLabel: "メール",
      emailUs: "メールを送る",
      callUs: "電話する",
      downloadVCard: "名刺をダウンロード",
      errorMessage: "チームメンバーが見つかりません",
      loading: "読み込み中…",
      // U+200B tras 関連: el corte cae ahí y no antes de la ー final (関連チームメンバ|ー a 320 px)
      relatedTeam: "関連\u200Bチームメンバー",
      viewProfile: "プロフィールを見る",
      relatedNews: "最新ニュース・記事",
      featuredRecognition: "注目の評価",
      totalRecognitions: "評価総数",
      topPublications: "主要出版物",
      tieredRankings: "段階別ランキング",
      otherRecognitions: "その他の評価",
      band: "バンド",
      viewPublication: "出版物を見る",
      home: "ホーム",
      positions: {
        foundingPartner: "創立パートナー",
        partner: "パートナー",
        ofCounsel: "オブ・カウンセル",
        seniorAssociate: "シニアアソシエイト",
        associate: "アソシエイト",
      },
    },
    ar: {
      partner: "شريك",
      ofCounsel: "مستشار قانوني",
      associate: "محامي",
      contactInfo: "معلومات الاتصال",
      practiceAreas: "مجالات الممارسة",
      industryGroups: "المجموعات الصناعية",
      biography: "السيرة الذاتية",
      education: "التعليم",
      barAdmissions: "تراخيص المحاماة",
      languages: "اللغات",
      affiliations: "العضويات المهنية",
      rankings: "التصنيفات والتقدير",
      publications: "المنشورات",
      representativeMatters: "القضايا التمثيلية",
      experience: "الخبرة",
      contactCta: "التواصل",
      officeLabel: "المكتب",
      phoneLabel: "الهاتف",
      emailLabel: "البريد الإلكتروني",
      emailUs: "إرسال بريد إلكتروني",
      callUs: "اتصل",
      downloadVCard: "تحميل بطاقة العمل",
      errorMessage: "لم يتم العثور على عضو الفريق",
      loading: "جاري التحميل…",
      relatedTeam: "أعضاء الفريق ذوو الصلة",
      viewProfile: "عرض الملف الشخصي",
      relatedNews: "آخر الأخبار والمقالات",
      featuredRecognition: "التقدير المميز",
      totalRecognitions: "إجمالي التقديرات",
      topPublications: "أهم المنشورات",
      tieredRankings: "التصنيفات حسب المستوى",
      otherRecognitions: "تقديرات أخرى",
      band: "الفئة",
      viewPublication: "عرض المنشور",
      home: "الرئيسية",
      positions: {
        foundingPartner: "شريك مؤسس",
        partner: "شريك",
        ofCounsel: "مستشار قانوني",
        seniorAssociate: "محامي أول",
        associate: "محامي",
      },
    },
    ru: {
      partner: "Партнёр",
      ofCounsel: "Советник",
      associate: "Юрист",
      contactInfo: "Контакты",
      practiceAreas: "Области практики",
      industryGroups: "Отраслевые группы",
      biography: "Биография",
      education: "Образование",
      barAdmissions: "Адвокатские лицензии",
      languages: "Языки",
      affiliations: "Профессиональные ассоциации",
      rankings: "Рейтинги и признание",
      publications: "Публикации",
      representativeMatters: "Показательные дела",
      experience: "Опыт",
      contactCta: "Контакты",
      officeLabel: "Офис",
      phoneLabel: "Телефон",
      emailLabel: "Эл. почта",
      emailUs: "Написать на эл. почту",
      callUs: "Позвонить",
      downloadVCard: "Скачать визитку",
      errorMessage: "Член команды не найден",
      loading: "Загрузка…",
      relatedTeam: "Связанные члены команды",
      viewProfile: "Посмотреть профиль",
      relatedNews: "Последние новости и статьи",
      featuredRecognition: "Главное признание",
      totalRecognitions: "Всего признаний",
      topPublications: "Ведущие публикации",
      tieredRankings: "Уровневые рейтинги",
      otherRecognitions: "Другие признания",
      band: "Уровень",
      viewPublication: "Смотреть публикацию",
      home: "Главная",
      positions: {
        foundingPartner: "Учредитель",
        partner: "Партнёр",
        ofCounsel: "Советник",
        seniorAssociate: "Старший юрист",
        associate: "Юрист",
      },
    },
    fr: {
      partner: "Associé",
      ofCounsel: "Of Counsel",
      associate: "Collaborateur",
      contactInfo: "Coordonnées",
      practiceAreas: "Domaines de pratique",
      industryGroups: "Groupes sectoriels",
      biography: "Biographie",
      education: "Formation",
      barAdmissions: "Inscriptions au barreau",
      languages: "Langues",
      affiliations: "Affiliations professionnelles",
      rankings: "Classements et distinctions",
      publications: "Publications",
      representativeMatters: "Affaires représentatives",
      experience: "Expérience",
      contactCta: "Contact",
      officeLabel: "Bureau",
      phoneLabel: "Téléphone",
      emailLabel: "E-mail",
      emailUs: "Envoyer un e-mail",
      callUs: "Appeler",
      downloadVCard: "Télécharger vCard",
      errorMessage: "Membre de l’équipe introuvable",
      loading: "Chargement…",
      relatedTeam: "Autres membres de l’équipe",
      viewProfile: "Voir le profil",
      relatedNews: "Dernières actualités et articles",
      featuredRecognition: "Reconnaissance mise en avant",
      totalRecognitions: "Total des reconnaissances",
      topPublications: "Principales publications",
      tieredRankings: "Classements par niveau",
      otherRecognitions: "Autres distinctions",
      band: "Bande",
      viewPublication: "Voir la publication",
      home: "Accueil",
      positions: {
        foundingPartner: "Associé fondateur",
        partner: "Associé",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Collaborateur senior",
        associate: "Collaborateur",
      },
    },
    it: {
      partner: "Partner",
      ofCounsel: "Of Counsel",
      associate: "Associato",
      contactInfo: "Contatti",
      practiceAreas: "Aree di pratica",
      industryGroups: "Settori industriali",
      biography: "Biografia",
      education: "Formazione",
      barAdmissions: "Iscrizioni all'albo",
      languages: "Lingue",
      affiliations: "Affiliazioni professionali",
      rankings: "Classifiche e riconoscimenti",
      publications: "Pubblicazioni",
      representativeMatters: "Casi rappresentativi",
      experience: "Esperienza",
      contactCta: "Contatti",
      officeLabel: "Ufficio",
      phoneLabel: "Telefono",
      emailLabel: "E-mail",
      emailUs: "Invia e-mail",
      callUs: "Chiama",
      downloadVCard: "Scarica vCard",
      errorMessage: "Membro del team non trovato",
      loading: "Caricamento…",
      relatedTeam: "Membri del team correlati",
      viewProfile: "Visualizza profilo",
      relatedNews: "Ultime notizie e articoli",
      featuredRecognition: "Riconoscimento in evidenza",
      totalRecognitions: "Riconoscimenti totali",
      topPublications: "Pubblicazioni principali",
      tieredRankings: "Classifiche per livello",
      otherRecognitions: "Altri riconoscimenti",
      band: "Fascia",
      viewPublication: "Vedi pubblicazione",
      home: "Home",
      positions: {
        foundingPartner: "Partner fondatore",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associato",
      },
    },
  };

  const editableContent = useCmsContent("profile", content);
  const t = editableContent[language] || editableContent.en;

  // "Socios" con el nombre del menú en cada idioma (E5): enlace de vuelta y miga de pan
  const partnersLabel = (cmsChrome[language] ?? cmsChrome.es).nav[2].label;

  // Fecha de las notas: el formateador compartido del Monitor Laboral (lib/newsDate)
  const formatDate = (date: string | Date | null) => formatNewsDate(date, language);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getSeniorityLabel = () => {
    if (member?.isPartner) return t.partner;
    if (member?.title === "Of Counsel") return t.ofCounsel;
    return t.associate;
  };

  const handleDownloadVCard = () => {
    if (isStaticSite) return;
    if (member) {
      window.location.href = `/api/team/${member.slug}/vcard?lang=${language}`;
    }
  };

  // Misma regla que /team (isNamedOnTeamPage): un socio sin foto confirmada tampoco aparece aquí.
  // Tres como máximo: una fila de tres desde md, sin celdas vacías.
  const relatedMembers = allTeamMembers?.filter(m => 
    m.id !== member?.id && 
    isNamedOnTeamPage(m) &&
    ((m.isPartner && member?.isPartner) || 
     (m.title === member?.title))
  ).slice(0, 3);

  // Áreas de práctica e industrias de la persona: solo las que trae su propio registro (ids o
  // slugs en practiceGroupIds / industryGroupIds, de la tabla team_member_practice_groups). Hoy
  // ningún registro las trae y las secciones no se pintan: antes cada ficha listaba todas las
  // prácticas de la firma, una afirmación sin confirmar sobre cada persona.
  const memberRecord = member as (TeamMember & { practiceGroupIds?: string[] | null; industryGroupIds?: string[] | null }) | undefined;
  const memberPracticeRefs = memberRecord?.practiceGroupIds ?? [];
  const memberIndustryRefs = memberRecord?.industryGroupIds ?? [];
  const memberPracticeGroups = (practiceGroups ?? []).filter(g => memberPracticeRefs.includes(g.id) || memberPracticeRefs.includes(g.slug));
  const memberIndustryGroups = (industryGroups ?? []).filter(g => memberIndustryRefs.includes(g.id) || memberIndustryRefs.includes(g.slug));

  // Sin correo ni teléfono (el socio fundador in memoriam) no hay botones ni vCard, como no hay
  // bloque de contacto
  const isInMemoriam = isInMemoriamMember({ title: member?.title });

  // Sin viñeta: la jerarquía la dan la letra y los filetes
  const getPublicationIcon = (_publication: string): JSX.Element | null => null;

  const getPublicationPriority = (publication: string): number => {
    const pubLower = publication.toLowerCase();
    if (pubLower.includes("chambers")) return 1;
    if (pubLower.includes("legal 500")) return 2;
    if (pubLower.includes("who's who") || pubLower.includes("whos who")) return 3;
    if (pubLower.includes("iflr")) return 4;
    if (pubLower.includes("benchmark")) return 5;
    return 10;
  };

  const processedRankings = useMemo(() => {
    if (!member?.rankings || member.rankings.length === 0) return null;
    
    const rankings = member.rankings as Ranking[];
    
    const tieredRankings = rankings.filter(r => r.ranking && r.ranking.trim() !== "");
    const simpleRankings = rankings.filter(r => !r.ranking || r.ranking.trim() === "");
    
    const sortedTiered = [...tieredRankings].sort((a, b) => {
      const prioA = getPublicationPriority(a.publication);
      const prioB = getPublicationPriority(b.publication);
      if (prioA !== prioB) return prioA - prioB;
      const bandA = a.ranking?.match(/\d+/)?.[0];
      const bandB = b.ranking?.match(/\d+/)?.[0];
      if (bandA && bandB) return parseInt(bandA) - parseInt(bandB);
      return 0;
    });

    const uniquePublications = Array.from(new Set(rankings.map(r => r.publication)));
    const topPublications = uniquePublications
      .sort((a, b) => getPublicationPriority(a) - getPublicationPriority(b))
      .slice(0, 3);
    
    return {
      tieredRankings: sortedTiered,
      simpleRankings,
      totalCount: rankings.length,
      topPublications,
    };
  }, [member?.rankings]);

  const getMemberEducation = () => {
    if (!member?.education || member.education.length === 0) return undefined;
    return (member.education as Education[]).map(edu => ({
      school: language === "es" && edu.schoolEs ? edu.schoolEs : edu.school,
      degree: language === "es" && edu.degreeEs ? edu.degreeEs : edu.degree,
      year: edu.year
    }));
  };

  // knowsAbout del JSON-LD: las prácticas de la propia persona, no todas las de la firma
  const getMemberKnowsAbout = () => {
    const areas = memberPracticeGroups.map(pg => (language === "es" ? pg.nameEs : pg.name));
    return areas.length > 0 ? areas.slice(0, 10) : undefined;
  };

  // Ficha inexistente o de alguien que el sitio no nombra (socios sin confirmar, asociados):
  // la vista 404 del sitio, con su SEOHead page="notFound" (noindex), igual en el servidor y
  // en el build estático (E11)
  if (error || (member && !isNamed)) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-team-member-loading">
        <Header />
        <main id="main-content">
          {/* Carga con el mismo encabezado Hueso y el mismo orden que la vista final */}
          <section className={`${PROFILE_HERO} editorial-page-hero editorial-page-hero--paper`} aria-busy="true">
            <div className="ss-container">
              {/* Enlace de vuelta: barra en línea dentro del mismo bloque mb-6, con su alto de línea */}
              <div className="mb-6">
                <Skeleton className="inline-block h-4 w-24 bg-ss-rule align-middle" />
              </div>
              <div className={PROFILE_GRID}>
                <div className={PROFILE_IDENTITY_CELL}>
                  <Skeleton className="h-3 w-28 bg-ss-rule mb-4" />
                  <Skeleton className="h-12 w-4/5 bg-ss-rule mb-3" />
                  <Skeleton className="h-12 w-3/5 bg-ss-rule mb-4" />
                  <Skeleton className="h-5 w-40 bg-ss-rule" />
                </div>
                <div className={PROFILE_ACTIONS_CELL}>
                  <Skeleton className="h-[44px] w-full bg-ss-rule sm:max-w-[15rem]" />
                </div>
                <Skeleton className={`${PROFILE_PHOTO_CELL} rounded-none bg-ss-rule`} />
              </div>
            </div>
          </section>
          {/* Cuerpo en la rejilla de la vista final (SplitSection): título a la izquierda desde lg;
              biografía y las tres filas de "Equipo relacionado", para que el pie no salte. La
              biografía empieza en la misma columna que la lista (sin prose), con 44rem de medida */}
          <div className="py-16 lg:py-20">
            <div className="ss-container space-y-12 lg:space-y-16">
              <SplitSection aside={<Skeleton className="h-7 w-40 bg-ss-rule" />}>
                <div className="max-w-[44rem] space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </SplitSection>
              <RelatedTeamSkeleton />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Sin traducción (falló o no llegó), el original en inglés marcado lang="en" dir="ltr";
  // antes quedaba null y desaparecían el cargo, la práctica y la biografía.
  const translated: Partial<typeof translatedFields> = hasTranslation ? translatedFields : {};
  const localizedTitle = pickLocalized(language, translated.title, member?.title, member?.titleEs);
  const localizedRole = pickLocalized(language, translated.role, member?.role, member?.roleEs);
  const localizedBio = pickLocalized(language, translated.bio, member?.bio, member?.bioEs);
  const displayTitle = localizedTitle.text;
  const displayBio = localizedBio.text;
  const profilePhotoSrcSet = getTeamPhotoSrcSet(member?.imageUrl);
  // Descripción: la primera oración de la biografía en el idioma de la página; si solo hay el
  // texto de respaldo en otro idioma, la descripción general del equipo en este idioma
  const seoDescription = !localizedBio.lang ? metaDescription(displayBio) || undefined : undefined;

  // Correo y teléfono propios (lib/partnerContact, la misma regla que la frase de /contact):
  // si la ficha repite los generales de la firma (hoy, todas), ni "Enviar correo" ni "Llamar"
  // ni bloque de contacto: no son líneas directas y ya están en el pie (E7; G6 cambia D8)
  const ownContact = directContact(member, firmContact);
  const showContactList = !!(ownContact.email || ownContact.phone);

  // Botones del encabezado: correo y teléfono solo si son directos; "Descargar vCard" se queda
  // (salvo in memoriam y en el build estático, donde no hace nada)
  const showVCard = !isStaticSite && !isInMemoriam && !!(member?.email || member?.phone);
  const actionCount = (ownContact.email ? 1 : 0) + (ownContact.phone ? 1 : 0) + (showVCard ? 1 : 0);
  const showActions = actionCount > 0;

  return (
    <div className="min-h-screen bg-background" data-testid="page-team-member-detail">
      {member && (
        <SEOHead
          page="team"
          language={language}
          customTitle={detailTitle(member.name)}
          customDescription={seoDescription}
          customPath={`/team/${member.slug}`}
        />
      )}
      <Header />
      
      {/* JSON-LD solo de quien el sitio nombra (isNamedOnTeamPage): ni socios sin confirmar ni
          asociados (los demás reciben la 404). Person enlaza con la firma por @id (#organization)
          y su imagen va con URL absoluta (PersonJsonLd, E18); la miga de pan nombra la sección
          como el menú. */}
      {member && isNamed && (
        <>
          <PersonJsonLd
            name={member.name}
            jobTitle={displayTitle || member.title}
            email={ownContact.email}
            telephone={ownContact.phone}
            imageUrl={member.imageUrl}
            url={`https://www.santossaucedo.com/team/${member.slug}`}
            linkedinUrl={member.linkedinUrl}
            education={getMemberEducation()}
            languages={member.languages as string[] | undefined}
            knowsAbout={getMemberKnowsAbout()}
            named
            language={language}
          />
          <BreadcrumbJsonLd
            items={[
              { name: t.home, url: "https://www.santossaucedo.com" },
              { name: partnersLabel, url: "https://www.santossaucedo.com/team" },
              { name: member.name, url: `https://www.santossaucedo.com/team/${member.slug}` }
            ]}
            language={language}
          />
        </>
      )}
      
      {/* El encabezado va dentro de main (el h1 queda en el landmark y en "Saltar al contenido");
          el relleno vertical está en el envoltorio del cuerpo, no en main, para que la banda
          siga pegada a la cabecera. Encabezado en papel, como el del artículo
          (.editorial-page-hero--paper): Hueso, nombre en Azul Marino, filete inferior en Línea,
          § y foco en Azul Marino; la cabecera sigue en Azul Profundo. */}
      <main id="main-content">
        <section className={`${PROFILE_HERO} editorial-page-hero editorial-page-hero--paper`} data-testid="section-team-member-hero">
          {/* Mismo contenedor que la cabecera y el cuerpo: la foto arranca en el borde del logo */}
          <div className="ss-container">
            <div>
              {/* Vuelta a /team: enlace de texto (etiqueta con flecha), como toda navegación */}
              <div className="mb-6">
                <BackTextLink href="/team" testId="link-back-to-team">
                  {partnersLabel}
                </BackTextLink>
              </div>
              {/* Lectores de pantalla: nombre, botones y foto, en ese orden. Teléfono: retrato de
                  112 px al lado del nombre y el cargo, y los botones debajo. Desde md cada bloque
                  va a su celda: foto a la izquierda en las dos filas y el texto alineado con su
                  borde superior. */}
              <div className={PROFILE_GRID}>
                {/* Texto al inicio de la línea (a la derecha en árabe, junto al retrato) */}
                <div className={`min-w-0 text-start ${PROFILE_IDENTITY_CELL}`}>
                  {/* Eyebrow del expediente: "§ 03 —— Socio" (sobre Hueso, § y cifras en Azul Marino;
                      la lima solo va sobre Azul Profundo). La categoría va aquí y no en una píldora. */}
                  <Eyebrow
                    num="03"
                    tone="paper"
                    label={getSeniorityLabel()}
                    labelTestId="badge-seniority"
                    className="mb-4"
                  />
                  <h1 
                    className="ss-hero-detail mb-3"
                    data-testid="text-team-member-name"
                  >
                    {member?.name}
                  </h1>
                  {(() => {
                    const normalize = (s: string) =>
                      s
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .trim()
                        .toLowerCase();
                    const seniorityLabel = getSeniorityLabel();
                    const titleMatchesSeniority =
                      displayTitle &&
                      seniorityLabel &&
                      normalize(displayTitle) === normalize(seniorityLabel);
                    if (titleMatchesSeniority) return null;
                    // Sin traducción, el cargo y la práctica en inglés van en <bdi lang="en">: el
                    // párrafo sigue la dirección de la página (en árabe, a la derecha bajo el nombre)
                    return (
                      <p
                        className="mb-1"
                        data-testid="text-team-member-title"
                      >
                        <LocalizedRun value={localizedTitle} />
                        {isTranslating && (
                          <Loader2 className="inline-block w-4 h-4 ms-2 animate-spin text-ss-medio" aria-hidden="true" />
                        )}
                      </p>
                    );
                  })()}
                  <p
                    data-testid="text-team-member-role"
                  >
                    <LocalizedRun value={localizedRole} />
                  </p>
                </div>

                {/* Botones iguales de contorno Azul Marino de 1 px, texto Azul Marino y, al pasar el
                    cursor, relleno Azul Marino con texto blanco; sin iconos: ninguno pesa más que el
                    nombre. Teléfono: uno debajo de otro, bajo el retrato y el nombre. Desde sm, una
                    fila de columnas iguales (en md, a todo lo ancho bajo el retrato y el nombre;
                    desde lg, al pie de la columna del texto). "Enviar correo" y "Llamar" solo con
                    datos directos (G6); in memoriam, ni botones ni vCard; en el build estático,
                    sin vCard. */}
                {showActions && (
                  <div className={`grid grid-cols-1 ${ACTIONS_COLUMNS[actionCount - 1] ?? ""} content-start gap-3 ${PROFILE_ACTIONS_CELL}`}>
                    {ownContact.email && (
                      <Button
                        variant="outline"
                        className={PROFILE_BUTTON}
                        asChild
                        data-testid="button-email"
                      >
                        <a href={`mailto:${ownContact.email}`}>
                          {t.emailUs}
                        </a>
                      </Button>
                    )}
                    {ownContact.phone && (
                      <Button
                        variant="outline"
                        className={PROFILE_BUTTON}
                        asChild
                        data-testid="button-phone"
                      >
                        {/* Sin espacios (RFC 3966): el mismo href que el del bloque de contacto */}
                        <a href={`tel:${ownContact.phone.replace(/\s+/g, "")}`}>
                          {t.callUs}
                        </a>
                      </Button>
                    )}
                    {showVCard && (
                      <Button
                        variant="outline"
                        className={PROFILE_BUTTON}
                        onClick={handleDownloadVCard}
                        data-testid="button-download-vcard"
                      >
                        {t.downloadVCard}
                      </Button>
                    )}
                  </div>
                )}
                <div
                  className={`group relative overflow-hidden ${PROFILE_PHOTO_CELL}`}
                  data-testid="container-profile-photo"
                >
                  {member?.imageUrl ? (
                    <>
                      <img
                        src={member.imageUrl}
                        data-portrait-slug={member.slug}
                        // WebP de 360/652 px en vez del PNG de 0,5–1 MB; si la variante no
                        // existe donde se sirven las fotos, onError vuelve al original (src)
                        {...(profilePhotoSrcSet ? { srcSet: profilePhotoSrcSet, sizes: PROFILE_PHOTO_SIZES } : {})}
                        // alt vacío: el nombre ya está en el h1 de al lado (antes se leía dos veces)
                        alt=""
                        // El tratamiento conmemorativo de Mario se aplica desde ss26.css.
                        className="ss-photo absolute inset-0 h-full w-full object-cover object-top"
                        style={{ objectPosition: getTeamPhotoObjectPosition(member.slug) }}
                        loading="eager"
                        {...highFetchPriority}
                        decoding="async"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                          if (!fallbackToOriginalSrc(e)) e.currentTarget.style.display = "none";
                        }}
                        data-testid="img-profile-photo"
                      />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-ss-rule text-ss-marino text-6xl font-heading font-normal"
                      data-testid="avatar-fallback"
                    >
                      {member?.name ? getInitials(member.name) : ''}
                    </div>
                  )}
                </div>
                <div
                  aria-hidden="true"
                  className="hidden md:col-start-2 md:row-span-2 md:row-start-1 md:block bg-ss-rule"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Relleno vertical del cuerpo (antes en main, que ahora también contiene el encabezado) */}
        <div className="py-16 lg:py-20">
          {/* Rejilla editorial de la portada (SplitSection, G1): desde lg, cada h2 en las columnas
              1–4 y su contenido desde la 5 (también la biografía, con su medida de lectura: así
              empieza en la misma columna que "Equipo relacionado"); en teléfono y tableta, apilado. Las secciones del antiguo lateral (contacto, reconocimiento
              destacado) son filas más. Sin aparición al hacer scroll (G3). */}
          <div className="ss-container space-y-12 lg:space-y-16">
            {(displayBio || ((member?.bio || member?.bioEs) && isTranslating)) && (
              <section data-testid="section-biography">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm flex items-center gap-3"
                      data-testid="text-biography-title"
                    >
                      {t.biography}
                      {isTranslating && (
                        <Loader2 className="w-4 h-4 animate-spin text-ss-medio" aria-hidden="true" />
                      )}
                    </h2>
                  }
                >
                  {/* Biografía sin traducción: bloque largo en el idioma de origen, marcado lang y
                      dir="ltr" (en árabe, alineado a la izquierda, como el resumen de las prácticas
                      y el cuerpo de las notas); los textos cortos de respaldo van en <bdi>. Medida
                      de lectura de 44rem en todos los anchos, desde el inicio de la columna del
                      cuerpo (en árabe, a la derecha, donde empiezan las demás filas). */}
                  <div
                    className="max-w-[44rem]"
                    data-testid="container-biography"
                    lang={localizedBio.lang}
                    dir={localizedBio.lang ? "ltr" : undefined}
                  >
                    {displayBio ? (() => {
                      // "Santos & Saucedo" sin partirse entre líneas (espacios duros, E16)
                      const bioText = keepFirmName(displayBio);
                      const paragraphs = bioText.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);
                      const [first, ...rest] = paragraphs.length ? paragraphs : [bioText];
                      return (
                        <LeadParagraph
                          firstParagraph={first}
                          restParagraphs={rest}
                          testId="lead-biography"
                        />
                      );
                    })() : (
                      <div className="flex items-center gap-2 text-ss-medio">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span data-testid="text-translation-pending">
                          {language === 'de' ? 'Übersetzung lädt…' :
                           language === 'zh' ? '翻译加载中…' :
                           language === 'ko' ? '번역 로딩 중…' :
                           language === 'ja' ? '翻訳を読み込み中…' :
                           language === 'ar' ? 'جاري تحميل الترجمة…' :
                           language === 'ru' ? 'Загрузка перевода…' :
                           language === 'fr' ? 'Traduction en cours…' :
                           language === 'it' ? 'Caricamento traduzione…' :
                           'Loading translation…'}
                        </span>
                      </div>
                    )}
                  </div>
                </SplitSection>
              </section>
            )}

            {/* Contacto: lista de datos con filete superior, sin fondo (oficina, teléfono, correo),
                sin botones ni frase de venta. Solo con un teléfono o un correo propios, y solo esos:
                los generales de la firma ya están en el pie (E7, G6). In memoriam, nada. */}
            {showContactList && (
              <section data-testid="section-contact-cta">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-contact-cta-title"
                    >
                      {t.contactCta}
                    </h2>
                  }
                >
                  <dl className="grid gap-4 border-t border-ss-rule pt-6 text-base leading-[1.5] text-ss-tinta sm:grid-cols-3 sm:gap-x-6" data-testid="text-contact-cta-subtitle">
                    <div>
                      <dt className="ss-label text-ss-medio">{t.officeLabel}</dt>
                      {/* <bdi>: en árabe el punto de "N.L." saltaba al principio de la línea */}
                      <dd className="mt-1"><bdi>San Pedro Garza García, N.L.</bdi></dd>
                    </div>
                    {ownContact.phone && (
                      <div>
                        <dt className="ss-label text-ss-medio">{t.phoneLabel}</dt>
                        <dd className="mt-1">
                          {/* dir="ltr": en árabe el número se leía "2086 8335 81 52+" */}
                          <a
                            href={`tel:${ownContact.phone.replace(/\s+/g, "")}`}
                            dir="ltr"
                            className="text-ss-marino underline-offset-4 hover:underline"
                            data-testid="button-call-contact"
                          >
                            {ownContact.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {ownContact.email && (
                      <div>
                        <dt className="ss-label text-ss-medio">{t.emailLabel}</dt>
                        <dd className="mt-1 [overflow-wrap:anywhere]">
                          <a
                            href={`mailto:${ownContact.email}`}
                            dir="ltr"
                            className="text-ss-marino underline-offset-4 hover:underline"
                            data-testid="button-email-contact"
                          >
                            {ownContact.email}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </SplitSection>
              </section>
            )}

            {processedRankings && (
              <section data-testid="section-rankings">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm flex items-baseline gap-3"
                      data-testid="text-rankings-title"
                    >
                      <span>{t.rankings}</span>
                      <span
                        className="ms-auto ss-label ss-num text-ss-medio"
                        data-testid="badge-rankings-count"
                      >
                        {processedRankings.totalCount}
                      </span>
                    </h2>
                  }
                >
                  {processedRankings.tieredRankings.length > 0 && (
                    <div className="mb-6" data-testid="container-tiered-rankings">
                      <h3 className="ss-label text-ss-medio mb-2">
                        {t.tieredRankings}
                      </h3>
                      <div>
                        {processedRankings.tieredRankings.map((ranking, index) => (
                          <RankingItemTranslated
                            key={index}
                            ranking={ranking}
                            index={index}
                            language={language}
                            memberId={member?.id?.toString() || ''}
                            isTiered={true}
                            getPublicationIcon={getPublicationIcon}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {processedRankings.simpleRankings.length > 0 && (
                    <div data-testid="container-simple-rankings">
                      {processedRankings.tieredRankings.length > 0 && (
                        <h3 className="ss-label text-ss-medio mb-2">
                          {t.otherRecognitions}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        {processedRankings.simpleRankings.map((ranking, index) => (
                          <RankingItemTranslated
                            key={index}
                            ranking={ranking}
                            index={processedRankings.tieredRankings.length + index}
                            language={language}
                            memberId={member?.id?.toString() || ''}
                            isTiered={false}
                            getPublicationIcon={getPublicationIcon}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </SplitSection>
              </section>
            )}

            {/* Reconocimiento destacado (antes en el lateral): cifra y publicaciones principales */}
            {processedRankings && (
              <section data-testid="section-featured-recognition">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-featured-recognition-title"
                    >
                      {t.featuredRecognition}
                    </h2>
                  }
                >
                  <div className="flex items-baseline gap-3 mb-5">
                    <span
                      className="ss-figure text-[44px]"
                      data-testid="text-total-recognitions-count"
                    >
                      {processedRankings.totalCount}
                    </span>
                    <span className="ss-label text-ss-medio">
                      {t.totalRecognitions}
                    </span>
                  </div>

                  {processedRankings.topPublications.length > 0 && (
                    <div data-testid="container-top-publications">
                      <p className="ss-label text-ss-medio mb-2">
                        {t.topPublications}
                      </p>
                      <div className="space-y-2">
                        {processedRankings.topPublications.map((pub, index) => (
                          <div
                            key={index}
                            className="text-base text-ss-tinta"
                            data-testid={`item-top-publication-${index}`}
                          >
                            <span className="block truncate">{pub}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SplitSection>
              </section>
            )}

            {memberPracticeGroups.length > 0 && (
              <section data-testid="section-practice-areas">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-practice-areas-title"
                    >
                      {t.practiceAreas}
                    </h2>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {memberPracticeGroups.map((group) => (
                      <PracticeGroupBadge
                        key={group.id}
                        group={group}
                        language={language}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {memberIndustryGroups.length > 0 && (
              <section data-testid="section-industry-groups">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-industry-groups-title"
                    >
                      {t.industryGroups}
                    </h2>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {memberIndustryGroups.map((group) => (
                      <IndustryGroupBadge
                        key={group.id}
                        group={group}
                        language={language}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {member?.education && member.education.length > 0 && (
              <section data-testid="section-education">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-education-title"
                    >
                      {t.education}
                    </h2>
                  }
                >
                  <div className="space-y-4">
                    {(member.education as Education[]).map((edu, index) => (
                      <EducationItemTranslated
                        key={index}
                        edu={edu}
                        index={index}
                        language={language}
                        memberId={member.id.toString()}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {member?.barAdmissions && member.barAdmissions.length > 0 && (
              <section data-testid="section-bar-admissions">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-bar-admissions-title"
                    >
                      {t.barAdmissions}
                    </h2>
                  }
                >
                  <div className="flex flex-wrap gap-3">
                    {(member.barAdmissions as BarAdmission[]).map((admission, index) => (
                      <BarAdmissionItemTranslated
                        key={index}
                        admission={admission}
                        index={index}
                        language={language}
                        memberId={member.id.toString()}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {member?.languages && member.languages.length > 0 && (
              <section data-testid="section-languages">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-languages-title"
                    >
                      {t.languages}
                    </h2>
                  }
                >
                  <div className="flex flex-wrap gap-3">
                    {(member.languages as string[]).map((lang, index) => (
                      <LanguageItemTranslated
                        key={index}
                        lang={lang}
                        index={index}
                        language={language}
                        memberId={member.id.toString()}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {member?.affiliations && member.affiliations.length > 0 && (
              <section data-testid="section-affiliations">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-affiliations-title"
                    >
                      {t.affiliations}
                    </h2>
                  }
                >
                  <div className="space-y-3">
                    {(member.affiliations as Affiliation[]).map((affiliation, index) => (
                      <AffiliationItemTranslated
                        key={index}
                        affiliation={affiliation}
                        index={index}
                        language={language}
                        memberId={member.id.toString()}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {member?.publications && member.publications.length > 0 && (
              <section data-testid="section-publications">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-publications-title"
                    >
                      {t.publications}
                    </h2>
                  }
                >
                  <div className="space-y-4">
                    {(member.publications as Publication[]).map((pub, index) => (
                      <PublicationItemTranslated
                        key={index}
                        pub={pub}
                        index={index}
                        language={language}
                        memberId={member.id.toString()}
                        viewPublicationText={t.viewPublication}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {member?.representativeMatters && member.representativeMatters.length > 0 && (
              <section data-testid="section-representative-matters">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-representative-matters-title"
                    >
                      {t.representativeMatters}
                    </h2>
                  }
                >
                  <div className="space-y-3">
                    {(member.representativeMatters as RepresentativeMatter[]).map((matter, index) => (
                      <RepresentativeMatterTranslated
                        key={index}
                        matter={matter}
                        index={index}
                        language={language}
                        memberId={member.id.toString()}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {member?.experience && member.experience.length > 0 && (
              <section data-testid="section-experience">
                <SplitSection
                  aside={
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-experience-title"
                    >
                      {t.experience}
                    </h2>
                  }
                >
                  <div className="space-y-4">
                    {(member.experience as any[]).map((exp, index) => (
                      <div
                        key={index}
                        className="border-s border-ss-rule ps-4 py-1"
                        data-testid={`item-experience-${index}`}
                      >
                        <p className="font-semibold text-ss-tinta">
                          {language === "es" && exp.positionEs ? exp.positionEs : exp.position}
                        </p>
                        <p className="text-ss-medio">
                          {exp.company}
                          {(exp.startYear || exp.endYear) && (
                            <span className="ml-2 text-base">
                              ({exp.startYear}{exp.endYear ? ` - ${exp.endYear}` : ' - Present'})
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}

            {/* Equipo relacionado: el h2 en el aside y las personas en el cuerpo, con filete
                superior en cada una (como mucho tres: la fila de tableta se llena). Mientras llega
                /api/team, su esqueleto ocupa el sitio. */}
            {isLoadingTeam && <RelatedTeamSkeleton />}
            {relatedMembers && relatedMembers.length > 0 && (
              <section data-testid="section-related-team">
                <SplitSection
                  aside={
                    // Mismo nivel que "Biografía" y "Más del Monitor Laboral" (.ss-h2-sm, E7)
                    <h2
                      className="ss-h2-sm"
                      data-testid="text-related-team-title"
                    >
                      {t.relatedTeam}
                    </h2>
                  }
                >
                  <div className={RELATED_GRID}>
                    {relatedMembers.map((relatedMember) => (
                      <RelatedTeamMemberCard
                        key={relatedMember.id}
                        relatedMember={relatedMember}
                        language={language}
                        getInitials={getInitials}
                      />
                    ))}
                  </div>
                </SplitSection>
              </section>
            )}
          </div>

          {relatedNews && relatedNews.length > 0 && (
            <section
              className="mt-16 pt-12"
              data-testid="section-related-news"
            >
              <div className="ss-container">
                <h2 
                  className="ss-h2-sm mb-8"
                  data-testid="text-related-news-title"
                >
                  {t.relatedNews}
                </h2>
                {/* Filas de filete, como la lista del Monitor Laboral: categoría y fecha en etiqueta,
                    titular en la romana que es el enlace y entradilla; sin foto, loseta ni "Leer más" */}
                <ul className="border-t border-ss-rule">
                  {relatedNews.map((article) => {
                    const headline = language === "es" ? article.titleEs : article.title;
                    const category = article.category
                      ? (language === "es" ? article.categoryEs : article.category.charAt(0).toUpperCase() + article.category.slice(1))
                      : null;
                    const date = formatDate(article.date);
                    return (
                      <li
                        key={article.id}
                        className="grid grid-cols-1 gap-y-3 border-b border-ss-rule py-8 lg:grid-cols-12 lg:gap-x-6"
                        data-testid={`card-related-news-${article.slug}`}
                      >
                        <p className="ss-label ss-num lg:col-span-4 lg:pt-2 [&_span]:[font-size:inherit]">
                          {category && (
                            <span className="text-ss-marino" data-testid={`badge-news-category-${article.slug}`}>
                              {category}
                            </span>
                          )}
                          {category && date && <span aria-hidden="true" className="text-ss-medio"> · </span>}
                          <span className="text-ss-medio" data-testid={`text-news-date-${article.slug}`}>
                            {date}
                          </span>
                        </p>
                        <div className="lg:col-span-7 lg:col-start-5 xl:col-span-6">
                          <h3
                            className="ss-display text-[clamp(22px,1.7vw,25px)] font-normal leading-[1.25] tracking-[-0.01em] text-ss-marino"
                            data-testid={`text-news-title-${article.slug}`}
                          >
                            <Link
                              href={`/news/${article.slug}`}
                              className="inline-link hover:underline decoration-1 underline-offset-4"
                            >
                              {headline}
                            </Link>
                          </h3>
                          {(language === "es" ? article.excerptEs : article.excerpt) && (
                            <p
                              className="mt-3 text-[16px] leading-[1.55] text-ss-tinta [text-wrap:pretty]"
                              data-testid={`text-news-excerpt-${article.slug}`}
                            >
                              {language === "es" ? article.excerptEs : article.excerpt}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
