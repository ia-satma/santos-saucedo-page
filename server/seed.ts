import type { SiteContent, Stat } from "@shared/schema";

export const siteContentData: SiteContent = {
  heroTitle: "WE GO WHERE CLIENTS NEED US",
  heroSubtitle: "Santos & Saucedo Abogados",
  visionTitle: "Labor law counsel built on experience and trust",
  visionText: "Santos & Saucedo Abogados has more than 35 years of experience advising companies on individual and collective labor matters, labor administration, and workplace compliance.",
  locationTitle: "Office address",
  locationText: "Río Tamazunchale 205 Norte, San Pedro Garza García, N.L.",
  statsTitle: "Santos & Saucedo Abogados",
  quoteText: "",
  quoteAuthor: "",
  quoteRole: "",
  address: "Río Tamazunchale 205 Norte, San Pedro Garza García, N.L., México",
  phone: "+52 81 8335 2086",
  email: "info@santossaucedo.com",
};

export const statsData: Stat[] = [];

export const practiceGroupsData = [
  {
    name: "Individual & Collective Labor Conflicts",
    nameEs: "Conflictos Individuales y Colectivos de Trabajo",
    slug: "conflictos-individuales-colectivos",
    description: "Representation and resolution of individual and collective labor disputes before conciliation and arbitration boards.",
    descriptionEs: "Representación y resolución de conflictos individuales y colectivos de trabajo ante juntas de conciliación y arbitraje.",
    fullDescription: "Santos & Saucedo represents companies in individual and collective labor conflicts, from the first stage of a dispute through resolution before the competent labor authorities. The team combines litigation experience with a preventive approach, seeking practical, cost-effective outcomes for employers while safeguarding legal compliance throughout the process.",
    fullDescriptionEs: "Santos & Saucedo representa a empresas en conflictos individuales y colectivos de trabajo, desde la primera etapa del conflicto hasta su resolución ante las autoridades laborales competentes. El equipo combina experiencia en litigio con un enfoque preventivo, buscando resultados prácticos y costo-eficientes para el empleador, sin dejar de lado el cumplimiento legal en cada etapa del proceso.",
    iconName: "gavel",
    order: 1
  },
  {
    name: "Labor Administration Review",
    nameEs: "Revisión de la Función de Administración Laboral",
    slug: "administracion-laboral",
    description: "Review of the company's labor administration function to identify risks and strengthen internal processes.",
    descriptionEs: "Revisión de la función de administración laboral de la empresa para identificar riesgos y fortalecer procesos internos.",
    fullDescription: "We review how a company's labor administration function actually operates — contracting, payroll, internal policies, and documentation — to identify gaps before they become disputes or liabilities. The review translates into concrete, actionable recommendations for the internal team responsible for labor administration.",
    fullDescriptionEs: "Revisamos cómo opera en la práctica la función de administración laboral de la empresa —contratación, nómina, políticas internas y documentación— para identificar áreas de riesgo antes de que se conviertan en conflictos o pasivos. La revisión se traduce en recomendaciones concretas y accionables para el equipo interno responsable de la administración laboral.",
    iconName: "file-text",
    order: 2
  },
  {
    name: "Labor Relations Diagnostics",
    nameEs: "Diagnóstico de Relaciones Laborales",
    slug: "diagnostico-relaciones-laborales",
    description: "Diagnostics of the relationship between employer and workforce to anticipate conflict and improve the labor climate.",
    descriptionEs: "Diagnóstico de la interrelación entre la empresa y su plantilla para anticipar conflictos y mejorar el clima laboral.",
    fullDescription: "Beyond individual disputes, we assess the overall state of labor relations within an organization — union interlocution, collective bargaining dynamics, and the general climate between company and workforce — to give leadership a clear, practical picture of where relations stand and where preventive action is needed.",
    fullDescriptionEs: "Más allá de los conflictos individuales, evaluamos el estado general de las relaciones laborales dentro de la organización —interlocución sindical, dinámica de la negociación colectiva y el clima general entre la empresa y su plantilla— para darle a la dirección un panorama claro y práctico de dónde están las relaciones y dónde se requiere acción preventiva.",
    iconName: "users",
    order: 3
  },
  {
    name: "Improvement Plans",
    nameEs: "Planes de Mejora",
    slug: "planes-mejora",
    description: "Concrete improvement plans derived from labor diagnostics, with clear priorities and timelines.",
    descriptionEs: "Planes de mejora concretos derivados del diagnóstico laboral, con prioridades y tiempos claros.",
    fullDescription: "Every diagnostic is followed by a prioritized plan of action: what to fix first, who owns each item, and by when. We work alongside the company's internal team so improvement plans are realistic to implement, not just a report on a shelf.",
    fullDescriptionEs: "A todo diagnóstico le sigue un plan de acción priorizado: qué corregir primero, quién es responsable de cada punto y en qué plazo. Trabajamos junto con el equipo interno de la empresa para que los planes de mejora sean realmente implementables, no solo un reporte más.",
    iconName: "trending-up",
    order: 4
  },
  {
    name: "Legal-Labor Auditing",
    nameEs: "Auditoría Jurídico-Laboral",
    slug: "auditoria-juridico-laboral",
    description: "Comprehensive legal-labor audits to verify compliance and reduce exposure to labor authorities.",
    descriptionEs: "Auditorías jurídico-laborales integrales para verificar el cumplimiento normativo y reducir la exposición ante autoridades laborales.",
    fullDescription: "Our legal-labor audits review contracts, internal policy, statutory obligations, and documentation against current labor law, identifying exposure before an inspection or dispute surfaces it. Findings are delivered with severity ratings and remediation guidance, not just a list of issues.",
    fullDescriptionEs: "Nuestras auditorías jurídico-laborales revisan contratos, políticas internas, obligaciones legales y documentación frente a la normativa laboral vigente, identificando exposición antes de que una inspección o un conflicto la revele. Los hallazgos se entregan con nivel de severidad y guía de remediación, no solo como una lista de pendientes.",
    iconName: "shield-check",
    order: 5
  },
  {
    name: "Strategic Planning & Training",
    nameEs: "Planeación Estratégica y Capacitación",
    slug: "planeacion-estrategica-capacitacion",
    description: "Strategic labor planning delivered through training programs for management and HR teams.",
    descriptionEs: "Planeación estratégica laboral a través de programas de capacitación dirigidos a mandos y equipos de recursos humanos.",
    fullDescription: "We design and deliver training programs that translate labor strategy into daily practice for management and human resources teams — covering how to handle disciplinary processes, documentation, and early warning signs of conflict, so prevention becomes part of how the company operates day to day.",
    fullDescriptionEs: "Diseñamos e impartimos programas de capacitación que traducen la estrategia laboral en práctica diaria para mandos y equipos de recursos humanos —cómo manejar procesos disciplinarios, documentación y señales tempranas de conflicto— para que la prevención forme parte de la operación cotidiana de la empresa.",
    iconName: "lightbulb",
    order: 6
  },
];

export const industryGroupsData = [
  { 
    name: "Automotive, Mobility & Manufacturing", 
    nameEs: "Automotriz, Movilidad y Manufactura", 
    slug: "automotive-mobility-manufacturing", 
    description: "Comprehensive support for OEMs, suppliers, and mobility companies.", 
    descriptionEs: "Apoyo integral para OEMs, proveedores y empresas de movilidad.",
    fullDescription: "Von Wobeser y Sierra's Automotive, Mobility & Manufacturing industry group provides cross-functional legal services to clients in the automotive, mobility, and broader manufacturing sectors. Core services include international trade and customs advisory for OEMs and auto parts manufacturers covering IMMEX programs for Tier 1, 2, and 3 suppliers, VAT and Excise Tax certifications, classification and origin verification under international treaties including USMCA, and sector registries; corporate and M&A work including mergers, acquisitions, spin-offs, strategic alliances, and general corporate transactions; competition and antitrust regulatory compliance for automotive and manufacturing clients; litigation and arbitration for dispute resolution in manufacturing contracts, commercial disputes, and compliance investigations; compliance and ESG covering anti-corruption, environmental compliance, and Environmental, Social and Governance matters; and labor and restructuring for employment matters, bankruptcy and restructuring, and mobility-related legal issues driven by nearshoring trends. The practice serves multinational companies including Fortune 50/500 companies and leaders from automotive, manufacturing, and related sectors, particularly German, U.S., and Asian clients.",
    fullDescriptionEs: "El grupo de industria de Automotriz, Movilidad y Manufactura de Von Wobeser y Sierra proporciona servicios legales multifuncionales a clientes en los sectores automotriz, movilidad y manufactura en general. Los servicios principales incluyen asesoría en comercio exterior y aduanas para fabricantes OEM y de autopartes cubriendo programas IMMEX para proveedores Tier 1, 2 y 3, certificaciones de IVA e IEPS, clasificación y verificación de origen bajo tratados internacionales incluyendo T-MEC, y registros sectoriales; trabajo corporativo y de M&A incluyendo fusiones, adquisiciones, escisiones, alianzas estratégicas y transacciones corporativas generales; cumplimiento regulatorio de competencia y antimonopolio para clientes automotrices y de manufactura; litigio y arbitraje para resolución de disputas en contratos de manufactura, disputas comerciales e investigaciones de cumplimiento; cumplimiento y ESG cubriendo anticorrupción, cumplimiento ambiental y asuntos de Ambiental, Social y Gobierno Corporativo; y laboral y reestructuración para asuntos de empleo, concursos mercantiles y reestructuración, y asuntos legales relacionados con movilidad impulsados por tendencias de nearshoring. La práctica atiende a empresas multinacionales incluyendo empresas Fortune 50/500 y líderes de los sectores automotriz, manufactura y relacionados, particularmente clientes alemanes, estadounidenses y asiáticos.",
    iconName: "car", 
    order: 1 
  },
  { 
    name: "Consumer Goods", 
    nameEs: "Bienes de Consumo", 
    slug: "consumer-goods", 
    description: "Retailers, consumer goods manufacturers, and e-commerce businesses.", 
    descriptionEs: "Minoristas, fabricantes de bienes de consumo y negocios de comercio electrónico.",
    fullDescription: "Von Wobeser y Sierra's Consumer Goods industry group provides cross-functional legal services tailored to the unique challenges of consumer product companies operating in Mexico and Latin America. Core services include corporate and M&A covering mergers and acquisitions, strategic alliances, joint ventures for domestic and cross-border transactions, spin-offs, dissolutions, asset and stock purchases, foreign investment and corporate structuring, and commercial contracts; international trade and customs covering general and sectoral registries, VAT, Excise Tax and Authorized Economic Operator certifications, classification of origin under USMCA, EU agreements and ACE-55, IMMEX program setup for manufacturing and assembly operations, NOMs compliance with official Mexican standards, and antidumping proceedings and verification of origin; tax consultancy and litigation covering international corporate structuring, tax controversy resolution before federal and local courts, alternative dispute resolution mechanisms, and advance pricing agreements and mutual agreement procedures; anti-corruption and compliance covering investigations for multinational clients, corporate governance and risk management; industrial and intellectual property for brand protection and IP strategy; and ESG advisory as sustainability criteria become critical for investors and consumers. The practice serves multinational and domestic companies, German, European, and US corporations expanding in Mexico, major consumer brands, and private equity and venture capital funds.",
    fullDescriptionEs: "El grupo de industria de Bienes de Consumo de Von Wobeser y Sierra proporciona servicios legales multifuncionales adaptados a los desafíos únicos de las empresas de productos de consumo que operan en México y América Latina. Los servicios principales incluyen corporativo y M&A cubriendo fusiones y adquisiciones, alianzas estratégicas, joint ventures para transacciones nacionales y transfronterizas, escisiones, disoluciones, compras de activos y acciones, inversión extranjera y estructuración corporativa, y contratos comerciales; comercio exterior y aduanas cubriendo registros generales y sectoriales, certificaciones de IVA, IEPS y Operador Económico Autorizado, clasificación de origen bajo T-MEC, acuerdos con la UE y ACE-55, configuración de programas IMMEX para operaciones de manufactura y ensamble, cumplimiento de NOMs con normas oficiales mexicanas, y procedimientos antidumping y verificación de origen; consultoría y litigio fiscal cubriendo estructuración corporativa internacional, resolución de controversias fiscales ante tribunales federales y locales, mecanismos alternativos de resolución de disputas, y acuerdos anticipados de precios y procedimientos de acuerdo mutuo; anticorrupción y cumplimiento cubriendo investigaciones para clientes multinacionales, gobierno corporativo y gestión de riesgos; propiedad industrial e intelectual para protección de marcas y estrategia de PI; y asesoría ESG a medida que los criterios de sustentabilidad se vuelven críticos para inversionistas y consumidores. La práctica atiende a empresas multinacionales y nacionales, corporaciones alemanas, europeas y estadounidenses expandiéndose en México, marcas de consumo importantes, y fondos de capital privado y capital de riesgo.",
    iconName: "shopping-bag", 
    order: 2 
  },
  { 
    name: "Energy & Natural Resources", 
    nameEs: "Energía y Recursos Naturales", 
    slug: "energy-natural-resources-industry", 
    description: "Comprehensive legal services across the energy value chain including hydrocarbons, renewables, and mining.", 
    descriptionEs: "Servicios legales integrales en toda la cadena de valor energética incluyendo hidrocarburos, renovables y minería.",
    fullDescription: "Von Wobeser y Sierra is one of the few firms in Mexico with an Energy & Natural Resources industry practice group. The group is made up of partners and lawyers specialized in multiple fields. Thus, we can offer our clients comprehensive and sophisticated advice that allows them to successfully develop their projects in the sector. The group identifies itself as a comprehensive and robust business ally for its clients. With decades of combined practice, it is qualified to favorably accompany ventures and activities in hydrocarbons; energy, including renewables and clean energy (wind, solar, hydroelectric, geothermal, cogeneration and nuclear), and natural resources (such as mining, water and waste management).",
    fullDescriptionEs: "Von Wobeser y Sierra es una de las pocas firmas en México con un grupo de práctica de industria de Energía y Recursos Naturales. El grupo lo integran socios y abogados especializados en múltiples campos. Así, podemos ofrecer a nuestros clientes una asesoría integral y sofisticada que les permite desarrollar con éxito sus proyectos en el sector. El grupo se identifica como un aliado de negocios integral y robusto para sus clientes. Con décadas de práctica combinada, está calificado para acompañar favorablemente emprendimientos y actividades en hidrocarburos; energías, incluidas las renovables y limpias (eólica, solar, hidroeléctrica, geotérmica, de cogeneración y nuclear), y recursos naturales (como minería, agua y gestión de residuos).",
    iconName: "zap", 
    order: 3 
  },
  { 
    name: "Pharmaceutical & Life Sciences", 
    nameEs: "Farmacéutica y Ciencias de la Salud", 
    slug: "pharmaceutical-life-sciences", 
    description: "Pharmaceuticals, medical devices, biotechnology, and healthcare providers.", 
    descriptionEs: "Farmacéuticas, dispositivos médicos, biotecnología y proveedores de salud.",
    fullDescription: "The Pharmaceutical & Life Sciences industry practice group brings together multidisciplinary experience and knowledge around the needs of the firm's clients. Backed by solid track records, the group's lawyers study the industry from within, stay abreast of its innovations and constantly refine their legal instruments to be able to effectively meet the sector's requirements. The advice provided by the firm to leading industry companies covers the most relevant areas of specialty. We have assisted our clients in all types of corporate and commercial matters, including mergers and acquisitions (M&A), commercial distribution agreements, trademark portfolio purchases, biotechnology project financing and joint ventures for the joint development of medical products.",
    fullDescriptionEs: "El grupo de práctica de industria de Farmacéutica y Ciencias de la Salud conjunta experiencia y conocimiento multidisciplinario alrededor de las necesidades de los clientes del despacho. Respaldados por sólidas trayectorias, los abogados del grupo estudian la industria desde dentro, se mantienen al tanto de sus innovaciones y afinan constantemente sus instrumentos legales para poder atender eficazmente los requerimientos del sector. La asesoría que brinda el despacho a empresas líderes de la industria comprende las áreas de especialidad más relevantes. Hemos asistido a nuestros clientes en todo tipo de asuntos corporativos y comerciales, incluyendo fusiones y adquisiciones (M&A), acuerdos de distribución comercial, compra de portafolios de marcas, financiamiento de proyectos biotecnológicos y joint ventures para el desarrollo conjunto de productos médicos.",
    iconName: "heart-pulse", 
    order: 4 
  },
  { 
    name: "Financial Services", 
    nameEs: "Servicios Financieros", 
    slug: "financial-services", 
    description: "Banks, insurance companies, fintech, and investment funds.", 
    descriptionEs: "Bancos, aseguradoras, fintech y fondos de inversión.",
    fullDescription: "Von Wobeser y Sierra's Financial Services industry group provides multidisciplinary legal services tailored to clients in the financial sector. Core services include banking and finance advising on banking and payment systems regulatory matters, financial transactions, project finance, and credit and debt restructurings for a client base that includes domestic and foreign banks, fintech entities, private equity funds, pension funds, hedge funds, and insurance companies; transaction support for secured, unsecured, and syndicated loans, M&A in financial services, debt issuances, and regulatory compliance; fintech and payments specializing in e-commerce, merchant acquiring, payment networks, and fintech regulatory matters; data privacy and cybersecurity supporting financial institutions with technology law, data protection, and cybersecurity compliance; and regulatory matters covering banking regulations and payment systems compliance. The practice serves Fortune 50/500 companies, Mexican Stock Exchange listed entities, multinational banks, and financial institutions. The Financial Services group works alongside 17+ practice areas including Banking & Finance, Corporate/M&A, Fintech, Antitrust, Tax, and Arbitration to provide sector-specific expertise.",
    fullDescriptionEs: "El grupo de industria de Servicios Financieros de Von Wobeser y Sierra proporciona servicios legales multidisciplinarios adaptados a clientes del sector financiero. Los servicios principales incluyen banca y finanzas asesorando en asuntos regulatorios bancarios y de sistemas de pago, transacciones financieras, financiamiento de proyectos, y reestructuración de créditos y deuda para una base de clientes que incluye bancos nacionales y extranjeros, entidades fintech, fondos de capital privado, fondos de pensiones, hedge funds, y compañías de seguros; soporte transaccional para préstamos garantizados, no garantizados y sindicados, M&A en servicios financieros, emisiones de deuda, y cumplimiento regulatorio; fintech y pagos especializándose en comercio electrónico, adquisición de comerciantes, redes de pago, y asuntos regulatorios fintech; privacidad de datos y ciberseguridad apoyando a instituciones financieras con derecho de tecnología, protección de datos, y cumplimiento de ciberseguridad; y asuntos regulatorios cubriendo regulaciones bancarias y cumplimiento de sistemas de pago. La práctica atiende a empresas Fortune 50/500, entidades listadas en la Bolsa Mexicana de Valores, bancos multinacionales, e instituciones financieras. El grupo de Servicios Financieros trabaja junto con más de 17 áreas de práctica incluyendo Bancario y Finanzas, Corporativo/M&A, Fintech, Competencia Económica, Fiscal, y Arbitraje para proporcionar experiencia específica del sector.",
    iconName: "dollar-sign", 
    order: 5 
  },
  { 
    name: "Real Estate", 
    nameEs: "Inmobiliario", 
    slug: "real-estate-industry", 
    description: "Real estate developers, investors, and operators.", 
    descriptionEs: "Desarrolladores inmobiliarios, inversionistas y operadores.",
    fullDescription: "Von Wobeser y Sierra's Real Estate industry group is multidisciplinary and comprehensive, covering all phases of real estate projects across Mexico. The practice draws on the firm's broader corporate, M&A, finance, regulatory, litigation, tax, and environmental expertise to handle complex transactions. Core services include acquisition and sale of all forms of real estate in Mexico, lease agreements and usufruct, ejidal land conversion from public, private, and social property into private property as a signature strength, securing and defending water rights, creating legal structures and vehicles for real estate projects and transactions including tax advisory, negotiating government incentives at federal, state and municipal levels, obtaining land use rights, concessions and construction permits, advising on urban development plans and protected natural areas, structuring legal frameworks for real estate use on digital platforms, and environmental, civil, and commercial litigation related to real estate. The practice serves domestic and foreign developers, lenders, private equity investors, public companies listed on major global exchanges including Dow Jones, S&P, DAX, Nikkei, and BMV, and Fortune 500 firms. The practice has seen increased activity driven by Mexico's nearshoring boom.",
    fullDescriptionEs: "El grupo de industria de Inmobiliario de Von Wobeser y Sierra es multidisciplinario e integral, cubriendo todas las fases de proyectos inmobiliarios en todo México. La práctica aprovecha la experiencia más amplia de la firma en corporativo, M&A, finanzas, regulatorio, litigio, fiscal y ambiental para manejar transacciones complejas. Los servicios principales incluyen adquisición y venta de todo tipo de inmuebles en México, contratos de arrendamiento y usufructo, conversión de tierras ejidales de propiedad pública, privada y social a propiedad privada como una fortaleza distintiva, asegurar y defender derechos de agua, crear estructuras legales y vehículos para proyectos y transacciones inmobiliarias incluyendo asesoría fiscal, negociar incentivos gubernamentales a nivel federal, estatal y municipal, obtener derechos de uso de suelo, concesiones y permisos de construcción, asesorar en planes de desarrollo urbano y áreas naturales protegidas, estructurar marcos legales para uso inmobiliario en plataformas digitales, y litigio ambiental, civil y comercial relacionado con bienes raíces. La práctica atiende a desarrolladores nacionales y extranjeros, prestamistas, inversionistas de capital privado, empresas públicas listadas en bolsas globales importantes incluyendo Dow Jones, S&P, DAX, Nikkei y BMV, y empresas Fortune 500. La práctica ha visto mayor actividad impulsada por el boom de nearshoring en México.",
    iconName: "building", 
    order: 6 
  },
  { 
    name: "Technology", 
    nameEs: "Tecnología", 
    slug: "technology-industry", 
    description: "Tech companies, startups, and digital transformation.", 
    descriptionEs: "Empresas tecnológicas, startups y transformación digital.",
    fullDescription: "Von Wobeser y Sierra's Technology industry group provides comprehensive technology-focused legal services through a multidisciplinary team integrating specialists from various legal practice areas. Core service areas include technology and digital business covering Telecommunications, Media and Technology (TMT), internet services and platforms, e-commerce and merchant acquiring, payment networks and systems, fintech and legaltech solutions, and artificial intelligence regulations; data and cybersecurity covering data privacy and protection, cybersecurity compliance, and anti-money laundering regulations; intellectual property and contracts covering IP rights and licensing, complex commercial contracts with technology and IP components, and IT contracts and procurement; and regulatory and compliance covering telecommunications regulation and technology sector regulatory compliance. The Technology group collaborates strategically with Corporate and M&A, Intellectual Property, Tax, Labor, Antitrust, Banking and Finance, and Administrative Law practices to enable holistic solutions for technology transactions, corporate deals, and day-to-day operations. The firm maintains an Innovation and Technology Committee that identifies and tests AI and technology tools for internal use including their custom AI chatbot VonBot and AI eDiscovery tools for litigation and arbitration.",
    fullDescriptionEs: "El grupo de industria de Tecnología de Von Wobeser y Sierra proporciona servicios legales integrales enfocados en tecnología a través de un equipo multidisciplinario que integra especialistas de diversas áreas de práctica legal. Las áreas de servicio principales incluyen tecnología y negocios digitales cubriendo Telecomunicaciones, Medios y Tecnología (TMT), servicios y plataformas de internet, comercio electrónico y adquisición de comerciantes, redes y sistemas de pago, soluciones fintech y legaltech, y regulaciones de inteligencia artificial; datos y ciberseguridad cubriendo privacidad y protección de datos, cumplimiento de ciberseguridad, y regulaciones anti-lavado de dinero; propiedad intelectual y contratos cubriendo derechos y licenciamiento de PI, contratos comerciales complejos con componentes de tecnología y PI, y contratos y adquisiciones de TI; y regulación y cumplimiento cubriendo regulación de telecomunicaciones y cumplimiento regulatorio del sector tecnológico. El grupo de Tecnología colabora estratégicamente con las prácticas de Corporativo y M&A, Propiedad Intelectual, Fiscal, Laboral, Competencia Económica, Bancario y Finanzas, y Derecho Administrativo para permitir soluciones holísticas para transacciones tecnológicas, transacciones corporativas y operaciones cotidianas. La firma mantiene un Comité de Innovación y Tecnología que identifica y prueba herramientas de IA y tecnología para uso interno incluyendo su chatbot de IA personalizado VonBot y herramientas de eDiscovery con IA para litigio y arbitraje.",
    iconName: "monitor", 
    order: 7 
  },
];

export const teamMembersData = [
  {
    name: "Enrique Hernán Santos Gúzman",
    slug: "enrique-hernan-santos-guzman",
    title: "Founding Partner",
    titleEs: "Socio Fundador",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bio: "Enrique Hernán Santos Gúzman is a founding partner of Santos & Saucedo Abogados, a labor-law boutique firm based in San Pedro Garza García, Nuevo León. He advises national and international companies on individual and collective labor conflicts, labor administration, and preventive labor compliance.",
    bioEs: "Enrique Hernán Santos Gúzman es socio fundador de Santos & Saucedo Abogados, firma especializada en derecho laboral con sede en San Pedro Garza García, Nuevo León. Asesora a empresas nacionales e internacionales en conflictos individuales y colectivos de trabajo, administración laboral y cumplimiento preventivo en materia laboral.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 1
  },
  {
    name: "[FALTA: Nombre del Socio Fundador — Saucedo]",
    slug: "socio-fundador-saucedo",
    title: "Founding Partner",
    titleEs: "Socio Fundador",
    role: "Labor Law",
    roleEs: "Derecho Laboral",
    bioEs: "Perfil pendiente de confirmación por la firma.",
    email: "info@santossaucedo.com",
    phone: "+52 81 8335 2086",
    isPartner: true,
    order: 2
  },
  {
    name: "[FALTA: Nombre de Socia]",
    slug: "socia-conflictos-laborales",
    title: "Partner",
    titleEs: "Socia",
    role: "Individual & Collective Labor Conflicts",
    roleEs: "Conflictos Individuales y Colectivos de Trabajo",
    bioEs: "Perfil pendiente de confirmación por la firma.",
    email: "info@santossaucedo.com",
    isPartner: true,
    order: 3
  },
  {
    name: "[FALTA: Nombre de Consejero]",
    slug: "consejero-administracion-laboral",
    title: "Counsel",
    titleEs: "Consejero",
    role: "Labor Administration Review",
    roleEs: "Revisión de la Función de Administración Laboral",
    bioEs: "Perfil pendiente de confirmación por la firma.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 4
  },
  {
    name: "[FALTA: Nombre de Asociada Senior]",
    slug: "asociada-senior-auditoria",
    title: "Senior Associate",
    titleEs: "Asociada Senior",
    role: "Legal-Labor Auditing",
    roleEs: "Auditoría Jurídico-Laboral",
    bioEs: "Perfil pendiente de confirmación por la firma.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 5
  },
  {
    name: "[FALTA: Nombre de Asociado]",
    slug: "asociado-relaciones-laborales",
    title: "Associate",
    titleEs: "Asociado",
    role: "Labor Relations Diagnostics",
    roleEs: "Diagnóstico de Relaciones Laborales",
    bioEs: "Perfil pendiente de confirmación por la firma.",
    email: "info@santossaucedo.com",
    isPartner: false,
    order: 6
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
    title: "German Automotive Company Market Entry",
    titleEs: "Entrada al Mercado de Empresa Automotriz Alemana",
    description: "Advised a major German automotive manufacturer on its market entry strategy, including joint venture structuring and regulatory compliance.",
    descriptionEs: "Asesoramos a un importante fabricante automotriz alemán en su estrategia de entrada al mercado, incluyendo estructuración de joint venture y cumplimiento regulatorio.",
    client: "German Automotive Manufacturer",
    clientEs: "Fabricante Automotriz Alemán",
    year: 2021,
    practiceAreaSlug: "german-desk",
    industrySlug: "automotive-mobility-manufacturing",
    isHighlight: false,
    order: 18,
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
