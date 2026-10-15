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

export const nav26 = {
  es: [
    { label: "Nuestra firma", href: "/about" },
    { label: "Prácticas", href: "/practice-groups" },
    { label: "Socios", href: "/team" },
    { label: "Monitor Laboral", href: "/news" },
    { label: "Carreras", href: "/careers" },
    { label: "Contacto", href: "/contact" },
  ],
  en: [
    { label: "The firm", href: "/about" },
    { label: "Practices", href: "/practice-groups" },
    { label: "Partners", href: "/team" },
    { label: "Labor Monitor", href: "/news" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const home26 = {
  es: {
    skip: "Ir al contenido",
    menu: "Menú",
    close: "Cerrar",
    hero: {
      kicker: "San Pedro Garza García, Nuevo León",
      title: ["Derecho laboral", "para empresas."],
      lead:
        "Santos & Saucedo asesora a empresas nacionales y multinacionales en la administración de su capital humano y las representa en asuntos laborales, corporativos, migratorios y contenciosos. Desde San Pedro Garza García, con presencia en más de 72 ciudades del país.",
      sealLabel: "El signo de sección, centro del logotipo de la firma",
    },
    facts: [
      { value: "2010", label: "Año de fundación" },
      { value: "+72", label: "Ciudades con presencia" },
      { value: "4", label: "Prácticas" },
    ],
    firma: {
      label: "La firma",
      title: "Una práctica dedicada a\u00a0las empresas",
      body: [
        "Santos & Saucedo nació en San Pedro Garza García en 2010 con una práctica dedicada a las empresas. Desde entonces asesora a grupos industriales mexicanos, a multinacionales y a empresas de capital asiático en las decisiones que involucran a su personal: la contratación, la organización del trabajo, la relación con el sindicato, la terminación de una relación laboral y la defensa ante las autoridades y los tribunales.",
        "El trabajo de la firma se apoya en una alianza de despachos especializados que le da presencia en más de 72 ciudades. Un cliente con plantas o sucursales en varios estados recibe el mismo criterio en todas ellas.",
      ],
      link: "Nuestra firma",
      caption: "Río Tamazunchale 205 Norte, San Pedro Garza García. En el cristal, el Cerro de la Silla.",
      alt: "Fachada de cristal de las oficinas de Santos & Saucedo con el Cerro de la Silla reflejado",
    },
    creemos: {
      label: "Lo que creemos",
      quote: "La prevención es la primera defensa.",
      body: [
        "Estamos convencidos de que la mayoría de los conflictos laborales se resuelven antes de llegar a un tribunal: en un contrato bien redactado, en un expediente en orden, en una negociación preparada con tiempo.",
        "Por eso la mayor parte de nuestro trabajo es preventivo. Cuando el litigio es inevitable, lo conduce el mismo equipo que conoce la operación del cliente.",
      ],
    },
    practicas: {
      label: "Prácticas",
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
      link: "Todas las prácticas",
    },
    extranjeras: {
      label: "Empresas extranjeras",
      title: "Empresas extranjeras en México",
      body:
        "Nuevo León recibe cada año nuevas plantas de capital asiático, estadounidense y europeo. Para estas empresas, las prácticas corporativa, migratoria y laboral de la firma trabajan en conjunto, desde la constitución de la sociedad hasta la contratación del primer turno.",
      steps: ["Constitución de la sociedad", "Permisos migratorios", "Contratación del primer turno"],
      link: "Empresas extranjeras en México",
      alt: "Sala de juntas de Santos & Saucedo con el tríptico abstracto de la firma",
    },
    monitor: {
      label: "Monitor Laboral",
      title: "Monitor Laboral",
      intro: "Análisis de la firma sobre los cambios que afectan a las empresas.",
      items: [
        // Sin fecha mientras los análisis no estén publicados: en el índice, una sola fila
        // con fecha hacía parecer que a las otras les faltaba el dato.
        {
          date: "",
          tag: "Jornada",
          title: "Registro electrónico de jornada: lo que establece la reforma y lo que aún está pendiente",
          body: "La obligación entra en vigor el 1 de enero de 2027. Los lineamientos técnicos de la Secretaría del Trabajo todavía no se publican.",
        },
        {
          date: "",
          tag: "Jornada",
          title: "Jornada de 40 horas: el calendario de reducción de 2027 a 2030",
          body: "La jornada máxima baja dos horas cada 1 de enero hasta llegar a 40 horas semanales en 2030.",
        },
        {
          date: "",
          tag: "Seguridad social",
          title: "TIP Digital: la tarjeta de identificación patronal del IMSS pasa al Buzón IMSS",
          body: "El acuerdo publicado el 8 de septiembre de 2026 permite generar la tarjeta en formato digital con la e.firma. Está vigente desde el 23 de septiembre.",
        },
      ],
      link: "Ver todos los análisis",
    },
    socios: {
      label: "Socios",
      title: "Socios",
      // Cargos tomados del panel (team_members.title_es).
      people: [
        { name: "Enrique Hernán Santos Arce", photo: "santos-arce", role: "Socio fundador" },
        { name: "Enrique Hernán Santos Guzmán", photo: "santos-guzman", role: "Socio director" },
        { name: "Mario Saucedo Montemayor", photo: "saucedo-montemayor", role: "Socio director" },
      ],
      link: "Conozca al equipo",
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
      kicker: "San Pedro Garza García, Nuevo León",
      title: ["Labor law", "for employers."],
      lead:
        "Santos & Saucedo advises Mexican and multinational companies on the management of their workforce and represents them in labor, corporate, immigration and litigation matters. From San Pedro Garza García, with presence in more than 72 cities across Mexico.",
      sealLabel: "The section sign, at the center of the firm's logotype",
    },
    facts: [
      { value: "2010", label: "Founded" },
      { value: "+72", label: "Cities with presence" },
      { value: "4", label: "Practices" },
    ],
    firma: {
      label: "The firm",
      title: "A practice devoted to\u00a0employers",
      body: [
        "Santos & Saucedo was founded in San Pedro Garza García in 2010 with a practice devoted to employers. Since then it has advised Mexican industrial groups, multinationals and Asian-owned companies on the decisions that involve their people: hiring, the organization of work, union relations, terminations and the defense before authorities and courts.",
        "The firm works with an alliance of specialized law firms that gives it presence in more than 72 cities. A client with plants or branches in several states receives the same judgment in all of them.",
      ],
      link: "The firm",
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
      label: "Practices",
      title: ["Four practices,", "one standard"],
      items: [
        {
          slug: "laboral-seguridad-social",
          title: "Labor and\u00a0social security",
          body: "Audits, inspections, employment documentation, collective relations and litigation before the Conciliation Centers and Labor Courts. It is the firm's core practice and gives meaning to the others.",
        },
        {
          slug: "corporativo-contractual",
          title: "Corporate and\u00a0contracts",
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
      link: "All practices",
    },
    extranjeras: {
      label: "Foreign companies",
      title: "Foreign companies in Mexico",
      body:
        "Every year Nuevo León receives new plants backed by Asian, American and European capital. For these companies, the firm's corporate, immigration and labor practices work together, from incorporation to hiring the first shift.",
      steps: ["Incorporation", "Immigration permits", "Hiring the first shift"],
      link: "Foreign companies in Mexico",
      alt: "Santos & Saucedo boardroom with the firm's abstract triptych",
    },
    monitor: {
      label: "Labor Monitor",
      title: "Labor Monitor",
      intro: "The firm's analysis of the changes that affect employers.",
      items: [
        {
          date: "",
          tag: "Working hours",
          title: "Electronic time records: what the reform requires and what is still pending",
          body: "The obligation takes effect on January 1, 2027. The Labor Ministry has not yet published the technical guidelines.",
        },
        {
          date: "",
          tag: "Working hours",
          title: "The 40-hour week: the 2027–2030 reduction schedule",
          body: "The maximum working week drops two hours every January 1 until it reaches 40 hours in 2030.",
        },
        {
          date: "",
          tag: "Social security",
          title: "Digital TIP: the IMSS employer ID card moves to the IMSS Mailbox",
          body: "The agreement published on September 8, 2026 allows the card to be issued digitally with the e.firma. It has been in force since September 23.",
        },
      ],
      link: "All analysis",
    },
    socios: {
      label: "Partners",
      title: "Partners",
      people: [
        { name: "Enrique Hernán Santos Arce", photo: "santos-arce", role: "Founding partner" },
        { name: "Enrique Hernán Santos Guzmán", photo: "santos-guzman", role: "Managing partner" },
        { name: "Mario Saucedo Montemayor", photo: "saucedo-montemayor", role: "Managing partner" },
      ],
      link: "Meet the team",
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
