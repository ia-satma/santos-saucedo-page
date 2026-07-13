import type { SiteContent, Stat } from "@shared/schema";

export const siteContentData: SiteContent = {
  heroTitle: "WE GO WHERE CLIENTS NEED US",
  heroSubtitle: "Santos & Saucedo Abogados",
  visionTitle: "Human-capital administration and legal defense for companies",
  visionText: "Santos & Saucedo Abogados provides legal counsel and services for the implementation and development of strategies in human-capital administration and legal defense for national and multinational companies — anchored in labor law and backed by more than 35 years of experience.",
  locationTitle: "Office address",
  locationText: "Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220",
  statsTitle: "Santos & Saucedo Abogados",
  quoteText: "",
  quoteAuthor: "",
  quoteRole: "",
  address: "Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220, México",
  phone: "+52 81 8335 2086",
  email: "info@santossaucedo.com",
};

export const statsData: Stat[] = [];

export const practiceGroupsData = [
  {
    name: "Labor & Social Security",
    nameEs: "Laboral y Seguridad Social",
    slug: "laboral-seguridad-social",
    description: "The firm's core: preventive counsel, compliance, and defense in labor and social-security matters for national and multinational companies.",
    descriptionEs: "El núcleo de la firma: asesoría preventiva, cumplimiento y defensa en materia laboral y de seguridad social para empresas nacionales y multinacionales.",
    fullDescription: "Our flagship practice, built on more than 35 years of experience. We cover labor audits and inspections before federal and state authorities; diagnostics (basic labor, regulatory compliance, labor compliance); labor planning; projects with labor impact (purchase, sale, mergers, spin-offs, collective adjustments, changes in working conditions); collective matters (collective bargaining, revisions, consultation procedures, counterclaims, union coverage); and labor legal documentation. On the contentious side we handle labor litigation — individual and collective, pre-procedural matters — terminations, labor investigations, labor reengineering, contractor and supplier control, savings funds, and compliance distinctions.",
    fullDescriptionEs: "Nuestra práctica insignia, construida sobre más de 35 años de experiencia. Cubrimos auditorías laborales e inspecciones ante autoridades federales y estatales; diagnósticos (básicos laborales, cumplimiento normativo, compliance laboral); planeaciones laborales; proyectos con impacto laboral (compra, venta, fusiones, escisiones, reajustes colectivos, cambios en condiciones laborales); asesoría en materia colectiva (negociaciones colectivas, revisiones, procedimientos de consulta, reconvenciones, cobertura sindical); y documentación legal laboral. En lo contencioso atendemos litigio laboral —individual y colectivo, procedimientos paraprocesales—, terminaciones de contratos, investigaciones laborales, reingeniería laboral, administración y control de contratistas y proveedores, cajas y fondos de ahorro, y distintivos de cumplimiento.",
    iconName: "shield-check",
    order: 1
  },
  {
    name: "Corporate & Contractual",
    nameEs: "Corporativo y Contractual",
    slug: "corporativo-contractual",
    description: "Corporate structure and contracts that give legal support to the company's operation.",
    descriptionEs: "Estructura societaria y contratos que dan soporte legal a la operación de la empresa.",
    fullDescription: "Corporate and contractual advisory: general contracts, incorporations, mergers, spin-offs, dissolutions, liquidations, increases and reductions of capital stock, issuance and cancellation of shares or equity interests, sale of shares, and trusts of any kind. Commercial contracts: joint ventures, supply, administrative services, commercial commissions, sales, management, franchises, licenses of use, and industrial property rights.",
    fullDescriptionEs: "Asesoría corporativa y contractual: contratos en general, constituciones, fusiones, escisiones, disoluciones, liquidaciones, aumentos y disminuciones de capital social, emisión y cancelación de acciones o partes sociales, compraventa de acciones y fideicomisos de cualquier índole. Contratos mercantiles: joint ventures, suministros, prestación de servicios administrativos, comisiones mercantiles, ventas, administración, franquicias, licencias de uso y derechos de propiedad industrial.",
    iconName: "building-2",
    order: 2
  },
  {
    name: "Immigration",
    nameEs: "Migratorio",
    slug: "migratorio",
    description: "International mobility of human capital: visas, work permits, and immigration compliance.",
    descriptionEs: "Movilidad internacional del capital humano: visas, permisos de trabajo y cumplimiento migratorio.",
    fullDescription: "Visas and work permits; employer certificates; timely consulting on the applicable immigration situation; obtaining visas for work, investment, business, studies, professional practices, and residency in Mexico; notices to immigration authorities on changes in civil status, address, activities authorized abroad, and the exercise of legal remedies in immigration matters; and apostilles, translations, and legalizations.",
    fullDescriptionEs: "Visa y permisos de trabajo; constancias de empleador; consultoría oportuna respecto del tipo de situación migratoria; obtención de visa de trabajo, inversión, negocios, estudios, prácticas profesionales y residencia en México; avisos a las autoridades de migración sobre cambios en estado civil, domicilio, actividades autorizadas en el extranjero y ejercicio de medios de defensa en materia migratoria; y apostilles, traducciones y legalizaciones.",
    iconName: "globe",
    order: 3
  },
  {
    name: "Contentious Litigation",
    nameEs: "Litigio Contencioso",
    slug: "litigio-contencioso",
    description: "Defense and representation in civil, commercial, and criminal (patrimonial) litigation.",
    descriptionEs: "Defensa y representación en litigio civil, mercantil y penal patrimonial.",
    fullDescription: "Services in civil, commercial, and criminal matters. Patrimonial labor-criminal: filing of complaints before the State of Nuevo León's Orientation and Complaint Centers for the commission of patrimonial crimes — such as theft, fraud, and breach of trust — and assisting as co-adjuvant in oral trials within the new accusatory criminal justice system.",
    fullDescriptionEs: "Servicios en materia civil, mercantil y penal. Penal laboral patrimonial: presentación de denuncias ante los Centros de Orientación y Denuncia del Estado de Nuevo León por la comisión de delitos patrimoniales —tales como robo, fraude y abuso de confianza— y coadyuvar en juicios orales dentro del nuevo sistema penal acusatorio.",
    iconName: "gavel",
    order: 4
  },
];

export const industryGroupsData = [];

export const teamMembersData = [
  {
    name: "Mario Saucedo Montemayor",
    slug: "mario-saucedo-montemayor",
    imageUrl: "/team_photos/mario-saucedo-montemayor.png",
    title: "Managing Partner",
    titleEs: "Socio Director",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Mario Saucedo Montemayor is a managing partner at Santos & Saucedo Abogados, a labor-law firm with more than 35 years of experience advising national and international companies.",
    bioEs: "Mario Saucedo Montemayor es socio director de Santos & Saucedo Abogados, despacho especializado en derecho laboral con más de 35 años de experiencia asesorando a empresas nacionales e internacionales.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 1
  },
  {
    name: "Enrique Santos Gúzman",
    slug: "enrique-santos-guzman",
    imageUrl: "/team_photos/enrique-santos-guzman.png",
    title: "Managing Partner",
    titleEs: "Socio Director",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Enrique Santos Gúzman is a managing partner at Santos & Saucedo Abogados, focused on preventive labor counsel and consulting for companies.",
    bioEs: "Enrique Santos Gúzman es socio director de Santos & Saucedo Abogados, con enfoque en asesoría preventiva y consultoría legal laboral para empresas.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 2
  },
  {
    name: "Enrique Santos Arce",
    slug: "enrique-santos-arce",
    imageUrl: "/team_photos/enrique-santos-arce.png",
    title: "Founding Partner",
    titleEs: "Socio Fundador",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Enrique Santos Arce is a founding partner of Santos & Saucedo Abogados.",
    bioEs: "Enrique Santos Arce es socio fundador de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 3
  },
  {
    name: "Jaime Herrera de Herrera",
    slug: "jaime-herrera-de-herrera",
    imageUrl: "/team_photos/jaime-herrera-de-herrera.jpg",
    title: "Partner",
    titleEs: "Socio",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Jaime Herrera de Herrera is a partner at Santos & Saucedo Abogados.",
    bioEs: "Jaime Herrera de Herrera es socio de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 4
  },
  {
    name: "David Martínez Saucedo",
    slug: "david-martinez-saucedo",
    imageUrl: "/team_photos/david-martinez-saucedo.jpg",
    title: "Partner",
    titleEs: "Socio",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "David Martínez Saucedo is a partner at Santos & Saucedo Abogados.",
    bioEs: "David Martínez Saucedo es socio de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 5
  },
  {
    name: "Jorge A. Garza Martínez",
    slug: "jorge-a-garza-martinez",
    imageUrl: "/team_photos/jorge-a-garza-martinez.jpg",
    title: "Senior Associate",
    titleEs: "Asociado Senior",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Jorge A. Garza Martínez is a senior associate at Santos & Saucedo Abogados.",
    bioEs: "Jorge A. Garza Martínez es asociado senior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 6
  },
  {
    name: "Carlos A. Cerda Ramos",
    slug: "carlos-a-cerda-ramos",
    imageUrl: "/team_photos/carlos-a-cerda-ramos.jpg",
    title: "Senior Associate",
    titleEs: "Asociado Senior",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Carlos A. Cerda Ramos is a senior associate at Santos & Saucedo Abogados.",
    bioEs: "Carlos A. Cerda Ramos es asociado senior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 7
  },
  {
    name: "Orlando Cantú Garza",
    slug: "orlando-cantu-garza",
    imageUrl: "/team_photos/orlando-cantu-garza.jpg",
    title: "Senior Associate",
    titleEs: "Asociado Senior",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Orlando Cantú Garza is a senior associate at Santos & Saucedo Abogados.",
    bioEs: "Orlando Cantú Garza es asociado senior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 8
  },
  {
    name: "Rubén A. Frías García",
    slug: "ruben-a-frias-garcia",
    imageUrl: "/team_photos/ruben-a-frias-garcia.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Rubén A. Frías García is an associate at Santos & Saucedo Abogados.",
    bioEs: "Rubén A. Frías García es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 9
  },
  {
    name: "María Elena Mata Martínez",
    slug: "maria-elena-mata-martinez",
    imageUrl: "/team_photos/maria-elena-mata-martinez.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "María Elena Mata Martínez is an associate at Santos & Saucedo Abogados.",
    bioEs: "María Elena Mata Martínez es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 10
  },
  {
    name: "Pedro A. Sanvicente Romero",
    slug: "pedro-a-sanvicente-romero",
    imageUrl: "/team_photos/pedro-a-sanvicente-romero.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Pedro A. Sanvicente Romero is an associate at Santos & Saucedo Abogados.",
    bioEs: "Pedro A. Sanvicente Romero es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 11
  },
  {
    name: "Eduardo Castillo Cervantes",
    slug: "eduardo-castillo-cervantes",
    imageUrl: "/team_photos/eduardo-castillo-cervantes.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Eduardo Castillo Cervantes is an associate at Santos & Saucedo Abogados.",
    bioEs: "Eduardo Castillo Cervantes es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 12
  },
  {
    name: "José María Ureña Flores",
    slug: "jose-maria-urena-flores",
    imageUrl: "/team_photos/jose-maria-urena-flores.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "José María Ureña Flores is an associate at Santos & Saucedo Abogados.",
    bioEs: "José María Ureña Flores es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 13
  },
  {
    name: "Lillia Cardoza Díaz de León",
    slug: "lillia-cardoza-diaz-de-leon",
    imageUrl: "/team_photos/lillia-cardoza-diaz-de-leon.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Lillia Cardoza Díaz de León is an associate at Santos & Saucedo Abogados.",
    bioEs: "Lillia Cardoza Díaz de León es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 14
  },
  {
    name: "Erick Estrada Márquez",
    slug: "erick-estrada-marquez",
    imageUrl: "/team_photos/erick-estrada-marquez.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Erick Estrada Márquez is an associate at Santos & Saucedo Abogados.",
    bioEs: "Erick Estrada Márquez es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 15
  },
  {
    name: "Huán José Treviño Cavazos",
    slug: "huan-jose-trevino-cavazos",
    imageUrl: "/team_photos/huan-jose-trevino-cavazos.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Huán José Treviño Cavazos is an associate at Santos & Saucedo Abogados.",
    bioEs: "Huán José Treviño Cavazos es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 16
  },
  {
    name: "Misden Castillo Chávez",
    slug: "misden-castillo-chavez",
    imageUrl: "/team_photos/misden-castillo-chavez.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Misden Castillo Chávez is an associate at Santos & Saucedo Abogados.",
    bioEs: "Misden Castillo Chávez es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 17
  },
  {
    name: "Ancella Reynoso Pámanes",
    slug: "ancella-reynoso-pamanes",
    imageUrl: "/team_photos/ancella-reynoso-pamanes.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Ancella Reynoso Pámanes is an associate at Santos & Saucedo Abogados.",
    bioEs: "Ancella Reynoso Pámanes es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 18
  },
  {
    name: "Diana G. Lopez Rodríguez",
    slug: "diana-g-lopez-rodriguez",
    imageUrl: "/team_photos/diana-g-lopez-rodriguez.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Diana G. Lopez Rodríguez is an associate at Santos & Saucedo Abogados.",
    bioEs: "Diana G. Lopez Rodríguez es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 19
  },
  {
    name: "Carlos F. Rodríguez Mirelles",
    slug: "carlos-f-rodriguez-mirelles",
    imageUrl: "/team_photos/carlos-f-rodriguez-mirelles.jpg",
    title: "Junior Associate",
    titleEs: "Asociado Jr.",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Carlos F. Rodríguez Mirelles is a junior associate at Santos & Saucedo Abogados.",
    bioEs: "Carlos F. Rodríguez Mirelles es asociado junior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 20
  },
  {
    name: "Rubí Quintanilla Martínez",
    slug: "rubi-quintanilla-martinez",
    imageUrl: "/team_photos/rubi-quintanilla-martinez.jpg",
    title: "Junior Associate",
    titleEs: "Asociada Jr.",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Rubí Quintanilla Martínez is a junior associate at Santos & Saucedo Abogados.",
    bioEs: "Rubí Quintanilla Martínez es asociada junior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 21
  },
  {
    name: "Gabriela L. García Vásquez",
    slug: "gabriela-l-garcia-vasquez",
    imageUrl: "/team_photos/gabriela-l-garcia-vasquez.jpg",
    title: "Junior Associate",
    titleEs: "Asociada Jr.",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Gabriela L. García Vásquez is a junior associate at Santos & Saucedo Abogados.",
    bioEs: "Gabriela L. García Vásquez es asociada junior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 22
  },
  {
    name: "Luis A Saucedo Rodríguez",
    slug: "luis-a-saucedo-rodriguez",
    imageUrl: "/team_photos/luis-a-saucedo-rodriguez.jpg",
    title: "Staff",
    titleEs: "Staff",
    role: "Firm Operations",
    roleEs: "Operación del Despacho",
    bio: "Luis A Saucedo Rodríguez is part of the Santos & Saucedo staff.",
    bioEs: "Luis A Saucedo Rodríguez forma parte del staff de Santos & Saucedo.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 23
  },
  {
    name: "Jorge A. Melchor Ortíz",
    slug: "jorge-a-melchor-ortiz",
    imageUrl: "/team_photos/jorge-a-melchor-ortiz.jpg",
    title: "Staff",
    titleEs: "Staff",
    role: "Firm Operations",
    roleEs: "Operación del Despacho",
    bio: "Jorge A. Melchor Ortíz is part of the Santos & Saucedo staff.",
    bioEs: "Jorge A. Melchor Ortíz forma parte del staff de Santos & Saucedo.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 24
  },
];

export const newsData = [
  {
    title: "What companies should know about individual labor conflicts before conciliation and arbitration boards",
    titleEs: "Lo que las empresas deben saber sobre conflictos individuales de trabajo ante juntas de conciliación y arbitraje",
    excerpt: "A practical overview of the process employers face when an individual labor dispute reaches a conciliation and arbitration board.",
    excerptEs: "Un panorama práctico del proceso que enfrentan los empleadores cuando un conflicto individual de trabajo llega a una junta de conciliación y arbitraje.",
    content: "Individual labor conflicts can escalate quickly once they reach a conciliation and arbitration board. Companies that document processes and act early in the conciliation stage are consistently better positioned than those that wait until litigation is underway. This overview covers the key stages employers should understand and where preventive legal counsel makes the most difference.",
    contentEs: "Los conflictos individuales de trabajo pueden escalar rápidamente una vez que llegan a una junta de conciliación y arbitraje. Las empresas que documentan sus procesos y actúan desde la etapa de conciliación están consistentemente mejor posicionadas que aquellas que esperan a que el litigio esté en curso. Este panorama cubre las etapas clave que los empleadores deben entender y en qué momentos la asesoría legal preventiva marca la mayor diferencia.",
    slug: "conflictos-individuales-juntas-conciliacion",
    published: true,
    category: "alerts",
    categoryEs: "Alertas",
  },
  {
    title: "Why a labor administration review matters before a dispute, not after",
    titleEs: "Por qué una revisión de la administración laboral importa antes del conflicto, no después",
    excerpt: "A periodic review of labor administration processes surfaces risk before it becomes a formal claim.",
    excerptEs: "Una revisión periódica de los procesos de administración laboral permite identificar riesgos antes de que se conviertan en una demanda formal.",
    content: "Many labor claims trace back to gaps in day-to-day administration: incomplete files, inconsistent policy application, or undocumented decisions. A structured labor administration review identifies these gaps while they are still inexpensive to fix, rather than after a claim has already been filed.",
    contentEs: "Muchas demandas laborales se originan en vacíos de la administración cotidiana: expedientes incompletos, aplicación inconsistente de políticas o decisiones no documentadas. Una revisión estructurada de la administración laboral identifica estos vacíos mientras todavía son económicos de corregir, en lugar de después de que ya se presentó una demanda.",
    slug: "revision-administracion-laboral-preventiva",
    published: true,
    category: "alerts",
    categoryEs: "Alertas",
  },
  {
    title: "Building a legal-labor audit checklist for growing companies",
    titleEs: "Cómo construir un checklist de auditoría jurídico-laboral para empresas en crecimiento",
    excerpt: "As headcount grows, so does labor exposure. A structured audit checklist keeps compliance in step with growth.",
    excerptEs: "Conforme crece la plantilla, crece la exposición laboral. Un checklist de auditoría estructurado mantiene el cumplimiento a la par del crecimiento.",
    content: "Companies scaling quickly often outgrow their original labor documentation and policies without noticing. A legal-labor audit checklist — covering contracts, internal regulations, and statutory filings — gives growing companies a repeatable way to catch gaps before they compound.",
    contentEs: "Las empresas que crecen rápido con frecuencia superan su documentación y políticas laborales originales sin notarlo. Un checklist de auditoría jurídico-laboral —que cubra contratos, reglamentos internos y obligaciones legales— le da a las empresas en crecimiento una forma repetible de detectar vacíos antes de que se acumulen.",
    slug: "checklist-auditoria-juridico-laboral",
    published: true,
    category: "alerts",
    categoryEs: "Alertas",
  },
];


// Office photography pending (Fase 4 — institutional photo shoot)
export const officeImagesData: { imageUrl: string; alt: string; altEs: string; order: number }[] = [];

export const representativeMattersData = [
  {
    title: "Acquisition of Major Telecommunications Company",
    titleEs: "Adquisición de Importante Empresa de Telecomunicaciones",
    description: "Advised a Fortune 500 company on the $3.2 billion acquisition of a leading Mexican telecommunications operator, including regulatory approvals and antitrust filings.",
    descriptionEs: "Asesoramos a una empresa Fortune 500 en la adquisición de $3.2 mil millones de un operador de telecomunicaciones líder en México, incluyendo aprobaciones regulatorias y presentaciones de competencia económica.",
    client: "Confidential Client",
    clientEs: "Cliente Confidencial",
    year: 2024,
    practiceAreaSlug: "corporate-ma",
    industrySlug: "technology-industry",
    isHighlight: true,
    order: 1,
  },
  {
    title: "International Arbitration Victory in Energy Dispute",
    titleEs: "Victoria en Arbitraje Internacional en Disputa Energética",
    description: "Successfully represented a multinational energy company in ICC arbitration proceedings, securing a $500 million award in a complex infrastructure dispute.",
    descriptionEs: "Representamos exitosamente a una empresa energética multinacional en procedimientos de arbitraje ICC, obteniendo un laudo de $500 millones en una compleja disputa de infraestructura.",
    client: "International Energy Corporation",
    clientEs: "Corporación Energética Internacional",
    year: 2024,
    practiceAreaSlug: "arbitration",
    industrySlug: "energy-natural-resources-industry",
    isHighlight: true,
    order: 2,
  },
  {
    title: "Landmark Antitrust Defense in Automotive Sector",
    titleEs: "Defensa Histórica en Competencia Económica en Sector Automotriz",
    description: "Defended a leading automotive manufacturer against cartel allegations before COFECE, resulting in complete exoneration and establishing important precedents.",
    descriptionEs: "Defendimos a un fabricante automotriz líder contra alegaciones de cártel ante COFECE, logrando exoneración completa y estableciendo precedentes importantes.",
    client: "Confidential Client",
    clientEs: "Cliente Confidencial",
    year: 2024,
    practiceAreaSlug: "antitrust-competition",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: true,
    order: 3,
  },
  {
    title: "Cross-Border M&A in Pharmaceutical Industry",
    titleEs: "M&A Transfronteriza en Industria Farmacéutica",
    description: "Advised on the $1.8 billion cross-border acquisition of Mexican pharmaceutical laboratories by a European healthcare conglomerate.",
    descriptionEs: "Asesoramos en la adquisición transfronteriza de $1.8 mil millones de laboratorios farmacéuticos mexicanos por un conglomerado europeo de salud.",
    client: "European Healthcare Group",
    clientEs: "Grupo Europeo de Salud",
    year: 2023,
    practiceAreaSlug: "corporate-ma",
    industrySlug: "pharmaceutical-life-sciences",
    isHighlight: true,
    order: 4,
  },
  {
    title: "Major Restructuring of Retail Chain",
    titleEs: "Reestructuración Mayor de Cadena Minorista",
    description: "Led the comprehensive restructuring of one of Mexico's largest retail chains, involving $2 billion in debt and over 500 creditors.",
    descriptionEs: "Lideramos la reestructuración integral de una de las cadenas minoristas más grandes de México, involucrando $2 mil millones en deuda y más de 500 acreedores.",
    client: "Confidential Client",
    clientEs: "Cliente Confidencial",
    year: 2023,
    practiceAreaSlug: "bankruptcy-restructuring",
    industrySlug: "consumer-goods",
    isHighlight: true,
    order: 5,
  },
  {
    title: "FCPA Investigation and Settlement",
    titleEs: "Investigación y Acuerdo FCPA",
    description: "Represented a multinational corporation in internal investigation and DOJ negotiations, achieving favorable settlement in significant FCPA matter.",
    descriptionEs: "Representamos a una corporación multinacional en investigación interna y negociaciones con el DOJ, logrando un acuerdo favorable en un caso significativo de FCPA.",
    client: "Confidential Client",
    clientEs: "Cliente Confidencial",
    year: 2023,
    practiceAreaSlug: "investigations-anticorruption",
    industrySlug: "financial-services",
    isHighlight: true,
    order: 6,
  },
  {
    title: "Syndicated Loan for Infrastructure Project",
    titleEs: "Crédito Sindicado para Proyecto de Infraestructura",
    description: "Structured and negotiated a $750 million syndicated loan for a major infrastructure project, involving multiple international financial institutions.",
    descriptionEs: "Estructuramos y negociamos un crédito sindicado de $750 millones para un importante proyecto de infraestructura, involucrando múltiples instituciones financieras internacionales.",
    client: "International Infrastructure Fund",
    clientEs: "Fondo Internacional de Infraestructura",
    year: 2023,
    practiceAreaSlug: "banking-finance",
    industrySlug: "financial-services",
    isHighlight: false,
    order: 7,
  },
  {
    title: "Renewable Energy Project Development",
    titleEs: "Desarrollo de Proyecto de Energía Renovable",
    description: "Advised on the development and financing of a 500MW solar energy project, including land acquisition, permits, and power purchase agreements.",
    descriptionEs: "Asesoramos en el desarrollo y financiamiento de un proyecto de energía solar de 500MW, incluyendo adquisición de terrenos, permisos y contratos de compra de energía.",
    client: "Global Renewable Energy Developer",
    clientEs: "Desarrollador Global de Energía Renovable",
    year: 2023,
    practiceAreaSlug: "energy-natural-resources",
    industrySlug: "energy-natural-resources-industry",
    isHighlight: false,
    order: 8,
  },
  {
    title: "Commercial Litigation Victory in Contract Dispute",
    titleEs: "Victoria en Litigio Comercial en Disputa Contractual",
    description: "Obtained favorable judgment in complex commercial litigation involving breach of distribution agreements with damages exceeding $200 million.",
    descriptionEs: "Obtuvimos sentencia favorable en litigio comercial complejo involucrando incumplimiento de acuerdos de distribución con daños superiores a $200 millones.",
    client: "Confidential Client",
    clientEs: "Cliente Confidencial",
    year: 2022,
    practiceAreaSlug: "litigation",
    industrySlug: "consumer-goods",
    isHighlight: false,
    order: 9,
  },
  {
    title: "Tax Controversy Resolution",
    titleEs: "Resolución de Controversia Fiscal",
    description: "Successfully resolved major tax controversy with SAT involving transfer pricing adjustments of over $150 million, achieving substantial reduction.",
    descriptionEs: "Resolvimos exitosamente una importante controversia fiscal con el SAT involucrando ajustes de precios de transferencia de más de $150 millones, logrando reducción sustancial.",
    client: "Multinational Manufacturing Company",
    clientEs: "Empresa Manufacturera Multinacional",
    year: 2022,
    practiceAreaSlug: "tax",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: false,
    order: 10,
  },
  {
    title: "Major Real Estate Development Transaction",
    titleEs: "Transacción de Desarrollo Inmobiliario Mayor",
    description: "Advised on $400 million mixed-use development project, including land acquisition, construction financing, and commercial leasing.",
    descriptionEs: "Asesoramos en proyecto de desarrollo de uso mixto de $400 millones, incluyendo adquisición de terreno, financiamiento de construcción y arrendamiento comercial.",
    client: "Real Estate Investment Trust",
    clientEs: "Fideicomiso de Inversión Inmobiliaria",
    year: 2022,
    practiceAreaSlug: "real-estate",
    industrySlug: "real-estate-industry",
    isHighlight: false,
    order: 11,
  },
  {
    title: "Patent Infringement Defense",
    titleEs: "Defensa en Infracción de Patentes",
    description: "Successfully defended a technology company against patent infringement claims valued at $80 million, securing dismissal of all claims.",
    descriptionEs: "Defendimos exitosamente a una empresa de tecnología contra reclamaciones de infracción de patentes valuadas en $80 millones, logrando la desestimación de todas las reclamaciones.",
    client: "Technology Corporation",
    clientEs: "Corporación de Tecnología",
    year: 2022,
    practiceAreaSlug: "intellectual-property",
    industrySlug: "technology-industry",
    isHighlight: false,
    order: 12,
  },
  {
    title: "Collective Labor Agreement Negotiation",
    titleEs: "Negociación de Contrato Colectivo de Trabajo",
    description: "Negotiated collective bargaining agreements for a major manufacturing company with over 15,000 employees across multiple facilities.",
    descriptionEs: "Negociamos contratos colectivos de trabajo para una importante empresa manufacturera con más de 15,000 empleados en múltiples instalaciones.",
    client: "Confidential Client",
    clientEs: "Cliente Confidencial",
    year: 2022,
    practiceAreaSlug: "labor-employment",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: false,
    order: 13,
  },
  {
    title: "Trade Remedy Investigation",
    titleEs: "Investigación de Remedio Comercial",
    description: "Represented steel producers in antidumping investigation, successfully obtaining protective duties against unfair import practices.",
    descriptionEs: "Representamos a productores de acero en investigación antidumping, obteniendo exitosamente aranceles de protección contra prácticas de importación desleales.",
    client: "Mexican Steel Producers Association",
    clientEs: "Asociación Mexicana de Productores de Acero",
    year: 2021,
    practiceAreaSlug: "international-trade",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: false,
    order: 14,
  },
  {
    title: "TMT Sector Merger Approval",
    titleEs: "Aprobación de Fusión en Sector TMT",
    description: "Secured regulatory approval for complex merger in telecommunications sector, navigating IFT and COFECE requirements.",
    descriptionEs: "Obtuvimos aprobación regulatoria para fusión compleja en sector de telecomunicaciones, navegando requisitos del IFT y COFECE.",
    client: "Telecommunications Company",
    clientEs: "Empresa de Telecomunicaciones",
    year: 2021,
    practiceAreaSlug: "telecommunications-media-technology",
    industrySlug: "technology-industry",
    isHighlight: false,
    order: 15,
  },
  {
    title: "Environmental Permitting for Mining Project",
    titleEs: "Permisos Ambientales para Proyecto Minero",
    description: "Obtained all necessary environmental permits and approvals for a large-scale mining operation, including SEMARNAT authorizations.",
    descriptionEs: "Obtuvimos todos los permisos y aprobaciones ambientales necesarios para una operación minera a gran escala, incluyendo autorizaciones de SEMARNAT.",
    client: "International Mining Company",
    clientEs: "Empresa Minera Internacional",
    year: 2021,
    practiceAreaSlug: "environmental",
    industrySlug: "energy-natural-resources-industry",
    isHighlight: false,
    order: 16,
  },
  {
    title: "Government Contract Award Defense",
    titleEs: "Defensa de Adjudicación de Contrato Gubernamental",
    description: "Successfully defended contract award in administrative litigation, protecting a $120 million infrastructure concession.",
    descriptionEs: "Defendimos exitosamente adjudicación de contrato en litigio administrativo, protegiendo una concesión de infraestructura de $120 millones.",
    client: "Infrastructure Company",
    clientEs: "Empresa de Infraestructura",
    year: 2021,
    practiceAreaSlug: "administrative-law",
    industrySlug: "real-estate-industry",
    isHighlight: false,
    order: 17,
  },
  {
    title: "ESG Framework Implementation",
    titleEs: "Implementación de Marco ESG",
    description: "Developed comprehensive ESG compliance framework for a major financial institution, including sustainability reporting and governance policies.",
    descriptionEs: "Desarrollamos marco integral de cumplimiento ESG para una importante institución financiera, incluyendo reportes de sustentabilidad y políticas de gobierno corporativo.",
    client: "Leading Mexican Bank",
    clientEs: "Banco Mexicano Líder",
    year: 2024,
    practiceAreaSlug: "esg",
    industrySlug: "financial-services",
    isHighlight: false,
    order: 19,
  },
];

// No events scheduled yet for the prototype
export const eventsData: any[] = [];

export async function seed() {
  const { db } = await import("./db");
  const { eq } = await import("drizzle-orm");
  const {
    news,
    officeImages,
    practiceGroups,
    industryGroups,
    teamMembers,
    representativeMatters,
    adminUsers,
    events,
  } = await import("@shared/schema");

  console.log("Seeding database with Santos & Saucedo content...");

  const existingNews = await db.select().from(news);
  if (existingNews.length === 0) {
    console.log("Seeding news...");
    await db.insert(news).values(newsData);
  }

  const existingImages = await db.select().from(officeImages);
  if (existingImages.length === 0 && officeImagesData.length > 0) {
    console.log("Seeding office images...");
    await db.insert(officeImages).values(officeImagesData);
  }

  const existingPracticeGroups = await db.select().from(practiceGroups);
  if (existingPracticeGroups.length === 0) {
    console.log("Seeding practice groups...");
    await db.insert(practiceGroups).values(practiceGroupsData);
  }

  const existingIndustryGroups = await db.select().from(industryGroups);
  if (existingIndustryGroups.length === 0) {
    console.log("Seeding industry groups...");
    await db.insert(industryGroups).values(industryGroupsData);
  }

  const existingTeamMembers = await db.select().from(teamMembers);
  if (existingTeamMembers.length === 0) {
    console.log("Seeding team members...");
    await db.insert(teamMembers).values(teamMembersData);
  }

  const existingRepresentativeMatters = await db.select().from(representativeMatters);
  if (existingRepresentativeMatters.length === 0) {
    console.log("Seeding representative matters...");
    await db.insert(representativeMatters).values(representativeMattersData);
  }

  // Seed admin user from environment variables (secure approach)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  
  if (adminEmail && adminPasswordHash) {
    const existingAdmin = await db.select().from(adminUsers).where(
      eq(adminUsers.email, adminEmail)
    );
    
    if (existingAdmin.length === 0) {
      console.log("Creating admin user from environment variables...");
      await db.insert(adminUsers).values({
        username: adminEmail.split('@')[0],
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "super_admin",
        isActive: true,
      }).onConflictDoNothing();
      console.log(`Admin user created: ${adminEmail}`);
    }
  }

  // Seed events
  const existingEvents = await db.select().from(events);
  if (existingEvents.length === 0 && eventsData.length > 0) {
    console.log("Seeding events...");
    await db.insert(events).values(eventsData);
  }

  console.log("Database seeded successfully with Santos & Saucedo content!");
}
