import { Link, useParams } from "wouter";
import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow, LeadParagraph, RankingsList, type RankingItem } from "@/components/editorial";
import type { PracticeGroup, TeamMember, RepresentativeMatterDb } from "@shared/schema";

// Texto de origen en inglés mostrado en otro idioma (sin traducción, o en el sitio estático):
// lleva su propio idioma y dirección, para que :lang() y el algoritmo bidi lo traten como inglés.
// La descripción larga va entera en LTR (EN_SOURCE). El titular conserva la dirección de la
// página (en árabe, alineado a la derecha con la vuelta y el eyebrow): el bloque solo lleva
// lang="en" (la romana, no la sans de CJK y árabe) y el texto va en <bdi lang="en" dir="ltr">.
const EN_SOURCE = { lang: "en", dir: "ltr" } as const;

// Columna de lectura (≈800 px) al borde izquierdo del contenedor de cabecera y pie
// (ss-container), no centrada: encabezado y cuerpo empiezan bajo el logotipo.
function Column({ children }: { children: ReactNode }) {
  return (
    <div className="ss-container">
      <div className="max-w-[50rem]">{children}</div>
    </div>
  );
}

interface PracticeRanking {
  publication: string;
  ranking: string;
  rankingEs: string;
  year: string;
  badgeType: "band" | "tier" | "star" | "recommended";
}

const practiceAreaRoleMapping: Record<string, string[]> = {
  "corporate-ma": ["Corporate & M&A", "Corporate, M&A & Pharmaceutical Co-Leader"],
  "antitrust-competition": ["Antitrust & Competition"],
  "arbitration": ["Arbitration", "Arbitration & Energy", "Founding Partner, Arbitration & Litigation Expert"],
  "litigation": ["Litigation"],
  "investigations-anticorruption": ["Investigations, Anti-corruption & Compliance"],
  "bankruptcy-restructuring": ["Bankruptcy & Restructuring"],
  "banking-finance": ["Banking & Finance"],
  "energy-natural-resources": ["Energy & Natural Resources", "Arbitration & Energy"],
  "esg": ["ESG"],
  "real-estate": ["Real Estate"],
  "intellectual-property": ["Intellectual Property"],
  "labor-employment": ["Labor & Employment"],
  "tax": ["Tax", "Tax Practice"],
  "international-trade": ["International Trade"],
  "telecommunications-media-technology": ["Telecommunications, Media & Technology"],
  "environmental": ["Environmental"],
  "administrative-law": ["Administrative Law"],
};

interface TranslatedMatterCardProps {
  matter: RepresentativeMatterDb;
  language: string;
  t: {
    featured: string;
    client: string;
  };
}

function TranslatedMatterCard({ matter, language, t }: TranslatedMatterCardProps) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'representative_matter',
    entityId: matter.id.toString(),
    fields: {
      title: matter.title,
      titleEs: matter.titleEs,
      description: matter.description,
      descriptionEs: matter.descriptionEs,
      client: matter.client,
      clientEs: matter.clientEs,
    },
    enabled: !isNativeLanguage(language),
  });

  const displayTitle = translatedFields.title || matter.title;
  const displayDescription = translatedFields.description || matter.description;
  const displayClient = translatedFields.client || matter.client;

  // Fila abierta con filete superior (sin tarjeta oscura ni barra lima): año y "Destacado"
  // como etiquetas, titular en romana Azul Marino, texto en Gris Tinta.
  return (
    <article
      className="border-t border-ss-rule pt-6"
      data-testid={`card-matter-${matter.id}`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
        {matter.isHighlight && (
          <span className="ss-label text-ss-marino">{t.featured}</span>
        )}
        <span
          className="ss-label text-ss-medio"
          data-testid={`badge-matter-year-${matter.id}`}
        >
          {matter.year}
        </span>
      </div>
      <h3
        className="ss-h3"
        data-testid={`text-matter-title-${matter.id}`}
      >
        {displayTitle}
      </h3>
      <p
        className="mt-2 text-base leading-[1.6] text-ss-tinta"
        data-testid={`text-matter-description-${matter.id}`}
      >
        {displayDescription}
      </p>
      {displayClient && (
        <p
          className="mt-3 text-sm text-ss-medio"
          data-testid={`text-matter-client-${matter.id}`}
        >
          <span className="text-sm font-semibold text-ss-tinta">
            {t.client}{" "}
          </span>
          {displayClient}
        </p>
      )}
    </article>
  );
}

export default function PracticeGroupDetail() {
  const { language, displayLanguage } = useLanguage();
  // Bloque de contacto: dirección y teléfono del pie (/api/site-content), como datos;
  // "Llamar" marca ese teléfono
  const { address, phone, phoneHref } = useSiteContact(displayLanguage);
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: practiceGroup, isLoading, error } = useQuery<PracticeGroup>({
    queryKey: [`/api/practice-groups/${slug}`],
    enabled: !!slug,
  });

  const { data: allTeamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: representativeMatters } = useQuery<RepresentativeMatterDb[]>({
    queryKey: ['/api/practice-groups', slug, 'representative-matters'],
    enabled: !!slug,
  });

  const { translatedFields, isTranslating, isLoading: isTranslationLoading } = useTranslatedContent({
    contentType: 'practice_group',
    entityId: practiceGroup?.id?.toString() || '',
    fields: {
      name: practiceGroup?.name,
      nameEs: practiceGroup?.nameEs,
      description: practiceGroup?.description,
      descriptionEs: practiceGroup?.descriptionEs,
      fullDescription: practiceGroup?.fullDescription,
      fullDescriptionEs: practiceGroup?.fullDescriptionEs,
    },
    enabled: !!practiceGroup,
  });

  const translations: Record<string, {
    backToAll: string;
    contactUs: string;
    contactCta: string;
    emailUs: string;
    callUs: string;
    ourTeam: string;
    partners: string;
    ofCounsel: string;
    associates: string;
    viewAll: string;
    viewProfile: string;
    rankingsTitle: string;
    rankingsSubtitle: string;
    successCasesTitle: string;
    successCasesSubtitle: string;
    errorMessage: string;
    loading: string;
    overview: string;
    keyContacts: string;
    relatedIndustries: string;
    relatedPractices: string;
    representativeMatters: string;
    featured: string;
    client: string;
  }> = {
    en: {
      backToAll: "All Practice Groups",
      contactUs: "Contact Us",
      contactCta: "Contact",
      emailUs: "Email Us",
      callUs: "Call Us",
      ourTeam: "Our Team",
      partners: "Partners",
      ofCounsel: "Of Counsel",
      associates: "Associates",
      viewAll: "View all",
      viewProfile: "View Profile",
      rankingsTitle: "Rankings & Recognition",
      rankingsSubtitle: "Our practice has been recognized by leading legal directories worldwide.",
      successCasesTitle: "Success Cases",
      successCasesSubtitle: "Representative matters successfully handled by our practice.",
      errorMessage: "Practice group not found",
      loading: "Loading...",
      overview: "Overview",
      keyContacts: "Key Contacts",
      relatedIndustries: "Related Industries",
      relatedPractices: "Related Practice Areas",
      representativeMatters: "Representative Matters",
      featured: "Featured",
      client: "Client:",
    },
    es: {
      backToAll: "Todas las áreas de práctica",
      contactUs: "Contáctenos",
      contactCta: "Contacto",
      emailUs: "Enviar correo",
      callUs: "Llamar",
      ourTeam: "Nuestro equipo",
      partners: "Socios",
      ofCounsel: "Of Counsel",
      associates: "Asociados",
      viewAll: "Ver todos",
      viewProfile: "Ver perfil",
      rankingsTitle: "Rankings y reconocimientos",
      rankingsSubtitle: "Nuestra práctica ha sido reconocida por los principales directorios legales a nivel mundial.",
      successCasesTitle: "Casos de éxito",
      successCasesSubtitle: "Casos representativos manejados exitosamente por nuestra práctica.",
      errorMessage: "Área de práctica no encontrada",
      loading: "Cargando...",
      overview: "Resumen",
      keyContacts: "Contactos clave",
      relatedIndustries: "Industrias relacionadas",
      relatedPractices: "Áreas de práctica relacionadas",
      representativeMatters: "Casos representativos",
      featured: "Destacado",
      client: "Cliente:",
    },
    de: {
      backToAll: "Zurück zu Praxisbereichen",
      contactUs: "Kontakt",
      contactCta: "Kontakt",
      emailUs: "E-Mail senden",
      callUs: "Anrufen",
      ourTeam: "Unser Team",
      partners: "Partner",
      ofCounsel: "Of Counsel",
      associates: "Associates",
      viewAll: "Alle anzeigen",
      viewProfile: "Profil anzeigen",
      rankingsTitle: "Rankings & Anerkennung",
      rankingsSubtitle: "Unsere Praxis wurde von führenden Rechtsverzeichnissen weltweit anerkannt.",
      successCasesTitle: "Erfolgsfälle",
      successCasesSubtitle: "Repräsentative Mandate, die von unserer Praxis erfolgreich bearbeitet wurden.",
      errorMessage: "Praxisbereich nicht gefunden",
      loading: "Wird geladen...",
      overview: "Übersicht",
      keyContacts: "Hauptkontakte",
      relatedIndustries: "Verwandte Branchen",
      relatedPractices: "Verwandte Praxisbereiche",
      representativeMatters: "Beispielmandate",
      featured: "Empfohlen",
      client: "Mandant:",
    },
    zh: {
      backToAll: "返回业务领域",
      contactUs: "联系我们",
      contactCta: "联系方式",
      emailUs: "发送邮件",
      callUs: "致电",
      ourTeam: "我们的团队",
      partners: "合伙人",
      ofCounsel: "顾问律师",
      associates: "律师助理",
      viewAll: "查看全部",
      viewProfile: "查看简介",
      rankingsTitle: "排名与认可",
      rankingsSubtitle: "我们的业务获得了全球领先法律目录的认可。",
      successCasesTitle: "成功案例",
      successCasesSubtitle: "我们业务成功处理的代表性案件。",
      errorMessage: "未找到业务领域",
      loading: "加载中...",
      overview: "概述",
      keyContacts: "主要联系人",
      relatedIndustries: "相关行业",
      relatedPractices: "相关业务领域",
      representativeMatters: "代表性案例",
      featured: "精选",
      client: "客户：",
    },
    ko: {
      backToAll: "업무 분야로 돌아가기",
      contactUs: "문의하기",
      contactCta: "연락처",
      emailUs: "이메일 보내기",
      callUs: "전화하기",
      ourTeam: "우리 팀",
      partners: "파트너",
      ofCounsel: "고문 변호사",
      associates: "어소시에이트",
      viewAll: "모두 보기",
      viewProfile: "프로필 보기",
      rankingsTitle: "순위 및 인정",
      rankingsSubtitle: "세계 주요 법률 디렉토리에서 인정받은 업무 분야입니다.",
      successCasesTitle: "성공 사례",
      successCasesSubtitle: "성공적으로 처리한 대표적인 사건들입니다.",
      errorMessage: "업무 분야를 찾을 수 없습니다",
      loading: "로딩 중...",
      overview: "개요",
      keyContacts: "주요 연락처",
      relatedIndustries: "관련 산업",
      relatedPractices: "관련 업무 분야",
      representativeMatters: "대표 사례",
      featured: "추천",
      client: "의뢰인:",
    },
    ja: {
      backToAll: "取扱分野に戻る",
      contactUs: "お問い合わせ",
      contactCta: "連絡先",
      emailUs: "メールを送る",
      callUs: "電話する",
      ourTeam: "私たちのチーム",
      partners: "パートナー",
      ofCounsel: "オブカウンセル",
      associates: "アソシエイト",
      viewAll: "すべて表示",
      viewProfile: "プロフィールを見る",
      rankingsTitle: "ランキングと評価",
      rankingsSubtitle: "当事務所の業務は世界の主要な法律ディレクトリで評価されています。",
      successCasesTitle: "成功事例",
      successCasesSubtitle: "当事務所が成功裏に処理した代表的な案件です。",
      errorMessage: "取扱分野が見つかりません",
      loading: "読み込み中...",
      overview: "概要",
      keyContacts: "主要連絡先",
      relatedIndustries: "関連業界",
      relatedPractices: "関連取扱分野",
      representativeMatters: "代表的な案件",
      featured: "注目",
      client: "クライアント：",
    },
    ar: {
      backToAll: "العودة إلى مجالات الممارسة",
      contactUs: "اتصل بنا",
      contactCta: "معلومات الاتصال",
      emailUs: "راسلنا",
      callUs: "اتصل بنا",
      ourTeam: "فريقنا",
      partners: "الشركاء",
      ofCounsel: "مستشار قانوني",
      associates: "محامون مساعدون",
      viewAll: "عرض الكل",
      viewProfile: "عرض الملف الشخصي",
      rankingsTitle: "التصنيفات والاعتراف",
      rankingsSubtitle: "تم الاعتراف بممارستنا من قبل أبرز الدلائل القانونية في العالم.",
      successCasesTitle: "قضايا ناجحة",
      successCasesSubtitle: "قضايا تمثيلية تمت معالجتها بنجاح.",
      errorMessage: "مجال الممارسة غير موجود",
      loading: "جاري التحميل...",
      overview: "نظرة عامة",
      keyContacts: "جهات الاتصال الرئيسية",
      relatedIndustries: "القطاعات ذات الصلة",
      relatedPractices: "مجالات الممارسة ذات الصلة",
      representativeMatters: "قضايا تمثيلية",
      featured: "مميز",
      client: "العميل:",
    },
    ru: {
      backToAll: "Назад к практикам",
      contactUs: "Свяжитесь с нами",
      contactCta: "Контакты",
      emailUs: "Написать",
      callUs: "Позвонить",
      ourTeam: "Наша команда",
      partners: "Партнёры",
      ofCounsel: "Of Counsel",
      associates: "Ассоциаты",
      viewAll: "Показать все",
      viewProfile: "Посмотреть профиль",
      rankingsTitle: "Рейтинги и признание",
      rankingsSubtitle: "Наша практика признана ведущими юридическими справочниками мира.",
      successCasesTitle: "Успешные дела",
      successCasesSubtitle: "Показательные дела, успешно проведённые нашей практикой.",
      errorMessage: "Практика не найдена",
      loading: "Загрузка...",
      overview: "Обзор",
      keyContacts: "Ключевые контакты",
      relatedIndustries: "Связанные отрасли",
      relatedPractices: "Связанные практики",
      representativeMatters: "Типичные дела",
      featured: "Рекомендовано",
      client: "Клиент:",
    },
    fr: {
      backToAll: "Retour aux domaines de pratique",
      contactUs: "Contactez-nous",
      contactCta: "Contact",
      emailUs: "Envoyer un email",
      callUs: "Appeler",
      ourTeam: "Notre équipe",
      partners: "Associés",
      ofCounsel: "Of Counsel",
      associates: "Collaborateurs",
      viewAll: "Voir tout",
      viewProfile: "Voir le profil",
      rankingsTitle: "Classements et reconnaissance",
      rankingsSubtitle: "Notre pratique a été reconnue par les principaux annuaires juridiques mondiaux.",
      successCasesTitle: "Affaires réussies",
      successCasesSubtitle: "Affaires représentatives traitées avec succès par notre cabinet.",
      errorMessage: "Domaine de pratique non trouvé",
      loading: "Chargement...",
      overview: "Aperçu",
      keyContacts: "Contacts clés",
      relatedIndustries: "Industries connexes",
      relatedPractices: "Domaines de pratique connexes",
      representativeMatters: "Dossiers représentatifs",
      featured: "En vedette",
      client: "Client :",
    },
    it: {
      backToAll: "Torna alle aree di pratica",
      contactUs: "Contattaci",
      contactCta: "Contatti",
      emailUs: "Invia email",
      callUs: "Chiama",
      ourTeam: "Il nostro team",
      partners: "Soci",
      ofCounsel: "Of Counsel",
      associates: "Associati",
      viewAll: "Vedi tutto",
      viewProfile: "Vedi profilo",
      rankingsTitle: "Classifiche e riconoscimenti",
      rankingsSubtitle: "La nostra pratica è stata riconosciuta dalle principali directory legali a livello mondiale.",
      successCasesTitle: "Casi di successo",
      successCasesSubtitle: "Casi rappresentativi gestiti con successo dalla nostra pratica.",
      errorMessage: "Area di pratica non trovata",
      loading: "Caricamento...",
      overview: "Panoramica",
      keyContacts: "Contatti principali",
      relatedIndustries: "Settori correlati",
      relatedPractices: "Aree di pratica correlate",
      representativeMatters: "Casi rappresentativi",
      featured: "In evidenza",
      client: "Cliente:",
    },
  };

  const t = translations[language] || translations.en;

  const filteredAndGroupedMembers = useMemo(() => {
    if (!allTeamMembers || !slug) return { partners: [], ofCounsel: [], associates: [] };

    const roleMatches = practiceAreaRoleMapping[slug] || [];
    
    const matchingMembers = allTeamMembers.filter(member => {
      return roleMatches.some(role => 
        member.role.toLowerCase().includes(role.toLowerCase()) ||
        role.toLowerCase().includes(member.role.toLowerCase())
      );
    });

    const partners = matchingMembers.filter(m => m.isPartner);
    const ofCounsel = matchingMembers.filter(m => m.title === "Of Counsel");
    const associates = matchingMembers.filter(m => m.title === "Associate");

    return { partners, ofCounsel, associates };
  }, [allTeamMembers, slug]);

  const practiceRankings: PracticeRanking[] = [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getBadgeStyles = (badgeType: string) => {
    if (badgeType === "band" || badgeType === "tier" || badgeType === "star") {
      return "border border-ss-marino text-ss-marino bg-transparent";
    }
    return "border border-ss-rule text-ss-tinta bg-transparent";
  };

  const getBadgeIcon = (_badgeType: string) => null;

  if (error) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-practice-group-error">
        <Header />
        {/* Cabecera sticky en flujo: ya no hace falta compensar el header fijo */}
        <main id="main-content" className="pt-16 pb-20 lg:pt-20">
          <Column>
            <h2 className="ss-h2 mb-6" data-testid="text-error-title">
              {t.errorMessage}
            </h2>
            <Button asChild variant="outline" data-testid="button-back-to-practice-groups">
              <Link href="/practice-groups">{t.backToAll}</Link>
            </Button>
          </Column>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-practice-group-loading">
        <Header />
        <main id="main-content">
          <section className="pt-36 pb-20 editorial-page-hero">
            <Column>
              <Skeleton className="h-5 w-48 bg-white/10 mb-6" />
              <Skeleton className="h-12 w-64 bg-white/10" />
            </Column>
          </section>
          <div className="py-16 lg:py-20">
            <Column>
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-6 w-5/6 mb-4" />
            </Column>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Otros idiomas: la traducción automática. Si no llega (o en el sitio estático), el inglés de
  // origen, marcado como inglés (EN_SOURCE); mientras se traduce, el aviso de carga.
  const isOtherLanguage = language !== 'es' && language !== 'en';
  const translationPending = isTranslating || isTranslationLoading;
  const sourceDescription = practiceGroup?.fullDescription || practiceGroup?.description;
  const displayName = language === 'es' 
    ? (practiceGroup?.nameEs || practiceGroup?.name)
    : language === 'en'
      ? practiceGroup?.name
      : (translatedFields.name || null);
  const displayDescription = language === 'es'
    ? (practiceGroup?.fullDescriptionEs || practiceGroup?.descriptionEs || practiceGroup?.fullDescription || practiceGroup?.description)
    : language === 'en'
      ? sourceDescription
      : (translatedFields.fullDescription || translatedFields.description || (translationPending ? null : sourceDescription));
  const shownName = displayName || (translationPending ? null : practiceGroup?.name);
  const nameIsSource = isOtherLanguage && !!shownName && shownName === practiceGroup?.name;
  const descriptionSource = isOtherLanguage && !!displayDescription &&
    (displayDescription === practiceGroup?.fullDescription || displayDescription === practiceGroup?.description);

  const MAX_ASSOCIATES_DISPLAY = 6;
  const displayedAssociates = filteredAndGroupedMembers.associates.slice(0, MAX_ASSOCIATES_DISPLAY);
  const hasMoreAssociates = filteredAndGroupedMembers.associates.length > MAX_ASSOCIATES_DISPLAY;

  // Fila abierta: retrato en escala de grises, nombre en romana Azul Marino y cargo como etiqueta
  const renderMemberCard = (member: TeamMember) => (
    <Link key={member.id} href={`/team/${member.slug}`}>
      <article
        className="group flex items-center gap-4 border-t border-ss-rule py-4 cursor-pointer"
        data-testid={`card-team-member-${member.slug}`}
      >
        <div
          className="relative w-16 h-20 shrink-0 overflow-hidden bg-ss-paper"
          data-testid={`img-team-member-${member.slug}`}
        >
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              loading="lazy"
              className="ss-photo absolute inset-0 h-full w-full object-cover object-top"
            />
          ) : (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-heading text-[20px] text-ss-marino"
            >
              {getInitials(member.name)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3
            className="font-heading text-[18px] leading-[1.25] text-ss-marino truncate group-hover:underline decoration-1 underline-offset-4"
            data-testid={`text-team-member-name-${member.slug}`}
          >
            {member.name}
          </h3>
          <p
            className="ss-label text-ss-medio mt-1 truncate"
            data-testid={`text-team-member-role-${member.slug}`}
            lang={isOtherLanguage ? "en" : undefined}
          >
            {/* Fuera de ES/EN el cargo es el inglés de origen: marcado como el titular */}
            {isOtherLanguage
              ? <bdi lang="en" dir="ltr">{member.role}</bdi>
              : (language === "es" ? member.roleEs : member.role)}
          </p>
        </div>
      </article>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="page-practice-group-detail">
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1). Encabezado y
          cuerpo en la misma columna (Column), al borde izquierdo del logotipo y del pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-practice-group-hero">
          <Column>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Link href="/practice-groups">
                <span
                  className="inline-flex items-center gap-2 mb-6 cursor-pointer"
                  data-testid="link-back-to-practice-groups"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  {t.backToAll}
                </span>
              </Link>
              <Eyebrow num="02" tone="navy" className="mb-4" />
              <div>
                <h1
                  className="ss-hero-detail"
                  data-testid="text-practice-group-title"
                  lang={nameIsSource ? "en" : undefined}
                >
                  {nameIsSource ? <bdi lang="en" dir="ltr">{shownName}</bdi> : shownName || (translationPending && (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-white/60" aria-hidden="true" />
                    </span>
                  ))}
                  {displayName && isTranslating && (
                    <Loader2 className="inline-block w-5 h-5 ml-3 animate-spin text-white/60" aria-hidden="true" />
                  )}
                </h1>
              </div>
            </motion.div>
          </Column>
        </section>

        {/* Description — light band with editorial lead paragraph */}
        <section className="bg-background py-16 lg:py-20">
          <Column>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div data-testid="container-practice-group-description">
                {displayDescription ? (() => {
                  const paragraphs = displayDescription.split(/\n\s*\n/).filter(Boolean);
                  const [first, ...rest] = paragraphs.length ? paragraphs : [displayDescription];
                  // Texto de origen en inglés: el bloque entero (rótulo incluido) va en inglés
                  return (
                    <div {...(descriptionSource ? EN_SOURCE : {})}>
                      <LeadParagraph
                        eyebrow={descriptionSource ? translations.en.overview : t.overview}
                        firstParagraph={first}
                        restParagraphs={rest}
                        testId="lead-practice-group"
                      />
                    </div>
                  );
                })() : (practiceGroup?.descriptionEs || practiceGroup?.description) && translationPending ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
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
                ) : null}
              </div>
            </motion.div>
          </Column>
        </section>

        {/* Casos de éxito: blanco, filete de sección y filas abiertas */}
        {representativeMatters && representativeMatters.length > 0 && (
          <section className="bg-background border-t border-ss-rule py-16 lg:py-20" data-testid="section-representative-matters">
            <Column>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.22 }}
              >
                <h2
                  className="ss-h2-sm mb-3"
                  data-testid="text-success-cases-title"
                >
                  {t.successCasesTitle}
                </h2>
                <p
                  className="text-base text-ss-medio mb-8 max-w-2xl"
                  data-testid="text-success-cases-subtitle"
                >
                  {t.successCasesSubtitle}
                </p>
                <div className="grid grid-cols-1 gap-8">
                  {representativeMatters
                    .sort((a, b) => {
                      if (a.isHighlight && !b.isHighlight) return -1;
                      if (!a.isHighlight && b.isHighlight) return 1;
                      return b.year - a.year;
                    })
                    .map((matter) => (
                      <TranslatedMatterCard
                        key={matter.id}
                        matter={matter}
                        language={language}
                        t={{ featured: t.featured, client: t.client }}
                      />
                    ))}
                </div>
              </motion.div>
            </Column>
          </section>
        )}

        {/* Rankings: lista de filetes */}
        {practiceRankings.length > 0 && (
          <section className="bg-background border-t border-ss-rule py-16 lg:py-20" data-testid="section-rankings">
            <Column>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <Eyebrow label={t.rankingsTitle} className="mb-4" testId="eyebrow-rankings" />
                <h2
                  className="ss-h2-sm mb-3"
                  data-testid="text-rankings-title"
                >
                  {t.rankingsTitle}
                </h2>
                <p
                  className="text-base text-ss-medio mb-8 max-w-2xl"
                  data-testid="text-rankings-subtitle"
                >
                  {t.rankingsSubtitle}
                </p>
                <RankingsList
                  items={practiceRankings as RankingItem[]}
                  language={language}
                  getBadgeStyles={getBadgeStyles}
                  getBadgeIcon={getBadgeIcon}
                  testIdPrefix="ranking"
                />
              </motion.div>
            </Column>
          </section>
        )}

        {/* Nuestro equipo: blanco, filas abiertas con retrato */}
        {(filteredAndGroupedMembers.partners.length > 0 ||
          filteredAndGroupedMembers.ofCounsel.length > 0 ||
          filteredAndGroupedMembers.associates.length > 0) && (
          <section className="bg-background border-t border-ss-rule py-16 lg:py-20" data-testid="section-team-members">
            <Column>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2
                  className="ss-h2-sm mb-8"
                  data-testid="text-our-team-title"
                >
                  {t.ourTeam}
                </h2>

                {filteredAndGroupedMembers.partners.length > 0 && (
                  <div className="mb-10" data-testid="section-partners">
                    <h3
                      className="ss-label text-ss-medio mb-2 flex items-baseline gap-3"
                      data-testid="text-partners-title"
                    >
                      {t.partners}
                      <span className="ss-label text-ss-marino">
                        {filteredAndGroupedMembers.partners.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      {filteredAndGroupedMembers.partners.map(renderMemberCard)}
                    </div>
                  </div>
                )}

                {filteredAndGroupedMembers.ofCounsel.length > 0 && (
                  <div className="mb-10" data-testid="section-of-counsel">
                    <h3
                      className="ss-label text-ss-medio mb-2 flex items-baseline gap-3"
                      data-testid="text-of-counsel-title"
                    >
                      {t.ofCounsel}
                      <span className="ss-label text-ss-marino">
                        {filteredAndGroupedMembers.ofCounsel.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      {filteredAndGroupedMembers.ofCounsel.map(renderMemberCard)}
                    </div>
                  </div>
                )}

                {displayedAssociates.length > 0 && (
                  <div data-testid="section-associates">
                    <h3
                      className="ss-label text-ss-medio mb-2 flex items-baseline gap-3"
                      data-testid="text-associates-title"
                    >
                      {t.associates}
                      <span className="ss-label text-ss-marino">
                        {filteredAndGroupedMembers.associates.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      {displayedAssociates.map(renderMemberCard)}
                    </div>
                    {hasMoreAssociates && (
                      <div className="mt-6">
                        <Button
                          asChild
                          variant="outline"
                          data-testid="button-view-all-associates"
                        >
                          <Link href={`/team?practice=${slug}`}>
                            {t.viewAll} ({filteredAndGroupedMembers.associates.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </Column>
          </section>
        )}

        {/* Contacto: bloque Hueso, sin iconos. Dirección y teléfono como datos (sin texto de
            venta); un solo elemento enfocable por acción y el mismo ancho apilados en teléfono */}
        <section className="bg-background pb-16 lg:pb-24">
          <Column>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-ss-paper p-8 lg:p-12"
              data-testid="section-contact-cta"
            >
              <h2
                className="ss-h2-sm mb-3"
                data-testid="text-contact-cta-title"
              >
                {t.contactCta}
              </h2>
              <p
                className="text-base text-ss-tinta mb-6 max-w-2xl"
                data-testid="text-contact-cta-subtitle"
              >
                {/* Cada parte de la dirección sin cortes internos ("C.P. 66220") */}
                {address.map((part, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <span className="whitespace-nowrap">{part}</span>
                  </span>
                ))}
                <br />
                <span dir="ltr">T. {phone}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="w-full sm:w-auto" data-testid="button-email-us">
                  <Link href="/contact">{t.emailUs}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto" data-testid="button-call-us">
                  <a href={phoneHref}>{t.callUs}</a>
                </Button>
              </div>
            </motion.section>
          </Column>
        </section>
      </main>

      <Footer />
    </div>
  );
}
