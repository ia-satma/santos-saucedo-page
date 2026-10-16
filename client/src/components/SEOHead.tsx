import { useEffect } from "react";
import { useLocation } from "wouter";
import type { LanguageCode } from "@shared/schema";
import { chrome26 } from "@/components/home26/chrome26";

const BASE_URL = "https://www.santossaucedo.com";
const DEFAULT_IMAGE = "https://santossaucedo.com/images/santossaucedo_2025.png";
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

/** Descripción a partir de un texto largo (biografía, resumen, entradilla): la primera oración, hasta ~160 caracteres */
export function metaDescription(text: string | null | undefined, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentence = clean.match(/^.+?[.!?。！？](?=\s|$)/)?.[0] ?? clean;
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
// la frase de los 35 años se conserva tal cual. Títulos en minúscula inicial (también en
// ruso e inglés).
const practiceGroupsConfig: SEOConfig = {
  title: navTitle(1),
  description: {
    en: "Santos & Saucedo practices for companies: labor and social security, corporate and contractual, immigration, and litigation.",
    es: "Prácticas de Santos & Saucedo para empresas: laboral y seguridad social, corporativo y contractual, migratorio y litigio.",
    de: "Praxisbereiche von Santos & Saucedo für Unternehmen: Arbeits- und Sozialversicherungsrecht, Gesellschafts- und Vertragsrecht, Migrationsrecht sowie Prozessführung.",
    zh: "Santos & Saucedo为企业提供的业务领域：劳动与社会保障、公司与合同、移民以及诉讼。",
    ko: "Santos & Saucedo의 기업 대상 업무 분야: 노동 및 사회보장, 기업 및 계약, 이민, 소송.",
    ja: "Santos & Saucedoの企業向け取扱分野：労働・社会保障、企業法務・契約、移民、訴訟。",
    ar: "مجالات ممارسة Santos & Saucedo للشركات: العمل والضمان الاجتماعي، والشركات والعقود، والهجرة، والتقاضي.",
    ru: "Практики Santos & Saucedo для компаний: трудовое право и социальное обеспечение, корпоративное и договорное право, миграционное право и судебные споры.",
    fr: "Domaines de pratique de Santos & Saucedo pour les entreprises : droit du travail et sécurité sociale, droit des sociétés et des contrats, immigration et contentieux.",
    it: "Aree di pratica di Santos & Saucedo per le imprese: lavoro e previdenza sociale, societario e contrattuale, immigrazione e contenzioso.",
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
      en: "Human-capital administration and legal defense for companies, rooted in labor law. More than 35 years of experience and a national alliance across more than 72 Mexican cities.",
      es: "Administración del capital humano y defensa legal para empresas, con raíz en el derecho laboral. Más de 35 años de experiencia y alianza nacional en más de 72 ciudades de México.",
      de: "Verwaltung des Humankapitals und Rechtsverteidigung für Unternehmen, mit Wurzeln im Arbeitsrecht. Mehr als 35 Jahre Erfahrung und eine nationale Allianz in mehr als 72 Städten Mexikos.",
      zh: "为企业提供人力资本管理与法律辩护，以劳动法为根基。超过35年的经验，并通过全国联盟覆盖墨西哥72个以上城市。",
      ko: "노동법에 뿌리를 둔 기업의 인적 자본 관리와 법률 방어. 35년 이상의 경험과 멕시코 72개 이상 도시에 걸친 전국 제휴.",
      ja: "労働法を基盤とする、企業のための人的資本管理と法的防御。35年以上の経験と、メキシコ72以上の都市にわたる全国的な提携。",
      ar: "إدارة رأس المال البشري والدفاع القانوني للشركات، بجذور في قانون العمل. أكثر من 35 عامًا من الخبرة وتحالف وطني في أكثر من 72 مدينة في المكسيك.",
      ru: "Управление человеческим капиталом и правовая защита компаний с опорой на трудовое право. Более 35 лет опыта и национальный альянс в более чем 72 городах Мексики.",
      fr: "Administration du capital humain et défense juridique des entreprises, ancrées dans le droit du travail. Plus de 35 ans d’expérience et une alliance nationale dans plus de 72 villes du Mexique.",
      it: "Amministrazione del capitale umano e difesa legale per le imprese, con radici nel diritto del lavoro. Oltre 35 anni di esperienza e un’alleanza nazionale in più di 72 città del Messico.",
    },
    path: "/",
  },
  about: {
    title: navTitle(0),
    description: {
      en: "Santos & Saucedo is a law firm for companies —labor, corporate, immigration and litigation— rooted in labor law, with more than 35 years of experience advising national and multinational companies.",
      es: "Santos & Saucedo es una firma legal para empresas —laboral, corporativo, migratorio y litigio— con raíz en el derecho laboral y más de 35 años de experiencia asesorando empresas nacionales y multinacionales.",
      de: "Santos & Saucedo ist eine Kanzlei für Unternehmen – Arbeitsrecht, Gesellschafts- und Vertragsrecht, Migrationsrecht und Prozessführung – mit Wurzeln im Arbeitsrecht und mehr als 35 Jahren Erfahrung in der Beratung nationaler und multinationaler Unternehmen.",
      zh: "Santos & Saucedo是一家服务企业的律师事务所，业务涵盖劳动、公司、移民和诉讼，以劳动法为根基，拥有超过35年为国内企业和跨国企业提供咨询的经验。",
      ko: "Santos & Saucedo는 노동, 기업, 이민, 소송 분야에서 기업을 자문하는 법률사무소로, 노동법에 뿌리를 두고 35년 이상 국내 기업과 다국적 기업에 자문해 왔습니다.",
      ja: "Santos & Saucedoは、労働、企業法務、移民、訴訟の分野で企業を支援する法律事務所です。労働法を基盤とし、35年以上にわたり国内企業と多国籍企業に助言してきました。",
      ar: "Santos & Saucedo مكتب محاماة للشركات في مجالات العمل والشركات والهجرة والتقاضي، بجذور في قانون العمل وخبرة تزيد على 35 عامًا في تقديم المشورة للشركات الوطنية والمتعددة الجنسيات.",
      ru: "Santos & Saucedo — юридическая фирма для компаний (трудовое, корпоративное и миграционное право, судебные споры) с опорой на трудовое право и более чем 35-летним опытом консультирования национальных и многонациональных компаний.",
      fr: "Santos & Saucedo est un cabinet d’avocats pour les entreprises — droit du travail, droit des sociétés, immigration et contentieux — ancré dans le droit du travail, avec plus de 35 ans d’expérience auprès d’entreprises nationales et multinationales.",
      it: "Santos & Saucedo è uno studio legale per le imprese — lavoro, societario, immigrazione e contenzioso — con radici nel diritto del lavoro e oltre 35 anni di esperienza nella consulenza ad aziende nazionali e multinazionali.",
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
  news: {
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
  },
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
  // /experience y /offices redirigen (D4, D5): si algo los montara, título y canonical de su destino
  experience: { ...practiceGroupsConfig, path: "/practice-groups" },
  offices: { ...contactConfig, path: "/contact" },
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
  // Páginas heredadas sin ruta en App.tsx: textos sin tocar, solo títulos en minúscula inicial
  industryGroups: {
    title: {
      en: "Industry groups | Santos & Saucedo",
      es: "Grupos industriales | Santos & Saucedo",
      de: "Branchengruppen | Santos & Saucedo",
      zh: "行业组 | Santos & Saucedo",
      ko: "산업 그룹 | Santos & Saucedo",
      ja: "業界グループ | Santos & Saucedo",
      ar: "مجموعات الصناعة | Santos & Saucedo",
      ru: "Отраслевые группы | Santos & Saucedo",
      fr: "Groupes industriels | Santos & Saucedo",
      it: "Gruppi industriali | Santos & Saucedo",
    },
    description: {
      en: "Labor-law experience applied to companies across a range of industries. We advise national and international employers on prevention, audits, training, and labor disputes tailored to each sector.",
      es: "Experiencia en derecho laboral aplicada a empresas de diversas industrias. Asesoramos a empleadores nacionales e internacionales en prevención, auditoría, capacitación y conflictos laborales según cada sector.",
      de: "Arbeitsrechtliche Erfahrung für Unternehmen aus unterschiedlichen Branchen. Wir beraten nationale und internationale Arbeitgeber bei Prävention, Audits, Schulungen und Arbeitskonflikten – abgestimmt auf den jeweiligen Sektor.",
      zh: "将劳动法经验应用于各行业的企业。我们为国内外雇主提供针对各自行业的预防、审计、培训及劳动争议咨询。",
      ko: "다양한 산업의 기업에 적용되는 노동법 경험. 국내외 고용주에게 각 부문에 맞춘 예방, 감사, 교육 및 노동 분쟁 자문을 제공합니다.",
      ja: "さまざまな業界の企業に応用する労働法の経験。国内外の雇用主に対し、各業界に合わせた予防、監査、研修、労働紛争の助言を提供します。",
      ar: "خبرة في قانون العمل مطبَّقة على الشركات في مختلف الصناعات. نقدم الاستشارة لأصحاب العمل الوطنيين والدوليين في الوقاية والتدقيق والتدريب ونزاعات العمل بما يتناسب مع كل قطاع.",
      ru: "Опыт в области трудового права применительно к компаниям различных отраслей. Мы консультируем национальных и международных работодателей по вопросам профилактики, аудита, обучения и трудовых споров с учётом специфики каждого сектора.",
      fr: "Expérience en droit du travail appliquée aux entreprises de divers secteurs. Nous conseillons les employeurs nationaux et internationaux en matière de prévention, d'audit, de formation et de conflits du travail, adaptés à chaque secteur.",
      it: "Esperienza in diritto del lavoro applicata alle aziende di diversi settori. Assistiamo datori di lavoro nazionali e internazionali in prevenzione, audit, formazione e conflitti di lavoro su misura per ciascun settore.",
    },
    path: "/industry-groups",
  },
  rankings: {
    title: {
      en: "Rankings and recognition | Santos & Saucedo",
      es: "Rankings y reconocimientos | Santos & Saucedo",
      de: "Rankings und Auszeichnungen | Santos & Saucedo",
      zh: "排名与认可 | Santos & Saucedo",
      ko: "순위 및 인정 | Santos & Saucedo",
      ja: "ランキングと評価 | Santos & Saucedo",
      ar: "التصنيفات والتقدير | Santos & Saucedo",
      ru: "Рейтинги и признание | Santos & Saucedo",
      fr: "Classements et reconnaissance | Santos & Saucedo",
      it: "Classifiche e riconoscimenti | Santos & Saucedo",
    },
    description: {
      en: "For more than 35 years, Santos & Saucedo has earned the trust of national and multinational companies through its labor-rooted, multi-area practice and consistent results.",
      es: "Durante más de 35 años, Santos & Saucedo ha ganado la confianza de empresas nacionales y multinacionales gracias a su práctica multi-área con raíz laboral y a resultados consistentes.",
      de: "Seit über 35 Jahren genießt Santos & Saucedo das Vertrauen nationaler und internationaler Unternehmen dank seiner spezialisierten arbeitsrechtlichen Praxis und konsistenter Ergebnisse.",
      zh: "35年多来，Santos & Saucedo凭借专注的劳动法业务和稳定的成果，赢得了国内外企业的信任。",
      ko: "35년 이상 Santos & Saucedo는 노동법에 특화된 업무와 일관된 성과로 국내외 기업의 신뢰를 얻어 왔습니다.",
      ja: "35年以上にわたり、Santos & Saucedoは労働法に特化した実務と一貫した成果により、国内外の企業から信頼を得てきました。",
      ar: "على مدى أكثر من 35 عامًا، نالت Santos & Saucedo ثقة الشركات الوطنية والدولية بفضل ممارستها المتخصصة في قانون العمل ونتائجها المتسقة.",
      ru: "На протяжении более 35 лет Santos & Saucedo завоёвывает доверие национальных и международных компаний благодаря специализированной практике в области трудового права и стабильным результатам.",
      fr: "Depuis plus de 35 ans, Santos & Saucedo gagne la confiance d'entreprises nationales et internationales grâce à sa pratique spécialisée en droit du travail et à des résultats constants.",
      it: "Da oltre 35 anni, Santos & Saucedo ha conquistato la fiducia di aziende nazionali e internazionali grazie alla sua pratica specializzata in diritto del lavoro e a risultati costanti.",
    },
    path: "/rankings",
  },
  diversityInclusion: {
    title: {
      en: "Diversity and inclusion | Santos & Saucedo",
      es: "Diversidad e inclusión | Santos & Saucedo",
      de: "Vielfalt und Inklusion | Santos & Saucedo",
      zh: "多元与包容 | Santos & Saucedo",
      ko: "다양성과 포용성 | Santos & Saucedo",
      ja: "ダイバーシティとインクルージョン | Santos & Saucedo",
      ar: "التنوع والشمول | Santos & Saucedo",
      ru: "Разнообразие и инклюзия | Santos & Saucedo",
      fr: "Diversité et inclusion | Santos & Saucedo",
      it: "Diversità e inclusione | Santos & Saucedo",
    },
    description: {
      en: "Santos & Saucedo has been committed to diversity and inclusion for more than 35 years. Learn about our initiatives for gender equality, inclusive hiring, and equal opportunities.",
      es: "Santos & Saucedo está comprometido con la diversidad e inclusión desde hace más de 35 años. Conozca nuestras iniciativas de igualdad de género, contratación inclusiva e igualdad de oportunidades.",
      de: "Santos & Saucedo setzt sich seit über 35 Jahren für Vielfalt und Inklusion ein. Erfahren Sie mehr über unsere Initiativen für Geschlechtergleichstellung.",
      zh: "Santos & Saucedo三十五年多来致力于多元化和包容性。了解我们在性别平等、包容性招聘和机会平等方面的举措。",
      ko: "Santos & Saucedo는 35년 넘게 다양성과 포용성에 전념해 왔습니다. 성평등, 포용적 채용, 기회 균등에 대한 이니셔티브를 알아보세요.",
      ja: "Santos & Saucedoは35年以上にわたり、多様性と包摂に取り組んでいます。ジェンダー平等、インクルーシブな採用、機会均等への取り組みをご紹介します。",
      ar: "Santos & Saucedo ملتزمة بالتنوع والشمول منذ أكثر من 35 عامًا. تعرف على مبادراتنا للمساواة بين الجنسين والتوظيف الشامل وتكافؤ الفرص.",
      ru: "Santos & Saucedo привержена принципам разнообразия и инклюзии более 35 лет. Узнайте о наших инициативах по гендерному равенству.",
      fr: "Santos & Saucedo est engagé pour la diversité et l'inclusion depuis plus de 35 ans. Découvrez nos initiatives pour l'égalité des sexes et l'embauche inclusive.",
      it: "Santos & Saucedo è impegnata per la diversità e l'inclusione da oltre 35 anni. Scopri le nostre iniziative per la parità di genere e le pari opportunità.",
    },
    path: "/diversity-inclusion",
  },
  proBono: {
    title: {
      en: "Pro bono | Santos & Saucedo",
      es: "Pro bono | Santos & Saucedo",
      de: "Pro bono | Santos & Saucedo",
      zh: "公益法律服务 | Santos & Saucedo",
      ko: "프로보노 | Santos & Saucedo",
      ja: "プロボノ | Santos & Saucedo",
      ar: "خدمات قانونية مجانية | Santos & Saucedo",
      ru: "Pro bono | Santos & Saucedo",
      fr: "Pro bono | Santos & Saucedo",
      it: "Pro bono | Santos & Saucedo",
    },
    description: {
      en: "Santos & Saucedo has been committed to pro bono legal services for over 35 years. We support NGOs, human rights causes, and access to justice initiatives.",
      es: "Santos & Saucedo está comprometido con servicios legales pro bono por más de 35 años. Apoyamos ONGs, causas de derechos humanos e iniciativas de acceso a la justicia.",
      de: "Santos & Saucedo engagiert sich seit über 35 Jahren für Pro-Bono-Rechtsdienstleistungen. Wir unterstützen NGOs und Menschenrechtsinitiativen.",
      zh: "Santos & Saucedo致力于公益法律服务超过35年。我们支持非政府组织、人权事业和司法公正倡议。",
      ko: "Santos & Saucedo는 35년 이상 프로보노 법률 서비스에 헌신해 왔습니다. NGO, 인권 활동 및 사법 접근성 이니셔티브를 지원합니다.",
      ja: "Santos & Saucedoは35年以上にわたりプロボノ法律サービスに取り組んでいます。NGO、人権、司法アクセスイニシアチブを支援しています。",
      ar: "Santos & Saucedo ملتزمة بتقديم الخدمات القانونية المجانية لأكثر من 35 عامًا. ندعم المنظمات غير الحكومية وقضايا حقوق الإنسان.",
      ru: "Santos & Saucedo более 35 лет оказывает юридические услуги pro bono. Мы поддерживаем НКО, правозащитные инициативы и доступ к правосудию.",
      fr: "Santos & Saucedo s'engage dans les services juridiques pro bono depuis plus de 35 ans. Nous soutenons les ONG et les causes des droits de l'homme.",
      it: "Santos & Saucedo è impegnata nei servizi legali pro bono da oltre 35 anni. Supportiamo ONG, cause per i diritti umani e accesso alla giustizia.",
    },
    path: "/pro-bono",
  },
  articles: {
    title: {
      en: "Articles | Santos & Saucedo",
      es: "Artículos | Santos & Saucedo",
      de: "Artikel | Santos & Saucedo",
      zh: "文章 | Santos & Saucedo",
      ko: "아티클 | Santos & Saucedo",
      ja: "記事 | Santos & Saucedo",
      ar: "المقالات | Santos & Saucedo",
      ru: "Статьи | Santos & Saucedo",
      fr: "Articles | Santos & Saucedo",
      it: "Articoli | Santos & Saucedo",
    },
    description: {
      en: "Articles from the Santos & Saucedo Labor Monitor on labor law, social security and the regulatory changes that affect employers.",
      es: "Artículos del Monitor Laboral de Santos & Saucedo sobre derecho laboral, seguridad social y los cambios normativos que afectan a las empresas.",
      de: "Artikel von Santos & Saucedo zu Arbeitsrecht, Sozialversicherung und den regulatorischen Änderungen, die Unternehmen betreffen.",
      zh: "Santos & Saucedo的文章，涵盖劳动法、社会保障以及影响企业的法规变化。",
      ko: "노동법과 사회보장, 기업에 영향을 미치는 규제 변화를 다루는 Santos & Saucedo의 기사.",
      ja: "労働法、社会保障、企業に影響する規制の変更を取り上げるSantos & Saucedoの記事。",
      ar: "مقالات Santos & Saucedo حول قانون العمل والضمان الاجتماعي والتغييرات التنظيمية التي تؤثر على الشركات.",
      ru: "Статьи Santos & Saucedo о трудовом праве, социальном обеспечении и изменениях регулирования, которые касаются компаний.",
      fr: "Articles de Santos & Saucedo sur le droit du travail, la sécurité sociale et les évolutions réglementaires qui concernent les entreprises.",
      it: "Articoli di Santos & Saucedo sul diritto del lavoro, la previdenza sociale e le novità normative che riguardano le imprese.",
    },
    path: "/articles",
  },
  newsletter: {
    title: {
      en: "Newsletter | Santos & Saucedo",
      es: "Boletín informativo | Santos & Saucedo",
      de: "Newsletter | Santos & Saucedo",
      zh: "通讯 | Santos & Saucedo",
      ko: "뉴스레터 | Santos & Saucedo",
      ja: "ニュースレター | Santos & Saucedo",
      ar: "النشرة الإخبارية | Santos & Saucedo",
      ru: "Рассылка | Santos & Saucedo",
      fr: "Newsletter | Santos & Saucedo",
      it: "Newsletter | Santos & Saucedo",
    },
    description: {
      en: "The Santos & Saucedo Labor Monitor's analysis of labor and social security law, by email.",
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
  events: {
    title: {
      en: "Events | Santos & Saucedo",
      es: "Eventos | Santos & Saucedo",
      de: "Veranstaltungen | Santos & Saucedo",
      zh: "活动 | Santos & Saucedo",
      ko: "이벤트 | Santos & Saucedo",
      ja: "イベント | Santos & Saucedo",
      ar: "الفعاليات | Santos & Saucedo",
      ru: "Мероприятия | Santos & Saucedo",
      fr: "Événements | Santos & Saucedo",
      it: "Eventi | Santos & Saucedo",
    },
    description: {
      en: "Santos & Saucedo events.",
      es: "Eventos de Santos & Saucedo.",
      de: "Veranstaltungen von Santos & Saucedo.",
      zh: "Santos & Saucedo的活动。",
      ko: "Santos & Saucedo의 이벤트.",
      ja: "Santos & Saucedoのイベント。",
      ar: "فعاليات Santos & Saucedo.",
      ru: "Мероприятия Santos & Saucedo.",
      fr: "Événements de Santos & Saucedo.",
      it: "Eventi di Santos & Saucedo.",
    },
    path: "/events",
  },
  interns: {
    title: {
      en: "Semillero S&S | Santos & Saucedo",
      es: "Semillero S&S | Santos & Saucedo",
      de: "Semillero S&S | Santos & Saucedo",
      zh: "Semillero S&S | Santos & Saucedo",
      ko: "Semillero S&S | Santos & Saucedo",
      ja: "Semillero S&S | Santos & Saucedo",
      ar: "Semillero S&S | Santos & Saucedo",
      ru: "Semillero S&S | Santos & Saucedo",
      fr: "Semillero S&S | Santos & Saucedo",
      it: "Semillero S&S | Santos & Saucedo",
    },
    description: {
      en: "Semillero S&S is the Santos & Saucedo internship program.",
      es: "El Semillero S&S es el programa de pasantes de Santos & Saucedo.",
      de: "Semillero S&S ist das Praktikantenprogramm von Santos & Saucedo.",
      zh: "Semillero S&S是Santos & Saucedo的实习生项目。",
      ko: "Semillero S&S는 Santos & Saucedo의 인턴 프로그램입니다.",
      ja: "Semillero S&Sは、Santos & Saucedoのインターン・プログラムです。",
      ar: "Semillero S&S هو برنامج المتدربين في Santos & Saucedo.",
      ru: "Semillero S&S — программа стажировок Santos & Saucedo.",
      fr: "Semillero S&S est le programme de stagiaires de Santos & Saucedo.",
      it: "Semillero S&S è il programma di tirocinio di Santos & Saucedo.",
    },
    path: "/careers/interns",
  },
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

  useEffect(() => {
    const config = seoConfig[page];
    if (!config) return;

    const title = customTitle || config.title[language] || config.title.es;
    const description = customDescription || config.description[language] || config.description.es;
    // Canonical por página: la ruta propia (las fichas /team/slug, /news/slug… incluidas)
    const rawPath = customPath || (location.startsWith("/") ? location : config.path) || "/";
    const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;
    const image = customImage || DEFAULT_IMAGE;
    const url = `${BASE_URL}${path}`;

    document.title = title;

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
    updateOrCreateMeta("robots", config.noindex ? "noindex, follow" : "index, follow");

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
  }, [page, language, customTitle, customDescription, customImage, customPath, location]);

  return null;
}

export { seoConfig };
