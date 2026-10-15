import { useLanguage } from "@/contexts/LanguageContext";
import type { LanguageCode } from "@shared/schema";
import type { Lang26 } from "./content";

// Texto de interfaz de cabecera, menú móvil, buscador, selector de idiomas y pie.
// ES y EN son los textos aprobados de la portada (no cambian). Los otros 8 reutilizan
// i18n.ts y CookieBanner cuando hay equivalente; cada enlace del menú lleva el título
// (h1) que muestra su página, salvo Carreras (el h1 es una frase: se usa el nombre
// corto) y los títulos franceses que no caben en la cabecera.

export interface NavItem26 {
  label: string;
  href: string;
}

export interface Chrome26Strings {
  /** lang/dir de la raíz de cabecera, menú móvil, buscador y pie */
  attrs: { lang: string; dir: "ltr" | "rtl" };
  /** Fechas de los resultados del buscador */
  locale: string;
  /** Los 6 enlaces del menú (también la columna Firma del pie) */
  nav: readonly NavItem26[];
  header: {
    /** aria-label de las dos navegaciones (el lector añade "navegación") */
    nav: string;
    menu: string;
    close: string;
  };
  search: {
    open: string;
    dialog: string;
    label: string;
    placeholder: string;
    hint: string;
    loading: string;
    error: string;
    empty: (q: string) => string;
    count: (n: number) => string;
    close: string;
    groups: { team: string; practiceGroups: string; industryGroups: string; news: string };
  };
  langs: {
    /** aria-label del selector de la cabecera: bilingüe, para quien no lee el idioma activo */
    group: string;
    /** Botón del globo y título de su lista */
    others: string;
    /** Título del grupo de idiomas del menú móvil y del pie */
    label: string;
  };
  footer: {
    office: string;
    firm: string;
    legal: string;
    privacy: string;
    terms: string;
    cookies: string;
    disclaimer: string;
    rights: string;
  };
}

// Rutas del menú, en el orden de la numeración § de las páginas (01–06)
const H = ["/about", "/practice-groups", "/team", "/news", "/careers", "/contact"] as const;
const nav = (...labels: [string, string, string, string, string, string]): NavItem26[] =>
  labels.map((label, i) => ({ label, href: H[i] }));

// Ruso: una, dos a cuatro, cinco o más (11–14 van con "результатов")
function ruCount(n: number) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return `${n} результат`;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${n} результата`;
  return `${n} результатов`;
}

// Árabe: 1 y 2 con forma propia; 3–10 en plural; 11 o más en singular
function arCount(n: number) {
  if (n === 1) return "نتيجة واحدة";
  if (n === 2) return "نتيجتان";
  const r = n % 100;
  return r >= 3 && r <= 10 ? `${n} نتائج` : `${n} نتيجة`;
}

export const chrome26: Record<LanguageCode, Chrome26Strings> = {
  es: {
    attrs: { lang: "es-MX", dir: "ltr" },
    locale: "es-MX",
    nav: nav("Nuestra firma", "Prácticas", "Socios", "Monitor Laboral", "Carreras", "Contacto"),
    header: { nav: "Principal", menu: "Menú", close: "Cerrar" },
    search: {
      open: "Buscar",
      dialog: "Buscar en el sitio",
      label: "Buscar en el sitio",
      placeholder: "Nombre, práctica o tema",
      hint: "Equipo, prácticas y análisis del Monitor Laboral. Escriba al menos dos caracteres.",
      loading: "Buscando…",
      error: "La búsqueda no está disponible en este momento.",
      empty: (q) => `Sin resultados para «${q}».`,
      count: (n) => (n === 1 ? "1 resultado" : `${n} resultados`),
      close: "Cerrar",
      // /api/search devuelve a todo el equipo (socios, asociados y staff), no solo socios
      groups: { team: "Equipo", practiceGroups: "Prácticas", industryGroups: "Industrias", news: "Análisis" },
    },
    langs: { group: "Idioma / Language", others: "Otros idiomas", label: "Idioma" },
    footer: {
      office: "Oficina",
      firm: "Firma",
      legal: "Legal",
      privacy: "Aviso de privacidad",
      terms: "Términos de uso",
      cookies: "Preferencias de cookies",
      disclaimer: "La información de este sitio es de carácter general y no constituye asesoría legal.",
      rights: "Santos & Saucedo",
    },
  },
  en: {
    attrs: { lang: "en", dir: "ltr" },
    locale: "en-US",
    nav: nav("The firm", "Practices", "Partners", "Labor Monitor", "Careers", "Contact"),
    header: { nav: "Main", menu: "Menu", close: "Close" },
    search: {
      open: "Search",
      dialog: "Search the site",
      label: "Search the site",
      placeholder: "Name, practice or topic",
      hint: "People, practices and Labor Monitor analysis. Type at least two characters.",
      loading: "Searching…",
      error: "Search is not available right now.",
      empty: (q) => `No results for “${q}”.`,
      count: (n) => (n === 1 ? "1 result" : `${n} results`),
      close: "Close",
      groups: { team: "People", practiceGroups: "Practices", industryGroups: "Industries", news: "Analysis" },
    },
    langs: { group: "Idioma / Language", others: "Other languages", label: "Language" },
    footer: {
      office: "Office",
      firm: "Firm",
      legal: "Legal",
      privacy: "Privacy notice",
      terms: "Terms of use",
      cookies: "Cookie preferences",
      disclaimer: "The information on this site is general in nature and does not constitute legal advice.",
      rights: "Santos & Saucedo",
    },
  },
  de: {
    attrs: { lang: "de", dir: "ltr" },
    locale: "de-DE",
    nav: nav("Über die Kanzlei", "Praxisbereiche", "Unser Team", "Nachrichten", "Karriere", "Kontakt"),
    header: { nav: "Hauptmenü", menu: "Menü", close: "Schließen" },
    search: {
      open: "Suchen",
      dialog: "Website durchsuchen",
      label: "Website durchsuchen",
      placeholder: "Name, Praxisbereich oder Thema",
      hint: "Team, Praxisbereiche und Analysen der Kanzlei. Geben Sie mindestens zwei Zeichen ein.",
      loading: "Suche läuft …",
      error: "Die Suche ist derzeit nicht verfügbar.",
      empty: (q) => `Keine Ergebnisse für „${q}“.`,
      count: (n) => (n === 1 ? "1 Ergebnis" : `${n} Ergebnisse`),
      close: "Schließen",
      groups: { team: "Team", practiceGroups: "Praxisbereiche", industryGroups: "Branchen", news: "Analysen" },
    },
    langs: { group: "Sprache / Language", others: "Weitere Sprachen", label: "Sprache" },
    footer: {
      office: "Büro",
      firm: "Kanzlei",
      legal: "Rechtliches",
      privacy: "Datenschutzhinweis",
      terms: "Nutzungsbedingungen",
      cookies: "Cookie-Einstellungen",
      disclaimer: "Die Informationen auf dieser Website sind allgemeiner Natur und stellen keine Rechtsberatung dar.",
      rights: "Santos & Saucedo",
    },
  },
  zh: {
    attrs: { lang: "zh-CN", dir: "ltr" },
    locale: "zh-CN",
    nav: nav("关于律所", "业务领域", "我们的团队", "新闻", "职业发展", "联系我们"),
    header: { nav: "主菜单", menu: "菜单", close: "关闭" },
    search: {
      open: "搜索",
      dialog: "站内搜索",
      label: "站内搜索",
      placeholder: "姓名、业务领域或主题",
      hint: "可搜索团队成员、业务领域及本所分析文章。请至少输入两个字符。",
      loading: "正在搜索…",
      error: "搜索功能暂时无法使用。",
      empty: (q) => `未找到与“${q}”相关的结果。`,
      count: (n) => `${n} 条结果`,
      close: "关闭",
      groups: { team: "团队", practiceGroups: "业务领域", industryGroups: "行业", news: "分析" },
    },
    langs: { group: "语言 / Language", others: "其他语言", label: "语言" },
    footer: {
      office: "办公地址",
      firm: "律所",
      legal: "法律信息",
      privacy: "隐私声明",
      terms: "使用条款",
      cookies: "Cookie 偏好设置",
      disclaimer: "本网站所载信息仅供一般参考，不构成法律意见。",
      rights: "Santos & Saucedo",
    },
  },
  ko: {
    attrs: { lang: "ko", dir: "ltr" },
    locale: "ko-KR",
    nav: nav("회사 소개", "업무 분야", "우리 팀", "뉴스 및 인사이트", "채용", "문의하기"),
    header: { nav: "주 메뉴", menu: "메뉴", close: "닫기" },
    search: {
      open: "검색",
      dialog: "사이트 검색",
      label: "사이트 검색",
      placeholder: "이름, 업무 분야 또는 주제",
      hint: "구성원, 업무 분야, 분석 자료를 검색할 수 있습니다. 두 글자 이상 입력하십시오.",
      loading: "검색 중…",
      error: "현재 검색을 이용할 수 없습니다.",
      empty: (q) => `‘${q}’에 대한 검색 결과가 없습니다.`,
      count: (n) => `검색 결과 ${n}건`,
      close: "닫기",
      groups: { team: "구성원", practiceGroups: "업무 분야", industryGroups: "산업", news: "분석" },
    },
    langs: { group: "언어 / Language", others: "다른 언어", label: "언어" },
    footer: {
      office: "사무소",
      firm: "회사",
      legal: "법적 고지",
      privacy: "개인정보 처리방침",
      terms: "이용 약관",
      cookies: "쿠키 환경설정",
      disclaimer: "본 웹사이트의 정보는 일반적인 내용이며 법률 자문에 해당하지 않습니다.",
      rights: "Santos & Saucedo",
    },
  },
  ja: {
    attrs: { lang: "ja", dir: "ltr" },
    locale: "ja-JP",
    nav: nav("事務所について", "取扱分野", "私たちのチーム", "ニュースとインサイト", "採用情報", "お問い合わせ"),
    header: { nav: "メインメニュー", menu: "メニュー", close: "閉じる" },
    search: {
      open: "検索",
      dialog: "サイト内検索",
      label: "サイト内検索",
      placeholder: "氏名、取扱分野、テーマ",
      hint: "メンバー、取扱分野、当事務所の解説を検索できます。2文字以上入力してください。",
      loading: "検索中…",
      error: "現在、検索をご利用いただけません。",
      empty: (q) => `「${q}」に一致する結果はありません。`,
      count: (n) => `${n}件の結果`,
      close: "閉じる",
      groups: { team: "メンバー", practiceGroups: "取扱分野", industryGroups: "業種", news: "解説" },
    },
    langs: { group: "言語 / Language", others: "その他の言語", label: "言語" },
    footer: {
      office: "所在地",
      firm: "事務所",
      legal: "法的情報",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      cookies: "Cookie設定",
      disclaimer: "本サイトの情報は一般的な内容であり、法的助言を構成するものではありません。",
      rights: "Santos & Saucedo",
    },
  },
  ar: {
    attrs: { lang: "ar", dir: "rtl" },
    // "ar" sin región: calendario gregoriano (ar-SA usaría el hégira)
    locale: "ar",
    nav: nav("عن الشركة", "مجالات الممارسة", "فريقنا", "الأخبار والرؤى", "الوظائف", "اتصل بنا"),
    header: { nav: "القائمة الرئيسية", menu: "القائمة", close: "إغلاق" },
    search: {
      open: "بحث",
      dialog: "البحث في الموقع",
      label: "البحث في الموقع",
      placeholder: "الاسم أو مجال الممارسة أو الموضوع",
      hint: "يشمل البحث الفريق ومجالات الممارسة والتحليلات. أدخل حرفين على الأقل.",
      loading: "جارٍ البحث…",
      error: "البحث غير متاح حاليًا.",
      empty: (q) => `لا توجد نتائج لـ «${q}».`,
      count: arCount,
      close: "إغلاق",
      groups: { team: "الفريق", practiceGroups: "مجالات الممارسة", industryGroups: "القطاعات", news: "التحليلات" },
    },
    langs: { group: "اللغة / Language", others: "لغات أخرى", label: "اللغة" },
    footer: {
      office: "المكتب",
      firm: "الشركة",
      legal: "معلومات قانونية",
      privacy: "إشعار الخصوصية",
      terms: "شروط الاستخدام",
      cookies: "تفضيلات ملفات تعريف الارتباط",
      disclaimer: "المعلومات الواردة في هذا الموقع ذات طابع عام ولا تُعدّ استشارة قانونية.",
      rights: "Santos & Saucedo",
    },
  },
  ru: {
    attrs: { lang: "ru", dir: "ltr" },
    locale: "ru-RU",
    nav: nav("О фирме", "Практики", "Наша команда", "Новости", "Карьера", "Контакты"),
    header: { nav: "Основное меню", menu: "Меню", close: "Закрыть" },
    search: {
      open: "Поиск",
      dialog: "Поиск по сайту",
      label: "Поиск по сайту",
      placeholder: "Имя, практика или тема",
      hint: "Команда, практики и аналитические материалы фирмы. Введите не менее двух символов.",
      loading: "Идёт поиск…",
      error: "Поиск сейчас недоступен.",
      empty: (q) => `По запросу «${q}» ничего не найдено.`,
      count: ruCount,
      close: "Закрыть",
      groups: { team: "Команда", practiceGroups: "Практики", industryGroups: "Отрасли", news: "Аналитика" },
    },
    langs: { group: "Язык / Language", others: "Другие языки", label: "Язык" },
    footer: {
      office: "Офис",
      firm: "Фирма",
      legal: "Правовая информация",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
      cookies: "Настройки cookie",
      disclaimer: "Информация на этом сайте носит общий характер и не является юридической консультацией.",
      rights: "Santos & Saucedo",
    },
  },
  fr: {
    attrs: { lang: "fr", dir: "ltr" },
    locale: "fr-FR",
    // Los h1 completos ("À propos du cabinet", "Actualités et perspectives", "Contactez-nous")
    // no caben en la cabecera ni a 1440 px: se usa su sustantivo, como el EN "The firm"
    nav: nav("Le cabinet", "Domaines de pratique", "Notre équipe", "Actualités", "Carrières", "Contact"),
    header: { nav: "Principale", menu: "Menu", close: "Fermer" },
    search: {
      open: "Rechercher",
      dialog: "Rechercher sur le site",
      label: "Rechercher sur le site",
      placeholder: "Nom, domaine de pratique ou sujet",
      hint: "Équipe, domaines de pratique et analyses du cabinet. Saisissez au moins deux caractères.",
      loading: "Recherche en cours…",
      error: "La recherche n’est pas disponible pour le moment.",
      // Espace insécable dentro de las comillas francesas
      empty: (q) => `Aucun résultat pour « ${q} ».`,
      count: (n) => (n === 1 ? "1 résultat" : `${n} résultats`),
      close: "Fermer",
      groups: { team: "Équipe", practiceGroups: "Domaines de pratique", industryGroups: "Secteurs", news: "Analyses" },
    },
    langs: { group: "Langue / Language", others: "Autres langues", label: "Langue" },
    footer: {
      office: "Bureau",
      firm: "Cabinet",
      legal: "Informations légales",
      privacy: "Politique de confidentialité",
      terms: "Conditions d’utilisation",
      cookies: "Préférences de cookies",
      disclaimer: "Les informations publiées sur ce site sont de nature générale et ne constituent pas un avis juridique.",
      rights: "Santos & Saucedo",
    },
  },
  it: {
    attrs: { lang: "it", dir: "ltr" },
    locale: "it-IT",
    nav: nav("Chi siamo", "Aree di pratica", "Il nostro team", "Notizie", "Carriere", "Contatti"),
    header: { nav: "Principale", menu: "Menu", close: "Chiudi" },
    search: {
      open: "Cerca",
      dialog: "Cerca nel sito",
      label: "Cerca nel sito",
      placeholder: "Nome, area di pratica o argomento",
      hint: "Team, aree di pratica e analisi dello studio. Digitare almeno due caratteri.",
      loading: "Ricerca in corso…",
      error: "La ricerca non è al momento disponibile.",
      empty: (q) => `Nessun risultato per «${q}».`,
      count: (n) => (n === 1 ? "1 risultato" : `${n} risultati`),
      close: "Chiudi",
      groups: { team: "Team", practiceGroups: "Aree di pratica", industryGroups: "Settori", news: "Analisi" },
    },
    langs: { group: "Lingua / Language", others: "Altre lingue", label: "Lingua" },
    footer: {
      office: "Sede",
      firm: "Studio",
      legal: "Note legali",
      privacy: "Informativa sulla privacy",
      terms: "Termini di utilizzo",
      cookies: "Preferenze cookie",
      disclaimer: "Le informazioni contenute in questo sito hanno carattere generale e non costituiscono consulenza legale.",
      rights: "Santos & Saucedo",
    },
  },
};

/**
 * Idioma de la interfaz. En las páginas internas (`localized`) es el idioma elegido,
 * cualquiera de los 10; en la portada, ES o EN como su contenido (el resto cae a EN).
 * `base` (ES/EN) sirve a lo que solo existe en ES/EN: los datos de contacto de respaldo.
 */
export function useChrome26(localized = false) {
  const { language, displayLanguage } = useLanguage();
  const code: LanguageCode = localized ? language : displayLanguage;
  const base: Lang26 = displayLanguage;
  return { code, t: chrome26[code], base };
}
