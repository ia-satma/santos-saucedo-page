// Texto del Inicio 2026 (versión aprobada v3, 12 oct 2026).
// El inglés es provisional hasta la revisión de la firma.

export type Lang26 = "es" | "en";

// El Inicio solo existe en ES/EN: su contenido declara su propio idioma y dirección,
// aunque <html> lleve otro (de, ar…) desde LanguageContext.
export const langAttrs = {
  es: { lang: "es-MX", dir: "ltr" },
  en: { lang: "en", dir: "ltr" },
} as const;

// En los titulares, "\u00a0" (espacio duro) evita que una palabra corta quede al final de línea.
// Los TextLink de cada sección no tienen texto propio: llevan la etiqueta del menú de su destino
// (chrome26[lang].nav, fuente única de los nombres de sección), un solo texto por destino.
// Los nombres de las prácticas son los de la base (practice_groups.name_es / name).

export const home26 = {
  es: {
    skip: "Ir al contenido",
    menu: "Menú",
    close: "Cerrar",
    // Héroe (composición aprobada, H4): el logotipo es el h1 junto con la frase; debajo, lugar
    // y año. Las dos partes del lugar se unen con " · " (en teléfono, una debajo de la otra).
    hero: {
      tagline: "Derecho laboral para empresas",
      place: ["San Pedro Garza García", "Desde 2010"],
    },
    firma: {
      title: "Una práctica dedicada a\u00a0las empresas",
      body: [
        "Santos & Saucedo nació en San Pedro Garza García en 2010 con una práctica dedicada a las empresas. Desde entonces asesora a grupos industriales mexicanos, a multinacionales y a empresas de capital asiático en las decisiones que involucran a su personal: la contratación, la organización del trabajo, la relación con el sindicato, la terminación de una relación laboral y la defensa ante las autoridades y los tribunales.",
        "El trabajo de la firma se apoya en una alianza de despachos especializados que le da presencia en más de 72 ciudades. Un cliente con plantas o sucursales en varios estados recibe el mismo criterio en todas ellas.",
      ],
      caption: "Río Tamazunchale 205 Norte, San Pedro Garza García. En el cristal, el Cerro de la Silla.",
      alt: "Fachada de cristal de las oficinas de Santos & Saucedo con el Cerro de la Silla reflejado",
    },
    creemos: {
      // Etiqueta de la banda (redacción: "Lo que creemos"), tras "§ ——"
      label: "Lo que creemos",
      quote: "La prevención es la primera defensa.",
      body: [
        "Estamos convencidos de que la mayoría de los conflictos laborales se resuelven antes de llegar a un tribunal: en un contrato bien redactado, en un expediente en orden, en una negociación preparada con tiempo.",
        "Por eso la mayor parte de nuestro trabajo es preventivo. Cuando el litigio es inevitable, lo conduce el mismo equipo que conoce la operación del cliente.",
      ],
    },
    practicas: {
      // Dos líneas fijas, como el titular de portada
      title: ["Cuatro prácticas,", "un mismo criterio"],
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
          title: "Litigio",
          body: "Juicios civiles y mercantiles, y asuntos penales en los que la empresa es la parte afectada por robo, fraude o abuso de confianza.",
        },
      ],
    },
    extranjeras: {
      title: "Empresas extranjeras en México",
      body:
        "Nuevo León recibe cada año nuevas plantas de capital asiático, estadounidense y europeo. Para estas empresas, las prácticas corporativa, migratoria y laboral de la firma trabajan en conjunto, desde la constitución de la sociedad hasta la contratación del primer turno.",
      steps: ["Constitución de la sociedad", "Permisos migratorios", "Contratación del primer turno"],
      alt: "Sala de juntas de Santos & Saucedo con el tríptico abstracto de la firma",
    },
    // Las filas son las notas publicadas en /api/news (Sections26, MonitorList)
    monitor: {
      title: "Monitor Laboral",
      intro: "Análisis de la firma sobre los cambios que afectan a las empresas.",
    },
    socios: {
      title: "Socios",
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
      tagline: "Labor law for companies",
      place: ["San Pedro Garza García", "Since 2010"],
    },
    firma: {
      title: "A practice devoted to\u00a0employers",
      body: [
        "Santos & Saucedo was founded in San Pedro Garza García in 2010 with a practice devoted to employers. Since then it has advised Mexican industrial groups, multinationals and Asian-owned companies on the decisions that involve their people: hiring, the organization of work, union relations, terminations and the defense before authorities and courts.",
        "The firm works with an alliance of specialized law firms that gives it presence in more than 72 cities. A client with plants or branches in several states receives the same judgment in all of them.",
      ],
      caption: "Río Tamazunchale 205 Norte, San Pedro Garza García. In the glass, the Cerro de la Silla.",
      alt: "Glass facade of the Santos & Saucedo offices reflecting the Cerro de la Silla",
    },
    creemos: {
      label: "What we believe",
      quote: "Prevention is the first defense.",
      body: [
        "We are convinced that most labor disputes are resolved before they reach a court: in a well-drafted contract, in a file kept in order, in a negotiation prepared in advance.",
        "That is why most of our work is preventive. When litigation is unavoidable, it is handled by the same team that knows the client's operation.",
      ],
    },
    practicas: {
      title: ["Four practices,", "one standard"],
      items: [
        {
          slug: "laboral-seguridad-social",
          title: "Labor and\u00a0social security",
          body: "Audits, inspections, employment documentation, collective relations and litigation before the Conciliation Centers and Labor Courts. It is the firm's core practice and gives meaning to the others.",
        },
        {
          slug: "corporativo-contractual",
          title: "Corporate and\u00a0contractual",
          body: "Incorporation and corporate life of companies, trusts and commercial contracts, with labor review built into every transaction.",
        },
        {
          slug: "migratorio",
          title: "Immigration",
          body: "Visas, residence and work permits for foreign executives, technicians and specialists, coordinated with our clients' human resources departments.",
        },
        {
          slug: "litigio-contencioso",
          title: "Litigation",
          body: "Civil and commercial proceedings, and criminal matters in which the company is the injured party in theft, fraud or breach of trust.",
        },
      ],
    },
    extranjeras: {
      title: "Foreign companies in Mexico",
      body:
        "Every year Nuevo León receives new plants backed by Asian, American and European capital. For these companies, the firm's corporate, immigration and labor practices work together, from incorporation to hiring the first shift.",
      steps: ["Incorporation", "Immigration permits", "Hiring the first shift"],
      alt: "Santos & Saucedo boardroom with the firm's abstract triptych",
    },
    monitor: {
      title: "Labor Monitor",
      intro: "The firm's analysis of the changes that affect employers.",
    },
    socios: {
      title: "Partners",
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
