// Página de cada práctica con el diseño de la demo v3 (aprobada el 5-11-2026): foto horizontal a todo lo
// ancho, el nombre y su resumen, y a su lado el equipo; el texto de la práctica con «Qué hacemos»; la
// primera lámina isométrica; los servicios del texto; las demás láminas (ninguna lámina azul pegada a
// otra); y al final las cuatro prácticas y la página siguiente. Litigio, sin lámina: sus servicios en
// una banda azul con una foto de la oficina (config.ts, feature).
// Todo el texto de la práctica viene de la base y del panel, en los 10 idiomas, como antes: nombre,
// resumen, texto largo (lema «# », entrada y servicios «## »), lista «Qué hacemos», equipo y casos.
// Lo nuevo de la demo (láminas y rótulos) va en español o inglés: client/src/v3/practicas/.
import { useContentEntity } from "@/features/admin/ContentPreview";
import { useCmsContent } from "@/hooks/useCmsContent";
import cmsDefaults from "@shared/cms-defaults.json";
import { Link, Redirect, useParams } from "wouter";
import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { getTeamPhotoThumb } from "@/lib/teamPhotoSources";
import { Eyebrow } from "@/components/editorial";
import { chrome26 } from "@/components/home26/chrome26";
import { TextLink } from "@/components/home26/primitives";
import { isNamedOnTeamPage } from "@shared/teamVisibility";
import { keepFirmName } from "@/lib/firmName";
import { usePracticeNames } from "@/lib/practiceNames";
import { V3Main, V3PageHeader, useV3Lang, v3SrcSet, v3HeaderSizes } from "@/v3/shared";
import { Figura } from "@/v3/practicas/Figura";
import { Destacado } from "@/v3/practicas/Destacado";
import { SiguientePractica } from "@/v3/practicas/Siguiente";
import { LAMINAS_TOTAL, LAMINA_N, LEGACY_SLUGS, PRACTICE_V3, type Plate, type PracticeV3 } from "@/v3/practicas/config";
import { PAGINA, type SheetId } from "@/v3/practicas/textos";
import "@/v3/practicas/practicas.css";
import type { PracticeGroup, TeamMember, RepresentativeMatterDb } from "@shared/schema";
import type { LanguageCode } from "@shared/constants";

// Texto de origen en inglés mostrado en otro idioma (sin traducción, o en el sitio estático):
// lleva su propio idioma y dirección, para que :lang() y el algoritmo bidi lo traten como inglés.
// La descripción larga va entera en LTR (EN_SOURCE). El título conserva la dirección de la
// página: solo lleva <bdi lang="en" dir="ltr">.
const EN_SOURCE = { lang: "en", dir: "ltr" } as const;

const BASE = import.meta.env.BASE_URL;

// La anatomía (three.js) solo en las prácticas que la llevan: su código se pide al montarla
const Anatomia = lazy(() => import("@/v3/practicas/Anatomia").then((m) => ({ default: m.Anatomia })));
const H1 = "pp-practica-h";

// Título mientras carga una dirección que no es de las cuatro prácticas conocidas
const LOADING: Record<string, string> = {
  es: "Cargando…", en: "Loading…", de: "Wird geladen…", zh: "加载中…", ko: "로딩 중…",
  ja: "読み込み中…", ar: "جارٍ التحميل…", ru: "Загрузка…", fr: "Chargement…", it: "Caricamento…",
};

// Quién figura en cada práctica: solo lo que dice el registro de cada persona (campo role).
// Hoy todos los registros dicen "Labor law" (la comparación no distingue mayúsculas); ninguno
// vincula a una persona con las prácticas corporativa, migratoria o de litigio, así que esas
// páginas no muestran nombres.
const practiceAreaRoleMapping: Record<string, string[]> = {
  "laboral-seguridad-social": ["Labor law"],
  "corporativo-contractual": [],
  "migratorio": [],
  "litigio-contencioso": [],
};

// Sin práctica en la tabla de la demo (una práctica nueva del panel): foto neutra y sin láminas
const FALLBACK_V3: PracticeV3 = {
  vista: "practica",
  photo: {
    src: "v3/c-cerro-luna.webp", w: 2400, h: 1600, pos: "50% 62%",
    alt: {
      es: "La luna llena sale entre dos crestas de la sierra, al anochecer", en: "The full moon rises between two ridges of the sierra at dusk",
      de: "Der Vollmond geht in der Dämmerung zwischen zwei Bergkämmen auf", zh: "暮色中，满月从两道山脊之间升起", ko: "해질 무렵 보름달이 두 산등성이 사이로 떠오릅니다", ja: "夕暮れ、満月が二つの山稜の間から昇ります", ar: "يطلع البدر بين سلسلتي جبال عند الغسق", ru: "В сумерках полная луна поднимается между двумя горными хребтами", fr: "La pleine lune se lève entre deux crêtes au crépuscule", it: "La luna piena sorge tra due creste al crepuscolo",
    },
  },
  plates: [],
};

// Texto de una práctica (full_description): párrafos separados por una línea en blanco.
// Un bloque que empieza con "# " es el lema y cada "## " abre un servicio; lo que va antes del
// primer servicio es la entrada. Sin marcas (p. ej. una traducción que las pierda), todo es entrada.
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
    <span className="pd-equipo__foto" data-testid={`img-team-member-${member.slug}`}>
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setSrc(src !== member.imageUrl ? member.imageUrl || undefined : undefined)}
        />
      ) : (
        <span aria-hidden="true" className="pd-equipo__ini">{initials}</span>
      )}
    </span>
  );
}

interface TranslatedMatterCardProps {
  matter: RepresentativeMatterDb;
  language: string;
  t: { featured: string; client: string };
}

// Caso representativo: fila abierta con filete superior; año y «Destacado» como etiquetas
function TranslatedMatterCard({ matter, language, t }: TranslatedMatterCardProps) {
  const { translatedFields } = useTranslatedContent({
    contentType: "representative_matter",
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

  return (
    <article className="pd-caso" data-testid={`card-matter-${matter.id}`}>
      <p className="pd-caso__k">
        {matter.isHighlight ? <span className="pd-caso__dest">{t.featured}</span> : null}
        <span data-testid={`badge-matter-year-${matter.id}`}>{matter.year}</span>
      </p>
      <h3 className="sh-h3 pd-caso__t" data-testid={`text-matter-title-${matter.id}`}>{displayTitle}</h3>
      <p className="pd-caso__d" data-testid={`text-matter-description-${matter.id}`}>{displayDescription}</p>
      {displayClient ? (
        <p className="pd-caso__c" data-testid={`text-matter-client-${matter.id}`}>
          <span>{t.client} </span>
          {displayClient}
        </p>
      ) : null}
    </article>
  );
}

/** Una lámina de la página, con su número de la demo (n/7: anatomía 3 y 4, figuras 5, 6 y 7). La clave
    lleva la práctica, la lámina y el idioma: al pasar de una práctica a otra la lámina arranca de nuevo. */
function Lamina({ plate, slug, lang, attrs }: { plate: Plate; slug: string; lang: LanguageCode; attrs: { lang?: string; dir?: "ltr" | "rtl" } }) {
  if (plate.kind === "anatomia") {
    const nums: Partial<Record<SheetId, string>> = {};
    plate.sheets.forEach((id) => { nums[id] = `${LAMINA_N[id]}/${LAMINAS_TOTAL}`; });
    return (
      <div className="pd-laminas">
        {/* mientras llega su código, una sección del mismo alto (la del recorrido), sin contenido */}
        <Suspense fallback={<section className="an sobre-azul" aria-hidden="true" />}>
          <Anatomia key={`an-${slug}-${plate.sheets.join("+")}-${lang}`} sheets={plate.sheets} nums={nums} lang={lang} attrs={attrs} />
        </Suspense>
      </div>
    );
  }
  const n = LAMINA_N[plate.area];
  return (
    <div className="pd-laminas">
      <Figura key={`fg-${slug}-${plate.area}-${n}-${LAMINAS_TOTAL}-${lang}`} area={plate.area} n={n} total={LAMINAS_TOTAL} lang={lang} attrs={attrs} />
    </div>
  );
}

export default function PracticeGroupDetail() {
  const { name: practiceName } = usePracticeNames();
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();
  const { lang, locale, attrs } = useV3Lang();
  const params = useParams<{ slug: string }>();
  // Direcciones de la demo con otro nombre de práctica: a la del sitio, sin pedir la que no existe
  const legacy = params.slug ? LEGACY_SLUGS[params.slug] : undefined;
  const slug = legacy ? undefined : params.slug;

  const { data: practiceGroup, isLoading, error } = useContentEntity<PracticeGroup>("practices", slug);

  const { data: allTeamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: allGroups } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const { data: representativeMatters } = useQuery<RepresentativeMatterDb[]>({
    queryKey: ["/api/practice-groups", slug, "representative-matters"],
    enabled: !!slug,
  });

  const { translatedFields, isTranslating, isLoading: isTranslationLoading } = useTranslatedContent({
    contentType: "practice_group",
    entityId: practiceGroup?.id?.toString() || "",
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
      ourTeam: "Notre équipe",
      partners: "Associés",
      rankingsTitle: "Classements et reconnaissance",
      rankingsSubtitle: "Notre pratique a été reconnue par les principaux annuaires juridiques mondiaux.",
      successCasesTitle: "Affaires réussies",
      successCasesSubtitle: "Affaires représentatives traitées avec succès par notre cabinet.",
      errorMessage: "Domaine de pratique non trouvé",
      featured: "En vedette",
      client: "Client :",
    },
    it: {
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

  const editableContent = useCmsContent("practice-detail", translations);
  const t = editableContent[language] || editableContent.en;
  // «Qué hacemos»: la lista de servicios de cada práctica, editable en el panel (petición del
  // cliente, 24-10-2026). El snapshot del CMS contiene las diez versiones.
  const serviceLists = useCmsContent("practice-services", cmsDefaults["practice-services"]);
  const servicesCopy = (serviceLists as Record<string, { title: string; items: Record<string, string[]> }>)[language]
    ?? serviceLists.en
    ?? serviceLists.es;
  const serviceItems: string[] = (slug && (servicesCopy.items as Record<string, string[]>)[slug]) || [];
  // Vuelta a la sección con la etiqueta del menú en cada idioma (chrome26 nav[1]: "Prácticas")
  const backToAll = (cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en).nav[1].label;

  // Personas de la práctica: su registro la menciona (role) y la regla de quién aparece con
  // nombre en el sitio (isNamedOnTeamPage: socios confirmados y Of Counsel). El fundador in
  // memoriam no figura como integrante de una práctica.
  const practiceMembers = useMemo(() => {
    if (!allTeamMembers || !slug) return [];
    const roles = (practiceAreaRoleMapping[slug] || []).map((role) => role.toLowerCase());
    return allTeamMembers
      .filter((member) => practiceGroup?.teamMemberIds ? practiceGroup.teamMemberIds.includes(member.id) : roles.includes(member.role.toLowerCase()))
      .filter((member) => isNamedOnTeamPage(member))
      .filter((member) => !/memoriam/i.test(member.title))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [allTeamMembers, slug, practiceGroup?.teamMemberIds]);

  // Las cuatro prácticas (en el orden del panel) para la fila del final y la página siguiente
  const ordered = useMemo(
    () => (allGroups ? [...allGroups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []),
    [allGroups],
  );
  const nameOf = (g: PracticeGroup) =>
    language === "es" ? g.nameEs || g.name : language === "en" ? g.name : practiceName(g.slug, language) || g.name;

  if (legacy) return <Redirect to={`/practice-groups/${legacy}`} replace />;

  const cfg = (slug && PRACTICE_V3[slug]) || FALLBACK_V3;

  // Práctica inexistente (enlace viejo o mal escrito): la misma vista 404 que la ficha de socio
  // (not-found.tsx): SEOHead page="notFound" (título propio y noindex), encabezado azul con
  // "Error 404" y el mensaje como h1. El enlace lleva al listado con el rótulo del menú (nav[1]).
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="page-practice-group-error">
        <SEOHead page="notFound" language={language} />
        <Header />
        <main id="main-content" className="flex-1 pt-36 pb-20 editorial-page-hero" data-testid="section-not-found-hero">
          <div className="ss-container">
            <Eyebrow num="" tone="navy" label="Error 404" className="mb-6" />
            <h1 className="mb-10" data-testid="text-error-title">
              {t.errorMessage}
            </h1>
            {/* Enlace del router (respeta la base de GitHub Pages), no botón */}
            <TextLink href="/practice-groups" tone="dark" data-testid="button-back-to-practice-groups">
              {backToAll}
            </TextLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Cargando: la foto de la práctica ya está en la tabla; el título y la entrada esperan
  if (isLoading || !practiceGroup) {
    return (
      <div className="ss26 min-h-screen" data-testid="page-practice-group-loading">
        <Header />
        <V3Main vista={cfg.vista} className="pd">
          <header className="sh-pp sh-cab" aria-busy="true" aria-labelledby={H1}>
            <figure className="sh-pp__foto">
              <img src={`${BASE}${cfg.photo.src}`} srcSet={v3SrcSet(`${BASE}${cfg.photo.src}`, cfg.photo.w)} sizes={v3HeaderSizes(cfg.photo.w, cfg.photo.h)} {...{ fetchpriority: "high" }} alt="" width={cfg.photo.w} height={cfg.photo.h} style={{ objectPosition: cfg.photo.pos }} />
            </figure>
            <div className="sh-wrap sh-pp__cuerpo">
              <div className="sh-pp__texto pd-cargando">
                {/* la página tiene siempre su h1: el nombre de la práctica en el idioma de la página
                    (practiceNames.ts) o, si la dirección no es de una de las cuatro, «Cargando…» */}
                <h1 id={H1} className="sh-h1" tabIndex={-1} data-testid="text-practice-group-title-loading">
                  {(slug && practiceName(slug, language)) || LOADING[language] || LOADING.en}
                </h1>
                <Skeleton className="mt-8 h-5 w-full max-w-lg bg-[rgba(15,63,107,.08)]" />
                <Skeleton className="mt-3 h-5 w-5/6 max-w-md bg-[rgba(15,63,107,.08)]" />
              </div>
            </div>
          </header>
        </V3Main>
        <Footer />
      </div>
    );
  }

  // Otros idiomas: el inglés de origen de inmediato, marcado como inglés (EN_SOURCE), y la
  // traducción automática solo si llega (sin h1 vacío ni indicador mientras se espera).
  const isOtherLanguage = language !== "es" && language !== "en";
  const translationPending = isTranslating || isTranslationLoading;
  const sourceDescription = practiceGroup.fullDescription || practiceGroup.description;
  // Fuera de ES/EN, el nombre de la práctica en el idioma de la página (practiceNames.ts): el
  // mismo término de la lista, la descripción SEO y el select de Contacto
  const localName = isOtherLanguage && slug ? practiceName(slug, language) : undefined;
  const shownName = language === "es"
    ? (practiceGroup.nameEs || practiceGroup.name)
    : language === "en"
      ? practiceGroup.name
      : (localName || translatedFields.name || practiceGroup.name);
  const displayDescription = language === "es"
    ? (practiceGroup.fullDescriptionEs || practiceGroup.descriptionEs || practiceGroup.fullDescription || practiceGroup.description)
    : language === "en"
      ? sourceDescription
      : (translatedFields.fullDescription || translatedFields.description || sourceDescription);
  // Con nombre propio del idioma no es texto de origen (fr "Immigration" coincide con el inglés)
  const nameIsSource = isOtherLanguage && !localName && !!shownName && shownName === practiceGroup.name;
  const descriptionSource = isOtherLanguage && !!displayDescription &&
    (displayDescription === practiceGroup.fullDescription || displayDescription === practiceGroup.description);

  // Resumen de la práctica (la entrada bajo el título): el mismo de la lista de prácticas
  const summary = language === "es"
    ? (practiceGroup.descriptionEs || practiceGroup.description)
    : language === "en"
      ? practiceGroup.description
      : (translatedFields.description || practiceGroup.description);
  const summaryIsSource = isOtherLanguage && !!summary && summary === practiceGroup.description;

  const practiceText = displayDescription ? parsePracticeText(displayDescription) : null;
  // Bloque largo en inglés de origen (fuera de ES/EN): LTR y lang="en", también en árabe
  const sourceAttrs = descriptionSource ? EN_SOURCE : {};
  const allPartners = practiceMembers.every((member) => member.isPartner);

  // Pestaña "Práctica | Santos & Saucedo" y descripción en el idioma de la página: el resumen
  // de la práctica; sin traducción (fuera de ES/EN), la descripción general de Prácticas en
  // ese idioma (SEOHead) en lugar del inglés de origen.
  const seoDescription = language === "es"
    ? practiceGroup.descriptionEs || practiceGroup.description
    : language === "en"
      ? practiceGroup.description
      : translatedFields.description && translatedFields.description !== practiceGroup.description
        ? translatedFields.description
        : undefined;

  // Fila de las cuatro prácticas y la siguiente (la que sigue en el orden del panel; tras la
  // última, Industrias)
  const here = ordered.findIndex((g) => g.slug === practiceGroup.slug);
  const nextGroup = here >= 0 && here < ordered.length - 1 ? ordered[here + 1] : null;
  const P = PAGINA[locale];
  const practicesRow = ordered.map((g) => ({ href: `/practice-groups/${g.slug}`, label: nameOf(g) }));

  const sortedMatters = representativeMatters
    ? [...representativeMatters].sort((a, b) => {
        if (a.isHighlight && !b.isHighlight) return -1;
        if (!a.isHighlight && b.isHighlight) return 1;
        return b.year - a.year;
      })
    : [];

  const firm = (s: string): ReactNode => keepFirmName(s);
  const hasText = !!practiceText && (!!practiceText.tagline || practiceText.intro.length > 0 || practiceText.services.length > 0);
  const services = practiceText ? practiceText.services : [];
  const [firstPlate, ...restPlates] = cfg.plates;
  // Tras la última práctica, Industrias: el título de la demo en ES/EN; en los otros idiomas, el
  // rótulo de Industrias del sitio en ese idioma (chrome26, el del buscador)
  const chromeL = cmsChrome[language as keyof typeof chrome26] ?? cmsChrome.en;
  const nextIndustries = language === "es" || language === "en" ? P.industries : chromeL.search.groups.industryGroups;

  return (
    <div className="ss26 min-h-screen" data-testid="page-practice-group-detail">
      <SEOHead
        page="practiceGroups"
        language={language}
        customTitle={shownName ? `${shownName} | Santos & Saucedo` : undefined}
        customDescription={seoDescription || undefined}
        customPath={`/practice-groups/${practiceGroup.slug}`}
      />
      <Header />

      <V3Main vista={cfg.vista} className="pd">
        {/* Foto a todo lo ancho; debajo, el nombre, el resumen y, a su lado, quienes llevan la práctica */}
        <V3PageHeader
          id={H1}
          img={`${BASE}${cfg.photo.src}`}
          alt={cfg.photo.alt[locale]}
          imgAttrs={attrs}
          width={cfg.photo.w}
          height={cfg.photo.h}
          position={cfg.photo.pos}
          title={
            <span data-testid="text-practice-group-title" lang={nameIsSource ? "en" : undefined}>
              {nameIsSource ? <bdi lang="en" dir="ltr">{shownName}</bdi> : shownName}
            </span>
          }
          lead={summary ? (
            <span className="pd-lead" data-testid="text-practice-group-summary" {...(summaryIsSource ? EN_SOURCE : {})}>
              {firm(summary)}
            </span>
          ) : undefined}
        >
          {practiceMembers.length > 0 ? (
            <aside className="pd-equipo" aria-labelledby="practice-people-title" data-testid="section-team-members">
              <h2 id="practice-people-title" className="pd-k" data-testid="text-our-team-title">
                {allPartners ? t.partners : t.ourTeam}
              </h2>
              <ul data-testid="section-partners">
                {practiceMembers.map((member) => {
                  const role = memberTitle(member, language);
                  return (
                    <li key={member.id} data-testid={`card-team-member-${member.slug}`}>
                      <Link href={`/team/${member.slug}`} className="pd-equipo__a">
                        <MemberThumb member={member} />
                        <span className="pd-equipo__txt">
                          <span className="pd-equipo__n" data-testid={`text-team-member-name-${member.slug}`}>{member.name}</span>
                          <span className="pd-equipo__c" data-testid={`text-team-member-role-${member.slug}`} lang={role.source ? "en" : undefined}>
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
          ) : null}
        </V3PageHeader>

        {/* El texto de la práctica a la izquierda; «Qué hacemos» a la derecha (arriba en teléfono) */}
        {hasText || serviceItems.length > 0 || translationPending ? (
          <div className="pd-cuerpo">
            <div className="sh-wrap pd-cuerpo__in">
              {serviceItems.length > 0 ? (
                <section
                  className="pd-hacemos"
                  aria-labelledby="practice-what-title"
                  data-testid="list-practice-what-we-do"
                  {...(isOtherLanguage ? EN_SOURCE : {})}
                >
                  <h2 id="practice-what-title" className="pd-k">{servicesCopy.title}</h2>
                  <ul>
                    {serviceItems.map((item, i) => <li key={i}>{firm(item)}</li>)}
                  </ul>
                </section>
              ) : null}

              {practiceText && (practiceText.tagline || practiceText.intro.length > 0) ? (
                <div className="pd-texto" data-testid="container-practice-group-description" {...sourceAttrs}>
                  {practiceText.tagline ? (
                    <h2 className="pd-lema" data-testid="text-practice-group-tagline">{firm(practiceText.tagline)}</h2>
                  ) : null}
                  {practiceText.intro.length > 0 ? (
                    <div className="pd-entrada" data-testid="lead-practice-group">
                      {practiceText.intro.map((p, i) => <p key={i}>{firm(p)}</p>)}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!hasText && translationPending ? (
                <div className="pd-texto pd-espera">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span data-testid="text-translation-pending">
                    {language === "de" ? "Übersetzung lädt…" :
                     language === "zh" ? "翻译加载中…" :
                     language === "ko" ? "번역 로딩 중…" :
                     language === "ja" ? "翻訳を読み込み中…" :
                     language === "ar" ? "جاري تحميل الترجمة…" :
                     language === "ru" ? "Загрузка перевода…" :
                     language === "fr" ? "Traduction en cours…" :
                     language === "it" ? "Caricamento traduzione…" :
                     "Loading translation…"}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* La primera lámina, justo después del texto (como en la demo, tras la cabecera) */}
        {firstPlate ? <Lamina plate={firstPlate} slug={practiceGroup.slug} lang={locale} attrs={attrs} /> : null}

        {/* Los servicios del texto («## »). Con lámina: en dos columnas sobre el fondo claro, entre la
            primera lámina y las demás. Sin lámina (litigio): en la banda azul con la foto de la oficina. */}
        {services.length > 0 && cfg.feature ? (
          <Destacado feature={cfg.feature} testId="list-practice-services">
            <div className="pd-dest__txt" {...sourceAttrs}>
              {services.map((service, index) => (
                <section key={index} className="pd-dest__area" data-testid={`item-practice-service-${index}`}>
                  <h2 className="sh-filo__frase pd-dest__t">{firm(service.title)}</h2>
                  {service.paragraphs.map((paragraph, i) => <p key={i} className="sh-filo__p">{firm(paragraph)}</p>)}
                </section>
              ))}
            </div>
          </Destacado>
        ) : services.length > 0 ? (
          <div className="pd-servicios">
            <div className="sh-wrap pd-areas" data-testid="list-practice-services" {...sourceAttrs}>
              {services.map((service, index) => (
                <section key={index} className="pd-area" data-testid={`item-practice-service-${index}`}>
                  {/* h3: cada servicio es una parte del texto de la práctica */}
                  <h3 className="sh-h3">{firm(service.title)}</h3>
                  <div className="pd-area__txt">
                    {service.paragraphs.map((paragraph, i) => <p key={i}>{firm(paragraph)}</p>)}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : null}

        {/* Casos representativos (los que la firma cargue en el panel) */}
        {sortedMatters.length > 0 ? (
          <section className="pd-casos" aria-labelledby="practice-cases-title" data-testid="section-representative-matters">
            <div className="sh-wrap">
              <div className="pd-casos__cab">
                <h2 id="practice-cases-title" className="sh-h2" data-testid="text-success-cases-title">{t.successCasesTitle}</h2>
                <p data-testid="text-success-cases-subtitle">{t.successCasesSubtitle}</p>
              </div>
              <div className="pd-casos__lista">
                {sortedMatters.map((matter) => (
                  <TranslatedMatterCard key={matter.id} matter={matter} language={language} t={{ featured: t.featured, client: t.client }} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Las demás láminas (laboral: el calendario del IMSS y el INFONAVIT) */}
        {restPlates.map((plate, i) => <Lamina key={`${practiceGroup.slug}-${i}`} plate={plate} slug={practiceGroup.slug} lang={locale} attrs={attrs} />)}

        {/* Las cuatro prácticas y la página siguiente; «Siguiente» en inglés fuera de ES/EN, marcado */}
        <SiguientePractica
          href={nextGroup ? `/practice-groups/${nextGroup.slug}` : "/industries"}
          label={P.next}
          labelAttrs={attrs}
          title={nextGroup ? nameOf(nextGroup) : nextIndustries}
          practices={practicesRow}
          practicesLabel={backToAll}
          allHref="/practice-groups"
          current={`/practice-groups/${practiceGroup.slug}`}
        />
      </V3Main>

      <Footer />
    </div>
  );
}
