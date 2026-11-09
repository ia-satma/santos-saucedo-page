/* Listas fijas del sitio (idiomas, categorías, tipos) sin dependencias: las usa el sitio público
   sin cargar el esquema de la base de datos. shared/schema.ts las vuelve a exportar. */

export const newsCategories = [
  { value: "press", en: "Press", es: "Prensa" },
  { value: "insights", en: "Insights", es: "Insights" },
  { value: "rankings", en: "Rankings", es: "Rankings" },
  { value: "events", en: "Events", es: "Eventos" },
  { value: "alerts", en: "Alerts", es: "Alertas" },
] as const;

export const eventTypes = [
  { 
    value: "conference", 
    en: "Conference", 
    es: "Conferencia", 
    de: "Konferenz", 
    zh: "会议", 
    ko: "컨퍼런스", 
    ja: "カンファレンス", 
    ar: "مؤتمر", 
    ru: "Конференция", 
    fr: "Conférence", 
    it: "Conferenza" 
  },
  { 
    value: "webinar", 
    en: "Webinar", 
    es: "Webinar", 
    de: "Webinar", 
    zh: "网络研讨会", 
    ko: "웨비나", 
    ja: "ウェビナー", 
    ar: "ندوة عبر الإنترنت", 
    ru: "Вебинар", 
    fr: "Webinaire", 
    it: "Webinar" 
  },
  { 
    value: "sponsorship", 
    en: "Sponsorship", 
    es: "Patrocinio", 
    de: "Sponsoring", 
    zh: "赞助", 
    ko: "스폰서십", 
    ja: "スポンサーシップ", 
    ar: "رعاية", 
    ru: "Спонсорство", 
    fr: "Parrainage", 
    it: "Sponsorizzazione" 
  },
  { 
    value: "speaking", 
    en: "Speaking Engagement", 
    es: "Ponencia", 
    de: "Vortrag", 
    zh: "演讲活动", 
    ko: "강연", 
    ja: "講演", 
    ar: "مشاركة في التحدث", 
    ru: "Выступление", 
    fr: "Conférence", 
    it: "Intervento" 
  },
  { 
    value: "networking", 
    en: "Networking Event", 
    es: "Evento de networking", 
    de: "Networking-Veranstaltung", 
    zh: "社交活动", 
    ko: "네트워킹 이벤트", 
    ja: "ネットワーキングイベント", 
    ar: "حدث التواصل", 
    ru: "Нетворкинг", 
    fr: "Événement de réseautage", 
    it: "Evento di networking" 
  },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Spanish", nameNative: "Español", locale: "es-MX" },
  { code: "en", name: "English", nameNative: "English", locale: "en" },
  { code: "de", name: "German", nameNative: "Deutsch", locale: "de" },
  { code: "zh", name: "Mandarin Chinese (Simplified)", nameNative: "简体中文", locale: "zh-CN" },
  { code: "ko", name: "Korean", nameNative: "한국어", locale: "ko-KR" },
  { code: "ja", name: "Japanese", nameNative: "日本語", locale: "ja" },
  { code: "ar", name: "Arabic", nameNative: "العربية", locale: "ar" },
  { code: "ru", name: "Russian", nameNative: "Русский", locale: "ru" },
  { code: "fr", name: "French", nameNative: "Français", locale: "fr" },
  { code: "it", name: "Italian", nameNative: "Italiano", locale: "it" },
] as const;

export const jobTypes = [
  { value: "full_time", en: "Full Time", es: "Tiempo completo" },
  { value: "part_time", en: "Part Time", es: "Medio tiempo" },
  { value: "internship", en: "Internship", es: "Pasantía" },
  { value: "contract", en: "Contract", es: "Contrato" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const TESTIMONIAL_QUOTE_MAX = 1200;
