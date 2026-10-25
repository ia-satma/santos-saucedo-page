import defaults from "@shared/cms-defaults.json";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import type { LanguageCode } from "@shared/schema";
import { chrome26 } from "@/components/home26/chrome26";
import { OFFICE_LABEL, officeLabel } from "@/lib/officeLabel";

const BASE_URL = "https://www.santossaucedo.com";
// Logotipo de client/public (el build lo copia a la raíz del sitio); el de /images no existe
const DEFAULT_IMAGE = "https://www.santossaucedo.com/logo-color.png";
const SITE_NAME = "Santos & Saucedo";

const OG_LOCALE_CODES: Record<LanguageCode, string> = {
  en: "en_US",
  es: "es_MX",
  de: "de_DE",
  zh: "zh_CN",
  ko: "ko_KR",
  ja: "ja_JP",
  ar: "ar_SA",
  ru: "ru_RU",
  fr: "fr_FR",
  it: "it_IT",
};

const LANGS: LanguageCode[] = ["en", "es", "de", "zh", "ko", "ja", "ar", "ru", "fr", "it"];

// Las etiquetas de chrome26 llevan guiones suaves (U+00AD) y cortes (U+200B) para el pie;
// en el título de la pestaña no hacen falta.
const plain = (text: string) => text.replace(/[­​]/g, "");

// Título de pestaña de las seis páginas del menú: la etiqueta de su enlace en cada idioma
// (01 Nuestra firma … 06 Contacto). Así el Monitor Laboral se llama igual en el h1, el menú
// y la pestaña (Labor Monitor, Nachrichten, ニュース…).
function navTitle(index: number): Record<LanguageCode, string> {
  return Object.fromEntries(
    LANGS.map((lang) => [lang, `${plain(chrome26[lang].nav[index].label)} | ${SITE_NAME}`]),
  ) as Record<LanguageCode, string>;
}

// Páginas legales: el nombre de su enlace en el pie
function footerTitle(key: "privacy" | "terms"): Record<LanguageCode, string> {
  return Object.fromEntries(
    LANGS.map((lang) => [lang, `${plain(chrome26[lang].footer[key])} | ${SITE_NAME}`]),
  ) as Record<LanguageCode, string>;
}

/** Nombre de la publicación en cada idioma: la etiqueta del menú (Monitor Laboral, Labor Monitor, Nachrichten…) */
export function publicationName(language: LanguageCode): string {
  return plain((chrome26[language] ?? chrome26.es).nav[3].label);
}

/** Título de una ficha (socio, práctica): "Nombre | Santos & Saucedo" */
export function detailTitle(name: string): string {
  return `${name} | ${SITE_NAME}`;
}

/** Título de una nota: "Titular | Monitor Laboral" (el nombre de la publicación en el idioma) */
export function articleTitle(headline: string, language: LanguageCode): string {
  return `${headline} | ${publicationName(language)}`;
}

// Fin de oración: . ! ? tras una minúscula, una cifra o un cierre (paréntesis, comillas), o
// los signos de cierre del chino y el japonés. Una inicial ("Jorge A. Garza") no cierra la
// oración, y tampoco un punto antes de 40 caracteres (abreviaturas como "Lic.").
// (RegExp con "u" para \p{Ll}, minúscula de cualquier alfabeto: á, ñ, é…)
const SENTENCE_END = new RegExp('[\\p{Ll}\\p{N})"»”’][.!?](?=\\s|$)|[。！？]', "gu");
const MIN_SENTENCE = 40;

/** Descripción a partir de un texto largo (biografía, resumen, entradilla): la primera oración, hasta ~155 caracteres en límite de palabra */
export function metaDescription(text: string | null | undefined, max = 155): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  let sentence = clean;
  for (const m of Array.from(clean.matchAll(SENTENCE_END))) {
    const end = (m.index ?? 0) + m[0].length;
    if (end >= MIN_SENTENCE) {
      sentence = clean.slice(0, end);
      break;
    }
  }
  if (sentence.length <= max) return sentence;
  const cut = sentence.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:\s]+$/, "")}…`;
}

interface SEOConfig {
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
  /** Ruta canónica cuando la página no da otra (customPath o la ruta actual) */
  path: string;
  /** Página que no debe indexarse (404): robots noindex y sin canonical */
  noindex?: boolean;
}

// Cada idioma usa su propio texto (antes una anulación en inglés pisaba a los otros ocho).
// Descripciones neutras, en tercera persona, sin elogios, llamadas ni datos sin confirmar;
// la experiencia del equipo se comunica como más de 40 años. Títulos en minúscula inicial (también en
// ruso e inglés).
const practiceGroupsConfig: SEOConfig = {
  title: navTitle(1),
  description: {
    en: "Santos & Saucedo practices for companies: labor and social security, corporate and contractual, immigration, and litigation and workplace criminal matters.",
    es: "Prácticas de Santos & Saucedo para empresas: laboral y seguridad social, corporativo y contractual, migratorio, y litigio y penal laboral.",
    de: "Praxisbereiche von Santos & Saucedo für Unternehmen: Arbeits- und Sozialversicherungsrecht, Gesellschafts- und Vertragsrecht, Migrationsrecht sowie Prozessführung und Arbeitsstrafrecht.",
    zh: "Santos & Saucedo为企业提供的业务领域：劳动与社会保障、公司与合同、移民以及诉讼与劳动刑事。",
    ko: "Santos & Saucedo의 기업 대상 업무 분야: 노동 및 사회보장, 기업 및 계약, 이민, 소송 및 노동 형사.",
    ja: "Santos & Saucedoの企業向け取扱分野：労働・社会保障、企業法務・契約、移民、訴訟・労働刑事。",
    ar: "مجالات ممارسة Santos & Saucedo للشركات: العمل والضمان الاجتماعي، والشركات والعقود، والهجرة، والتقاضي والقضايا الجنائية العمالية.",
    ru: "Практики Santos & Saucedo для компаний: трудовое право и социальное обеспечение, корпоративное и договорное право, миграционное право, судебные споры и уголовные дела в сфере труда.",
    fr: "Domaines de pratique de Santos & Saucedo pour les entreprises : droit du travail et sécurité sociale, droit des sociétés et des contrats, immigration, contentieux et pénal du travail.",
    it: "Aree di pratica di Santos & Saucedo per le imprese: lavoro e previdenza sociale, societario e contrattuale, immigrazione, contenzioso e penale del lavoro.",
  },
  path: "/practice-groups",
};

const contactConfig: SEOConfig = {
  title: navTitle(5),
  description: {
    en: "Santos & Saucedo office: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    es: "Oficina de Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    de: "Büro von Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    zh: "Santos & Saucedo办公地址：Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    ko: "Santos & Saucedo 사무소: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    ja: "Santos & Saucedoの所在地：Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    ar: "مكتب Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    ru: "Офис Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    fr: "Bureau de Santos & Saucedo : Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
    it: "Sede di Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L.",
  },
  path: "/contact",
};

const newsConfig: SEOConfig = {
  title: navTitle(3),
  description: {
    en: "Analysis and publications from the Santos & Saucedo Labor Monitor on the labor and social security changes that affect employers.",
    es: "Análisis y publicaciones del Monitor Laboral de Santos & Saucedo sobre los cambios laborales y de seguridad social que afectan a las empresas.",
    de: "Nachrichten und Analysen von Santos & Saucedo zu den Änderungen im Arbeits- und Sozialversicherungsrecht, die Unternehmen betreffen.",
    zh: "Santos & Saucedo关于影响企业的劳动法和社会保障法变化的新闻与分析。",
    ko: "기업에 영향을 미치는 노동법 및 사회보장법의 변화에 관한 Santos & Saucedo의 뉴스와 분석.",
    ja: "企業に影響する労働法・社会保障法の改正に関するSantos & Saucedoのニュースと分析。",
    ar: "أخبار وتحليلات Santos & Saucedo حول التغييرات في قانون العمل والضمان الاجتماعي التي تؤثر على الشركات.",
    ru: "Новости и аналитика Santos & Saucedo об изменениях трудового права и социального обеспечения, которые касаются компаний.",
    fr: "Actualités et analyses de Santos & Saucedo sur les évolutions du droit du travail et de la sécurité sociale qui concernent les entreprises.",
    it: "Notizie e analisi di Santos & Saucedo sulle novità del diritto del lavoro e della previdenza sociale che riguardano le imprese.",
  },
  path: "/news",
};

const seoConfig: Record<string, SEOConfig> = {
  home: {
    title: {
      en: "Santos & Saucedo | Law firm for companies in San Pedro Garza García",
      es: "Santos & Saucedo | Abogados para empresas en San Pedro Garza García",
      de: "Santos & Saucedo | Kanzlei für Unternehmen in San Pedro Garza García",
      zh: "Santos & Saucedo | 圣佩德罗加尔萨加西亚的企业律师事务所",
      ko: "Santos & Saucedo | 산페드로가르사가르시아의 기업 법률사무소",
      ja: "Santos & Saucedo | サン・ペドロ・ガルサ・ガルシアの企業法律事務所",
      ar: "Santos & Saucedo | محامون للشركات في سان بيدرو غارثا غارسيا",
      ru: "Santos & Saucedo | Юридическая фирма для компаний в Сан-Педро-Гарса-Гарсия",
      fr: "Santos & Saucedo | Cabinet d’avocats pour les entreprises à San Pedro Garza García",
      it: "Santos & Saucedo | Studio legale per le imprese a San Pedro Garza García",
    },
    description: {
      en: "Human-capital administration and legal defense for companies, rooted in labor law. More than 40 years of experience and a national alliance across more than 72 Mexican cities.",
      es: "Administración del capital humano y defensa legal para empresas, con raíz en el derecho laboral. Más de 40 años de experiencia y alianza nacional en más de 72 ciudades de México.",
      de: "Verwaltung des Humankapitals und Rechtsverteidigung für Unternehmen, mit Wurzeln im Arbeitsrecht. Mehr als 35 Jahre Erfahrung und eine nationale Allianz in mehr als 72 Städten Mexikos.",
      zh: "为企业提供人力资本管理与法律辩护，以劳动法为根基。超过40年的经验，并通过全国联盟覆盖墨西哥72个以上城市。",
      ko: "노동법에 뿌리를 둔 기업의 인적 자본 관리와 법률 방어. 40년 이상의 경험과 멕시코 72개 이상 도시에 걸친 전국 제휴.",
      ja: "労働法を基盤とする、企業のための人的資本管理と法的防御。40年以上の経験と、メキシコ72以上の都市にわたる全国的な提携。",
      ar: "إدارة رأس المال البشري والدفاع القانوني للشركات، بجذور في قانون العمل. أكثر من 40 عامًا من الخبرة وتحالف وطني في أكثر من 72 مدينة في المكسيك.",
      ru: "Управление человеческим капиталом и правовая защита компаний с опорой на трудовое право. Более 40 лет опыта и национальный альянс в более чем 72 городах Мексики.",
      fr: "Administration du capital humain et défense juridique des entreprises, ancrées dans le droit du travail. Plus de 40 ans d’expérience et une alliance nationale dans plus de 72 villes du Mexique.",
      it: "Amministrazione del capitale umano e difesa legale per le imprese, con radici nel diritto del lavoro. Oltre 40 anni di esperienza e un’alleanza nazionale in più di 72 città del Messico.",
    },
    path: "/",
  },
  about: {
    title: navTitle(0),
    description: {
      en: "Santos & Saucedo is a law firm for companies —labor, corporate, immigration and litigation— rooted in labor law, with more than 40 years of experience advising national and multinational companies.",
      es: "Santos & Saucedo es una firma legal para empresas —laboral, corporativo, migratorio y litigio— con raíz en el derecho laboral y más de 40 años de experiencia asesorando empresas nacionales y multinacionales.",
      de: "Santos & Saucedo ist eine Kanzlei für Unternehmen – Arbeitsrecht, Gesellschafts- und Vertragsrecht, Migrationsrecht und Prozessführung – mit Wurzeln im Arbeitsrecht und mehr als 40 Jahren Erfahrung in der Beratung nationaler und multinationaler Unternehmen.",
      zh: "Santos & Saucedo是一家服务企业的律师事务所，业务涵盖劳动、公司、移民和诉讼，以劳动法为根基，拥有超过40年为国内企业和跨国企业提供咨询的经验。",
      ko: "Santos & Saucedo는 노동, 기업, 이민, 소송 분야에서 기업을 자문하는 법률사무소로, 노동법에 뿌리를 두고 40년 이상 국내 기업과 다국적 기업에 자문해 왔습니다.",
      ja: "Santos & Saucedoは、労働、企業法務、移民、訴訟の分野で企業を支援する法律事務所です。労働法を基盤とし、40年以上にわたり国内企業と多国籍企業に助言してきました。",
      ar: "Santos & Saucedo مكتب محاماة للشركات في مجالات العمل والشركات والهجرة والتقاضي، بجذور في قانون العمل وخبرة تزيد على 40 عامًا في تقديم المشورة للشركات الوطنية والمتعددة الجنسيات.",
      ru: "Santos & Saucedo — юридическая фирма для компаний (трудовое, корпоративное и миграционное право, судебные споры) с опорой на трудовое право и более чем 40-летним опытом консультирования национальных и многонациональных компаний.",
      fr: "Santos & Saucedo est un cabinet d’avocats pour les entreprises — droit du travail, droit des sociétés, immigration et contentieux — ancré dans le droit du travail, avec plus de 40 ans d’expérience auprès d’entreprises nationales et multinationales.",
      it: "Santos & Saucedo è uno studio legale per le imprese — lavoro, societario, immigrazione e contenzioso — con radici nel diritto del lavoro e oltre 40 anni di esperienza nella consulenza ad aziende nazionali e multinazionali.",
    },
    path: "/about",
  },
  team: {
    title: navTitle(2),
    description: {
      en: "Partners and team of Santos & Saucedo, a labor law firm for companies in San Pedro Garza García.",
      es: "Socios y equipo de Santos & Saucedo, firma de derecho laboral para empresas en San Pedro Garza García.",
      de: "Partner und Team von Santos & Saucedo, Kanzlei für Arbeitsrecht für Unternehmen in San Pedro Garza García.",
      zh: "Santos & Saucedo的合伙人与团队。Santos & Saucedo是位于圣佩德罗加尔萨加西亚、为企业提供劳动法服务的律师事务所。",
      ko: "산페드로가르사가르시아에서 기업의 노동법 업무를 맡는 Santos & Saucedo의 파트너와 구성원.",
      ja: "サン・ペドロ・ガルサ・ガルシアで企業の労働法務を扱うSantos & Saucedoのパートナーとチーム。",
      ar: "شركاء وفريق Santos & Saucedo، مكتب قانون العمل للشركات في سان بيدرو غارثا غارسيا.",
      ru: "Партнёры и команда Santos & Saucedo — фирмы трудового права для компаний в Сан-Педро-Гарса-Гарсия.",
      fr: "Associés et équipe de Santos & Saucedo, cabinet de droit du travail pour les entreprises à San Pedro Garza García.",
      it: "Soci e team di Santos & Saucedo, studio di diritto del lavoro per le imprese a San Pedro Garza García.",
    },
    path: "/team",
  },
  practiceGroups: practiceGroupsConfig,
  news: newsConfig,
  contact: contactConfig,
  careers: {
    title: navTitle(4),
    description: {
      en: "Careers at Santos & Saucedo for students, lawyers and administrative staff.",
      es: "Carreras en Santos & Saucedo para estudiantes, abogados y personal administrativo.",
      de: "Karriere bei Santos & Saucedo für Studierende, Anwältinnen und Anwälte sowie Verwaltungspersonal.",
      zh: "Santos & Saucedo面向学生、律师和行政人员的职业机会。",
      ko: "학생, 변호사, 행정 직원을 위한 Santos & Saucedo의 채용 정보.",
      ja: "学生、弁護士、事務職員を対象としたSantos & Saucedoの採用情報。",
      ar: "الوظائف في Santos & Saucedo للطلاب والمحامين والموظفين الإداريين.",
      ru: "Карьера в Santos & Saucedo для студентов, юристов и административного персонала.",
      fr: "Carrières chez Santos & Saucedo pour les étudiants, les avocats et le personnel administratif.",
      it: "Carriere in Santos & Saucedo per studenti, avvocati e personale amministrativo.",
    },
    path: "/careers",
  },
  // "La oficina" (H1): el título es el nombre de la página en cada idioma (lib/officeLabel, el
  // mismo del h1, el pie y los enlaces); la descripción, la dirección y lo que dice la
  // introducción, sin cifras ni adjetivos.
  offices: {
    title: Object.fromEntries(
      LANGS.map((lang) => [lang, `${officeLabel(lang)} | ${SITE_NAME}`]),
    ) as Record<LanguageCode, string>,
    description: {
      en: "The Santos & Saucedo office: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León, facing Cerro de la Silla.",
      es: "La oficina de Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León, frente al Cerro de la Silla.",
      de: "Die Kanzleiräume von Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León, gegenüber dem Cerro de la Silla.",
      zh: "Santos & Saucedo办公室：Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León，面朝马鞍山（Cerro de la Silla）。",
      ko: "Santos & Saucedo 사무실: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León. 세로 데 라 시야(Cerro de la Silla)를 마주하고 있습니다.",
      ja: "Santos & Saucedoのオフィス：Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León。セロ・デ・ラ・シージャ（Cerro de la Silla）に面しています。",
      ar: "مكتب Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León، قبالة جبل سيرو دي لا سيا.",
      ru: "Офис Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León, напротив горы Серро-де-ла-Силья.",
      fr: "Le bureau de Santos & Saucedo : Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León, face au Cerro de la Silla.",
      it: "La sede di Santos & Saucedo: Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, Nuevo León, di fronte al Cerro de la Silla.",
    },
    path: "/offices",
  },
  privacyPolicy: {
    title: footerTitle("privacy"),
    description: {
      en: "Santos & Saucedo privacy notice on the processing and protection of personal data.",
      es: "Aviso de privacidad de Santos & Saucedo sobre el tratamiento y la protección de datos personales.",
      de: "Datenschutzhinweis von Santos & Saucedo zur Verarbeitung und zum Schutz personenbezogener Daten.",
      zh: "Santos & Saucedo关于个人数据处理与保护的隐私声明。",
      ko: "개인정보의 처리 및 보호에 관한 Santos & Saucedo의 개인정보 처리방침.",
      ja: "個人データの取扱いと保護に関するSantos & Saucedoのプライバシーポリシー。",
      ar: "إشعار الخصوصية الخاص بـ Santos & Saucedo بشأن معالجة البيانات الشخصية وحمايتها.",
      ru: "Политика конфиденциальности Santos & Saucedo об обработке и защите персональных данных.",
      fr: "Politique de confidentialité de Santos & Saucedo relative au traitement et à la protection des données personnelles.",
      it: "Informativa sulla privacy di Santos & Saucedo sul trattamento e la protezione dei dati personali.",
    },
    path: "/privacy-policy",
  },
  terms: {
    title: footerTitle("terms"),
    description: {
      en: "Terms of use of the Santos & Saucedo website.",
      es: "Términos de uso del sitio de Santos & Saucedo.",
      de: "Nutzungsbedingungen der Website von Santos & Saucedo.",
      zh: "Santos & Saucedo网站使用条款。",
      ko: "Santos & Saucedo 웹사이트 이용 약관.",
      ja: "Santos & Saucedoウェブサイトの利用規約。",
      ar: "شروط استخدام موقع Santos & Saucedo الإلكتروني.",
      ru: "Условия использования сайта Santos & Saucedo.",
      fr: "Conditions d’utilisation du site de Santos & Saucedo.",
      it: "Termini di utilizzo del sito di Santos & Saucedo.",
    },
    path: "/terms",
  },
  // La página pasa su h1 como customTitle (E5); esto es el respaldo, con el mismo nombre de la
  // publicación que el menú (nav[3]) en cada idioma
  newsletter: {
    title: {
      en: "Labor Monitor subscription | Santos & Saucedo",
      es: "Suscripción al Monitor Laboral | Santos & Saucedo",
      de: "Nachrichten abonnieren | Santos & Saucedo",
      zh: "订阅新闻 | Santos & Saucedo",
      ko: "뉴스 구독 | Santos & Saucedo",
      ja: "ニュースの購読 | Santos & Saucedo",
      ar: "الاشتراك في الأخبار | Santos & Saucedo",
      ru: "Подписка на новости | Santos & Saucedo",
      fr: "Abonnement aux actualités | Santos & Saucedo",
      it: "Iscrizione alle notizie | Santos & Saucedo",
    },
    description: {
      en: "The Santos & Saucedo Labor Monitor’s analysis of labor and social security law, by email.",
      es: "Los análisis del Monitor Laboral de Santos & Saucedo sobre derecho laboral y seguridad social, por correo electrónico.",
      de: "Die Analysen von Santos & Saucedo zum Arbeits- und Sozialversicherungsrecht, per E-Mail.",
      zh: "Santos & Saucedo关于劳动法和社会保障法的分析，以电子邮件发送。",
      ko: "노동법 및 사회보장법에 관한 Santos & Saucedo의 분석을 이메일로 보내 드립니다.",
      ja: "労働法・社会保障法に関するSantos & Saucedoの分析をメールでお届けします。",
      ar: "تحليلات Santos & Saucedo حول قانون العمل والضمان الاجتماعي، عبر البريد الإلكتروني.",
      ru: "Аналитика Santos & Saucedo по трудовому праву и социальному обеспечению — по электронной почте.",
      fr: "Les analyses de Santos & Saucedo sur le droit du travail et de la sécurité sociale, par courriel.",
      it: "Le analisi di Santos & Saucedo sul diritto del lavoro e della previdenza sociale, via e-mail.",
    },
    path: "/newsletter",
  },
  interns: {
    title: {
      en: "S&S Internships | Santos & Saucedo",
      es: "Pasantías S&S | Santos & Saucedo",
      de: "Pasantías S&S | Santos & Saucedo",
      zh: "Pasantías S&S | Santos & Saucedo",
      ko: "Pasantías S&S | Santos & Saucedo",
      ja: "Pasantías S&S | Santos & Saucedo",
      ar: "Pasantías S&S | Santos & Saucedo",
      ru: "Pasantías S&S | Santos & Saucedo",
      fr: "Pasantías S&S | Santos & Saucedo",
      it: "Pasantías S&S | Santos & Saucedo",
    },
    description: {
      en: "S&S Internships is the Santos & Saucedo internship program.",
      es: "Pasantías S&S es el programa de pasantes de Santos & Saucedo.",
      de: "Pasantías S&S ist das Praktikantenprogramm von Santos & Saucedo.",
      zh: "Pasantías S&S是Santos & Saucedo的实习生项目。",
      ko: "Pasantías S&S는 Santos & Saucedo의 인턴 프로그램입니다.",
      ja: "Pasantías S&Sは、Santos & Saucedoのインターン・プログラムです。",
      ar: "Pasantías S&S هو برنامج المتدربين في Santos & Saucedo.",
      ru: "Pasantías S&S — программа стажировок Santos & Saucedo.",
      fr: "Pasantías S&S est le programme de stagiaires de Santos & Saucedo.",
      it: "Pasantías S&S è il programma di tirocinio di Santos & Saucedo.",
    },
    path: "/careers/interns",
  },
  // Testimonios: el listado se indexa; el formulario del enlace de invitación, no
  testimonials: defaults.seo.testimonials,
  testimonialWrite: defaults.seo.testimonialWrite,
  // 404: título y descripción propios en el idioma de la página; no se indexa
  notFound: {
    title: {
      en: "Page not found | Santos & Saucedo",
      es: "Página no encontrada | Santos & Saucedo",
      de: "Seite nicht gefunden | Santos & Saucedo",
      zh: "页面未找到 | Santos & Saucedo",
      ko: "페이지를 찾을 수 없습니다 | Santos & Saucedo",
      ja: "ページが見つかりません | Santos & Saucedo",
      ar: "الصفحة غير موجودة | Santos & Saucedo",
      ru: "Страница не найдена | Santos & Saucedo",
      fr: "Page non trouvée | Santos & Saucedo",
      it: "Pagina non trovata | Santos & Saucedo",
    },
    description: {
      en: "The requested page does not exist on the Santos & Saucedo website.",
      es: "La página solicitada no existe en el sitio de Santos & Saucedo.",
      de: "Die angeforderte Seite existiert auf der Website von Santos & Saucedo nicht.",
      zh: "Santos & Saucedo网站上不存在所请求的页面。",
      ko: "요청하신 페이지는 Santos & Saucedo 웹사이트에 없습니다.",
      ja: "お探しのページはSantos & Saucedoのサイトに存在しません。",
      ar: "الصفحة المطلوبة غير موجودة في موقع Santos & Saucedo.",
      ru: "Запрошенная страница не существует на сайте Santos & Saucedo.",
      fr: "La page demandée n’existe pas sur le site de Santos & Saucedo.",
      it: "La pagina richiesta non esiste sul sito di Santos & Saucedo.",
    },
    path: "",
    noindex: true,
  },
};

interface SEOHeadProps {
  page: keyof typeof seoConfig;
  language: LanguageCode;
  /** Fichas y notas: "Nombre | Santos & Saucedo" (detailTitle) o "Titular | Monitor Laboral" (articleTitle) */
  customTitle?: string;
  /** Fichas y notas: la primera oración de la biografía, el resumen o la entradilla (metaDescription) */
  customDescription?: string;
  customImage?: string;
  /** Ruta canónica; por defecto, la ruta actual (sin la base de GitHub Pages) */
  customPath?: string;
}

export default function SEOHead({
  page,
  language,
  customTitle,
  customDescription,
  customImage,
  customPath,
}: SEOHeadProps) {
  const [location] = useLocation();
  const liveChrome = useCmsContent("chrome", chrome26);
  const officeName = useCmsContent("officeLabels", OFFICE_LABEL);
  const media = useCmsMedia();
  const integrations=useCmsContent("integrations",defaults.integrations);
  const seoFallback = useMemo(() => {
    const navigation: Record<string,number> = {about:0,practiceGroups:1,team:2,news:3,careers:4,contact:5};
    return Object.fromEntries(Object.entries(seoConfig).map(([key,config]) => [key, { ...config, title: Object.fromEntries(LANGS.map(lang => {
      const text = key in navigation ? `${plain(liveChrome[lang].nav[navigation[key]].label)} | ${media.brand.name}` : key==='offices' ? `${officeName[lang]} | ${media.brand.name}` : key==='privacyPolicy' ? `${liveChrome[lang].footer.privacy} | ${media.brand.name}` : key==='terms' ? `${liveChrome[lang].footer.terms} | ${media.brand.name}` : config.title[lang];
      return [lang,text];
    })) as Record<LanguageCode,string> }])) as Record<string,SEOConfig>;
  },[liveChrome,officeName,media.brand.name]);
  const liveSEO = useCmsContent("seo", seoFallback);

  useEffect(() => {
    const config = liveSEO[page];
    if (!config) return;

    const title = customTitle || config.title[language] || config.title.es;
    const description = customDescription || config.description[language] || config.description.es;
    // Canonical por página: la ruta propia (las fichas /team/slug, /news/slug… incluidas)
    const rawPath = customPath || (location.startsWith("/") ? location : config.path) || "/";
    const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;
    const image = customImage || `${integrations.siteUrl.replace(/\/$/,'')}/logo-color.png`;
    const url = `${integrations.siteUrl.replace(/\/$/,'')}${path}`;

    document.title = title;
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) { favicon = document.createElement("link"); favicon.rel = "icon"; document.head.appendChild(favicon); }
    favicon.href = media.brand.favicon;

    const updateOrCreateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateOrCreateMeta("description", description);
    updateOrCreateMeta("robots", config.noindex || window.location.pathname.startsWith("/admin/preview/") ? "noindex, nofollow" : "index, follow");

    updateOrCreateMeta("og:title", title, true);
    updateOrCreateMeta("og:description", description, true);
    updateOrCreateMeta("og:url", url, true);
    updateOrCreateMeta("og:image", image, true);
    updateOrCreateMeta("og:type", "website", true);
    updateOrCreateMeta("og:site_name", SITE_NAME, true);
    updateOrCreateMeta("og:locale", OG_LOCALE_CODES[language], true);

    updateOrCreateMeta("twitter:card", "summary_large_image");
    updateOrCreateMeta("twitter:title", title);
    updateOrCreateMeta("twitter:description", description);
    updateOrCreateMeta("twitter:image", image);

    // Sin URL por idioma (el idioma se elige en la página): no hay alternativas hreflang ni
    // og:locale:alternate que declarar; se borran las que hubiera dejado una versión anterior.
    document
      .querySelectorAll('link[rel="alternate"][hreflang], meta[property="og:locale:alternate"]')
      .forEach((el) => el.remove());

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (config.noindex) {
      canonical?.remove();
    } else {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", url);
    }
  }, [page, language, customTitle, customDescription, customImage, customPath, location, integrations.siteUrl, liveSEO, liveChrome, officeName, media.brand.favicon]);

  return null;
}

export { seoConfig };
