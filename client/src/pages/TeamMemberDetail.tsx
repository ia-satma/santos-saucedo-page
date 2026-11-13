// Ficha de un socio, Of Counsel o integrante (/team/<slug>) con el lenguaje de la demo v3 (la demo
// no tiene ficha; ver v3/socios/perfil.css): cabecera en el azul de «Nuestros socios» con el retrato
// y el cintillo, cuerpo en piedra con la biografía y la ficha, y «Siguiente» al final.
// Se conserva todo lo del sitio: textos del panel ("profile") en 10 idiomas, traducción automática
// con su respaldo marcado lang, vCard, contacto directo, el trato in memoriam (sin contacto ni vCard,
// «(in memoriam)» sin partirse, retrato a color), la 404 de quien el sitio no nombra (E11), SEO y
// JSON-LD, la vista previa del panel y los data-testid.
import { useContentEntity, useContentPreview } from "@/features/admin/ContentPreview";
import { useCmsContent } from "@/hooks/useCmsContent";
import { lazy, Suspense, useState, useMemo, type CSSProperties, type ReactNode, type SyntheticEvent } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { LeadParagraph } from "@/components/editorial";
import { chrome26 } from "@/components/home26/chrome26";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { directContact, isInMemoriamMember } from "@/lib/partnerContact";
import { keepFirmName } from "@/lib/firmName";
import defaults from "@shared/cms-defaults.json";
import type { TeamMember, PracticeGroup, IndustryGroup, Education, Affiliation, Ranking, Publication, RepresentativeMatter, BarAdmission, News, LanguageCode } from "@shared/schema";
import { V3Main, V3NextPage, useV3Lang } from "@/v3/shared";
import { useV3Content } from "@/v3/useV3Content";
import { firmPartnerFallback, firmPartners } from "@/v3/socios/partners";
import "@/v3/socios/perfil.css";

// Vista 404 del sitio (la misma carga diferida que usa App): fichas que no existen y personas
// que el sitio no nombra (E11)
const NotFound = lazy(() => import("@/pages/not-found"));

// Lado del retrato en cada tramo (--pf-w de perfil.css), para que srcset elija la variante WebP
const PROFILE_PHOTO_SIZES = "(max-width: 719px) calc(100vw - 32px), (max-width: 1023px) clamp(260px, 36vw, 340px), clamp(320px, 30vw, 440px)";

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
// como el nombre) y el punto final no salta al otro extremo.
// "(in memoriam)" sin partirse entre líneas, en todos los idiomas (espacio duro): a 320 y 390 px
// quedaba "Socio fundador (in / memoriam)"
const keepInMemoriam = (text: string | null | undefined) =>
  text?.replace(/\((in)\s+(memoriam)\)/gi, "($1 $2)");
function LocalizedRun({ value }: { value: LocalizedText }) {
  const text = keepInMemoriam(value.text);
  return value.lang ? <bdi lang={value.lang} dir="ltr">{text}</bdi> : <>{text}</>;
}

// Iconos de trazo fino de la demo (pe-ico): flecha de vuelta, flecha de enlace y descarga
function ArrowBack() {
  return <svg className="pe-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 8h-10M7 4.5L3.5 8 7 11.5" /></svg>;
}
function ArrowNext() {
  return <svg className="pe-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h10M9 4.5L12.5 8 9 11.5" /></svg>;
}
function Download() {
  return <svg className="pe-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" /></svg>;
}
// Indicador de traducción en curso: un arco que gira (quieto en Modo Mario)
function Spinner() {
  return (
    <svg className="pf-giro" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2a6 6 0 1 1-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Vuelta a /team: versalita con flecha (en árabe apunta a la derecha)
function BackLink({ href, children, testId }: { href: string; children: ReactNode; testId?: string }) {
  return (
    <Link href={href} className="pf-vuelta" data-testid={testId}>
      <ArrowBack />
      <span>{children}</span>
    </Link>
  );
}

// «Equipo relacionado» mientras llega /api/team: tres filas del mismo alto, para que el pie no salte
function RelatedTeamSkeleton({ title }: { title: string }) {
  return (
    <div className="pf-bloque" aria-busy="true">
      <h2 className="pf-k">{title}</h2>
      <ul className="pf-lista pf-lista--eq" role="list">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="pf-sk-fila" aria-hidden="true"><span className="pf-sk pf-sk--claro" /><span className="pf-sk pf-sk--claro" /></li>
        ))}
      </ul>
    </div>
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
  // quedan las iniciales sobre la piedra
  const originalSrc = relatedMember.imageUrl || undefined;
  const [avatarSrc, setAvatarSrc] = useState(() => getTeamPhotoThumb(originalSrc));

  return (
    <li>
      {/* Retrato cuadrado de 52 px, nombre en la romana y cargo en versalita: la lista de «Socios»
          de las prácticas */}
      <Link href={`/team/${relatedMember.slug}`} className="pf-eq__a" data-testid={`card-related-member-${relatedMember.slug}`}>
        <span className="pf-eq__foto" aria-hidden="true">
          <span className="pf-eq__ini">{getInitials(relatedMember.name)}</span>
          {avatarSrc && (
            <img
              src={avatarSrc}
              data-portrait-slug={relatedMember.slug}
              // alt vacío: el nombre ya es el texto del enlace
              alt=""
              width={52}
              height={52}
              loading="lazy"
              decoding="async"
              className="ss-photo"
              onError={(e) => {
                if (avatarSrc !== originalSrc) setAvatarSrc(originalSrc);
                else e.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
        <span className="pf-eq__txt">
          {/* Nombre y cargo completos: si no caben, pasan a una segunda línea */}
          <span className="pf-eq__n">{relatedMember.name}</span>
          {/* Sin traducción, el cargo en inglés va en <bdi>: aislado del árabe sin cambiar la alineación */}
          <span className="pf-eq__c"><LocalizedRun value={displayTitle} /></span>
        </span>
      </Link>
    </li>
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
    <li className="pf-fila" data-testid={`item-education-${index}`}>
      <span className="pf-fila__t">{displayDegree}</span>
      <span className="pf-fila__s">
        {displaySchool}
        {edu.year && <span className="ss-num">{displaySchool ? " · " : ""}{edu.year}</span>}
      </span>
    </li>
  );
}

function PracticeGroupLink({
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
    <li>
      <Link href={`/practice-groups/${group.slug}`} className="pf-enlace" data-testid={`badge-practice-group-${group.slug}`}>
        <span><LocalizedRun value={displayName} /></span>
        <ArrowNext />
      </Link>
    </li>
  );
}

function IndustryGroupItem({
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

  // Sin enlace: las industrias del registro no tienen página propia
  return (
    <li className="pf-fila" data-testid={`badge-industry-group-${group.slug}`}>
      <span className="pf-fila__t pf-fila__t--s"><LocalizedRun value={displayName} /></span>
    </li>
  );
}

function RankingItemTranslated({
  ranking,
  index,
  language,
  memberId,
  isTiered,
}: {
  ranking: Ranking;
  index: number;
  language: LanguageCode;
  memberId: string;
  isTiered: boolean;
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
      // Fila: publicación, banda y año en versalita, área debajo
      <li className="pf-fila" data-testid={`card-ranking-tiered-${index}`}>
        <span className="pf-fila__t pf-fila__t--s">{ranking.publication}</span>
        <span className="pf-fila__k">
          <span data-testid={`badge-ranking-band-${index}`}>{displayRanking}</span>
          {ranking.year && <span className="ss-num"> · {ranking.year}</span>}
        </span>
        {displayArea && <span className="pf-fila__s">{displayArea}</span>}
      </li>
    );
  }

  return (
    <li className="pf-fila" data-testid={`item-ranking-simple-${index}`}>
      <span className="pf-fila__t">{ranking.publication}</span>
      {ranking.year && <span className="pf-fila__s ss-num">{ranking.year}</span>}
    </li>
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

  const meta = [pub.journal, pub.year].filter(Boolean).join(" · ");
  return (
    <li className="pf-fila" data-testid={`item-publication-${index}`}>
      <span className="pf-fila__t pf-fila__t--s">{displayTitle}</span>
      {(meta || pub.url) && (
        <span className="pf-fila__s">
          {meta}
          {meta && pub.url ? " · " : ""}
          {pub.url && (
            <a href={pub.url} target="_blank" rel="noopener noreferrer">
              {viewPublicationText}
            </a>
          )}
        </span>
      )}
    </li>
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
    <li className="pf-fila" data-testid={`item-affiliation-${index}`}>
      <span className="pf-fila__t">{displayOrganization}</span>
      {displayRole && <span className="pf-fila__s">{displayRole}</span>}
    </li>
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
    <li className="pf-fila" data-testid={`badge-bar-admission-${index}`}>
      <span className="pf-fila__t">
        {displayJurisdiction}
        {admission.year && <span className="pf-fila__s ss-num"> · {admission.year}</span>}
      </span>
    </li>
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

  return <li data-testid={`badge-language-${index}`}>{displayLanguage}</li>;
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

  const meta = [matter.client, matter.year].filter(Boolean).join(" · ");
  return (
    <li className="pf-fila" data-testid={`item-representative-matter-${index}`}>
      <span className="pf-fila__t">{displayDescription}</span>
      {meta && <span className="pf-fila__s">{meta}</span>}
    </li>
  );
}

// Bloque de la ficha: rótulo en versalita (h2) y su contenido
function Bloque({ title, testId, titleTestId, children }: { title: ReactNode; testId: string; titleTestId: string; children: ReactNode }) {
  return (
    <section className="pf-bloque" data-testid={testId}>
      <h2 className="pf-k" data-testid={titleTestId}>{title}</h2>
      {children}
    </section>
  );
}

export default function TeamMemberDetail() {
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();
  const { locale: v3 } = useV3Content();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: memberData, isLoading, error } = useContentEntity<TeamMember>("team",slug);
  // Los cuatro socios siempre tienen ficha (regla del cliente, como en /team): si la API no da a uno
  // (el panel lo marcó como no público), su ficha con nombre, cargo y retrato de respaldo
  const member = memberData ?? (error ? firmPartnerFallback(slug) : undefined);

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
    present: string;
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
      present: "Present",
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
      present: "Actualidad",
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
      present: "heute",
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
      present: "至今",
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
      present: "현재",
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
      present: "現在",
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
      present: "حتى الآن",
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
      present: "по настоящее время",
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
      present: "aujourd’hui",
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
      present: "oggi",
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
  // Socios: los otros de los cuatro (siempre, en el orden de la firma; v3/socios/partners)
  const relatedMembers = member?.isPartner
    ? (allTeamMembers || error ? firmPartners(allTeamMembers).filter(m => m.slug !== member.slug).slice(0, 3) : undefined)
    : allTeamMembers?.filter(m =>
        m.id !== member?.id &&
        isNamedOnTeamPage(m) &&
        m.title === member?.title
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

  // Textos nuevos de la v3 (es/en; los demás idiomas ven el inglés, marcado lang="en") y enlaces
  const { lang, locale, attrs } = useV3Lang();
  const P = v3.perfil;
  const cmsLinks = useCmsContent("links", defaults.links);

  // «Siguiente»: la próxima persona de su grupo en el orden del panel (los cuatro socios, en el
  // orden de /team); tras la última, Contacto, como al final de /team
  const groupList = useMemo(() => {
    if (!member) return [] as TeamMember[];
    if (member.isPartner) return firmPartners(allTeamMembers);
    if (!allTeamMembers) return [] as TeamMember[];
    return allTeamMembers
      .filter((m) => !m.isPartner && isNamedOnTeamPage(m))
      .sort((a, b) => ((a.order ?? 0) - (b.order ?? 0)) || a.name.localeCompare(b.name));
  }, [allTeamMembers, member]);

  // Ficha inexistente o de alguien que el sitio no nombra (socios sin confirmar, asociados):
  // la vista 404 del sitio, con su SEOHead page="notFound" (noindex), igual en el servidor y
  // en el build estático (E11)
  if ((error && !member) || (member && !isNamed)) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <div className="ss26 min-h-screen" data-testid="page-team-member-loading">
        <Header />
        <V3Main vista="perfil">
          {/* Carga: la misma cabecera azul y el mismo cuerpo, sin datos, para que nada salte */}
          <header className="pf-cab sobre-azul" aria-busy="true">
            <div className="sh-wrap pf-cab__in">
              <div className="pf-vuelta-fila">
                <BackLink href="/team" testId="link-back-to-team">{partnersLabel}</BackLink>
              </div>
              <div className="pf-id" aria-hidden="true">
                <span className="pf-sk pf-sk--h1" style={{ width: "84%" }} />
                <span className="pf-sk pf-sk--h1" style={{ width: "56%" }} />
                <div className="pf-chy">
                  <span className="pf-chy-f" />
                  <span className="pf-sk pf-sk--t" />
                </div>
              </div>
              <div className="pf-retrato" aria-hidden="true" />
            </div>
          </header>
          <div className="pf-cuerpo">
            <div className="sh-wrap pf-cuerpo__in">
              <div className="pf-bio" aria-hidden="true">
                <span className="pf-sk pf-sk--claro" style={{ height: 12, width: "7rem", marginBottom: 18 }} />
                <span className="pf-sk pf-sk--claro" style={{ height: 22, width: "100%", marginBottom: 12 }} />
                <span className="pf-sk pf-sk--claro" style={{ height: 22, width: "100%", marginBottom: 12 }} />
                <span className="pf-sk pf-sk--claro" style={{ height: 22, width: "70%" }} />
              </div>
              <div className="pf-ficha">
                <RelatedTeamSkeleton title={t.relatedTeam} />
              </div>
            </div>
          </div>
        </V3Main>
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
  const officeLocation = firmContact.address[2] || firmContact.address[0] || "";

  // Botones de la cabecera: correo y teléfono solo si son directos; "Descargar vCard" se queda
  // (salvo in memoriam y en el build estático, donde no hace nada)
  const showVCard = !isStaticSite && !isInMemoriam && !!(member?.email || member?.phone);
  const showActions = !!(ownContact.email || ownContact.phone || showVCard);

  // Categoría (Socio, Of Counsel, Asociado) y cargo: si el cargo es la categoría, solo la
  // categoría; si el cargo ya la dice («Socio director»), solo el cargo: sin «Socio» dos veces
  const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
  const seniorityLabel = getSeniorityLabel();
  const titleMatchesSeniority = !!displayTitle && !!seniorityLabel && normalize(displayTitle) === normalize(seniorityLabel);
  const titleSaysSeniority = !!displayTitle && !!seniorityLabel && normalize(displayTitle).includes(normalize(seniorityLabel));
  const showTitle = !!displayTitle && !titleMatchesSeniority;
  const showCategory = !!seniorityLabel && (!titleSaysSeniority || titleMatchesSeniority);

  const hasBio = !!(displayBio || ((member?.bio || member?.bioEs) && isTranslating));
  const memberId = member?.id?.toString() || "";
  const education = (member?.education as Education[] | null | undefined) ?? [];
  const barAdmissions = (member?.barAdmissions as BarAdmission[] | null | undefined) ?? [];
  const languagesList = (member?.languages as string[] | null | undefined) ?? [];
  const affiliations = (member?.affiliations as Affiliation[] | null | undefined) ?? [];
  const publications = (member?.publications as Publication[] | null | undefined) ?? [];
  const matters = (member?.representativeMatters as RepresentativeMatter[] | null | undefined) ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const experience = (member?.experience as any[] | null | undefined) ?? [];
  const showRelated = !!relatedMembers && relatedMembers.length > 0;
  // Columna principal: la biografía y lo que se lee como texto (experiencia, publicaciones, asuntos)
  const hasMain = hasBio || experience.length > 0 || publications.length > 0 || matters.length > 0;
  // Ficha: los datos cortos y el equipo relacionado
  const hasFicha = memberPracticeGroups.length > 0 || memberIndustryGroups.length > 0 || showContactList ||
    education.length > 0 || barAdmissions.length > 0 || languagesList.length > 0 || affiliations.length > 0 ||
    !!processedRankings || isLoadingTeam || showRelated;

  // «Siguiente»
  const here = groupList.findIndex((m) => m.slug === member?.slug);
  const nextMember = here >= 0 && here < groupList.length - 1 ? groupList[here + 1] : null;
  const ownLang = language === "es" || language === "en";
  const navLabels = (cmsChrome[language] ?? cmsChrome.es).nav;
  const internal = (href: string | undefined, fallback: string) => (href && href.startsWith("/") ? href : fallback);

  return (
    <div className="ss26 min-h-screen" data-testid="page-team-member-detail">
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

      <V3Main vista="perfil">
        {/* Cabecera en el azul de «Nuestros socios» (se vuelve a montar con cada ficha: el retrato se
            asienta otra vez). Lectores de pantalla: vuelta, nombre, cargo, botones y retrato. */}
        <header
          key={member?.slug}
          className={`pf-cab sobre-azul${isInMemoriam ? " is-memoria" : ""}`}
          aria-labelledby="pf-h"
          data-testid="section-team-member-hero"
        >
          <div className="sh-wrap pf-cab__in">
            <div className="pf-vuelta-fila">
              {/* Vuelta a /team con el nombre del menú en cada idioma */}
              <BackLink href="/team" testId="link-back-to-team">{partnersLabel}</BackLink>
            </div>

            <div className="pf-id">
              {showCategory && <p className="pf-cat" data-testid="badge-seniority">{seniorityLabel}</p>}
              <h1 id="pf-h" className="pf-h1" tabIndex={-1} data-testid="text-team-member-name">
                {member?.name}
              </h1>
              {/* Cintillo: filete con la marca lima (in memoriam, sin el acento vivo), cargo y área.
                  Sin traducción, el cargo y el área en inglés van en <bdi lang="en">. */}
              <div className="pf-chy">
                <span className="pf-chy-f" aria-hidden="true"><span className="pf-chy-m" /></span>
                {showTitle && (
                  <p className="pf-cargo" data-testid="text-team-member-title">
                    <LocalizedRun value={localizedTitle} />
                    {isTranslating && <Spinner />}
                  </p>
                )}
                {localizedRole.text && (
                  <p className="pf-area" data-testid="text-team-member-role">
                    <LocalizedRun value={localizedRole} />
                  </p>
                )}
              </div>

              {/* "Enviar correo" y "Llamar" solo con datos directos (G6); in memoriam, ni botones ni
                  vCard; en el build estático, sin vCard */}
              {showActions && (
                <div className="pf-acc">
                  {ownContact.email && (
                    <a className="pf-boton" href={`mailto:${ownContact.email}`} data-testid="button-email">
                      <span>{t.emailUs}</span>
                    </a>
                  )}
                  {ownContact.phone && (
                    // Sin espacios (RFC 3966): el mismo href que el del bloque de contacto
                    <a className="pf-boton" href={`tel:${ownContact.phone.replace(/\s+/g, "")}`} data-testid="button-phone">
                      <span>{t.callUs}</span>
                    </a>
                  )}
                  {showVCard && (
                    <button type="button" className="pf-boton" onClick={handleDownloadVCard} data-testid="button-download-vcard">
                      <Download />
                      <span>{t.downloadVCard}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Retrato (decorativo: el nombre está en el h1); llega desde /team o la portada con la
                transición del navegador (retrato-<slug>) */}
            <figure
              className="pf-retrato"
              style={member?.slug ? ({ viewTransitionName: `retrato-${member.slug}` } as CSSProperties) : undefined}
              data-testid="container-profile-photo"
            >
              {member?.imageUrl ? (
                <img
                  src={member.imageUrl}
                  data-portrait-slug={member.slug}
                  // WebP de 360/652 px en vez del PNG; si la variante no existe donde se sirven las
                  // fotos, onError vuelve al original (src)
                  {...(profilePhotoSrcSet ? { srcSet: profilePhotoSrcSet, sizes: PROFILE_PHOTO_SIZES } : {})}
                  alt=""
                  width={652}
                  height={652}
                  // ss-photo: el retrato in memoriam conserva el trato del sitio (ss26.css)
                  className="ss-photo"
                  style={{ objectPosition: getTeamPhotoObjectPosition(member.slug) }}
                  loading="eager"
                  {...highFetchPriority}
                  decoding="async"
                  draggable={false}
                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                    if (!fallbackToOriginalSrc(e)) e.currentTarget.style.display = "none";
                  }}
                  data-testid="img-profile-photo"
                />
              ) : (
                <span className="pf-ini" aria-hidden="true" data-testid="avatar-fallback">
                  {member?.name ? getInitials(member.name) : ""}
                </span>
              )}
            </figure>
          </div>
        </header>

        {/* Cuerpo en piedra: la biografía a la izquierda (con lo que se lee como texto) y la ficha a
            la derecha; en tableta y teléfono, una debajo de otra. Sin aparición al hacer scroll. */}
        {(hasMain || hasFicha) && (
          <div className="pf-cuerpo">
            <div className="sh-wrap pf-cuerpo__in">
              {hasMain && (
                <div className="pf-principal">
                  {hasBio && (
                    <section className="pf-bloque pf-bio" data-testid="section-biography">
                      <h2 className="pf-k" data-testid="text-biography-title">
                        <span>{t.biography}</span>
                        {isTranslating && <Spinner />}
                      </h2>
                      {/* Biografía sin traducción: bloque en el idioma de origen, marcado lang y
                          dir="ltr" (en árabe, alineado a la izquierda, como el resumen de las
                          prácticas); la entrada en la romana grande y el resto en el texto corrido */}
                      <div
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
                          <p className="pf-espera">
                            <Spinner />
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
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {experience.length > 0 && (
                    <Bloque title={t.experience} testId="section-experience" titleTestId="text-experience-title">
                      <ul className="pf-lista" role="list">
                        {experience.map((exp, index) => (
                          <li key={index} className="pf-fila" data-testid={`item-experience-${index}`}>
                            <span className="pf-fila__t">{language === "es" && exp.positionEs ? exp.positionEs : exp.position}</span>
                            <span className="pf-fila__s">
                              {exp.company}
                              {(exp.startYear || exp.endYear) && (
                                <span className="ss-num">
                                  {exp.company ? " · " : ""}{exp.startYear}{exp.endYear ? `–${exp.endYear}` : ` – ${t.present}`}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {publications.length > 0 && (
                    <Bloque title={t.publications} testId="section-publications" titleTestId="text-publications-title">
                      <ul className="pf-lista" role="list">
                        {publications.map((pub, index) => (
                          <PublicationItemTranslated
                            key={index}
                            pub={pub}
                            index={index}
                            language={language}
                            memberId={memberId}
                            viewPublicationText={t.viewPublication}
                          />
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {matters.length > 0 && (
                    <Bloque title={t.representativeMatters} testId="section-representative-matters" titleTestId="text-representative-matters-title">
                      <ul className="pf-lista" role="list">
                        {matters.map((matter, index) => (
                          <RepresentativeMatterTranslated
                            key={index}
                            matter={matter}
                            index={index}
                            language={language}
                            memberId={memberId}
                          />
                        ))}
                      </ul>
                    </Bloque>
                  )}
                </div>
              )}

              {hasFicha && (
                <div className="pf-ficha">
                  {/* Prácticas e industrias: solo las que trae el registro de la persona */}
                  {memberPracticeGroups.length > 0 && (
                    <Bloque title={t.practiceAreas} testId="section-practice-areas" titleTestId="text-practice-areas-title">
                      <ul className="pf-lista" role="list">
                        {memberPracticeGroups.map((group) => (
                          <PracticeGroupLink key={group.id} group={group} language={language} />
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {memberIndustryGroups.length > 0 && (
                    <Bloque title={t.industryGroups} testId="section-industry-groups" titleTestId="text-industry-groups-title">
                      <ul className="pf-lista" role="list">
                        {memberIndustryGroups.map((group) => (
                          <IndustryGroupItem key={group.id} group={group} language={language} />
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {/* Contacto: solo con un teléfono o un correo propios, y solo esos; los generales
                      de la firma ya están en el pie (E7, G6). In memoriam, nada. */}
                  {showContactList && (
                    <Bloque title={t.contactCta} testId="section-contact-cta" titleTestId="text-contact-cta-title">
                      <dl className="pf-datos" data-testid="text-contact-cta-subtitle">
                        <div>
                          <dt>{t.officeLabel}</dt>
                          {/* <bdi>: en árabe el punto de "N.L." saltaba al principio de la línea */}
                          <dd><bdi>{officeLocation}</bdi></dd>
                        </div>
                        {ownContact.phone && (
                          <div>
                            <dt>{t.phoneLabel}</dt>
                            <dd>
                              {/* dir="ltr": en árabe el número se leía al revés */}
                              <a href={`tel:${ownContact.phone.replace(/\s+/g, "")}`} dir="ltr" data-testid="button-call-contact">
                                {ownContact.phone}
                              </a>
                            </dd>
                          </div>
                        )}
                        {ownContact.email && (
                          <div>
                            <dt>{t.emailLabel}</dt>
                            <dd>
                              <a href={`mailto:${ownContact.email}`} dir="ltr" data-testid="button-email-contact">
                                {ownContact.email}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </Bloque>
                  )}

                  {education.length > 0 && (
                    <Bloque title={t.education} testId="section-education" titleTestId="text-education-title">
                      <ul className="pf-lista" role="list">
                        {education.map((edu, index) => (
                          <EducationItemTranslated key={index} edu={edu} index={index} language={language} memberId={memberId} />
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {barAdmissions.length > 0 && (
                    <Bloque title={t.barAdmissions} testId="section-bar-admissions" titleTestId="text-bar-admissions-title">
                      <ul className="pf-lista" role="list">
                        {barAdmissions.map((admission, index) => (
                          <BarAdmissionItemTranslated key={index} admission={admission} index={index} language={language} memberId={memberId} />
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {languagesList.length > 0 && (
                    <Bloque title={t.languages} testId="section-languages" titleTestId="text-languages-title">
                      <ul className="pf-linea" role="list">
                        {languagesList.map((l, index) => (
                          <LanguageItemTranslated key={index} lang={l} index={index} language={language} memberId={memberId} />
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {affiliations.length > 0 && (
                    <Bloque title={t.affiliations} testId="section-affiliations" titleTestId="text-affiliations-title">
                      <ul className="pf-lista" role="list">
                        {affiliations.map((affiliation, index) => (
                          <AffiliationItemTranslated key={index} affiliation={affiliation} index={index} language={language} memberId={memberId} />
                        ))}
                      </ul>
                    </Bloque>
                  )}

                  {processedRankings && (
                    <Bloque
                      title={<><span>{t.rankings}</span><span className="pf-num" data-testid="badge-rankings-count">{processedRankings.totalCount}</span></>}
                      testId="section-rankings"
                      titleTestId="text-rankings-title"
                    >
                      {processedRankings.tieredRankings.length > 0 && (
                        <div data-testid="container-tiered-rankings">
                          <h3 className="pf-k3">{t.tieredRankings}</h3>
                          <ul className="pf-lista" role="list">
                            {processedRankings.tieredRankings.map((ranking, index) => (
                              <RankingItemTranslated key={index} ranking={ranking} index={index} language={language} memberId={memberId} isTiered />
                            ))}
                          </ul>
                        </div>
                      )}
                      {processedRankings.simpleRankings.length > 0 && (
                        <div data-testid="container-simple-rankings">
                          {processedRankings.tieredRankings.length > 0 && <h3 className="pf-k3">{t.otherRecognitions}</h3>}
                          <ul className="pf-lista pf-lista--2" role="list">
                            {processedRankings.simpleRankings.map((ranking, index) => (
                              <RankingItemTranslated
                                key={index}
                                ranking={ranking}
                                index={processedRankings.tieredRankings.length + index}
                                language={language}
                                memberId={memberId}
                                isTiered={false}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </Bloque>
                  )}

                  {/* Reconocimiento destacado: la cifra y las publicaciones principales */}
                  {processedRankings && (
                    <Bloque title={t.featuredRecognition} testId="section-featured-recognition" titleTestId="text-featured-recognition-title">
                      <div className="pf-cifra">
                        <span className="pf-cifra__n" data-testid="text-total-recognitions-count">{processedRankings.totalCount}</span>
                        <span className="pf-cifra__l">{t.totalRecognitions}</span>
                      </div>
                      {processedRankings.topPublications.length > 0 && (
                        <div data-testid="container-top-publications">
                          <h3 className="pf-k3">{t.topPublications}</h3>
                          <ul className="pf-lista" role="list">
                            {processedRankings.topPublications.map((pub, index) => (
                              <li key={index} className="pf-fila" data-testid={`item-top-publication-${index}`}>
                                <span className="pf-fila__t">{pub}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Bloque>
                  )}

                  {/* Equipo relacionado: como mucho tres. Mientras llega /api/team, su esqueleto. */}
                  {isLoadingTeam && <RelatedTeamSkeleton title={t.relatedTeam} />}
                  {showRelated && (
                    <Bloque title={t.relatedTeam} testId="section-related-team" titleTestId="text-related-team-title">
                      <ul className="pf-lista pf-lista--eq" role="list">
                        {relatedMembers!.map((relatedMember) => (
                          <RelatedTeamMemberCard
                            key={relatedMember.id}
                            relatedMember={relatedMember}
                            language={language}
                            getInitials={getInitials}
                          />
                        ))}
                      </ul>
                    </Bloque>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notas del Monitor Laboral de la persona: filas de filete con categoría y fecha en
            versalita, titular en la romana (el enlace) y entradilla */}
        {relatedNews && relatedNews.length > 0 && (
          <section className="pf-notas" data-testid="section-related-news">
            <div className="sh-wrap">
              <h2 className="pf-k" data-testid="text-related-news-title">{t.relatedNews}</h2>
              <ul className="pf-notas__lista" role="list">
                {relatedNews.map((article) => {
                  const headline = language === "es" ? article.titleEs : article.title;
                  const category = article.category
                    ? (language === "es" ? article.categoryEs : article.category.charAt(0).toUpperCase() + article.category.slice(1))
                    : null;
                  const date = formatDate(article.date);
                  const excerpt = language === "es" ? article.excerptEs : article.excerpt;
                  return (
                    <li key={article.id} className="pf-nota" data-testid={`card-related-news-${article.slug}`}>
                      <p className="pf-nota__k ss-num">
                        {category && (
                          <span className="pf-nota__cat" data-testid={`badge-news-category-${article.slug}`}>{category}</span>
                        )}
                        {category && date && <span aria-hidden="true"> · </span>}
                        <span data-testid={`text-news-date-${article.slug}`}>{date}</span>
                      </p>
                      <div>
                        <h3 className="pf-nota__t" data-testid={`text-news-title-${article.slug}`}>
                          <Link href={`/news/${article.slug}`}>{headline}</Link>
                        </h3>
                        {excerpt && (
                          <p className="pf-nota__p" data-testid={`text-news-excerpt-${article.slug}`}>{excerpt}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Siguiente: el próximo socio (o la próxima persona de su grupo); tras el último, Contacto */}
        <div {...attrs}>
          <V3NextPage
            href={nextMember ? `/team/${nextMember.slug}` : internal(cmsLinks.contact, "/contact")}
            label={nextMember && member?.isPartner ? P.nextPartner : P.next}
            title={nextMember ? nextMember.name : (ownLang ? navLabels[5].label : P.nextTitle)}
            ariaLabel={P.nextAria}
          />
        </div>
      </V3Main>

      <Footer />
    </div>
  );
}
