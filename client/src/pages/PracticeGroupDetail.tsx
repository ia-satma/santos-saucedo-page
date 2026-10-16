import { Link, useParams } from "wouter";
import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { getTeamPhotoThumb } from "@/lib/teamPhotoSources";
import { Eyebrow, LeadParagraph, RankingsList, type RankingItem } from "@/components/editorial";
import { isNamedOnTeamPage } from "@shared/teamVisibility";
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

// Quién figura en cada práctica: solo lo que dice el registro de cada persona (campo role).
// Hoy todos los registros dicen "Labor Law"; ninguno vincula a una persona con las prácticas
// corporativa, migratoria o contenciosa, así que esas páginas no muestran nombres.
const practiceAreaRoleMapping: Record<string, string[]> = {
  "laboral-seguridad-social": ["Labor Law"],
  "corporativo-contractual": [],
  "migratorio": [],
  "litigio-contencioso": [],
};

// Texto de una práctica (full_description): párrafos separados por una línea en blanco.
// Un bloque que empieza con "# " es el lema (subtítulo del encabezado) y cada "## " abre un
// servicio de la lista de dos columnas; lo que va antes del primer servicio es la entrada.
// Sin marcas (p. ej. una traducción que las pierda), todo es entrada.
interface PracticeText {
  tagline: string | null;
  intro: string[];
  services: { title: string; paragraphs: string[] }[];
}

function parsePracticeText(text: string): PracticeText {
  const result: PracticeText = { tagline: null, intro: [], services: [] };
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  for (const block of blocks) {
    const [firstLine, ...restLines] = block.split("\n");
    const rest = restLines.join(" ").trim();
    if (/^##\s/.test(firstLine)) {
      result.services.push({ title: firstLine.replace(/^##\s+/, "").trim(), paragraphs: rest ? [rest] : [] });
    } else if (/^#\s/.test(firstLine) && !result.tagline && !result.intro.length && !result.services.length) {
      result.tagline = firstLine.replace(/^#\s+/, "").trim();
      if (rest) result.intro.push(rest);
    } else if (result.services.length) {
      result.services[result.services.length - 1].paragraphs.push(block);
    } else {
      result.intro.push(block);
    }
  }
  return result;
}

// Cargo bajo el nombre (en inglés, en minúscula inicial como el resto del sitio)
function memberTitle(member: TeamMember, language: string): { text: string; source: boolean } {
  if (language === "es") return { text: member.titleEs || member.title, source: false };
  const en = member.title ? member.title.charAt(0) + member.title.slice(1).toLowerCase() : member.titleEs;
  return { text: en, source: language !== "en" };
}

// Retrato cuadrado pequeño (miniatura WebP de 128 px; si falta, el original)
function MemberThumb({ member }: { member: TeamMember }) {
  const [src, setSrc] = useState(() => getTeamPhotoThumb(member.imageUrl));
  const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="relative h-14 w-14 shrink-0 overflow-hidden bg-ss-paper"
      data-testid={`img-team-member-${member.slug}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="ss-photo absolute inset-0 h-full w-full object-cover object-top"
          onError={() => setSrc(src !== member.imageUrl ? member.imageUrl || undefined : undefined)}
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-heading text-[18px] text-ss-marino">
          {initials}
        </span>
      )}
    </div>
  );
}

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
  const { language } = useLanguage();
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
    ourTeam: string;
    partners: string;
    rankingsTitle: string;
    rankingsSubtitle: string;
    successCasesTitle: string;
    successCasesSubtitle: string;
    errorMessage: string;
    featured: string;
    client: string;
  }> = {
    en: {
      backToAll: "All practice areas",
      ourTeam: "Our team",
      partners: "Partners",
      rankingsTitle: "Rankings and recognition",
      rankingsSubtitle: "Our practice has been recognized by leading legal directories worldwide.",
      successCasesTitle: "Success cases",
      successCasesSubtitle: "Representative matters successfully handled by our practice.",
      errorMessage: "Practice area not found",
      featured: "Featured",
      client: "Client:",
    },
    es: {
      backToAll: "Todas las áreas de práctica",
      ourTeam: "Nuestro equipo",
      partners: "Socios",
      rankingsTitle: "Rankings y reconocimientos",
      rankingsSubtitle: "Nuestra práctica ha sido reconocida por los principales directorios legales a nivel mundial.",
      successCasesTitle: "Casos de éxito",
      successCasesSubtitle: "Casos representativos manejados exitosamente por nuestra práctica.",
      errorMessage: "Área de práctica no encontrada",
      featured: "Destacado",
      client: "Cliente:",
    },
    de: {
      backToAll: "Zurück zu Praxisbereichen",
      ourTeam: "Unser Team",
      partners: "Partner",
      rankingsTitle: "Rankings & Anerkennung",
      rankingsSubtitle: "Unsere Praxis wurde von führenden Rechtsverzeichnissen weltweit anerkannt.",
      successCasesTitle: "Erfolgsfälle",
      successCasesSubtitle: "Repräsentative Mandate, die von unserer Praxis erfolgreich bearbeitet wurden.",
      errorMessage: "Praxisbereich nicht gefunden",
      featured: "Empfohlen",
      client: "Mandant:",
    },
    zh: {
      backToAll: "返回业务领域",
      ourTeam: "我们的团队",
      partners: "合伙人",
      rankingsTitle: "排名与认可",
      rankingsSubtitle: "我们的业务获得了全球领先法律目录的认可。",
      successCasesTitle: "成功案例",
      successCasesSubtitle: "我们业务成功处理的代表性案件。",
      errorMessage: "未找到业务领域",
      featured: "精选",
      client: "客户：",
    },
    ko: {
      backToAll: "업무 분야로 돌아가기",
      ourTeam: "우리 팀",
      partners: "파트너",
      rankingsTitle: "순위 및 인정",
      rankingsSubtitle: "세계 주요 법률 디렉토리에서 인정받은 업무 분야입니다.",
      successCasesTitle: "성공 사례",
      successCasesSubtitle: "성공적으로 처리한 대표적인 사건들입니다.",
      errorMessage: "업무 분야를 찾을 수 없습니다",
      featured: "추천",
      client: "의뢰인:",
    },
    ja: {
      backToAll: "取扱分野に戻る",
      ourTeam: "私たちのチーム",
      partners: "パートナー",
      rankingsTitle: "ランキングと評価",
      rankingsSubtitle: "当事務所の業務は世界の主要な法律ディレクトリで評価されています。",
      successCasesTitle: "成功事例",
      successCasesSubtitle: "当事務所が成功裏に処理した代表的な案件です。",
      errorMessage: "取扱分野が見つかりません",
      featured: "注目",
      client: "クライアント：",
    },
    ar: {
      backToAll: "العودة إلى مجالات الممارسة",
      ourTeam: "فريقنا",
      partners: "الشركاء",
      rankingsTitle: "التصنيفات والاعتراف",
      rankingsSubtitle: "تم الاعتراف بممارستنا من قبل أبرز الدلائل القانونية في العالم.",
      successCasesTitle: "قضايا ناجحة",
      successCasesSubtitle: "قضايا تمثيلية تمت معالجتها بنجاح.",
      errorMessage: "مجال الممارسة غير موجود",
      featured: "مميز",
      client: "العميل:",
    },
    ru: {
      backToAll: "Назад к практикам",
      ourTeam: "Наша команда",
      partners: "Партнёры",
      rankingsTitle: "Рейтинги и признание",
      rankingsSubtitle: "Наша практика признана ведущими юридическими справочниками мира.",
      successCasesTitle: "Успешные дела",
      successCasesSubtitle: "Показательные дела, успешно проведённые нашей практикой.",
      errorMessage: "Практика не найдена",
      featured: "Рекомендовано",
      client: "Клиент:",
    },
    fr: {
      backToAll: "Retour aux domaines de pratique",
      ourTeam: "Notre équipe",
      partners: "Associés",
      rankingsTitle: "Classements et reconnaissance",
      rankingsSubtitle: "Notre pratique a été reconnue par les principaux annuaires juridiques mondiaux.",
      successCasesTitle: "Affaires réussies",
      successCasesSubtitle: "Affaires représentatives traitées avec succès par notre cabinet.",
      errorMessage: "Domaine de pratique non trouvé",
      featured: "En vedette",
      client: "Client\u202f:",
    },
    it: {
      backToAll: "Torna alle aree di pratica",
      ourTeam: "Il nostro team",
      partners: "Soci",
      rankingsTitle: "Classifiche e riconoscimenti",
      rankingsSubtitle: "La nostra pratica è stata riconosciuta dalle principali directory legali a livello mondiale.",
      successCasesTitle: "Casi di successo",
      successCasesSubtitle: "Casi rappresentativi gestiti con successo dalla nostra pratica.",
      errorMessage: "Area di pratica non trovata",
      featured: "In evidenza",
      client: "Cliente:",
    },
  };

  const t = translations[language] || translations.en;

  // Personas de la práctica: su registro la menciona (role) y la regla de quién aparece con
  // nombre en el sitio (isNamedOnTeamPage: socios confirmados y Of Counsel). El fundador in
  // memoriam no figura como integrante de una práctica.
  const practiceMembers = useMemo(() => {
    if (!allTeamMembers || !slug) return [];
    const roles = (practiceAreaRoleMapping[slug] || []).map((role) => role.toLowerCase());
    return allTeamMembers
      .filter((member) => roles.includes(member.role.toLowerCase()))
      .filter((member) => isNamedOnTeamPage(member))
      .filter((member) => !/memoriam/i.test(member.title))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [allTeamMembers, slug]);

  const practiceRankings: PracticeRanking[] = [];

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
            <Link
              href="/practice-groups"
              className="ss-label inline-flex items-center gap-2 text-ss-marino hover:underline decoration-1 underline-offset-4"
              data-testid="button-back-to-practice-groups"
            >
              <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" />
              {t.backToAll}
            </Link>
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

  const practiceText = displayDescription ? parsePracticeText(displayDescription) : null;
  // Bloque largo en inglés de origen (fuera de ES/EN): LTR y lang="en", también en árabe
  const sourceAttrs = descriptionSource ? EN_SOURCE : {};
  const allPartners = practiceMembers.every((member) => member.isPartner);

  // Pestaña "Práctica | Santos & Saucedo" y descripción en el idioma de la página: el resumen
  // de la práctica; sin traducción (fuera de ES/EN), la descripción general de Prácticas en
  // ese idioma (SEOHead) en lugar del inglés de origen.
  const seoDescription = language === "es"
    ? practiceGroup?.descriptionEs || practiceGroup?.description
    : language === "en"
      ? practiceGroup?.description
      : translatedFields.description && translatedFields.description !== practiceGroup?.description
        ? translatedFields.description
        : undefined;

  return (
    <div className="min-h-screen bg-background" data-testid="page-practice-group-detail">
      {practiceGroup && (
        <SEOHead
          page="practiceGroups"
          language={language}
          customTitle={shownName ? `${shownName} | Santos & Saucedo` : undefined}
          customDescription={seoDescription || undefined}
          customPath={`/practice-groups/${practiceGroup.slug}`}
        />
      )}
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1). Encabezado en la
          columna de lectura (Column) y cuerpo en ss-container: mismo borde izquierdo que el
          logotipo y el pie. */}
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
                {practiceText?.tagline && (
                  <p data-testid="text-practice-group-tagline" lang={descriptionSource ? "en" : undefined}>
                    {descriptionSource ? <bdi lang="en" dir="ltr">{practiceText.tagline}</bdi> : practiceText.tagline}
                  </p>
                )}
              </div>
            </motion.div>
          </Column>
        </section>

        {/* Entrada a la izquierda (≈ 8 columnas) y, a la derecha, los socios de la práctica
            (solo si su registro la menciona). Debajo, los servicios en una lista de filetes de
            dos columnas a todo el ancho del contenedor. */}
        <section className="bg-background py-16 lg:py-20">
          <div className="ss-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-12"
            >
              <div className="lg:col-span-8 xl:col-span-7" data-testid="container-practice-group-description">
                {practiceText && practiceText.intro.length > 0 ? (
                  <div {...sourceAttrs}>
                    <LeadParagraph
                      firstParagraph={practiceText.intro[0]}
                      restParagraphs={practiceText.intro.slice(1)}
                      testId="lead-practice-group"
                    />
                  </div>
                ) : !displayDescription && (practiceGroup?.descriptionEs || practiceGroup?.description) && translationPending ? (
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

              {/* Socios de la práctica: retrato cuadrado pequeño, nombre y cargo. Sin nadie
                  confirmado, la columna no se pinta. */}
              {practiceMembers.length > 0 && (
                <aside
                  className="lg:col-span-4 lg:col-start-9"
                  aria-labelledby="practice-people-title"
                  data-testid="section-team-members"
                >
                  {/* Encabezado de columna lateral: romana de 20 px, no etiqueta */}
                  <h2
                    id="practice-people-title"
                    className="ss-h3 text-[20px] mb-4"
                    data-testid="text-our-team-title"
                  >
                    {allPartners ? t.partners : t.ourTeam}
                  </h2>
                  <ul className="border-b border-ss-rule" data-testid="section-partners">
                    {practiceMembers.map((member) => {
                      const role = memberTitle(member, language);
                      return (
                        <li key={member.id} className="border-t border-ss-rule" data-testid={`card-team-member-${member.slug}`}>
                          <Link
                            href={`/team/${member.slug}`}
                            className="inline-link group flex items-center gap-4 py-4"
                          >
                            <MemberThumb member={member} />
                            <span className="min-w-0">
                              <span
                                className="block font-heading text-[18px] leading-[1.25] text-ss-marino group-hover:underline decoration-1 underline-offset-4"
                                data-testid={`text-team-member-name-${member.slug}`}
                              >
                                {member.name}
                              </span>
                              <span
                                className="ss-label block mt-1 text-ss-medio"
                                data-testid={`text-team-member-role-${member.slug}`}
                                lang={role.source ? "en" : undefined}
                              >
                                {/* Fuera de ES/EN el cargo es el inglés de origen, aislado */}
                                {role.source ? <bdi lang="en" dir="ltr">{role.text}</bdi> : role.text}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </aside>
              )}
            </motion.div>

            {practiceText && practiceText.services.length > 0 && (
              <ul
                className="mt-16 grid grid-cols-1 gap-x-12 md:grid-cols-2 lg:mt-20"
                data-testid="list-practice-services"
                {...sourceAttrs}
              >
                {practiceText.services.map((service, index) => (
                  <li
                    key={index}
                    className="border-t border-ss-rule pt-6 pb-10"
                    data-testid={`item-practice-service-${index}`}
                  >
                    {/* h2 con el aspecto de h3: cada servicio es una sección de la práctica */}
                    <h2 className="ss-h3 mb-3">{service.title}</h2>
                    {service.paragraphs.map((paragraph, i) => (
                      <p key={i} className={`ss-prose text-[16px] leading-[1.6] text-ss-tinta ${i > 0 ? "mt-4" : ""}`}>
                        {paragraph}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                  className="ss-h2 mb-3"
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
                  className="ss-h2 mb-3"
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
      </main>

      <Footer />
    </div>
  );
}
