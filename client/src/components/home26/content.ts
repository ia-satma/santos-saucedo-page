import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/constants";

// Texto del Inicio 2026 (versión aprobada v3, 12 oct 2026).
// El CMS sustituye estos valores base con la versión publicada del idioma activo.

export type Lang26 = LanguageCode;

// El Inicio solo existe en ES/EN: su contenido declara su propio idioma y dirección,
// aunque <html> lleve otro (de, ar…) desde LanguageContext.
export const langAttrs = Object.fromEntries(
  SUPPORTED_LANGUAGES.map(({ code, locale }) => [code, { lang: locale, dir: code === "ar" ? "rtl" : "ltr" }]),
) as Record<Lang26, { lang: string; dir: "ltr" | "rtl" }>;

// En los titulares, "\u00a0" (espacio duro) evita que una palabra corta quede al final de línea.
// Los TextLink de cada sección no tienen texto propio: llevan la etiqueta del menú de su destino
// (chrome26[lang].nav, fuente única de los nombres de sección), un solo texto por destino.
// Los nombres de las prácticas son los de la base (practice_groups.name_es / name).

const home26Source = {
  es: {
    skip: "Ir al contenido",
    menu: "Menú",
    close: "Cerrar",
    // Héroe: textos del wordmark y llamadas a la acción, editables desde CMS.
    hero: {
      eyebrow: "Firma legal empresarial",
      titleFirst: "Santos",
      titleSecond: "Saucedo",
      tagline: "Derecho laboral para empresas",
      place: ["San Pedro Garza García", "Desde 2010"],
      primaryCta: "Conozca la firma",
      secondaryCta: "Hable con nosotros",
    },
    firma: {
      // Inicio v3 (demo aprobada): título (h2 oculto) y la frase de la firma sobre sus cifras.
      // Los mismos valores que shared/cms-defaults.json (home.es.firma).
      title: "Nuestra firma",
      body: [
        "Desde San Pedro Garza García, Santos & Saucedo asesora a grupos industriales mexicanos, a multinacionales y a empresas de capital asiático en las decisiones que involucran a su personal.",
      ],
      caption: "Río Tamazunchale 205 Norte, San Pedro Garza García. En el cristal, el Cerro de la Silla.",
      alt: "Fachada de cristal de las oficinas de Santos & Saucedo con el Cerro de la Silla reflejado",
    },
    creemos: {
      // Inicio v3: la banda de la turbina. label = el botón; quote = el titular; body[0] = el párrafo.
      label: "Nuestra filosofía",
      quote: "Preparamos cada asunto como si fuera a llegar a juicio.",
      body: [
        "Esa preparación respalda cada negociación: se negocia mejor cuando el caso ya está listo para defenderse. Prevención primero y, si hay conflicto, capacidad de reacción.",
      ],
    },
    practicas: {
      // h2 del bloque de prácticas del Inicio v3 (el mismo valor que shared/cms-defaults.json)
      title: "Nuestras prácticas",
      // slug: el de la base; la fila enlaza a /practice-groups/<slug>
      items: [
        {
          slug: "laboral-seguridad-social",
          title: "Laboral y\u00a0seguridad social",
          body: "Auditorías, inspecciones, documentación laboral, relaciones colectivas y litigio ante los Centros de Conciliación y los Tribunales Laborales. Es la práctica central de la firma y la que da sentido a las demás.",
        },
        {
          slug: "corporativo-contractual",
          title: "Corporativo y\u00a0contractual",
          body: "Constitución y vida corporativa de las sociedades, fideicomisos y contratos mercantiles, con la revisión laboral integrada en cada operación.",
        },
        {
          slug: "migratorio",
          title: "Migratorio",
          body: "Visas, residencias y permisos de trabajo para directivos, técnicos y especialistas extranjeros, en coordinación con los departamentos de recursos humanos de nuestros clientes.",
        },
        {
          slug: "litigio-contencioso",
          title: "Litigio y\u00a0penal laboral",
          body: "Juicios civiles y mercantiles, y asuntos penales en los que la empresa es la parte afectada por robo, fraude o abuso de confianza, incluidos los que involucran a su propio personal.",
        },
      ],
    },
    extranjeras: {
      title: "Empresas extranjeras en México",
      body:
        "Nuevo León recibe cada año nuevas plantas de capital asiático, estadounidense y europeo. Para estas empresas, las prácticas corporativa, migratoria y laboral de la firma trabajan en conjunto, desde la constitución de la sociedad hasta la contratación del primer turno.",
      alt: "Sala de juntas de Santos & Saucedo con el tríptico abstracto de la firma",
      // Cifras que cuentan al entrar en pantalla (Sections26 · CountUp): valor, sufijo y etiqueta
      figures: [
        { value: "72", suffix: "+", label: "ciudades con despacho aliado" },
        { value: "40", suffix: "+", label: "años de experiencia de los socios" },
      ],
    },
    // Las filas son las notas publicadas en /api/news (Sections26, MonitorList)
    monitor: {
      title: "Monitor Laboral",
      intro: "Análisis de la firma sobre los cambios que afectan a las empresas.",
    },
    socios: {
      // h2 de la banda de los socios del Inicio v3 (el mismo valor que shared/cms-defaults.json)
      title: "Nuestros socios",
      // Nombres, cargos (team_members.title_es) y orden ("order") tomados del panel, como en /team.
      // photo: el slug del socio en /team (sus retratos en team_photos).
      people: [
        { name: "Mario Saucedo Montemayor", photo: "mario-saucedo-montemayor", role: "Socio director" },
        { name: "Enrique Santos Guzmán", photo: "enrique-santos-guzman", role: "Socio director" },
        { name: "Enrique Santos Arce", photo: "enrique-santos-arce", role: "Socio fundador" },
      ],
    },
    footer: {
      address: ["Río Tamazunchale 205 Norte", "Col. del Valle", "San Pedro Garza García, N.L.", "C.P. 66220, México"],
      phone: "+52 81 8335 2086",
      phoneHref: "tel:+528183352086",
      privacy: "Aviso de privacidad",
      disclaimer: "La información de este sitio es de carácter general y no constituye asesoría legal.",
      rights: "Santos & Saucedo",
    },
  },
  en: {
    skip: "Skip to content",
    menu: "Menu",
    close: "Close",
    hero: {
      eyebrow: "Business law firm",
      titleFirst: "Santos",
      titleSecond: "Saucedo",
      tagline: "Labor law for companies",
      place: ["San Pedro Garza García", "Since 2010"],
      primaryCta: "Discover the firm",
      secondaryCta: "Talk to our team",
    },
    firma: {
      title: "Our firm",
      body: [
        "From San Pedro Garza García, Santos & Saucedo advises Mexican industrial groups, multinationals and Asian-owned companies on the decisions that involve their people.",
      ],
      caption: "Río Tamazunchale 205 Norte, San Pedro Garza García. In the glass, the Cerro de la Silla.",
      alt: "Glass facade of the Santos & Saucedo offices reflecting the Cerro de la Silla",
    },
    creemos: {
      label: "Our philosophy",
      quote: "We prepare every matter as if it were going to trial.",
      body: [
        "That preparation supports every negotiation: one negotiates better when the case is already ready to be defended. Prevention first and, if a dispute arises, the capacity to respond.",
      ],
    },
    practicas: {
      title: "Our practices",
      items: [
        {
          slug: "laboral-seguridad-social",
          title: "Labor and\u00a0social security",
          body: "Audits, inspections, employment documentation, collective relations and litigation before the Conciliation Centers and Labor Courts. It is the firm’s core practice and gives meaning to the others.",
        },
        {
          slug: "corporativo-contractual",
          title: "Corporate and\u00a0contractual",
          body: "Incorporation and corporate life of companies, trusts and commercial contracts, with labor review built into every transaction.",
        },
        {
          slug: "migratorio",
          title: "Immigration",
          body: "Visas, residence and work permits for foreign executives, technicians and specialists, coordinated with our clients’ human resources departments.",
        },
        {
          slug: "litigio-contencioso",
          title: "Litigation and workplace criminal matters",
          body: "Civil and commercial proceedings, and criminal matters in which the company is the injured party in theft, fraud or breach of trust, including those involving its own personnel.",
        },
      ],
    },
    extranjeras: {
      title: "Foreign companies in Mexico",
      body:
        "Every year Nuevo León receives new plants backed by Asian, American and European capital. For these companies, the firm’s corporate, immigration and labor practices work together, from incorporation to hiring the first shift.",
      alt: "Santos & Saucedo boardroom with the firm’s abstract triptych",
      figures: [
        { value: "72", suffix: "+", label: "cities with an allied firm" },
        { value: "40", suffix: "+", label: "years of partner experience" },
      ],
    },
    monitor: {
      title: "Labor Monitor",
      intro: "The firm’s analysis of the changes that affect employers.",
    },
    socios: {
      title: "Our partners",
      people: [
        { name: "Mario Saucedo Montemayor", photo: "mario-saucedo-montemayor", role: "Managing partner" },
        { name: "Enrique Santos Guzmán", photo: "enrique-santos-guzman", role: "Managing partner" },
        { name: "Enrique Santos Arce", photo: "enrique-santos-arce", role: "Founding partner" },
      ],
    },
    footer: {
      address: ["Río Tamazunchale 205 Norte", "Col. del Valle", "San Pedro Garza García, N.L.", "C.P. 66220, México"],
      phone: "+52 81 8335 2086",
      phoneHref: "tel:+528183352086",
      privacy: "Privacy notice",
      disclaimer: "The information on this site is general in nature and does not constitute legal advice.",
      rights: "Santos & Saucedo",
    },
  },
} as const;

type Home26Content = typeof home26Source.es;

// The source bundle contains the approved Spanish and English copy. For the other
// languages use English only as an initial shape. `useCmsContent` replaces the
// active key with the published CMS translation as soon as it is available.
export const home26 = Object.fromEntries(
  SUPPORTED_LANGUAGES.map(({ code }) => [code, code === "es" ? home26Source.es : home26Source.en]),
) as Record<Lang26, Home26Content>;
