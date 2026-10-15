import { useState, useMemo } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PersonJsonLd, BreadcrumbJsonLd } from "@/components/JsonLdSchema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isStaticSite } from "@/lib/queryClient";
import { getTeamPhotoObjectPosition } from "@/lib/teamPhotoPosition";
import { Eyebrow, LeadParagraph } from "@/components/editorial";
import type { TeamMember, PracticeGroup, IndustryGroup, Education, Affiliation, Ranking, Publication, RepresentativeMatter, BarAdmission, News, LanguageCode } from "@shared/schema";

// Retícula del encabezado del perfil, compartida por la vista y su carga para que no se
// desalineen. Móvil: nombre, foto y contacto en ese orden. Desde md: foto en la columna 1
// (dos filas, al menos cuadrada), filete de 1px y el texto en la 3 alineado con la foto.
const PROFILE_GRID = "grid grid-cols-1 md:grid-cols-[280px_1px_minmax(0,1fr)] md:grid-rows-[auto_1fr] lg:grid-cols-[320px_1px_minmax(0,1fr)]";
const PROFILE_PHOTO_CELL = "aspect-square w-full md:col-start-1 md:row-span-2 md:row-start-1 md:aspect-auto md:min-h-[280px] lg:min-h-[320px]";
const PROFILE_IDENTITY_CELL = "pb-8 md:col-start-3 md:row-start-1 md:px-10 md:pb-6";
const PROFILE_ACTIONS_CELL = "pt-8 md:col-start-3 md:row-start-2 md:px-10 md:pb-10 md:pt-0";

function NewsImageWithFallback({ 
  src, 
  alt, 
  className 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError || !src) {
    return (
      // Sin imagen: Hueso con un § tonal en Línea (en vez del "S&S")
      <div aria-hidden="true" className={`bg-ss-paper flex items-center justify-center ${className}`}>
        <span className="font-heading font-normal text-5xl text-ss-rule leading-none">§</span>
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
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
  const { translatedFields } = useTranslatedContent({
    contentType: 'team_member',
    entityId: relatedMember.id.toString(),
    fields: { title: relatedMember.titleEs || relatedMember.title, titleEs: relatedMember.titleEs },
    enabled: language !== 'es',
  });

  const displayTitle = language === 'es'
    ? relatedMember.titleEs
    : (translatedFields.title || relatedMember.titleEs || relatedMember.title);

  return (
    <Link href={`/team/${relatedMember.slug}`}>
      {/* Fila con filete superior; retrato en grises como todos los retratos */}
      <div
        className="group flex items-center gap-4 py-4 border-t border-ss-rule cursor-pointer"
        data-testid={`card-related-member-${relatedMember.slug}`}
      >
        <Avatar className="w-12 h-12 shrink-0">
          <AvatarImage
            src={relatedMember.imageUrl || undefined}
            alt={relatedMember.name}
            className="ss-photo"
          />
          <AvatarFallback className="bg-ss-paper text-ss-marino text-sm font-heading">
            {getInitials(relatedMember.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-[17px] leading-[1.2] tracking-[-0.01em] text-ss-marino truncate group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1">
            {relatedMember.name}
          </p>
          <p className="ss-label text-ss-medio truncate mt-1">
            {displayTitle}
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
        {edu.year && <span className="ml-2 text-sm">({edu.year})</span>}
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
  const { translatedFields } = useTranslatedContent({
    contentType: 'practice_group',
    entityId: group.id.toString(),
    fields: { name: group.nameEs || group.name, nameEs: group.nameEs },
    enabled: language !== 'es',
  });

  const displayName = language === 'es'
    ? (group.nameEs || group.name)
    : (translatedFields.name || group.nameEs || group.name);

  return (
    <Link href={`/practice-groups/${group.slug}`}>
      {/* Chip de 14 px con filete Línea; al pasar el cursor, filete y texto Azul Marino */}
      <Badge
        variant="outline"
        className="cursor-pointer px-3 py-1.5 no-default-hover-elevate no-default-active-elevate transition-colors duration-200 hover:border-ss-marino hover:text-ss-marino"
        data-testid={`badge-practice-group-${group.slug}`}
      >
        {displayName}
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
  const { translatedFields } = useTranslatedContent({
    contentType: 'industry_group',
    entityId: group.id.toString(),
    fields: { name: group.nameEs || group.name, nameEs: group.nameEs },
    enabled: language !== 'es',
  });

  const displayName = language === 'es'
    ? (group.nameEs || group.name)
    : (translatedFields.name || group.nameEs || group.name);

  // Sin enlace: el sitio no tiene páginas públicas de industrias (rutas retiradas en 4f995a6)
  return (
    <Badge
      variant="outline"
      className="px-3 py-1.5 no-default-hover-elevate no-default-active-elevate"
      data-testid={`badge-industry-group-${group.slug}`}
    >
      {displayName}
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
  const { language } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: member, isLoading, error } = useQuery<TeamMember>({
    queryKey: [`/api/team/${slug}`],
    enabled: !!slug,
  });

  const { data: practiceGroups } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const { data: industryGroups } = useQuery<IndustryGroup[]>({
    queryKey: ["/api/industry-groups"],
  });

  const { data: allTeamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: relatedNews } = useQuery<News[]>({
    queryKey: ['/api/team', slug, 'news'],
    enabled: !!slug,
  });

  const { translatedFields, isTranslating } = useTranslatedContent({
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
    enabled: !!member && !!member.bio && language !== 'es',
  });

  const content: Record<string, {
    backToAll: string;
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
    contactSubtitle: string;
    emailUs: string;
    callUs: string;
    downloadVCard: string;
    errorMessage: string;
    loading: string;
    relatedTeam: string;
    viewProfile: string;
    relatedNews: string;
    readMore: string;
    featuredRecognition: string;
    totalRecognitions: string;
    topPublications: string;
    tieredRankings: string;
    otherRecognitions: string;
    band: string;
    viewPublication: string;
    positions: {
      foundingPartner: string;
      partner: string;
      ofCounsel: string;
      seniorAssociate: string;
      associate: string;
    };
  }> = {
    en: {
      backToAll: "All Team Members",
      partner: "Partner",
      ofCounsel: "Of Counsel",
      associate: "Associate",
      contactInfo: "Contact Information",
      practiceAreas: "Practice Areas",
      industryGroups: "Industry Groups",
      biography: "Biography",
      education: "Education",
      barAdmissions: "Bar Admissions",
      languages: "Languages",
      affiliations: "Professional Affiliations",
      rankings: "Rankings & Recognition",
      publications: "Publications",
      representativeMatters: "Representative Matters",
      experience: "Professional Experience",
      contactCta: "Get in touch",
      contactSubtitle: "Connect with our team to discuss how we can assist with your legal needs.",
      emailUs: "Send Email",
      callUs: "Call",
      downloadVCard: "Download vCard",
      errorMessage: "Team member not found",
      loading: "Loading...",
      relatedTeam: "Related Team Members",
      viewProfile: "View Profile",
      relatedNews: "Latest News & Articles",
      readMore: "Read More",
      featuredRecognition: "Featured Recognition",
      totalRecognitions: "Total Recognitions",
      topPublications: "Top Publications",
      tieredRankings: "Tiered Rankings",
      otherRecognitions: "Other Recognitions",
      band: "Band",
      viewPublication: "View Publication",
      positions: {
        foundingPartner: "Founding Partner",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associate",
      },
    },
    es: {
      backToAll: "Todos los miembros",
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
      contactCta: "Contáctenos",
      contactSubtitle: "Conéctese con nuestro equipo para discutir cómo podemos ayudarle con sus necesidades legales.",
      emailUs: "Enviar correo",
      callUs: "Llamar",
      downloadVCard: "Descargar vCard",
      errorMessage: "Miembro del equipo no encontrado",
      loading: "Cargando...",
      relatedTeam: "Equipo relacionado",
      viewProfile: "Ver perfil",
      relatedNews: "Últimas noticias y artículos",
      readMore: "Leer más",
      featuredRecognition: "Reconocimiento destacado",
      totalRecognitions: "Total de reconocimientos",
      topPublications: "Publicaciones principales",
      tieredRankings: "Rankings por nivel",
      otherRecognitions: "Otros reconocimientos",
      band: "Banda",
      viewPublication: "Ver publicación",
      positions: {
        foundingPartner: "Socio fundador",
        partner: "Socio",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Asociado senior",
        associate: "Asociado",
      },
    },
    de: {
      backToAll: "Zurück zum Team",
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
      contactCta: "Kontakt aufnehmen",
      contactSubtitle: "Kontaktieren Sie unser Team, um zu besprechen, wie wir Ihnen helfen können.",
      emailUs: "E-Mail senden",
      callUs: "Anrufen",
      downloadVCard: "VCard herunterladen",
      errorMessage: "Teammitglied nicht gefunden",
      loading: "Wird geladen...",
      relatedTeam: "Weitere Teammitglieder",
      viewProfile: "Profil anzeigen",
      relatedNews: "Aktuelle Nachrichten & Artikel",
      readMore: "Mehr lesen",
      featuredRecognition: "Hervorgehobene Anerkennung",
      totalRecognitions: "Gesamte Anerkennungen",
      topPublications: "Top-Publikationen",
      tieredRankings: "Ranking-Einstufungen",
      otherRecognitions: "Weitere Auszeichnungen",
      band: "Band",
      viewPublication: "Publikation ansehen",
      positions: {
        foundingPartner: "Gründungspartner",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associate",
      },
    },
    zh: {
      backToAll: "返回团队",
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
      contactCta: "联系我们",
      contactSubtitle: "联系我们的团队，讨论我们如何协助您的法律需求。",
      emailUs: "发送邮件",
      callUs: "电话联系",
      downloadVCard: "下载名片",
      errorMessage: "未找到团队成员",
      loading: "加载中...",
      relatedTeam: "相关团队成员",
      viewProfile: "查看简介",
      relatedNews: "最新新闻与文章",
      readMore: "阅读更多",
      featuredRecognition: "重点认可",
      totalRecognitions: "认可总数",
      topPublications: "主要出版物",
      tieredRankings: "分级排名",
      otherRecognitions: "其他认可",
      band: "等级",
      viewPublication: "查看出版物",
      positions: {
        foundingPartner: "创始合伙人",
        partner: "合伙人",
        ofCounsel: "法律顾问",
        seniorAssociate: "高级律师",
        associate: "律师",
      },
    },
    ko: {
      backToAll: "팀으로 돌아가기",
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
      contactCta: "연락하기",
      contactSubtitle: "법률 서비스에 대해 상담하려면 저희 팀에 연락해 주세요.",
      emailUs: "이메일 보내기",
      callUs: "전화하기",
      downloadVCard: "명함 다운로드",
      errorMessage: "팀원을 찾을 수 없습니다",
      loading: "로딩 중...",
      relatedTeam: "관련 팀원",
      viewProfile: "프로필 보기",
      relatedNews: "최신 뉴스 및 기사",
      readMore: "더 읽기",
      featuredRecognition: "주요 인정",
      totalRecognitions: "총 인정",
      topPublications: "주요 출판물",
      tieredRankings: "등급별 순위",
      otherRecognitions: "기타 인정",
      band: "등급",
      viewPublication: "출판물 보기",
      positions: {
        foundingPartner: "창립 파트너",
        partner: "파트너",
        ofCounsel: "고문",
        seniorAssociate: "시니어 어소시에이트",
        associate: "어소시에이트",
      },
    },
    ja: {
      backToAll: "チームに戻る",
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
      contactCta: "お問い合わせ",
      contactSubtitle: "法務ニーズについてご相談ください。",
      emailUs: "メールを送る",
      callUs: "電話する",
      downloadVCard: "名刺をダウンロード",
      errorMessage: "チームメンバーが見つかりません",
      loading: "読み込み中...",
      relatedTeam: "関連チームメンバー",
      viewProfile: "プロフィールを見る",
      relatedNews: "最新ニュース・記事",
      readMore: "続きを読む",
      featuredRecognition: "注目の評価",
      totalRecognitions: "評価総数",
      topPublications: "主要出版物",
      tieredRankings: "段階別ランキング",
      otherRecognitions: "その他の評価",
      band: "バンド",
      viewPublication: "出版物を見る",
      positions: {
        foundingPartner: "創立パートナー",
        partner: "パートナー",
        ofCounsel: "オブ・カウンセル",
        seniorAssociate: "シニアアソシエイト",
        associate: "アソシエイト",
      },
    },
    ar: {
      backToAll: "العودة للفريق",
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
      contactCta: "تواصل معنا",
      contactSubtitle: "تواصل مع فريقنا لمناقشة كيف يمكننا المساعدة في احتياجاتك القانونية.",
      emailUs: "إرسال بريد إلكتروني",
      callUs: "اتصل",
      downloadVCard: "تحميل بطاقة العمل",
      errorMessage: "لم يتم العثور على عضو الفريق",
      loading: "جاري التحميل...",
      relatedTeam: "أعضاء الفريق ذوو الصلة",
      viewProfile: "عرض الملف الشخصي",
      relatedNews: "آخر الأخبار والمقالات",
      readMore: "اقرأ المزيد",
      featuredRecognition: "التقدير المميز",
      totalRecognitions: "إجمالي التقديرات",
      topPublications: "أهم المنشورات",
      tieredRankings: "التصنيفات حسب المستوى",
      otherRecognitions: "تقديرات أخرى",
      band: "الفئة",
      viewPublication: "عرض المنشور",
      positions: {
        foundingPartner: "شريك مؤسس",
        partner: "شريك",
        ofCounsel: "مستشار قانوني",
        seniorAssociate: "محامي أول",
        associate: "محامي",
      },
    },
    ru: {
      backToAll: "Назад к команде",
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
      contactCta: "Связаться с нами",
      contactSubtitle: "Свяжитесь с нашей командой, чтобы обсудить ваши юридические потребности.",
      emailUs: "Отправить email",
      callUs: "Позвонить",
      downloadVCard: "Скачать визитку",
      errorMessage: "Член команды не найден",
      loading: "Загрузка...",
      relatedTeam: "Связанные члены команды",
      viewProfile: "Посмотреть профиль",
      relatedNews: "Последние новости и статьи",
      readMore: "Читать далее",
      featuredRecognition: "Главное признание",
      totalRecognitions: "Всего признаний",
      topPublications: "Ведущие публикации",
      tieredRankings: "Уровневые рейтинги",
      otherRecognitions: "Другие признания",
      band: "Уровень",
      viewPublication: "Смотреть публикацию",
      positions: {
        foundingPartner: "Учредитель",
        partner: "Партнёр",
        ofCounsel: "Советник",
        seniorAssociate: "Старший юрист",
        associate: "Юрист",
      },
    },
    fr: {
      backToAll: "Retour à l'équipe",
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
      contactCta: "Nous contacter",
      contactSubtitle: "Contactez notre équipe pour discuter de vos besoins juridiques.",
      emailUs: "Envoyer un email",
      callUs: "Appeler",
      downloadVCard: "Télécharger vCard",
      errorMessage: "Membre de l'équipe introuvable",
      loading: "Chargement...",
      relatedTeam: "Membres de l'équipe associés",
      viewProfile: "Voir le profil",
      relatedNews: "Dernières actualités et articles",
      readMore: "Lire la suite",
      featuredRecognition: "Reconnaissance mise en avant",
      totalRecognitions: "Total des reconnaissances",
      topPublications: "Principales publications",
      tieredRankings: "Classements par niveau",
      otherRecognitions: "Autres distinctions",
      band: "Bande",
      viewPublication: "Voir la publication",
      positions: {
        foundingPartner: "Associé fondateur",
        partner: "Associé",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Collaborateur senior",
        associate: "Collaborateur",
      },
    },
    it: {
      backToAll: "Torna al team",
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
      contactCta: "Contattaci",
      contactSubtitle: "Contatta il nostro team per discutere delle tue esigenze legali.",
      emailUs: "Invia email",
      callUs: "Chiama",
      downloadVCard: "Scarica vCard",
      errorMessage: "Membro del team non trovato",
      loading: "Caricamento...",
      relatedTeam: "Membri del team correlati",
      viewProfile: "Visualizza profilo",
      relatedNews: "Ultime notizie e articoli",
      readMore: "Leggi di più",
      featuredRecognition: "Riconoscimento in evidenza",
      totalRecognitions: "Riconoscimenti totali",
      topPublications: "Pubblicazioni principali",
      tieredRankings: "Classifiche per livello",
      otherRecognitions: "Altri riconoscimenti",
      band: "Fascia",
      viewPublication: "Vedi pubblicazione",
      positions: {
        foundingPartner: "Partner fondatore",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associato",
      },
    },
  };

  const t = content[language] || content.en;

  const formatDate = (date: string | Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-MX',
      de: 'de-DE',
      zh: 'zh-CN',
      ko: 'ko-KR',
      ja: 'ja-JP',
      ar: 'ar-SA',
      ru: 'ru-RU',
      fr: 'fr-FR',
      it: 'it-IT',
    };
    return d.toLocaleDateString(localeMap[language] || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const relatedMembers = allTeamMembers?.filter(m => 
    m.id !== member?.id && 
    ((m.isPartner && member?.isPartner) || 
     (m.title === member?.title))
  ).slice(0, 4);

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

  const getMemberKnowsAbout = () => {
    const areas: string[] = [];
    if (practiceGroups && member) {
      practiceGroups.forEach(pg => {
        areas.push(language === "es" ? pg.nameEs : pg.name);
      });
    }
    return areas.length > 0 ? areas.slice(0, 10) : undefined;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-team-member-error">
        <Header />
        {/* Cabecera sticky en flujo: ya no hace falta compensar el header fijo */}
        <main id="main-content" className="pt-16 pb-20 lg:pt-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="ss-h2 mb-6" data-testid="text-error-title">
              {t.errorMessage}
            </h2>
            <Link href="/team">
              <Button variant="outline" data-testid="button-back-to-team">
                {t.backToAll}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-team-member-loading">
        <Header />
        <section className="pt-36 pb-20 editorial-page-hero" aria-busy="true">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Skeleton className="h-4 w-44 bg-white/10 mb-6" />
            <div className={PROFILE_GRID}>
              <div className={PROFILE_IDENTITY_CELL}>
                <Skeleton className="h-3 w-28 bg-white/10 mb-4" />
                <Skeleton className="h-12 w-4/5 bg-white/10 mb-3" />
                <Skeleton className="h-12 w-3/5 bg-white/10 mb-4" />
                <Skeleton className="h-5 w-40 bg-white/10" />
              </div>
              <Skeleton className={`${PROFILE_PHOTO_CELL} rounded-none bg-white/10`} />
              <div className={PROFILE_ACTIONS_CELL}>
                <Skeleton className="h-10 w-56 bg-white/10" />
              </div>
            </div>
          </div>
        </section>
        <main id="main-content" className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-6 w-5/6 mb-4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayTitle = language === 'es'
    ? (member?.titleEs || member?.title)
    : language === 'en'
      ? member?.title
      : (translatedFields.title || null);
  
  const displayRole = language === 'es'
    ? (member?.roleEs || member?.role)
    : language === 'en'
      ? member?.role
      : (translatedFields.role || null);
  
  const displayBio = language === 'es'
    ? (member?.bioEs || member?.bio)
    : language === 'en'
      ? member?.bio
      : (translatedFields.bio || null);

  return (
    <div className="min-h-screen bg-background" data-testid="page-team-member-detail">
      <Header />
      
      {member && (
        <>
          <PersonJsonLd
            name={member.name}
            jobTitle={displayTitle || member.title}
            email={member.email}
            telephone={member.phone}
            imageUrl={member.imageUrl}
            url={`https://www.santossaucedo.com/team/${member.slug}`}
            linkedinUrl={member.linkedinUrl}
            education={getMemberEducation()}
            languages={member.languages as string[] | undefined}
            knowsAbout={getMemberKnowsAbout()}
            language={language}
          />
          <BreadcrumbJsonLd
            items={[
              { name: language === "es" ? "Inicio" : "Home", url: "https://www.santossaucedo.com" },
              { name: language === "es" ? "Equipo" : "Team", url: "https://www.santossaucedo.com/team" },
              { name: member.name, url: `https://www.santossaucedo.com/team/${member.slug}` }
            ]}
            language={language}
          />
        </>
      )}
      
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-team-member-hero">
        {/* Mismo ancho que la biografía (max-w-6xl): foto y vuelta alineadas con el cuerpo */}
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Link href="/team">
              <span 
                className="inline-flex items-center gap-2 mb-6 cursor-pointer"
                data-testid="link-back-to-team"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                {t.backToAll}
              </span>
            </Link>
            {/* Móvil (y lectores de pantalla): nombre, foto y contacto, en ese orden; antes la
                foto a todo lo ancho empujaba el nombre bajo el primer pantallazo. Desde md cada
                bloque va a su celda: foto a la izquierda en las dos filas y el texto alineado
                con su borde superior. */}
            <div className={PROFILE_GRID}>
              {/* Sin padding lateral en móvil: el texto arranca en el borde de la foto y de la vuelta */}
              <div className={`min-w-0 text-center md:text-left ${PROFILE_IDENTITY_CELL}`}>
                {/* Eyebrow del expediente: "§ 03 —— Socio" (glifo § en lima, components/editorial).
                    La categoría va aquí y no en una píldora junto al nombre. */}
                <Eyebrow
                  num="03"
                  tone="navy"
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
                  return (
                    <p
                      className="mb-1"
                      data-testid="text-team-member-title"
                    >
                      {displayTitle}
                      {isTranslating && (
                        <Loader2 className="inline-block w-4 h-4 ml-2 animate-spin text-white/60" />
                      )}
                    </p>
                  );
                })()}
                <p 
                  data-testid="text-team-member-role"
                >
                  {displayRole}
                </p>
              </div>

              <div
                className={`group relative overflow-hidden ${PROFILE_PHOTO_CELL}`}
                data-testid="container-profile-photo"
              >
                {member?.imageUrl ? (
                  <>
                    <img
                      src={member.imageUrl}
                      // alt vacío: el nombre ya está en el h1 de al lado (antes se leía dos veces)
                      alt=""
                      // En grises, como todos los retratos del sitio; sin velo marino encima
                      className="ss-photo absolute inset-0 h-full w-full object-cover object-top"
                      style={{ objectPosition: getTeamPhotoObjectPosition(member.slug) }}
                      loading="eager"
                      decoding="async"
                      data-testid="img-profile-photo"
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-white/10 text-white text-6xl font-heading font-normal"
                    data-testid="avatar-fallback"
                  >
                    {member?.name ? getInitials(member.name) : ''}
                  </div>
                )}
              </div>
              <div
                aria-hidden="true"
                className="hidden md:col-start-2 md:row-span-2 md:row-start-1 md:block bg-white/[0.14]"
              />
              {/* Tres botones iguales de contorno blanco, sin iconos: ninguno pesa más que el nombre.
                  El número de teléfono (dir="ltr") y LinkedIn están en el bloque de contacto. */}
              <div className={`flex flex-col sm:flex-row sm:flex-wrap content-start justify-start gap-3 ${PROFILE_ACTIONS_CELL}`}>
                {member?.email && (
                  <Button 
                    variant="outline"
                    className="min-h-11 sm:min-w-[12rem] border-white/45 text-white hover:border-white"
                    asChild
                    data-testid="button-email"
                  >
                    <a href={`mailto:${member.email}`}>
                      {t.emailUs}
                    </a>
                  </Button>
                )}
                {member?.phone && (
                  <Button 
                    variant="outline"
                    className="min-h-11 sm:min-w-[12rem] border-white/45 text-white hover:border-white"
                    asChild
                    data-testid="button-phone"
                  >
                    <a href={`tel:${member.phone}`}>
                      {t.callUs}
                    </a>
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="min-h-11 sm:min-w-[12rem] border-white/45 text-white hover:border-white"
                  onClick={handleDownloadVCard}
                  data-testid="button-download-vcard"
                >
                  {t.downloadVCard}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main id="main-content" className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {/* Biografía en 8 columnas con "Áreas de práctica" debajo; contacto y equipo en 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              {(displayBio || ((member?.bio || member?.bioEs) && isTranslating)) && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  data-testid="section-biography"
                >
                  <h2 
                    className="ss-h3 mb-6 flex items-center gap-3"
                    data-testid="text-biography-title"
                  >
                    {t.biography}
                    {isTranslating && (
                      <Loader2 className="w-4 h-4 animate-spin text-ss-medio" aria-hidden="true" />
                    )}
                  </h2>
                  <div data-testid="container-biography">
                    {displayBio ? (() => {
                      const paragraphs = displayBio.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);
                      const [first, ...rest] = paragraphs.length ? paragraphs : [displayBio];
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
                          {language === 'de' ? 'Übersetzung lädt...' :
                           language === 'zh' ? '翻译加载中...' :
                           language === 'ko' ? '번역 로딩 중...' :
                           language === 'ja' ? '翻訳を読み込み中...' :
                           language === 'ar' ? 'جاري تحميل الترجمة...' :
                           language === 'ru' ? 'Загрузка перевода...' :
                           language === 'fr' ? 'Traduction en cours...' :
                           language === 'it' ? 'Caricamento traduzione...' :
                           'Loading translation...'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {processedRankings && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  data-testid="section-rankings"
                >
                  <div>
                    <div className="mb-6">
                      <h2
                        className="ss-h3 flex items-baseline gap-3"
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
                    </div>

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
                  </div>
                </motion.section>
              )}

              {practiceGroups && practiceGroups.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  data-testid="section-practice-areas"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-practice-areas-title"
                  >
                    {t.practiceAreas}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {practiceGroups.slice(0, 8).map((group) => (
                      <PracticeGroupBadge
                        key={group.id}
                        group={group}
                        language={language}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {industryGroups && industryGroups.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  data-testid="section-industry-groups"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-industry-groups-title"
                  >
                    {t.industryGroups}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {industryGroups.slice(0, 6).map((group) => (
                      <IndustryGroupBadge
                        key={group.id}
                        group={group}
                        language={language}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {member?.education && member.education.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  data-testid="section-education"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-education-title"
                  >
                    {t.education}
                  </h2>
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
                </motion.section>
              )}

              {member?.barAdmissions && member.barAdmissions.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  data-testid="section-bar-admissions"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-bar-admissions-title"
                  >
                    {t.barAdmissions}
                  </h2>
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
                </motion.section>
              )}

              {member?.languages && member.languages.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  data-testid="section-languages"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-languages-title"
                  >
                    {t.languages}
                  </h2>
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
                </motion.section>
              )}

              {member?.affiliations && member.affiliations.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  data-testid="section-affiliations"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-affiliations-title"
                  >
                    {t.affiliations}
                  </h2>
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
                </motion.section>
              )}

              {member?.publications && member.publications.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  data-testid="section-publications"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-publications-title"
                  >
                    {t.publications}
                  </h2>
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
                </motion.section>
              )}

              {member?.representativeMatters && member.representativeMatters.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  data-testid="section-representative-matters"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-representative-matters-title"
                  >
                    {t.representativeMatters}
                  </h2>
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
                </motion.section>
              )}

              {member?.experience && member.experience.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.75 }}
                  data-testid="section-experience"
                >
                  <h2 
                    className="ss-h3 mb-5"
                    data-testid="text-experience-title"
                  >
                    {t.experience}
                  </h2>
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
                            <span className="ml-2 text-sm">
                              ({exp.startYear}{exp.endYear ? ` - ${exp.endYear}` : ' - Present'})
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            <div className="lg:col-span-4 space-y-10">
              {/* Contacto: bloque Hueso con un solo botón principal y dos enlaces de texto */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-ss-paper p-6 lg:p-8"
                data-testid="section-contact-cta"
              >
                <h2 
                  className="ss-h3 text-[20px] mb-3"
                  data-testid="text-contact-cta-title"
                >
                  {t.contactCta}
                </h2>
                <p 
                  className="text-base leading-[1.55] text-ss-tinta mb-6"
                  data-testid="text-contact-cta-subtitle"
                >
                  {t.contactSubtitle}
                </p>
                {member?.email && (
                  <Button 
                    className="w-full min-h-11"
                    asChild
                    data-testid="button-email-contact"
                  >
                    <a href={`mailto:${member.email}`}>
                      {t.emailUs}
                    </a>
                  </Button>
                )}
                <ul className="mt-5 space-y-3 text-[15px] font-semibold">
                  {member?.phone && (
                    <li>
                      <a
                        href={`tel:${member.phone}`}
                        className="text-ss-marino underline-offset-4 hover:underline"
                        data-testid="button-call-contact"
                      >
                        {t.callUs}{" "}
                        {/* dir="ltr": en árabe el número se leía "2086 8335 81 52+" */}
                        <span dir="ltr" className="font-normal text-ss-tinta">{member.phone}</span>
                      </a>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={handleDownloadVCard}
                      className="text-ss-marino underline-offset-4 hover:underline"
                      data-testid="button-download-vcard-sidebar"
                    >
                      {t.downloadVCard}
                    </button>
                  </li>
                  {member?.linkedinUrl && (
                    <li>
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ss-marino underline-offset-4 hover:underline"
                        data-testid="button-linkedin"
                      >
                        LinkedIn
                      </a>
                    </li>
                  )}
                </ul>
              </motion.section>

              {processedRankings && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="border-t border-ss-rule pt-6"
                  data-testid="section-featured-recognition"
                >
                  <h2 
                    className="ss-h3 text-[20px] mb-4"
                    data-testid="text-featured-recognition-title"
                  >
                    {t.featuredRecognition}
                  </h2>
                  
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
                </motion.section>
              )}

              {relatedMembers && relatedMembers.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  data-testid="section-related-team"
                >
                  <h2
                    className="ss-h3 text-[20px] mb-4"
                    data-testid="text-related-team-title"
                  >
                    {t.relatedTeam}
                  </h2>
                  <div className="border-b border-ss-rule">
                    {relatedMembers.map((relatedMember) => (
                      <RelatedTeamMemberCard
                        key={relatedMember.id}
                        relatedMember={relatedMember}
                        language={language}
                        getInitials={getInitials}
                      />
                    ))}
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>

        {relatedNews && relatedNews.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 pt-12"
            data-testid="section-related-news"
          >
            <div className="max-w-6xl mx-auto px-6 lg:px-12">
              <h2 
                className="ss-h2-sm mb-8"
                data-testid="text-related-news-title"
              >
                {t.relatedNews}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {relatedNews.map((article) => (
                  <motion.div 
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link href={`/news/${article.slug}`}>
                      {/* Sin caja: imagen sin velo, categoría y fecha como etiquetas, titular en la romana */}
                      <article
                        className="group h-full cursor-pointer"
                        data-testid={`card-related-news-${article.slug}`}
                      >
                        <div className="relative h-48 overflow-hidden bg-ss-paper">
                          <NewsImageWithFallback
                            src={article.imageUrl || ""}
                            alt={language === "es" ? article.titleEs : article.title}
                            className="ss-photo--colour w-full h-full object-cover"
                          />
                        </div>
                        <div className="pt-5">
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                            {article.category && (
                              <span 
                                className="ss-label text-ss-marino"
                                data-testid={`badge-news-category-${article.slug}`}
                              >
                                {language === "es" ? article.categoryEs : article.category?.charAt(0).toUpperCase() + article.category?.slice(1)}
                              </span>
                            )}
                            <span className="ss-label ss-num text-ss-medio" data-testid={`text-news-date-${article.slug}`}>
                              {formatDate(article.date)}
                            </span>
                          </p>
                          <h3 
                            className="ss-h3 text-[20px] mb-3 line-clamp-3 group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1"
                            data-testid={`text-news-title-${article.slug}`}
                          >
                            {language === "es" ? article.titleEs : article.title}
                          </h3>
                          <p 
                            className="text-base leading-[1.55] text-ss-tinta line-clamp-3 mb-4"
                            data-testid={`text-news-excerpt-${article.slug}`}
                          >
                            {language === "es" ? article.excerptEs : article.excerpt}
                          </p>
                          <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-ss-marino">
                            {t.readMore}
                            <span aria-hidden="true" className="ss-arrow">→</span>
                          </span>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  );
}
