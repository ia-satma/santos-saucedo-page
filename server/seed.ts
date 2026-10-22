import type { SiteContent, Stat } from "@shared/schema";

export const siteContentData: SiteContent = {
  heroTitle: "WE GO WHERE CLIENTS NEED US",
  heroSubtitle: "Santos & Saucedo Abogados",
  visionTitle: "Human-capital administration and legal defense for companies",
  visionText: "Santos & Saucedo Abogados provides legal counsel and services for the implementation and development of strategies in human-capital administration and legal defense for national and multinational companies — anchored in labor law and backed by more than 35 years of experience.",
  locationTitle: "Office address",
  // "Col. del Valle", como el pie, la ficha de Contacto y la consulta de Google Maps (G11)
  locationText: "Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L., C.P. 66220",
  statsTitle: "Santos & Saucedo Abogados",
  quoteText: "",
  quoteAuthor: "",
  quoteRole: "",
  address: "Río Tamazunchale 205 Norte, Col. del Valle, San Pedro Garza García, N.L., C.P. 66220, México",
  phone: "+52 81 8335 2086",
  email: "info@santossaucedo.com",
};

export const statsData: Stat[] = [];

// Textos de las prácticas: redacción aprobada por la firma (documento de redacción, v3), sin
// las líneas pendientes de confirmar. "description" es el resumen de la lista de prácticas.
// "fullDescription": "# " lema (subtítulo del encabezado), párrafos separados por una línea
// en blanco y "## " para cada servicio de la lista de dos columnas (PracticeGroupDetail).
export const practiceGroupsData = [
  {
    name: "Labor and social security",
    nameEs: "Laboral y seguridad social",
    slug: "laboral-seguridad-social",
    imageUrl: "/editorial/practice-laboral.webp",
    description: "Audits, inspections, employment documentation, collective relations and litigation before the Conciliation Centers and Labor Courts. It is the firm’s core practice and gives meaning to the others.",
    descriptionEs: "Auditorías, inspecciones, documentación laboral, relaciones colectivas y litigio ante los Centros de Conciliación y los Tribunales Laborales. Es la práctica central de la firma y la que da sentido a las demás.",
    fullDescription: "# Prevention is the first defense.\n\nSantos & Saucedo advises companies on compliance with their labor and social security obligations, and represents them before the labor authorities, the Conciliation Centers and the Labor Courts throughout Mexico.\n\nOur flagship practice, built on more than 35 years of experience. Most of our work is preventive. We review contracts, personnel files and internal practices to identify contingencies before they turn into a dispute, and we prepare our clients for reviews by the authorities. When litigation is unavoidable, it is handled by the same team that knows the company’s operation, its workforce and its history.\n\nThe 2019 labor reform changed the way disputes are resolved in Mexico: pre-judicial conciliation, the new courts and the legitimation of collective bargaining agreements require files to be in order from day one. The 2026 reforms, with the gradual reduction of the working week to 40 hours and electronic time records, add new obligations from 2027.\n\n## Compliance and prevention\n\nWe conduct labor audits that review contracts, personnel files, payroll and benefits, and deliver a diagnosis with the contingencies ranked by priority. We draft and implement the documentation that supports the employment relationship: individual contracts, internal work regulations, policies and protocols, including those required by NOM-035 and for the prevention of workplace violence.\n\nWe prepare companies for inspections by federal and local labor authorities and accompany them throughout. We check that specialized service providers hold a current REPSE registration and meet their obligations before the IMSS, because the liability they leave unmet can fall on the company that hires them.\n\nWe also advise on the year’s labor planning: the organization of headcount and shifts, hiring schemes, the transition to the 40-hour week, the design and regularization of savings funds, and obtaining labor distinctions.\n\n## Collective relations\n\nWe prepare and conduct our clients’ collective bargaining and wage reviews, and organize the worker consultation procedures the law requires to register or revise a collective bargaining agreement. While the agreement is in force we advise continuously on the relationship with the union, so that each review begins in order and operations are not interrupted.\n\nIn a market closely watched by the USMCA labor mechanism, especially in the automotive industry, we make sure that every step of the collective relationship respects freedom of association and is properly documented.\n\n## Transactions, restructurings and terminations\n\nWe analyze the labor implications of acquisitions, mergers and spin-offs, and organize the transfer of personnel so that the company does not inherit contingencies. We plan collective adjustments, changes in working conditions and labor reengineering when the actual operation no longer matches what the contracts say.\n\nWe document individual and collective terminations and formalize settlement agreements before the authorities through non-contentious (paraprocesal) proceedings, so that the termination is final.\n\n## Labor litigation\n\nWe represent companies in pre-judicial conciliation before the Conciliation Centers and in individual and collective proceedings before the Labor Courts, as well as in matters still pending before the Conciliation and Arbitration Boards. The defense begins with the file: much of what is argued at trial was decided months earlier, in a signed document or in one that was missing.\n\nWe also conduct internal investigations into complaints of harassment or serious misconduct, with a procedure that can withstand review by a court. When an employee damages the company’s assets, the labor practice works with the litigation practice to coordinate the termination and the criminal complaint.\n\n## Social security\n\nWe advise on compliance with obligations before the IMSS and Infonavit.",
    fullDescriptionEs: "# La prevención es la primera defensa.\n\nSantos & Saucedo asesora a empresas en el cumplimiento de sus obligaciones laborales y de seguridad social, y las representa ante las autoridades del trabajo, los Centros de Conciliación y los Tribunales Laborales de todo el país.\n\nNuestra práctica insignia, construida sobre más de 35 años de experiencia. La mayor parte de nuestro trabajo es preventivo. Revisamos contratos, expedientes y prácticas internas para identificar contingencias antes de que se conviertan en un conflicto, y preparamos a nuestros clientes para las revisiones de la autoridad. Cuando el litigio es inevitable, lo conduce el mismo equipo que conoce la operación de la empresa, su plantilla y su historia.\n\nLa reforma laboral de 2019 cambió la forma en que se resuelven los conflictos en México: la conciliación prejudicial, los nuevos tribunales y la legitimación de los contratos colectivos exigen expedientes en orden desde el primer día. Las reformas de 2026, con la reducción gradual de la jornada a 40 horas y el registro electrónico de jornada, añaden obligaciones nuevas a partir de 2027.\n\n## Cumplimiento y prevención\n\nRealizamos auditorías laborales que revisan contratos, expedientes de personal, nómina y prestaciones, y entregamos un diagnóstico con las contingencias ordenadas por prioridad. Elaboramos e implementamos la documentación que sostiene la relación de trabajo: contratos individuales, reglamentos interiores, políticas y protocolos, incluidos los que exigen la NOM-035 y la prevención de la violencia laboral.\n\nPreparamos a las empresas para las inspecciones de las autoridades federales y locales del trabajo y las acompañamos durante ellas. Revisamos que los proveedores de servicios especializados cuenten con registro vigente en el REPSE y cumplan con sus obligaciones ante el IMSS, porque la responsabilidad que omiten puede recaer en quien los contrata.\n\nAsesoramos también en la planeación laboral del año: la organización de plantillas y turnos, los esquemas de contratación, la transición a la jornada de 40 horas, el diseño y la regularización de cajas y fondos de ahorro y la obtención de distintivos laborales.\n\n## Relaciones colectivas\n\nPreparamos y conducimos las revisiones contractuales y salariales de nuestros clientes, y organizamos los procedimientos de consulta a los trabajadores que la ley exige para registrar o revisar un contrato colectivo. Durante la vigencia del contrato asesoramos de forma continua en la relación con el sindicato, para que cada revisión empiece con orden y la operación no se interrumpa.\n\nEn un mercado observado de cerca por el mecanismo laboral del T-MEC, en especial en la industria automotriz, cuidamos que cada paso de la relación colectiva respete la libertad sindical y quede debidamente documentado.\n\n## Operaciones, reestructuras y terminaciones\n\nAnalizamos las implicaciones laborales de adquisiciones, fusiones y escisiones, y ordenamos la transferencia del personal para que la empresa no herede contingencias. Planeamos reajustes colectivos, cambios en las condiciones de trabajo y procesos de reingeniería laboral cuando la operación real ya no coincide con lo que dicen los contratos.\n\nDocumentamos las terminaciones individuales y colectivas y formalizamos los convenios ante la autoridad mediante procedimientos paraprocesales, de modo que la terminación quede firme.\n\n## Litigio laboral\n\nRepresentamos a las empresas en la conciliación prejudicial ante los Centros de Conciliación y en juicios individuales y colectivos ante los Tribunales Laborales, así como en los asuntos que aún se tramitan ante las Juntas de Conciliación y Arbitraje. La defensa empieza por el expediente: buena parte de lo que se discute en un juicio se decidió meses antes, en un documento firmado o en uno que faltó.\n\nConducimos además investigaciones internas por denuncias de acoso, hostigamiento o faltas graves, con un procedimiento que resista la revisión de un tribunal. Cuando un trabajador daña el patrimonio de la empresa, la práctica laboral trabaja junto con la de litigio para coordinar la terminación y la denuncia penal.\n\n## Seguridad social\n\nAsesoramos en el cumplimiento de las obligaciones ante el IMSS y el Infonavit.",
    iconName: "shield-check",
    order: 1
  },
  {
    name: "Corporate and contractual",
    nameEs: "Corporativo y contractual",
    slug: "corporativo-contractual",
    imageUrl: "/editorial/practice-corporativo.webp",
    description: "Incorporation and corporate life of companies, trusts and commercial contracts, with labor review built into every transaction.",
    descriptionEs: "Constitución y vida corporativa de las sociedades, fideicomisos y contratos mercantiles, con la revisión laboral integrada en cada operación.",
    fullDescription: "# The company and its contracts, with a labor perspective.\n\nSantos & Saucedo advises Mexican and foreign companies on the corporate life of their entities in Mexico and on the contracts under which they operate.\n\nEvery corporate transaction has consequences for personnel. A merger changes the employer of hundreds of people; a spin-off decides which entity answers for which contingencies; a share purchase can bring with it lawsuits that do not appear in the financial statements. That is why, at Santos & Saucedo, every transaction is reviewed jointly by the corporate and labor practices.\n\n## Corporate entities\n\nWe incorporate commercial and civil companies and manage their corporate life: shareholders’ meetings, minutes, corporate books, powers of attorney, capital increases and reductions, mergers, spin-offs, dissolutions and liquidations. We document the issuance, cancellation and sale of shares and equity interests, and we structure and review trusts.\n\n## Contracts\n\nWe draft and negotiate the contracts under which a company operates: joint ventures, supply, services, administrative services, commission, purchase and sale, management and franchise agreements, as well as licenses of use and of industrial property rights. In services contracts we also make sure that the arrangement is compatible with the prohibition on subcontracting personnel.",
    fullDescriptionEs: "# La sociedad y sus contratos, con criterio laboral.\n\nSantos & Saucedo asesora a empresas nacionales y extranjeras en la vida corporativa de sus sociedades en México y en los contratos con los que operan.\n\nToda operación corporativa tiene consecuencias para el personal. Una fusión cambia al patrón de cientos de personas; una escisión decide qué sociedad responde por qué contingencias; una compraventa de acciones puede traer consigo juicios que no aparecen en los estados financieros. Por eso, en Santos & Saucedo cada operación la revisan en conjunto las prácticas corporativa y laboral.\n\n## Sociedades\n\nConstituimos sociedades mercantiles y civiles y llevamos su vida corporativa: asambleas, actas, libros, poderes, aumentos y disminuciones de capital, fusiones, escisiones, disoluciones y liquidaciones. Documentamos la emisión, la cancelación y la compraventa de acciones y partes sociales, y estructuramos y revisamos fideicomisos.\n\n## Contratos\n\nRedactamos y negociamos los contratos con los que opera una empresa: coinversión (joint ventures), suministro, prestación de servicios, servicios administrativos, comisión, compraventa, administración y franquicia, así como licencias de uso y de derechos de propiedad industrial. En los contratos de servicios cuidamos además que el esquema sea compatible con la prohibición de la subcontratación de personal.",
    iconName: "building-2",
    order: 2
  },
  {
    name: "Immigration",
    nameEs: "Migratorio",
    slug: "migratorio",
    imageUrl: "/editorial/practice-migratorio.webp",
    description: "Visas, residence and work permits for foreign executives, technicians and specialists, coordinated with our clients’ human resources departments.",
    descriptionEs: "Visas, residencias y permisos de trabajo para directivos, técnicos y especialistas extranjeros, en coordinación con los departamentos de recursos humanos de nuestros clientes.",
    fullDescription: "# Mobility of foreign personnel.\n\nSantos & Saucedo advises companies on compliance with immigration law and handles the visas, residence permits and work permits of their foreign personnel.\n\nThe arrival of an executive or a technical team from abroad is usually tied to a date: the start-up of a line, an audit by the parent company, the start of a contract. We work with our clients’ human resources departments so that each person’s immigration status is resolved on time and stays in order while they work in Mexico.\n\nThe immigration practice works together with the labor and corporate practices. The work permit, the employment contract, the IMSS registration and the structure of the hiring entity must all be consistent with one another.\n\n## Other services\n\nWe also handle investment, business, study and professional internship visas; file the notices required for changes in marital status, address or activities; bring legal challenges against decisions of the immigration authorities; and apostille, legalize and translate the foreign documents a company needs to operate in Mexico.",
    fullDescriptionEs: "# Movilidad del personal extranjero.\n\nSantos & Saucedo asesora a empresas en el cumplimiento de la legislación migratoria y tramita las visas, residencias y permisos de trabajo de su personal extranjero.\n\nLa llegada de un directivo o de un equipo técnico del extranjero suele estar ligada a una fecha: el arranque de una línea, una auditoría de la casa matriz, el inicio de un contrato. Trabajamos con los departamentos de recursos humanos de nuestros clientes para que la situación migratoria de cada persona esté resuelta a tiempo y se mantenga en regla mientras trabaja en México.\n\nLa práctica migratoria trabaja junto con la laboral y la corporativa. El permiso de trabajo, el contrato, el alta ante el IMSS y la estructura de la sociedad que contrata deben coincidir entre sí.\n\n## Otros servicios\n\nTramitamos también visas de inversión, negocios, estudios y prácticas profesionales; damos los avisos por cambio de estado civil, domicilio o actividades; interponemos medios de defensa contra resoluciones de la autoridad migratoria, y apostillamos, legalizamos y traducimos los documentos extranjeros que una empresa necesita para operar en México.",
    iconName: "globe",
    order: 3
  },
  {
    name: "Litigation",
    nameEs: "Litigio",
    slug: "litigio-contencioso",
    imageUrl: "/editorial/practice-litigio.webp",
    description: "Civil and commercial proceedings, and criminal matters in which the company is the injured party in theft, fraud or breach of trust.",
    descriptionEs: "Juicios civiles y mercantiles, y asuntos penales en los que la empresa es la parte afectada por robo, fraude o abuso de confianza.",
    fullDescription: "# Civil, commercial and criminal property litigation.\n\nSantos & Saucedo represents companies in civil and commercial proceedings and, in criminal matters, in cases where the company is the injured party in theft, fraud or breach of trust.\n\n## Property crimes\n\nWhen an employee, a former employee or a supplier disposes of company property, the matter has two fronts: recovering the loss and the labor or contractual relationship with the person responsible. The firm handles both.\n\nWe file complaints before the Orientation and Complaint Centers of the Nuevo León Attorney General’s Office, assist the Public Prosecutor during the investigation and at the oral trial, and seek compensation for the damage. When the person responsible is an employee, the criminal matter and the labor termination are handled in coordination between both practices, so that one does not compromise the other.",
    fullDescriptionEs: "# Litigio civil, mercantil y penal patrimonial.\n\nSantos & Saucedo representa a empresas en juicios civiles y mercantiles y, en materia penal, en los asuntos en que la empresa es la parte afectada por robo, fraude o abuso de confianza.\n\n## Penal patrimonial\n\nCuando un trabajador, un exempleado o un proveedor dispone de bienes de la empresa, el asunto tiene dos frentes: la recuperación del daño y la relación laboral o contractual con el responsable. La firma atiende ambos.\n\nPresentamos las denuncias ante los Centros de Orientación y Denuncia de la Fiscalía General de Justicia de Nuevo León, coadyuvamos con el Ministerio Público durante la investigación y en el juicio oral, y buscamos la reparación del daño. Cuando el responsable es un trabajador, el asunto penal y la terminación laboral se conducen de forma coordinada entre ambas prácticas, para que una no comprometa a la otra.",
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
    title: "Managing partner",
    titleEs: "Socio director",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Mario Saucedo Montemayor is a managing partner at Santos & Saucedo Abogados, a labor-law firm with more than 35 years of experience advising national and international companies.",
    bioEs: "Mario Saucedo Montemayor es socio director de Santos & Saucedo Abogados, despacho especializado en derecho laboral con más de 35 años de experiencia asesorando a empresas nacionales e internacionales.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 1
  },
  {
    name: "Enrique Santos Guzmán",
    slug: "enrique-santos-guzman",
    imageUrl: "/team_photos/enrique-santos-guzman.png",
    title: "Managing partner",
    titleEs: "Socio director",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Enrique Santos Guzmán is a managing partner at Santos & Saucedo Abogados, focused on preventive labor counsel and consulting for companies.",
    bioEs: "Enrique Santos Guzmán es socio director de Santos & Saucedo Abogados, con enfoque en asesoría preventiva y consultoría legal laboral para empresas.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 2
  },
  {
    name: "Enrique Santos Arce",
    slug: "enrique-santos-arce",
    imageUrl: "/team_photos/enrique-santos-arce.png",
    title: "Founding partner",
    titleEs: "Socio fundador",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Enrique Santos Arce is a founding partner of Santos & Saucedo Abogados.",
    bioEs: "Enrique Santos Arce es socio fundador de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 3
  },
  {
    name: "Mario Saucedo Rodríguez",
    slug: "mario-saucedo-rodriguez",
    imageUrl: "/team_photos/mario-saucedo-rodriguez.png",
    title: "Founding partner (in memoriam)",
    titleEs: "Socio fundador (in memoriam)",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Mario Saucedo Rodríguez was a founding partner of Santos & Saucedo Abogados, helping establish the firm’s labor-law practice.",
    bioEs: "Mario Saucedo Rodríguez fue socio fundador de Santos & Saucedo Abogados, y contribuyó a establecer la práctica laboral de la firma.",
    isPartner: true,
    order: 4
  },
  {
    name: "Jaime Herrera de Herrera",
    slug: "jaime-herrera-de-herrera",
    imageUrl: "/team_photos/jaime-herrera-de-herrera.jpg",
    title: "Partner",
    titleEs: "Socio",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Jaime Herrera de Herrera is a partner at Santos & Saucedo Abogados.",
    bioEs: "Jaime Herrera de Herrera es socio de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 5
  },
  {
    name: "David Martínez Saucedo",
    slug: "david-martinez-saucedo",
    imageUrl: "/team_photos/david-martinez-saucedo.jpg",
    title: "Partner",
    titleEs: "Socio",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "David Martínez Saucedo is a partner at Santos & Saucedo Abogados.",
    bioEs: "David Martínez Saucedo es socio de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 6
  },
  {
    name: "Jorge A. Garza Martínez",
    slug: "jorge-a-garza-martinez",
    imageUrl: "/team_photos/jorge-a-garza-martinez.jpg",
    title: "Senior associate",
    titleEs: "Asociado senior",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Jorge A. Garza Martínez is a senior associate at Santos & Saucedo Abogados.",
    bioEs: "Jorge A. Garza Martínez es asociado senior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 7
  },
  {
    name: "Carlos A. Cerda Ramos",
    slug: "carlos-a-cerda-ramos",
    imageUrl: "/team_photos/carlos-a-cerda-ramos.jpg",
    title: "Senior associate",
    titleEs: "Asociado senior",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Carlos A. Cerda Ramos is a senior associate at Santos & Saucedo Abogados.",
    bioEs: "Carlos A. Cerda Ramos es asociado senior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 8
  },
  {
    name: "Orlando Cantú Garza",
    slug: "orlando-cantu-garza",
    imageUrl: "/team_photos/orlando-cantu-garza.jpg",
    title: "Senior associate",
    titleEs: "Asociado senior",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Orlando Cantú Garza is a senior associate at Santos & Saucedo Abogados.",
    bioEs: "Orlando Cantú Garza es asociado senior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 9
  },
  {
    name: "Rubén A. Frías García",
    slug: "ruben-a-frias-garcia",
    imageUrl: "/team_photos/ruben-a-frias-garcia.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Rubén A. Frías García is an associate at Santos & Saucedo Abogados.",
    bioEs: "Rubén A. Frías García es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 10
  },
  {
    name: "María Elena Mata Martínez",
    slug: "maria-elena-mata-martinez",
    imageUrl: "/team_photos/maria-elena-mata-martinez.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "María Elena Mata Martínez is an associate at Santos & Saucedo Abogados.",
    bioEs: "María Elena Mata Martínez es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 11
  },
  {
    name: "Pedro A. Sanvicente Romero",
    slug: "pedro-a-sanvicente-romero",
    imageUrl: "/team_photos/pedro-a-sanvicente-romero.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Pedro A. Sanvicente Romero is an associate at Santos & Saucedo Abogados.",
    bioEs: "Pedro A. Sanvicente Romero es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 12
  },
  {
    name: "Eduardo Castillo Cervantes",
    slug: "eduardo-castillo-cervantes",
    imageUrl: "/team_photos/eduardo-castillo-cervantes.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Eduardo Castillo Cervantes is an associate at Santos & Saucedo Abogados.",
    bioEs: "Eduardo Castillo Cervantes es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 13
  },
  {
    name: "José María Ureña Flores",
    slug: "jose-maria-urena-flores",
    imageUrl: "/team_photos/jose-maria-urena-flores.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "José María Ureña Flores is an associate at Santos & Saucedo Abogados.",
    bioEs: "José María Ureña Flores es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 14
  },
  {
    name: "Lillia Cardoza Díaz de León",
    slug: "lillia-cardoza-diaz-de-leon",
    imageUrl: "/team_photos/lillia-cardoza-diaz-de-leon.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Lillia Cardoza Díaz de León is an associate at Santos & Saucedo Abogados.",
    bioEs: "Lillia Cardoza Díaz de León es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 15
  },
  {
    name: "Erick Estrada Márquez",
    slug: "erick-estrada-marquez",
    imageUrl: "/team_photos/erick-estrada-marquez.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Erick Estrada Márquez is an associate at Santos & Saucedo Abogados.",
    bioEs: "Erick Estrada Márquez es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 16
  },
  {
    name: "Huán José Treviño Cavazos",
    slug: "huan-jose-trevino-cavazos",
    imageUrl: "/team_photos/huan-jose-trevino-cavazos.jpg",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Huán José Treviño Cavazos is an associate at Santos & Saucedo Abogados.",
    bioEs: "Huán José Treviño Cavazos es asociado de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 17
  },
  {
    name: "Misden Castillo Chávez",
    slug: "misden-castillo-chavez",
    imageUrl: "/team_photos/misden-castillo-chavez.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Misden Castillo Chávez is an associate at Santos & Saucedo Abogados.",
    bioEs: "Misden Castillo Chávez es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 18
  },
  {
    name: "Ancella Reynoso Pámanes",
    slug: "ancella-reynoso-pamanes",
    imageUrl: "/team_photos/ancella-reynoso-pamanes.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Ancella Reynoso Pámanes is an associate at Santos & Saucedo Abogados.",
    bioEs: "Ancella Reynoso Pámanes es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 19
  },
  {
    name: "Diana G. Lopez Rodríguez",
    slug: "diana-g-lopez-rodriguez",
    imageUrl: "/team_photos/diana-g-lopez-rodriguez.jpg",
    title: "Associate",
    titleEs: "Asociada",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Diana G. Lopez Rodríguez is an associate at Santos & Saucedo Abogados.",
    bioEs: "Diana G. Lopez Rodríguez es asociada de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 20
  },
  {
    name: "Carlos F. Rodríguez Mirelles",
    slug: "carlos-f-rodriguez-mirelles",
    imageUrl: "/team_photos/carlos-f-rodriguez-mirelles.jpg",
    title: "Junior associate",
    titleEs: "Asociado Jr.",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Carlos F. Rodríguez Mirelles is a junior associate at Santos & Saucedo Abogados.",
    bioEs: "Carlos F. Rodríguez Mirelles es asociado junior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 21
  },
  {
    name: "Rubí Quintanilla Martínez",
    slug: "rubi-quintanilla-martinez",
    imageUrl: "/team_photos/rubi-quintanilla-martinez.jpg",
    title: "Junior associate",
    titleEs: "Asociada Jr.",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Rubí Quintanilla Martínez is a junior associate at Santos & Saucedo Abogados.",
    bioEs: "Rubí Quintanilla Martínez es asociada junior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 22
  },
  {
    name: "Gabriela L. García Vásquez",
    slug: "gabriela-l-garcia-vasquez",
    imageUrl: "/team_photos/gabriela-l-garcia-vasquez.jpg",
    title: "Junior associate",
    titleEs: "Asociada Jr.",
    role: "Labor law",
    roleEs: "Derecho laboral",
    bio: "Gabriela L. García Vásquez is a junior associate at Santos & Saucedo Abogados.",
    bioEs: "Gabriela L. García Vásquez es asociada junior de Santos & Saucedo Abogados.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 23
  },
  {
    name: "Luis A. Saucedo Rodríguez",
    slug: "luis-a-saucedo-rodriguez",
    imageUrl: "/team_photos/luis-a-saucedo-rodriguez.jpg",
    title: "Staff",
    titleEs: "Staff",
    role: "Firm operations",
    roleEs: "Operación del despacho",
    bio: "Luis A. Saucedo Rodríguez is part of the Santos & Saucedo staff.",
    bioEs: "Luis A. Saucedo Rodríguez forma parte del personal de Santos & Saucedo.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 24
  },
  {
    name: "Jorge A. Melchor Ortíz",
    slug: "jorge-a-melchor-ortiz",
    imageUrl: "/team_photos/jorge-a-melchor-ortiz.jpg",
    title: "Staff",
    titleEs: "Staff",
    role: "Firm operations",
    roleEs: "Operación del despacho",
    bio: "Jorge A. Melchor Ortíz is part of the Santos & Saucedo staff.",
    bioEs: "Jorge A. Melchor Ortíz forma parte del personal de Santos & Saucedo.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 25
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
    titleEs: "Adquisición de importante empresa de telecomunicaciones",
    description: "Advised a Fortune 500 company on the $3.2 billion acquisition of a leading Mexican telecommunications operator, including regulatory approvals and antitrust filings.",
    descriptionEs: "Asesoramos a una empresa Fortune 500 en la adquisición de $3.2 mil millones de un operador de telecomunicaciones líder en México, incluyendo aprobaciones regulatorias y presentaciones de competencia económica.",
    client: "Confidential Client",
    clientEs: "Cliente confidencial",
    year: 2024,
    practiceAreaSlug: "corporate-ma",
    industrySlug: "technology-industry",
    isHighlight: true,
    order: 1,
  },
  {
    title: "International Arbitration Victory in Energy Dispute",
    titleEs: "Victoria en arbitraje internacional en disputa energética",
    description: "Successfully represented a multinational energy company in ICC arbitration proceedings, securing a $500 million award in a complex infrastructure dispute.",
    descriptionEs: "Representamos exitosamente a una empresa energética multinacional en procedimientos de arbitraje ICC, obteniendo un laudo de $500 millones en una compleja disputa de infraestructura.",
    client: "International Energy Corporation",
    clientEs: "Corporación energética internacional",
    year: 2024,
    practiceAreaSlug: "arbitration",
    industrySlug: "energy-natural-resources-industry",
    isHighlight: true,
    order: 2,
  },
  {
    title: "Landmark Antitrust Defense in Automotive Sector",
    titleEs: "Defensa histórica en competencia económica en sector automotriz",
    description: "Defended a leading automotive manufacturer against cartel allegations before COFECE, resulting in complete exoneration and establishing important precedents.",
    descriptionEs: "Defendimos a un fabricante automotriz líder contra alegaciones de cártel ante COFECE, logrando exoneración completa y estableciendo precedentes importantes.",
    client: "Confidential Client",
    clientEs: "Cliente confidencial",
    year: 2024,
    practiceAreaSlug: "antitrust-competition",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: true,
    order: 3,
  },
  {
    title: "Cross-Border M&A in Pharmaceutical Industry",
    titleEs: "M&A transfronteriza en industria farmacéutica",
    description: "Advised on the $1.8 billion cross-border acquisition of Mexican pharmaceutical laboratories by a European healthcare conglomerate.",
    descriptionEs: "Asesoramos en la adquisición transfronteriza de $1.8 mil millones de laboratorios farmacéuticos mexicanos por un conglomerado europeo de salud.",
    client: "European Healthcare Group",
    clientEs: "Grupo europeo de salud",
    year: 2023,
    practiceAreaSlug: "corporate-ma",
    industrySlug: "pharmaceutical-life-sciences",
    isHighlight: true,
    order: 4,
  },
  {
    title: "Major Restructuring of Retail Chain",
    titleEs: "Reestructuración mayor de cadena minorista",
    description: "Led the comprehensive restructuring of one of Mexico's largest retail chains, involving $2 billion in debt and over 500 creditors.",
    descriptionEs: "Lideramos la reestructuración integral de una de las cadenas minoristas más grandes de México, involucrando $2 mil millones en deuda y más de 500 acreedores.",
    client: "Confidential Client",
    clientEs: "Cliente confidencial",
    year: 2023,
    practiceAreaSlug: "bankruptcy-restructuring",
    industrySlug: "consumer-goods",
    isHighlight: true,
    order: 5,
  },
  {
    title: "FCPA Investigation and Settlement",
    titleEs: "Investigación y acuerdo FCPA",
    description: "Represented a multinational corporation in internal investigation and DOJ negotiations, achieving favorable settlement in significant FCPA matter.",
    descriptionEs: "Representamos a una corporación multinacional en investigación interna y negociaciones con el DOJ, logrando un acuerdo favorable en un caso significativo de FCPA.",
    client: "Confidential Client",
    clientEs: "Cliente confidencial",
    year: 2023,
    practiceAreaSlug: "investigations-anticorruption",
    industrySlug: "financial-services",
    isHighlight: true,
    order: 6,
  },
  {
    title: "Syndicated Loan for Infrastructure Project",
    titleEs: "Crédito sindicado para proyecto de infraestructura",
    description: "Structured and negotiated a $750 million syndicated loan for a major infrastructure project, involving multiple international financial institutions.",
    descriptionEs: "Estructuramos y negociamos un crédito sindicado de $750 millones para un importante proyecto de infraestructura, involucrando múltiples instituciones financieras internacionales.",
    client: "International Infrastructure Fund",
    clientEs: "Fondo internacional de infraestructura",
    year: 2023,
    practiceAreaSlug: "banking-finance",
    industrySlug: "financial-services",
    isHighlight: false,
    order: 7,
  },
  {
    title: "Renewable Energy Project Development",
    titleEs: "Desarrollo de proyecto de energía renovable",
    description: "Advised on the development and financing of a 500MW solar energy project, including land acquisition, permits, and power purchase agreements.",
    descriptionEs: "Asesoramos en el desarrollo y financiamiento de un proyecto de energía solar de 500MW, incluyendo adquisición de terrenos, permisos y contratos de compra de energía.",
    client: "Global Renewable Energy Developer",
    clientEs: "Desarrollador global de energía renovable",
    year: 2023,
    practiceAreaSlug: "energy-natural-resources",
    industrySlug: "energy-natural-resources-industry",
    isHighlight: false,
    order: 8,
  },
  {
    title: "Commercial Litigation Victory in Contract Dispute",
    titleEs: "Victoria en litigio comercial en disputa contractual",
    description: "Obtained favorable judgment in complex commercial litigation involving breach of distribution agreements with damages exceeding $200 million.",
    descriptionEs: "Obtuvimos sentencia favorable en litigio comercial complejo involucrando incumplimiento de acuerdos de distribución con daños superiores a $200 millones.",
    client: "Confidential Client",
    clientEs: "Cliente confidencial",
    year: 2022,
    practiceAreaSlug: "litigation",
    industrySlug: "consumer-goods",
    isHighlight: false,
    order: 9,
  },
  {
    title: "Tax Controversy Resolution",
    titleEs: "Resolución de controversia fiscal",
    description: "Successfully resolved major tax controversy with SAT involving transfer pricing adjustments of over $150 million, achieving substantial reduction.",
    descriptionEs: "Resolvimos exitosamente una importante controversia fiscal con el SAT involucrando ajustes de precios de transferencia de más de $150 millones, logrando reducción sustancial.",
    client: "Multinational Manufacturing Company",
    clientEs: "Empresa manufacturera multinacional",
    year: 2022,
    practiceAreaSlug: "tax",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: false,
    order: 10,
  },
  {
    title: "Major Real Estate Development Transaction",
    titleEs: "Transacción de desarrollo inmobiliario mayor",
    description: "Advised on $400 million mixed-use development project, including land acquisition, construction financing, and commercial leasing.",
    descriptionEs: "Asesoramos en proyecto de desarrollo de uso mixto de $400 millones, incluyendo adquisición de terreno, financiamiento de construcción y arrendamiento comercial.",
    client: "Real Estate Investment Trust",
    clientEs: "Fideicomiso de inversión inmobiliaria",
    year: 2022,
    practiceAreaSlug: "real-estate",
    industrySlug: "real-estate-industry",
    isHighlight: false,
    order: 11,
  },
  {
    title: "Patent Infringement Defense",
    titleEs: "Defensa en infracción de patentes",
    description: "Successfully defended a technology company against patent infringement claims valued at $80 million, securing dismissal of all claims.",
    descriptionEs: "Defendimos exitosamente a una empresa de tecnología contra reclamaciones de infracción de patentes valuadas en $80 millones, logrando la desestimación de todas las reclamaciones.",
    client: "Technology Corporation",
    clientEs: "Corporación de tecnología",
    year: 2022,
    practiceAreaSlug: "intellectual-property",
    industrySlug: "technology-industry",
    isHighlight: false,
    order: 12,
  },
  {
    title: "Collective Labor Agreement Negotiation",
    titleEs: "Negociación de contrato colectivo de trabajo",
    description: "Negotiated collective bargaining agreements for a major manufacturing company with over 15,000 employees across multiple facilities.",
    descriptionEs: "Negociamos contratos colectivos de trabajo para una importante empresa manufacturera con más de 15,000 empleados en múltiples instalaciones.",
    client: "Confidential Client",
    clientEs: "Cliente confidencial",
    year: 2022,
    practiceAreaSlug: "labor-employment",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: false,
    order: 13,
  },
  {
    title: "Trade Remedy Investigation",
    titleEs: "Investigación de remedio comercial",
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
    titleEs: "Aprobación de fusión en sector TMT",
    description: "Secured regulatory approval for complex merger in telecommunications sector, navigating IFT and COFECE requirements.",
    descriptionEs: "Obtuvimos aprobación regulatoria para fusión compleja en sector de telecomunicaciones, navegando requisitos del IFT y COFECE.",
    client: "Telecommunications Company",
    clientEs: "Empresa de telecomunicaciones",
    year: 2021,
    practiceAreaSlug: "telecommunications-media-technology",
    industrySlug: "technology-industry",
    isHighlight: false,
    order: 15,
  },
  {
    title: "Environmental Permitting for Mining Project",
    titleEs: "Permisos ambientales para proyecto minero",
    description: "Obtained all necessary environmental permits and approvals for a large-scale mining operation, including SEMARNAT authorizations.",
    descriptionEs: "Obtuvimos todos los permisos y aprobaciones ambientales necesarios para una operación minera a gran escala, incluyendo autorizaciones de SEMARNAT.",
    client: "International Mining Company",
    clientEs: "Empresa minera internacional",
    year: 2021,
    practiceAreaSlug: "environmental",
    industrySlug: "energy-natural-resources-industry",
    isHighlight: false,
    order: 16,
  },
  {
    title: "Government Contract Award Defense",
    titleEs: "Defensa de adjudicación de contrato gubernamental",
    description: "Successfully defended contract award in administrative litigation, protecting a $120 million infrastructure concession.",
    descriptionEs: "Defendimos exitosamente adjudicación de contrato en litigio administrativo, protegiendo una concesión de infraestructura de $120 millones.",
    client: "Infrastructure Company",
    clientEs: "Empresa de infraestructura",
    year: 2021,
    practiceAreaSlug: "administrative-law",
    industrySlug: "real-estate-industry",
    isHighlight: false,
    order: 17,
  },
  {
    title: "ESG Framework Implementation",
    titleEs: "Implementación de marco ESG",
    description: "Developed comprehensive ESG compliance framework for a major financial institution, including sustainability reporting and governance policies.",
    descriptionEs: "Desarrollamos marco integral de cumplimiento ESG para una importante institución financiera, incluyendo reportes de sustentabilidad y políticas de gobierno corporativo.",
    client: "Leading Mexican Bank",
    clientEs: "Banco mexicano líder",
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
  if (existingIndustryGroups.length === 0 && industryGroupsData.length > 0) {
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
