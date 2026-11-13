export const layoutDefaults = {
  home: { firma: true, creemos: true, practicas: true, extranjeras: true, socios: true, monitor: true, hero: true },
  monitorLimit: 3,
  homeOrder: ["firma", "practicas", "creemos", "socios", "extranjeras", "monitor"],
} as const;

export const integrationsDefaults = {
  siteUrl: "https://santos-saucedo.replit.app",
  ga4: { enabled: false, measurementId: "" },
  searchConsole: { verification: "" },
  leadinfo: { enabled: false, siteId: "", disclosureReviewed: false },
} as const;

export const linksDefaults = {
  about: "/about",
  practices: "/practice-groups",
  team: "/team",
  news: "/news",
  careers: "/careers",
  interns: "/careers/interns",
  contact: "/contact",
  office: "/offices",
  newsletter: "/newsletter",
} as const;

const labels = (es: string, en: string) => ({ es, en });
const item = (id: string, href: string, es: string, en: string, order: number) => ({
  id, href, labels: labels(es, en), visible: true, order, children: [],
});

export const navigationDefaults = {
  header: { enabled: true, searchEnabled: true, phoneEnabled: true, languageEnabled: true },
  footer: { enabled: true, officeEnabled: true, linksEnabled: true, legalEnabled: true, languagesEnabled: true, adminEnabled: true },
  items: [
    item("about", "/about", "Nuestra firma", "The firm", 0),
    item("practices", "/practice-groups", "Prácticas", "Practices", 1),
    item("team", "/team", "Socios", "Partners", 2),
    item("news", "/news", "Monitor Laboral", "Labor Monitor", 3),
    item("careers", "/careers", "Carreras", "Careers", 4),
    item("contact", "/contact", "Contacto", "Contact", 5),
    item("testimonials", "/testimonios", "Testimonios", "Testimonials", 2),
    item("industries", "/industries", "Industrias", "Industries", 1),
  ],
  footerItems: [
    item("about", "/about", "Nuestra firma", "The firm", 0),
    item("offices", "/offices", "Nuestras Oficinas", "Our Offices", 1),
    item("practices", "/practice-groups", "Prácticas", "Practices", 2),
    item("industries", "/industries", "Industrias", "Industries", 2),
    item("team", "/team", "Socios", "Partners", 3),
    item("news", "/news", "Monitor Laboral", "Labor Monitor", 4),
    item("careers", "/careers", "Carreras", "Careers", 5),
    item("contact", "/contact", "Contacto", "Contact", 6),
    item("testimonials", "/testimonios", "Testimonios", "Testimonials", 3),
  ],
  legalItems: [
    item("privacy", "/privacy-policy", "Aviso de privacidad", "Privacy notice", 0),
    item("terms", "/terms", "Términos de uso", "Terms of use", 1),
  ],
} as const;

export const consentDefaults = {
  enabled: true,
  version: "1",
  validityMonths: 6,
  labels: {
    es: {
      title: "Preferencias de cookies",
      body: "Usamos almacenamiento necesario para el sitio. Puede aceptar o rechazar la analítica y otros servicios opcionales. Puede cambiar su elección desde el pie de página.",
      acceptAll: "Aceptar todas", rejectOptional: "Rechazar opcionales", configure: "Configurar", save: "Guardar preferencias", close: "Cerrar",
      essential: "Necesarias", essentialDescription: "Sesión administrativa, seguridad y preferencias básicas del sitio. Siempre activas.",
      analytics: "Analítica", analyticsDescription: "Estadísticas de uso mediante Google Analytics, cuando el despacho lo configure y active.",
      external: "Contenido externo", externalDescription: "Permite cargar contenido integrado de servicios externos cuando lo solicite.",
      leadinfo: "Identificación de empresas", leadinfoDescription: "Permite analítica de visitas empresariales mediante Leadinfo, si el despacho lo activa.", policy: "Aviso de privacidad",
    },
    en: {
      title: "Cookie preferences",
      body: "We use storage required to operate this site. You can accept or reject optional analytics and services. Change your choice in the footer at any time.",
      acceptAll: "Accept all", rejectOptional: "Reject optional", configure: "Configure", save: "Save preferences", close: "Close",
      essential: "Essential", essentialDescription: "Administrative sessions, security and basic site preferences. Always active.",
      analytics: "Analytics", analyticsDescription: "Usage statistics through Google Analytics, when configured and enabled by the firm.",
      external: "External content", externalDescription: "Allows embedded content from external services when requested.",
      leadinfo: "Business identification", leadinfoDescription: "Allows business visit analytics through Leadinfo, if enabled by the firm.", policy: "Privacy notice",
    },
  },
} as const;

export const testimonialsSeoDefaults = {
  title: { es: "Testimonios | Santos & Saucedo", en: "Testimonials | Santos & Saucedo" },
  description: {
    es: "Comentarios de clientes de Santos & Saucedo, firma de derecho laboral para empresas en San Pedro Garza García, publicados con su autorización.",
    en: "Comments from clients of Santos & Saucedo, a labor law firm for companies in San Pedro Garza García, published with their permission.",
  },
  path: "/testimonios",
} as const;

export const testimonialWriteSeoDefaults = {
  ...testimonialsSeoDefaults,
  description: { es: "Comentarios de clientes de Santos & Saucedo, publicados con su autorización.", en: "Comments from Santos & Saucedo clients, published with their permission." },
  path: "/testimonios/escribir",
  noindex: true,
} as const;
