/* Textos de la página «Industrias» (demo v3, aprobada el 5-11-2026).
   Cada idioma conserva las mismas piezas y el mismo orden para que el CSS y la
   composición editorial no cambien al cambiar de idioma. */
import type { V3Lang } from "@/v3/shared";
import { v3Asset } from "../asset";

export type IndustriaId =
  | "bebidas" | "automotriz" | "acero" | "energia"
  | "consumo" | "farmaceutica" | "tecnologia" | "construccion" | "financieros";

export interface Industria {
  id: IndustriaId;
  img: string;
  w: number;
  h: number;
  /** encuadre de la foto (el mismo de la demo) */
  pos: string;
  nombre: string;
  linea: string;
  lista: string[];
}

export interface IndustriasTexts {
  cab: { alt: string; title: string; lead: string; text: string };
  indice: string;
  industrias: Industria[];
  cierre: { texto: string; enlace: string };
  mapa: {
    titulo: string;
    entrada: string;
    desc: string;
    sedeTitulo: string;
    /** el mismo letrero, en dos piezas: en el teléfono va en dos renglones (sin el separador) para no
        llegar al borde de la pantalla */
    sedeTituloNorte: { a: string; sep: string; b: string };
    sedeNombre: string;
    pausar: string;
    reanudar: string;
    pausarAria: string;
    reanudarAria: string;
    /** teclado: nombre de la lista de entidades (el mapa) y cómo se recorre */
    lista: string;
    ayuda: string;
    /** nombres de las entidades que cambian en inglés (clave: data-e del mapa) */
    nombres: Record<string, string>;
  };
  sigue: { label: string; title: string; aria: string };
}

const FOTOS: Record<IndustriaId, Pick<Industria, "img" | "w" | "h" | "pos">> = {
  bebidas: { img: v3Asset("/v3/c-ind-bebidas.webp"), w: 2000, h: 1333, pos: "38% 50%" },
  automotriz: { img: v3Asset("/v3/c-ind-automotriz.webp"), w: 2000, h: 1335, pos: "62% 55%" },
  acero: { img: v3Asset("/v3/c-ind-acero.webp"), w: 2000, h: 1333, pos: "42% 55%" },
  energia: { img: v3Asset("/v3/c-ind-energia.webp"), w: 2000, h: 1333, pos: "62% 62%" },
  // Industrias que se suman con la lista de Von Wobeser (9-11-2026); fotos de Unsplash, licencia libre
  consumo: { img: v3Asset("/v3/c-ind-consumo.webp"), w: 1850, h: 1333, pos: "50% 62%" },  // recortada: sin la marca del equipo a la derecha
  farmaceutica: { img: v3Asset("/v3/c-ind-farmaceutica.webp"), w: 2000, h: 1333, pos: "56% 50%" },
  tecnologia: { img: v3Asset("/v3/c-ind-tecnologia.webp"), w: 2000, h: 1333, pos: "36% 62%" },
  construccion: { img: v3Asset("/v3/c-ind-construccion.webp"), w: 2000, h: 1333, pos: "30% 70%" },
  financieros: { img: v3Asset("/v3/c-ind-financieros.webp"), w: 2000, h: 1333, pos: "42% 50%" },
};

const es: IndustriasTexts = {
  cab: {
    alt: "Monterrey al atardecer, con el Cerro de la Silla sobre la ciudad",
    title: "Industrias que asesoramos",
    lead: "Conocemos su operación: turnos continuos, contratos colectivos, inspecciones y personal especializado.",
    // «Asesoramos cuando menos a 500 empresas de estas diversas industrias» (Mario, junta del
    // 6-11-2026): la cifra en lugar de nombres de clientes, que no se muestran
    text: "Asesoramos a más de 500 empresas: grupos industriales mexicanos, multinacionales y empresas de capital asiático, con operaciones en Nuevo León y en otros estados del país.",
  },
  indice: "Industrias",
  industrias: [
    {
      id: "bebidas", ...FOTOS.bebidas,
      nombre: "Refresqueras y bebidas",
      linea: "Contratos colectivos, centros de distribución y personal de reparto en operación continua.",
      lista: [
        "Revisión y negociación de los contratos colectivos de planta y de distribución.",
        "Personal de reparto y de ruta: contratación, esquemas de pago y terminaciones.",
        "Centros de distribución en varios estados, atendidos con un mismo criterio.",
        "Turnos, descansos y jornada documentados en una operación que no para.",
      ],
    },
    {
      id: "automotriz", ...FOTOS.automotriz,
      nombre: "Automotriz y manufactura",
      linea: "Relaciones colectivas, inspecciones y cumplimiento en plantas con varios turnos.",
      lista: [
        "Relaciones con el sindicato y legitimación del contrato colectivo.",
        "Inspecciones de la autoridad laboral, desde la visita hasta su resolución.",
        "Proveedores y servicios especializados dentro de la cadena de suministro.",
        "Reglamento interior, disciplina y terminaciones en la línea de producción.",
      ],
    },
    {
      id: "acero", ...FOTOS.acero,
      nombre: "Acero",
      linea: "Seguridad e higiene, riesgos de trabajo y relaciones sindicales en procesos que no se detienen.",
      lista: [
        "Comisiones de seguridad e higiene y cumplimiento de las normas oficiales.",
        "Riesgos de trabajo: su atención ante el IMSS y la defensa de la empresa.",
        "Revisiones contractuales y salariales con el sindicato.",
        "Emplazamientos a huelga y conflictos colectivos, con la operación en marcha.",
      ],
    },
    {
      id: "energia", ...FOTOS.energia,
      nombre: "Energía y recursos naturales",
      linea: "Servicios especializados (REPSE), contratistas y cumplimiento en proyectos de generación, transmisión y minería.",
      lista: [
        "Registro, contratos y verificación de los servicios especializados (REPSE).",
        "Contratistas en obra: responsabilidad solidaria y revisión de su cumplimiento.",
        "Personal de proyecto en parques, plantas y minas de distintas entidades, con un mismo criterio.",
        "Altas, bajas y cuotas ante el IMSS del personal asignado a cada proyecto.",
      ],
    },
    {
      id: "consumo", ...FOTOS.consumo,
      nombre: "Bienes de consumo",
      linea: "Plantas, centros de distribución y fuerza de ventas con plantillas grandes y temporadas altas.",
      lista: [
        "Contratos colectivos de planta y relación con el sindicato.",
        "Contratos por temporada y por tiempo determinado para los picos de producción y de venta.",
        "Fuerza de ventas y promotoría: comisiones, esquemas de pago y terminaciones.",
        "Turnos y jornada ante la reducción de la semana laboral y el registro electrónico de asistencia.",
      ],
    },
    {
      id: "farmaceutica", ...FOTOS.farmaceutica,
      nombre: "Farmacéutica y salud",
      linea: "Personal técnico y de laboratorio, áreas de producción controladas y representantes médicos.",
      lista: [
        "Contratos y reglamento interior para el personal técnico, de calidad y de laboratorio.",
        "Confidencialidad y protección de la información técnica y de los procesos.",
        "Representantes médicos: esquemas de pago, viáticos y terminaciones.",
        "Seguridad e higiene y riesgos de trabajo en las áreas de producción.",
      ],
    },
    {
      id: "tecnologia", ...FOTOS.tecnologia,
      nombre: "Tecnología",
      linea: "Talento especializado, teletrabajo y manufactura electrónica en plantas que llegan al norte del país.",
      lista: [
        "Teletrabajo conforme a la ley y a la NOM-037: políticas, equipo y gastos.",
        "Invenciones y desarrollos del personal: titularidad y confidencialidad.",
        "Compensación, bonos de retención y planes de incentivos de largo plazo.",
        "Arranque de plantas: contratación, reglamento interior y relación con el sindicato.",
      ],
    },
    {
      id: "construccion", ...FOTOS.construccion,
      nombre: "Inmobiliario y construcción",
      linea: "Obras con contratistas y subcontratistas, personal eventual y trabajos en altura.",
      lista: [
        "Servicios especializados (REPSE) y responsabilidad solidaria con los contratistas.",
        "Registro de obra ante el IMSS, cuotas del personal eventual y terminación al concluir la obra.",
        "Seguridad en obra, trabajos en altura y atención de los accidentes de trabajo.",
        "Administración de inmuebles: personal de mantenimiento, vigilancia y limpieza.",
      ],
    },
    {
      id: "financieros", ...FOTOS.financieros,
      nombre: "Servicios financieros",
      linea: "Sucursales, centros de atención y personal de confianza, con las exigencias de cumplimiento del sector.",
      lista: [
        "Trabajadores de confianza: contratación, compensación y terminaciones.",
        "Investigaciones internas, códigos de conducta y protocolos contra el hostigamiento y el acoso.",
        "Bonos, comisiones y esquemas de compensación variable.",
        "Reestructuras, fusiones y transferencia de personal (sustitución patronal).",
      ],
    },
  ],
  cierre: {
    texto: "Muchas de estas operaciones están fuera de Nuevo León, en otros estados del país.",
    enlace: "La red de la firma en las 32 entidades",
  },
  mapa: {
    titulo: "El mismo criterio en cada planta",
    entrada:
      "Desde Monterrey, la firma atiende a sus clientes en las 32 entidades federativas, a través de una alianza de despachos con presencia en más de 72 ciudades.",
    desc: "Mapa de México. Desde la sede de la firma, en San Pedro Garza García, Nuevo León, una red de rutas llega a las otras 31 entidades federativas.",
    sedeTitulo: "Monterrey · Sede",
    sedeTituloNorte: { a: "Monterrey", sep: " · ", b: "Sede" },
    sedeNombre: "Sede en San Pedro Garza García",
    pausar: "Pausar",
    reanudar: "Reanudar",
    pausarAria: "Pausar el movimiento del mapa",
    reanudarAria: "Reanudar el movimiento del mapa",
    lista: "Entidades federativas de la red",
    ayuda: "Con las flechas se recorren las entidades; con Intro o Espacio se fija una y con Escape se suelta.",
    nombres: {},
  },
  sigue: { label: "Siguiente", title: "Nuestros socios", aria: "Siguiente página" },
};

const en: IndustriasTexts = {
  cab: {
    alt: "Monterrey at sunset, with Cerro de la Silla above the city",
    title: "Industries we advise",
    lead: "We know how these operations work: continuous shifts, collective bargaining agreements, inspections and specialized personnel.",
    text: "We advise more than 500 companies: Mexican industrial groups, multinationals and Asian-owned companies, with operations in Nuevo León and in other states of Mexico.",
  },
  indice: "Industries",
  industrias: [
    {
      id: "bebidas", ...FOTOS.bebidas,
      nombre: "Soft drinks and beverages",
      linea: "Collective bargaining agreements, distribution centers and delivery personnel in continuous operation.",
      lista: [
        "Review and negotiation of plant and distribution collective bargaining agreements.",
        "Delivery and route personnel: hiring, pay schemes and terminations.",
        "Distribution centers in several states, handled under the same standard.",
        "Shifts, rest periods and working hours documented in an operation that never stops.",
      ],
    },
    {
      id: "automotriz", ...FOTOS.automotriz,
      nombre: "Automotive and manufacturing",
      linea: "Collective labor relations, inspections and compliance at plants that run several shifts.",
      lista: [
        "Relations with the union and legitimation of the collective bargaining agreement.",
        "Labor authority inspections, from the initial visit through to their resolution.",
        "Suppliers and specialized services within the supply chain.",
        "Internal work rules, discipline and terminations on the production line.",
      ],
    },
    {
      id: "acero", ...FOTOS.acero,
      nombre: "Steel",
      linea: "Health and safety, occupational risks and union relations in processes that never stop.",
      lista: [
        "Health and safety committees and compliance with official Mexican standards.",
        "Occupational risks: their handling before the IMSS and the company’s defense.",
        "Contract and wage reviews with the union.",
        "Strike notices and collective disputes, while operations continue.",
      ],
    },
    {
      id: "energia", ...FOTOS.energia,
      nombre: "Energy and natural resources",
      linea: "Specialized services (REPSE), contractors and compliance in generation, transmission and mining projects.",
      lista: [
        "Registration, contracts and verification of specialized services (REPSE).",
        "On-site contractors: joint liability and review of their compliance.",
        "Project personnel at parks, plants and mines in different states, under the same standard.",
        "IMSS registrations, terminations and contributions for the personnel assigned to each project.",
      ],
    },
    {
      id: "consumo", ...FOTOS.consumo,
      nombre: "Consumer goods",
      linea: "Plants, distribution centers and sales forces with large workforces and peak seasons.",
      lista: [
        "Plant collective bargaining agreements and relations with the union.",
        "Seasonal and fixed-term contracts for production and sales peaks.",
        "Sales and promotion staff: commissions, pay schemes and terminations.",
        "Shifts and working hours as the work week is shortened and electronic time records come in.",
      ],
    },
    {
      id: "farmaceutica", ...FOTOS.farmaceutica,
      nombre: "Pharmaceuticals and health",
      linea: "Technical and laboratory staff, controlled production areas and medical representatives.",
      lista: [
        "Contracts and internal work rules for technical, quality and laboratory staff.",
        "Confidentiality and protection of technical and process information.",
        "Medical representatives: pay schemes, travel expenses and terminations.",
        "Health and safety and occupational risks in production areas.",
      ],
    },
    {
      id: "tecnologia", ...FOTOS.tecnologia,
      nombre: "Technology",
      linea: "Specialized talent, remote work and electronics manufacturing at plants arriving in northern Mexico.",
      lista: [
        "Remote work under the law and NOM-037: policies, equipment and expenses.",
        "Employee inventions and developments: ownership and confidentiality.",
        "Compensation, retention bonuses and long-term incentive plans.",
        "Plant start-ups: hiring, internal work rules and relations with the union.",
      ],
    },
    {
      id: "construccion", ...FOTOS.construccion,
      nombre: "Real estate and construction",
      linea: "Sites with contractors and subcontractors, temporary personnel and work at height.",
      lista: [
        "Specialized services (REPSE) and joint liability with contractors.",
        "Site registration with the IMSS, contributions for temporary personnel and termination when the work ends.",
        "Site safety, work at height and handling of occupational accidents.",
        "Property management: maintenance, security and cleaning staff.",
      ],
    },
    {
      id: "financieros", ...FOTOS.financieros,
      nombre: "Financial services",
      linea: "Branches, service centers and trusted employees, under the sector’s compliance demands.",
      lista: [
        "Trusted employees: hiring, compensation and terminations.",
        "Internal investigations, codes of conduct and protocols against harassment.",
        "Bonuses, commissions and variable compensation schemes.",
        "Restructurings, mergers and transfers of personnel (employer substitution).",
      ],
    },
  ],
  cierre: {
    texto: "Many of these operations are outside Nuevo León, in other states of Mexico.",
    enlace: "The firm’s network across the 32 federal entities",
  },
  mapa: {
    titulo: "The same standard at every plant",
    entrada:
      "From Monterrey, the firm serves its clients in all 32 federal entities of Mexico, through an alliance of law firms present in more than 72 cities.",
    desc: "Map of Mexico. From the firm’s head office in San Pedro Garza García, Nuevo León, a network of routes reaches the other 31 federal entities.",
    sedeTitulo: "Monterrey office",
    sedeTituloNorte: { a: "Monterrey", sep: " ", b: "office" },
    sedeNombre: "Head office in San Pedro Garza García",
    pausar: "Pause",
    reanudar: "Resume",
    pausarAria: "Pause the map animation",
    reanudarAria: "Resume the map animation",
    lista: "Federal entities in the firm’s network",
    ayuda: "Use the arrow keys to move between entities; Enter or Space pins one and Escape releases it.",
    nombres: { df: "Mexico City", mx: "State of Mexico" },
  },
  sigue: { label: "Next", title: "Our partners", aria: "Next page" },
};

type IndustryLocale = V3Lang | "de" | "zh" | "ko" | "ja" | "ar" | "ru" | "fr" | "it";

type LocaleCopy = {
  cab: IndustriasTexts["cab"];
  indice: string;
  names: string[];
  lines: string[];
  lists: string[][];
  cierre: IndustriasTexts["cierre"];
  mapa: IndustriasTexts["mapa"];
  sigue: IndustriasTexts["sigue"];
};

const localizedCopies: Record<Exclude<IndustryLocale, V3Lang>, LocaleCopy> = {
  de: {
    cab: { alt: "Monterrey bei Sonnenuntergang mit dem Cerro de la Silla über der Stadt", title: "Branchen, die wir beraten", lead: "Wir kennen ihre Abläufe: durchgehende Schichten, Tarifverträge, Prüfungen und spezialisiertes Personal.", text: "Wir beraten mehr als 500 Unternehmen: mexikanische Industriegruppen, multinationale Konzerne und Unternehmen mit asiatischem Kapital in Nuevo León und anderen Bundesstaaten Mexikos." },
    indice: "Branchen",
    names: ["Getränke", "Automobil und Fertigung", "Stahl", "Energie und natürliche Ressourcen", "Konsumgüter", "Pharma und Gesundheit", "Technologie", "Immobilien und Bau", "Finanzdienstleistungen"],
    lines: ["Tarifverträge, Verteilzentren und Auslieferungspersonal im kontinuierlichen Betrieb.", "Kollektive Arbeitsbeziehungen, Prüfungen und Compliance in Werken mit mehreren Schichten.", "Arbeits- und Gesundheitsschutz, Arbeitsrisiken und Gewerkschaftsbeziehungen in durchgehend laufenden Prozessen.", "Spezialisierte Dienstleistungen, Auftragnehmer und Compliance in Energie- und Bergbauprojekten.", "Werke, Verteilzentren und Vertriebsmitarbeiter mit großen Belegschaften und saisonalen Spitzen.", "Technisches und Laborpersonal, kontrollierte Produktionsbereiche und medizinische Vertreter.", "Spezialisierte Fachkräfte, Telearbeit und Elektronikfertigung im Norden Mexikos.", "Baustellen mit Auftragnehmern, Zeitarbeit und Arbeiten in der Höhe.", "Filialen, Servicezentren und Vertrauensmitarbeiter unter den Compliance-Anforderungen des Sektors."],
    lists: [
      ["Prüfung und Verhandlung von Tarifverträgen für Werk und Vertrieb.", "Einstellung, Vergütung und Beendigung von Auslieferungs- und Routenpersonal.", "Verteilzentren in mehreren Bundesstaaten nach einem einheitlichen Standard.", "Dokumentierte Schichten, Pausen und Arbeitszeiten im durchgehenden Betrieb."],
      ["Gewerkschaftsbeziehungen und Legitimierung des Tarifvertrags.", "Arbeitsbehördliche Prüfungen von der Besichtigung bis zur Entscheidung.", "Lieferanten und spezialisierte Dienstleistungen in der Lieferkette.", "Betriebsordnung, Disziplin und Beendigungen in der Produktionslinie."],
      ["Ausschüsse für Arbeits- und Gesundheitsschutz und Einhaltung amtlicher Normen.", "Arbeitsrisiken, ihre Bearbeitung vor dem IMSS und die Verteidigung des Unternehmens.", "Vertrags- und Lohnverhandlungen mit der Gewerkschaft.", "Streikandrohungen und Kollektivkonflikte bei laufendem Betrieb."],
      ["Registrierung, Verträge und Prüfung spezialisierter Dienstleistungen (REPSE).", "Auftragnehmer auf der Baustelle, gesamtschuldnerische Haftung und Compliance-Prüfung.", "Projektpersonal in Parks, Werken und Minen nach einem einheitlichen Standard.", "An- und Abmeldungen sowie IMSS-Beiträge für Projektpersonal."],
      ["Tarifverträge des Werks und Beziehungen zur Gewerkschaft.", "Saison- und Zeitverträge für Produktions- und Verkaufsspitzen.", "Vertrieb und Promotion, Provisionen, Vergütung und Beendigungen.", "Schichten und Arbeitszeit bei verkürzter Arbeitswoche und elektronischer Zeiterfassung."],
      ["Verträge und Betriebsordnung für technisches, Qualitäts- und Laborpersonal.", "Vertraulichkeit und Schutz technischer Informationen und Prozesse.", "Medizinische Vertreter, Vergütung, Reisekosten und Beendigungen.", "Arbeits- und Gesundheitsschutz sowie Arbeitsrisiken in Produktionsbereichen."],
      ["Telearbeit nach Gesetz und NOM-037, Richtlinien, Ausstattung und Kosten.", "Erfindungen und Entwicklungen von Beschäftigten, Eigentum und Vertraulichkeit.", "Vergütung, Bindungsboni und langfristige Incentive-Pläne.", "Inbetriebnahme von Werken, Einstellung, Betriebsordnung und Gewerkschaftsbeziehungen."],
      ["Spezialisierte Dienstleistungen (REPSE) und gesamtschuldnerische Haftung mit Auftragnehmern.", "Baustellenmeldung beim IMSS, Beiträge für Zeitarbeit und Beendigung nach Abschluss.", "Baustellensicherheit, Arbeiten in der Höhe und Arbeitsunfälle.", "Immobilienverwaltung mit Wartungs-, Sicherheits- und Reinigungspersonal."],
      ["Vertrauensmitarbeiter, Einstellung, Vergütung und Beendigungen.", "Interne Untersuchungen, Verhaltenskodizes und Schutzprotokolle gegen Belästigung.", "Boni, Provisionen und variable Vergütungsmodelle.", "Umstrukturierungen, Fusionen und Personalübertragungen."],
    ],
    cierre: { texto: "Viele dieser Tätigkeiten finden außerhalb von Nuevo León in anderen Bundesstaaten statt.", enlace: "Das Netzwerk der Kanzlei in allen 32 Bundesstaaten" },
    mapa: { titulo: "Derselbe Maßstab in jedem Werk", entrada: "Von Monterrey aus betreut die Kanzlei ihre Mandanten in allen 32 Bundesstaaten über ein Netzwerk von Kanzleien in mehr als 72 Städten.", desc: "Karte von Mexiko. Vom Hauptsitz in San Pedro Garza García, Nuevo León, führen Routen in die übrigen 31 Bundesstaaten.", sedeTitulo: "Monterrey · Sitz", sedeTituloNorte: { a: "Monterrey", sep: " · ", b: "Sitz" }, sedeNombre: "Sitz in San Pedro Garza García", pausar: "Pausieren", reanudar: "Fortsetzen", pausarAria: "Kartenbewegung pausieren", reanudarAria: "Kartenbewegung fortsetzen", lista: "Bundesstaaten im Netzwerk der Kanzlei", ayuda: "Mit den Pfeiltasten bewegen, mit Enter oder Leertaste auswählen und mit Escape lösen.", nombres: {} },
    sigue: { label: "Weiter", title: "Unsere Partner", aria: "Nächste Seite" },
  },
  zh: {
    cab: { alt: "日落时分的蒙特雷，塞拉德拉西利亚山俯瞰城市", title: "我们提供咨询的行业", lead: "我们了解这些业务：连续轮班、集体协议、检查和专业人员。", text: "我们为500多家企业提供服务，包括墨西哥工业集团、跨国公司以及在新莱昂州和墨西哥其他州运营的亚洲资本企业。" },
    indice: "行业",
    names: ["饮料", "汽车与制造", "钢铁", "能源与自然资源", "消费品", "制药与医疗", "科技", "房地产与建筑", "金融服务"],
    lines: ["连续运营中的集体协议、配送中心和配送人员。", "多班次工厂的集体劳动关系、检查与合规。", "持续运行流程中的职业安全、工作风险与工会关系。", "发电、输电和采矿项目中的专业服务、承包商与合规。", "拥有大型员工队伍并面临旺季的工厂、配送中心和销售团队。", "技术与实验室人员、受控生产区域和医药代表。", "北墨西哥工厂中的专业人才、远程工作和电子制造。", "拥有承包商、临时人员和高空作业的工地。", "符合行业合规要求的分行、服务中心和信任员工。"],
    lists: [
      ["审查并谈判工厂和配送集体协议。", "配送与路线人员的招聘、薪酬方案和终止。", "多个州的配送中心采用统一标准管理。", "记录不停运作中的班次、休息和工作时间。"],
      ["工会关系与集体协议合法化。", "从现场检查到结案的劳动主管部门检查。", "供应链中的供应商和专业服务。", "生产线的内部规章、纪律和终止。"],
      ["安全卫生委员会与官方标准合规。", "工作风险、在墨西哥社会保障机构前的处理及企业抗辩。", "与工会进行合同和薪资审查。", "在运营持续期间处理罢工通知和集体争议。"],
      ["专业服务登记、合同与核查（REPSE）。", "工程承包商的连带责任与合规审查。", "不同州的园区、工厂和矿山项目人员采用统一标准。", "项目人员在社会保障机构的登记、注销和缴费。"],
      ["工厂集体协议与工会关系。", "生产和销售高峰期的季节性与定期合同。", "销售和促销人员的佣金、薪酬方案与终止。", "缩短工作周和电子考勤下的班次与工作时间。"],
      ["技术、质量和实验室人员的合同与内部规章。", "技术信息和流程的保密与保护。", "医药代表的薪酬、差旅费用与终止。", "生产区域的安全卫生与工作风险。"],
      ["依法开展远程工作并遵守NOM-037，涵盖政策、设备和费用。", "员工发明与开发成果的权属和保密。", "薪酬、留任奖金与长期激励计划。", "工厂启动阶段的招聘、内部规章与工会关系。"],
      ["专业服务（REPSE）与承包商连带责任。", "向社会保障机构登记工地、临时人员缴费及完工终止。", "工地安全、高空作业和工伤处理。", "物业管理、维护、安保和清洁人员。"],
      ["信任员工的招聘、薪酬与终止。", "内部调查、行为准则以及反骚扰和反霸凌协议。", "奖金、佣金与浮动薪酬方案。", "重组、合并和人员转移。"],
    ],
    cierre: { texto: "许多业务位于新莱昂州以外的其他州。", enlace: "事务所在32个州的网络" },
    mapa: { titulo: "每座工厂采用同一标准", entrada: "事务所从蒙特雷服务墨西哥全部32个州的客户，并通过覆盖72多个城市的律所联盟提供支持。", desc: "墨西哥地图。从新莱昂州圣佩德罗加尔萨加西亚的总部出发，路线连接其他31个州。", sedeTitulo: "蒙特雷 · 总部", sedeTituloNorte: { a: "蒙特雷", sep: " · ", b: "总部" }, sedeNombre: "圣佩德罗加尔萨加西亚总部", pausar: "暂停", reanudar: "继续", pausarAria: "暂停地图动画", reanudarAria: "继续地图动画", lista: "事务所网络覆盖的州", ayuda: "使用方向键浏览州，按回车或空格固定，按Escape解除。", nombres: {} },
    sigue: { label: "下一页", title: "我们的合伙人", aria: "下一页" },
  },
  ko: {
    cab: { alt: "해질 무렵의 몬테레이와 도시를 내려다보는 세로 데 라 시야", title: "자문 산업 분야", lead: "연속 교대, 단체협약, 점검과 전문 인력이 필요한 운영을 이해합니다.", text: "멕시코 산업 그룹, 다국적 기업, 아시아 자본 기업 등 누에보레온과 멕시코 여러 주에서 운영하는 500개 이상의 기업에 자문합니다." },
    indice: "산업",
    names: ["음료", "자동차 및 제조", "철강", "에너지 및 천연자원", "소비재", "제약 및 보건", "기술", "부동산 및 건설", "금융 서비스"],
    lines: ["연속 운영을 위한 단체협약, 물류센터와 배송 인력.", "다교대 공장의 집단 노사관계, 점검과 컴플라이언스.", "중단 없는 공정의 산업안전, 업무상 위험과 노조 관계.", "발전·송전·광산 프로젝트의 전문 서비스, 도급과 컴플라이언스.", "대규모 인력과 성수기를 운영하는 공장, 물류센터와 영업 조직.", "기술·실험실 인력, 통제된 생산구역과 의료 영업사원.", "멕시코 북부 공장의 전문 인재, 원격근무와 전자 제조.", "도급업체, 임시 인력과 고소 작업이 있는 현장.", "업종의 컴플라이언스 요건을 적용하는 지점, 고객센터와 신뢰직 직원."],
    lists: [
      ["공장 및 유통 단체협약의 검토와 협상.", "배송·노선 인력의 채용, 보수 체계와 종료.", "여러 주의 물류센터를 동일 기준으로 관리.", "중단 없는 운영에서 교대, 휴식과 근로시간을 문서화."],
      ["노조 관계와 단체협약의 적법성 확보.", "방문부터 해결까지 노동 당국의 점검 대응.", "공급망 내 공급업체와 전문 서비스.", "생산라인의 취업규칙, 징계와 종료."],
      ["산업안전보건위원회와 공식 기준 준수.", "업무상 위험의 IMSS 처리와 기업 방어.", "노조와의 계약 및 임금 검토.", "운영을 유지하며 파업 통지와 집단 분쟁 대응."],
      ["전문 서비스(REPSE)의 등록, 계약과 검증.", "현장 도급업체의 연대책임과 준수 여부 검토.", "여러 주의 발전소, 공장과 광산 프로젝트 인력 관리.", "프로젝트 인력의 IMSS 신고, 말소와 납부."],
      ["공장 단체협약과 노조 관계.", "생산·판매 성수기의 계절·기간제 계약.", "영업 및 프로모션 인력의 수수료, 보수와 종료.", "근로시간 단축과 전자 출퇴근 기록에 따른 교대 관리."],
      ["기술·품질·실험실 인력의 계약과 취업규칙.", "기술 정보와 공정의 비밀유지 및 보호.", "의료 영업사원의 보수, 출장비와 종료.", "생산 구역의 산업안전과 업무상 위험."],
      ["법과 NOM-037에 따른 원격근무 정책, 장비와 비용.", "직원 발명·개발물의 권리와 비밀유지.", "보수, 장기근속 보너스와 장기 인센티브.", "공장 가동 단계의 채용, 취업규칙과 노조 관계."],
      ["전문 서비스(REPSE)와 도급업체 연대책임.", "IMSS 공사 등록, 임시 인력 부담금과 공사 종료 처리.", "현장 안전, 고소 작업과 산업재해 대응.", "시설 관리, 유지보수·보안·청소 인력."],
      ["신뢰직 직원의 채용, 보수와 종료.", "내부 조사, 윤리규정과 괴롭힘 방지 절차.", "보너스, 수수료와 변동 보수 체계.", "구조조정, 합병과 인력 이전."],
    ],
    cierre: { texto: "많은 운영이 누에보레온 외 멕시코 다른 주에 있습니다.", enlace: "멕시코 32개 주를 잇는 법률사무소 네트워크" },
    mapa: { titulo: "모든 공장에 같은 기준", entrada: "몬테레이에서 32개 주의 고객을 지원하며, 72개 이상의 도시에 있는 로펌 연합을 통해 업무를 수행합니다.", desc: "멕시코 지도. 누에보레온 산페드로 가르사 가르시아의 본사에서 나머지 31개 주로 연결됩니다.", sedeTitulo: "몬테레이 · 본사", sedeTituloNorte: { a: "몬테레이", sep: " · ", b: "본사" }, sedeNombre: "산페드로 가르사 가르시아 본사", pausar: "일시정지", reanudar: "재생", pausarAria: "지도 애니메이션 일시정지", reanudarAria: "지도 애니메이션 재생", lista: "네트워크의 주 목록", ayuda: "화살표로 이동하고 Enter 또는 Space로 고정하며 Escape로 해제합니다.", nombres: {} },
    sigue: { label: "다음", title: "파트너", aria: "다음 페이지" },
  },
  ja: {
    cab: { alt: "夕暮れのモンテレイと街を見下ろすセロ・デ・ラ・シヤ", title: "ご相談いただく業界", lead: "連続シフト、労働協約、監査、専門人材を要する現場を理解しています。", text: "メキシコの産業グループ、多国籍企業、ヌエボ・レオン州などで事業を行うアジア資本企業を含む、500社以上に助言しています。" },
    indice: "業界",
    names: ["飲料", "自動車・製造", "鉄鋼", "エネルギー・天然資源", "消費財", "製薬・ヘルスケア", "テクノロジー", "不動産・建設", "金融サービス"],
    lines: ["連続稼働のための労働協約、配送センター、配送スタッフ。", "複数シフトの工場における労使関係、監査、コンプライアンス。", "止まらない工程の安全衛生、労災リスク、労組関係。", "発電・送電・鉱山プロジェクトの専門サービス、請負、コンプライアンス。", "大規模な人員と繁忙期を抱える工場、配送センター、営業組織。", "技術・研究所スタッフ、管理された生産区域、医療担当者。", "メキシコ北部の工場における専門人材、リモートワーク、電子製造。", "請負業者、臨時人員、高所作業を伴う現場。", "業界のコンプライアンス要件に対応する支店、サービスセンター、信任職。"],
    lists: [
      ["工場・配送の労働協約の確認と交渉。", "配送・ルート担当者の採用、報酬制度、契約終了。", "複数州の配送センターを共通基準で管理。", "止まらない操業のシフト、休憩、労働時間を文書化。"],
      ["労組との関係と労働協約の適法化。", "訪問から解決まで労働当局の監査に対応。", "サプライチェーンの供給業者と専門サービス。", "製造ラインの就業規則、規律、契約終了。"],
      ["安全衛生委員会と公式基準の遵守。", "労災の社会保障機関での対応と企業防衛。", "労組との契約・賃金の見直し。", "操業を続けながらストライキ通知と集団紛争に対応。"],
      ["専門サービス（REPSE）の登録、契約、確認。", "現場請負業者の連帯責任と遵守状況の確認。", "各州の発電所、工場、鉱山のプロジェクト人員。", "プロジェクト人員の社会保障登録、脱退、拠出。"],
      ["工場の労働協約と労組関係。", "生産・販売の繁忙期に向けた季節・有期契約。", "営業・プロモーション担当のコミッション、報酬、契約終了。", "週労働時間短縮と電子勤怠に伴うシフト管理。"],
      ["技術・品質・研究所スタッフの契約と就業規則。", "技術情報と工程の秘密保持・保護。", "医療担当者の報酬、旅費、契約終了。", "生産区域の安全衛生と労災リスク。"],
      ["法令とNOM-037に沿ったリモートワークの方針、機器、費用。", "従業員の発明・開発成果の権利と秘密保持。", "報酬、リテンションボーナス、長期インセンティブ。", "工場立ち上げ時の採用、就業規則、労組関係。"],
      ["専門サービス（REPSE）と請負業者の連帯責任。", "社会保障機関への工事登録、臨時人員の拠出、工事終了。", "現場安全、高所作業、労災対応。", "不動産管理、保守・警備・清掃スタッフ。"],
      ["信任職の採用、報酬、契約終了。", "内部調査、行動規範、ハラスメント防止手続。", "賞与、コミッション、変動報酬制度。", "再編、合併、人員移転。"],
    ],
    cierre: { texto: "多くの事業はヌエボ・レオン州以外の州で行われています。", enlace: "32州を結ぶ当事務所のネットワーク" },
    mapa: { titulo: "すべての工場に同じ基準", entrada: "モンテレイからメキシコ全32州の顧客を支援し、72以上の都市に広がる法律事務所の連携を通じて対応します。", desc: "メキシコの地図。ヌエボ・レオン州サン・ペドロ・ガルサ・ガルシアの本社から、他の31州へルートが広がります。", sedeTitulo: "モンテレイ · 本社", sedeTituloNorte: { a: "モンテレイ", sep: " · ", b: "本社" }, sedeNombre: "サン・ペドロ・ガルサ・ガルシア本社", pausar: "一時停止", reanudar: "再開", pausarAria: "地図の動きを一時停止", reanudarAria: "地図の動きを再開", lista: "ネットワークの州一覧", ayuda: "矢印キーで移動し、Enterまたはスペースで固定、Escapeで解除します。", nombres: {} },
    sigue: { label: "次へ", title: "パートナー", aria: "次のページ" },
  },
  fr: {
    cab: { alt: "Monterrey au coucher du soleil, avec le Cerro de la Silla au-dessus de la ville", title: "Secteurs que nous conseillons", lead: "Nous connaissons leurs opérations : équipes continues, conventions collectives, inspections et personnel spécialisé.", text: "Nous conseillons plus de 500 entreprises, notamment des groupes industriels mexicains, des multinationales et des sociétés à capitaux asiatiques implantées au Nuevo León et dans d’autres États du Mexique." },
    indice: "Secteurs",
    names: ["Boissons", "Automobile et industrie", "Acier", "Énergie et ressources naturelles", "Biens de consommation", "Pharmacie et santé", "Technologies", "Immobilier et construction", "Services financiers"],
    lines: ["Conventions collectives, centres de distribution et personnel de livraison en activité continue.", "Relations collectives, inspections et conformité dans des usines à plusieurs équipes.", "Santé-sécurité, risques professionnels et relations syndicales dans des procédés continus.", "Services spécialisés, sous-traitants et conformité dans les projets d’énergie et de mines.", "Usines, centres de distribution et forces commerciales avec de grands effectifs et des pics saisonniers.", "Personnel technique et de laboratoire, zones de production contrôlées et visiteurs médicaux.", "Talents spécialisés, télétravail et fabrication électronique dans le nord du Mexique.", "Chantiers avec sous-traitants, personnel temporaire et travaux en hauteur.", "Agences, centres de service et salariés de confiance soumis aux exigences de conformité du secteur."],
    lists: [
      ["Révision et négociation des conventions collectives des usines et de la distribution.", "Recrutement, rémunération et ruptures du personnel de livraison et de tournée.", "Centres de distribution dans plusieurs États, selon un même standard.", "Équipes, repos et horaires documentés dans une activité sans interruption."],
      ["Relations avec le syndicat et validation de la convention collective.", "Inspections de l’autorité du travail, de la visite à la résolution.", "Fournisseurs et services spécialisés dans la chaîne d’approvisionnement.", "Règlement intérieur, discipline et ruptures sur la ligne de production."],
      ["Commissions de santé-sécurité et respect des normes officielles.", "Risques professionnels, gestion auprès de l’IMSS et défense de l’entreprise.", "Révisions contractuelles et salariales avec le syndicat.", "Préavis de grève et conflits collectifs pendant la poursuite de l’activité."],
      ["Enregistrement, contrats et vérification des services spécialisés (REPSE).", "Sous-traitants sur chantier, responsabilité solidaire et contrôle de conformité.", "Personnel de projet dans les parcs, usines et mines de plusieurs États.", "Affiliations, radiations et cotisations IMSS du personnel de projet."],
      ["Conventions collectives d’usine et relations avec le syndicat.", "Contrats saisonniers et à durée déterminée pour les pics de production et de vente.", "Forces commerciales et promotion, commissions, rémunération et ruptures.", "Équipes et horaires lors de la réduction de la semaine et de la pointeuse électronique."],
      ["Contrats et règlement intérieur du personnel technique, qualité et laboratoire.", "Confidentialité et protection des informations techniques et des procédés.", "Visiteurs médicaux, rémunération, frais de déplacement et ruptures.", "Santé-sécurité et risques professionnels dans les zones de production."],
      ["Télétravail selon la loi et la NOM-037 : politiques, équipement et frais.", "Inventions et développements du personnel : propriété et confidentialité.", "Rémunération, primes de fidélisation et plans d’intéressement à long terme.", "Démarrage d’usines : recrutement, règlement intérieur et relations syndicales."],
      ["Services spécialisés (REPSE) et responsabilité solidaire des sous-traitants.", "Enregistrement du chantier à l’IMSS, cotisations du personnel temporaire et fin de chantier.", "Sécurité du chantier, travaux en hauteur et accidents du travail.", "Gestion immobilière : personnel de maintenance, sécurité et nettoyage."],
      ["Salariés de confiance : recrutement, rémunération et ruptures.", "Enquêtes internes, codes de conduite et protocoles contre le harcèlement.", "Primes, commissions et rémunération variable.", "Restructurations, fusions et transferts de personnel."],
    ],
    cierre: { texto: "Nombre de ces activités se trouvent hors du Nuevo León, dans d’autres États du pays.", enlace: "Le réseau de la firme dans les 32 entités fédérales" },
    mapa: { titulo: "Le même standard dans chaque usine", entrada: "Depuis Monterrey, la firme accompagne ses clients dans les 32 entités fédérales grâce à une alliance de cabinets présente dans plus de 72 villes.", desc: "Carte du Mexique. Depuis le siège de San Pedro Garza García, au Nuevo León, un réseau de routes rejoint les 31 autres entités.", sedeTitulo: "Monterrey · Siège", sedeTituloNorte: { a: "Monterrey", sep: " · ", b: "Siège" }, sedeNombre: "Siège à San Pedro Garza García", pausar: "Pause", reanudar: "Reprendre", pausarAria: "Mettre en pause l’animation de la carte", reanudarAria: "Reprendre l’animation de la carte", lista: "Entités fédérales du réseau", ayuda: "Utilisez les flèches pour parcourir les entités, Entrée ou Espace pour en fixer une et Échap pour la libérer.", nombres: {} },
    sigue: { label: "Suivant", title: "Nos associés", aria: "Page suivante" },
  },
  it: {
    cab: { alt: "Monterrey al tramonto, con il Cerro de la Silla sulla città", title: "Settori che assistiamo", lead: "Conosciamo le loro attività: turni continui, contratti collettivi, ispezioni e personale specializzato.", text: "Assistiamo oltre 500 imprese, tra cui gruppi industriali messicani, multinazionali e società a capitale asiatico che operano nel Nuevo León e in altri Stati del Messico." },
    indice: "Settori",
    names: ["Bevande", "Automotive e produzione", "Acciaio", "Energia e risorse naturali", "Beni di consumo", "Farmaceutico e salute", "Tecnologia", "Immobiliare e costruzioni", "Servizi finanziari"],
    lines: ["Contratti collettivi, centri di distribuzione e personale di consegna in attività continua.", "Relazioni collettive, ispezioni e compliance negli stabilimenti a più turni.", "Sicurezza, rischi professionali e rapporti sindacali in processi senza interruzioni.", "Servizi specializzati, appaltatori e compliance nei progetti energetici e minerari.", "Stabilimenti, centri di distribuzione e forze vendita con grandi organici e picchi stagionali.", "Personale tecnico e di laboratorio, aree produttive controllate e informatori scientifici.", "Talenti specializzati, lavoro da remoto e produzione elettronica nel nord del Messico.", "Cantieri con appaltatori, personale temporaneo e lavori in quota.", "Filiali, centri assistenza e personale fiduciario soggetti agli obblighi del settore."],
    lists: [
      ["Revisione e negoziazione dei contratti collettivi di stabilimento e distribuzione.", "Assunzione, compensi e cessazioni del personale di consegna e di percorso.", "Centri di distribuzione in più Stati, gestiti con lo stesso criterio.", "Turni, riposi e orari documentati in un’attività senza pause."],
      ["Rapporti con il sindacato e legittimazione del contratto collettivo.", "Ispezioni dell’autorità del lavoro, dalla visita alla definizione.", "Fornitori e servizi specializzati nella catena di approvvigionamento.", "Regolamento interno, disciplina e cessazioni sulla linea produttiva."],
      ["Comitati di sicurezza e igiene e rispetto delle norme ufficiali.", "Rischi professionali, gestione davanti all’IMSS e difesa dell’impresa.", "Revisioni contrattuali e salariali con il sindacato.", "Scioperi e controversie collettive con l’attività in corso."],
      ["Registrazione, contratti e verifica dei servizi specializzati (REPSE).", "Appaltatori in cantiere, responsabilità solidale e verifica della compliance.", "Personale di progetto in parchi, impianti e miniere di diversi Stati.", "Registrazioni, cessazioni e contributi IMSS del personale di progetto."],
      ["Contratti collettivi di stabilimento e rapporti con il sindacato.", "Contratti stagionali e a termine per i picchi produttivi e commerciali.", "Forza vendita e promozione, commissioni, compensi e cessazioni.", "Turni e orari con la riduzione della settimana e la rilevazione elettronica."],
      ["Contratti e regolamento interno per il personale tecnico, qualità e laboratorio.", "Riservatezza e protezione delle informazioni tecniche e dei processi.", "Informatori scientifici, compensi, trasferte e cessazioni.", "Sicurezza e rischi professionali nelle aree produttive."],
      ["Lavoro da remoto secondo legge e NOM-037: politiche, dotazioni e costi.", "Invenzioni e sviluppi dei dipendenti: titolarità e riservatezza.", "Compensi, premi di retention e piani di incentivo a lungo termine.", "Avvio degli stabilimenti: assunzioni, regolamento interno e sindacato."],
      ["Servizi specializzati (REPSE) e responsabilità solidale con gli appaltatori.", "Registrazione del cantiere all’IMSS, contributi del personale temporaneo e chiusura.", "Sicurezza in cantiere, lavori in quota e gestione degli infortuni.", "Gestione immobiliare: personale di manutenzione, sicurezza e pulizia."],
      ["Personale fiduciario: assunzione, compensi e cessazioni.", "Indagini interne, codici di condotta e protocolli contro le molestie.", "Bonus, commissioni e sistemi di compenso variabile.", "Ristrutturazioni, fusioni e trasferimenti del personale."],
    ],
    cierre: { texto: "Molte di queste attività si svolgono fuori dal Nuevo León, in altri Stati del Paese.", enlace: "La rete dello studio nelle 32 entità federali" },
    mapa: { titulo: "Lo stesso criterio in ogni stabilimento", entrada: "Da Monterrey assistiamo i clienti in tutte le 32 entità federali tramite un’alleanza di studi presente in oltre 72 città.", desc: "Mappa del Messico. Dalla sede di San Pedro Garza García, nel Nuevo León, una rete di percorsi raggiunge le altre 31 entità.", sedeTitulo: "Monterrey · Sede", sedeTituloNorte: { a: "Monterrey", sep: " · ", b: "Sede" }, sedeNombre: "Sede a San Pedro Garza García", pausar: "Pausa", reanudar: "Riprendi", pausarAria: "Metti in pausa l’animazione della mappa", reanudarAria: "Riprendi l’animazione della mappa", lista: "Entità federali della rete", ayuda: "Usa le frecce per scorrere, Invio o Spazio per fissare e Esc per liberare.", nombres: {} },
    sigue: { label: "Avanti", title: "I nostri soci", aria: "Pagina successiva" },
  },
  ru: {
    cab: { alt: "Монтеррей на закате и Серро-де-ла-Силья над городом", title: "Отрасли, которым мы помогаем", lead: "Мы понимаем их работу: непрерывные смены, коллективные договоры, проверки и специализированный персонал.", text: "Мы консультируем более 500 компаний, включая мексиканские промышленные группы, транснациональные корпорации и предприятия с азиатским капиталом в Нуэво-Леоне и других штатах Мексики." },
    indice: "Отрасли",
    names: ["Напитки", "Автомобили и производство", "Сталь", "Энергетика и природные ресурсы", "Потребительские товары", "Фармацевтика и здравоохранение", "Технологии", "Недвижимость и строительство", "Финансовые услуги"],
    lines: ["Коллективные договоры, распределительные центры и доставка в непрерывном режиме.", "Коллективные отношения, проверки и соответствие требованиям на многосменных заводах.", "Охрана труда, производственные риски и отношения с профсоюзами в непрерывных процессах.", "Специализированные услуги, подрядчики и соблюдение требований в энергетических и горных проектах.", "Заводы, центры распределения и продажи с большим штатом и сезонными пиками.", "Технический и лабораторный персонал, контролируемые зоны производства и медицинские представители.", "Специалисты, удалённая работа и электронное производство на севере Мексики.", "Строительные площадки с подрядчиками, временным персоналом и высотными работами.", "Филиалы, сервисные центры и доверенные сотрудники с учётом отраслевых требований."],
    lists: [
      ["Проверка и переговоры по коллективным договорам заводов и распределения.", "Найм, оплата и прекращение отношений с курьерами и маршрутным персоналом.", "Распределительные центры в нескольких штатах по единому стандарту.", "Документирование смен, отдыха и рабочего времени в непрерывной работе."],
      ["Отношения с профсоюзом и легализация коллективного договора.", "Проверки трудовых органов от визита до завершения.", "Поставщики и специализированные услуги в цепочке поставок.", "Правила трудового распорядка, дисциплина и увольнения на линии."],
      ["Комиссии по охране труда и соблюдение официальных норм.", "Производственные риски, работа с IMSS и защита компании.", "Пересмотр договоров и заработной платы с профсоюзом.", "Уведомления о забастовках и коллективные споры при работе предприятия."],
      ["Регистрация, договоры и проверка специализированных услуг (REPSE).", "Подрядчики на объекте, солидарная ответственность и проверка соблюдения.", "Проектный персонал на объектах, заводах и шахтах разных штатов.", "Регистрация, снятие с учёта и взносы IMSS за проектный персонал."],
      ["Коллективные договоры завода и отношения с профсоюзом.", "Сезонные и срочные договоры для пиков производства и продаж.", "Продажи и продвижение, комиссии, оплата и увольнения.", "Смены и время работы при сокращении недели и электронной регистрации."],
      ["Договоры и внутренние правила для технического, качественного и лабораторного персонала.", "Конфиденциальность и защита технической информации и процессов.", "Медицинские представители, оплата, командировочные и увольнения.", "Охрана труда и производственные риски в зонах производства."],
      ["Удалённая работа по закону и NOM-037: правила, оборудование и расходы.", "Изобретения и разработки сотрудников: права и конфиденциальность.", "Оплата, бонусы удержания и долгосрочные стимулы.", "Запуск заводов: найм, внутренние правила и отношения с профсоюзом."],
      ["Специализированные услуги (REPSE) и солидарная ответственность с подрядчиками.", "Регистрация объекта в IMSS, взносы временного персонала и завершение работ.", "Безопасность на объекте, высотные работы и производственные травмы.", "Управление недвижимостью: технический персонал, охрана и уборка."],
      ["Доверенные сотрудники: найм, оплата и увольнения.", "Внутренние расследования, кодексы поведения и протоколы против домогательств.", "Бонусы, комиссии и переменная оплата.", "Реструктуризация, слияния и перевод персонала."],
    ],
    cierre: { texto: "Многие операции находятся за пределами Нуэво-Леона, в других штатах страны.", enlace: "Сеть фирмы во всех 32 штатах" },
    mapa: { titulo: "Единый стандарт на каждом заводе", entrada: "Из Монтеррея фирма обслуживает клиентов во всех 32 штатах через альянс фирм, представленный более чем в 72 городах.", desc: "Карта Мексики. От офиса в Сан-Педро-Гарса-Гарсии, Нуэво-Леон, маршруты ведут к остальным 31 штатам.", sedeTitulo: "Монтеррей · Офис", sedeTituloNorte: { a: "Монтеррей", sep: " · ", b: "Офис" }, sedeNombre: "Офис в Сан-Педро-Гарса-Гарсии", pausar: "Пауза", reanudar: "Продолжить", pausarAria: "Поставить анимацию карты на паузу", reanudarAria: "Возобновить анимацию карты", lista: "Штаты в сети фирмы", ayuda: "Используйте стрелки для перехода, Enter или пробел для фиксации и Escape для освобождения.", nombres: {} },
    sigue: { label: "Далее", title: "Наши партнёры", aria: "Следующая страница" },
  },
  ar: {
    cab: { alt: "مونتيري عند الغروب مع سيرو دي لا سيّا فوق المدينة", title: "القطاعات التي نقدم لها المشورة", lead: "نفهم عملياتها: المناوبات المستمرة والاتفاقيات الجماعية والتفتيش والموظفون المتخصصون.", text: "نقدم المشورة لأكثر من 500 شركة، منها مجموعات صناعية مكسيكية وشركات متعددة الجنسيات وشركات برأس مال آسيوي تعمل في نويفو ليون وولايات مكسيكية أخرى." },
    indice: "القطاعات",
    names: ["المشروبات", "السيارات والتصنيع", "الصلب", "الطاقة والموارد الطبيعية", "السلع الاستهلاكية", "الأدوية والصحة", "التكنولوجيا", "العقارات والبناء", "الخدمات المالية"],
    lines: ["اتفاقيات جماعية ومراكز توزيع وموظفو توصيل في تشغيل مستمر.", "علاقات جماعية وتفتيش وامتثال في مصانع تعمل بعدة مناوبات.", "السلامة والصحة المهنية ومخاطر العمل والعلاقات النقابية في عمليات لا تتوقف.", "خدمات متخصصة ومقاولون وامتثال في مشروعات الطاقة والتعدين.", "مصانع ومراكز توزيع وقوة مبيعات بأعداد كبيرة ومواسم ذروة.", "موظفو التقنية والمختبرات ومناطق إنتاج مضبوطة وممثلون طبيون.", "كفاءات متخصصة وعمل عن بعد وتصنيع إلكتروني في شمال المكسيك.", "مواقع بها مقاولون وموظفون مؤقتون وأعمال على ارتفاعات.", "فروع ومراكز خدمة وموظفون موثوقون وفق متطلبات امتثال القطاع."],
    lists: [
      ["مراجعة والتفاوض على الاتفاقيات الجماعية للمصانع والتوزيع.", "توظيف وأجور وإنهاء خدمة موظفي التوصيل والطرق.", "مراكز توزيع في ولايات متعددة وفق معيار موحد.", "توثيق المناوبات والراحة وساعات العمل في عملية لا تتوقف."],
      ["العلاقات مع النقابة وإضفاء الشرعية على الاتفاقية الجماعية.", "تفتيش السلطات العمالية من الزيارة حتى الحل.", "الموردون والخدمات المتخصصة ضمن سلسلة التوريد.", "اللائحة الداخلية والانضباط وإنهاء الخدمة على خط الإنتاج."],
      ["لجان السلامة والصحة المهنية والامتثال للمعايير الرسمية.", "مخاطر العمل ومعالجتها أمام IMSS والدفاع عن الشركة.", "مراجعة العقود والأجور مع النقابة.", "إخطارات الإضراب والنزاعات الجماعية مع استمرار التشغيل."],
      ["تسجيل وعقود والتحقق من الخدمات المتخصصة (REPSE).", "المقاولون في المواقع والمسؤولية التضامنية ومراجعة الامتثال.", "موظفو المشروعات في الحدائق والمصانع والمناجم في ولايات مختلفة.", "تسجيل وإلغاء ومساهمات IMSS للموظفين المكلفين بالمشروع."],
      ["الاتفاقيات الجماعية للمصانع والعلاقة مع النقابة.", "عقود موسمية ومحددة المدة لذروة الإنتاج والمبيعات.", "قوة المبيعات والترويج والعمولات والأجور وإنهاء الخدمة.", "المناوبات وساعات العمل مع تقليل الأسبوع وسجل الحضور الإلكتروني."],
      ["عقود ولائحة داخلية للموظفين التقنيين وموظفي الجودة والمختبرات.", "سرية وحماية المعلومات والعمليات التقنية.", "الممثلون الطبيون والأجور ونفقات السفر وإنهاء الخدمة.", "السلامة والصحة المهنية ومخاطر العمل في مناطق الإنتاج."],
      ["العمل عن بعد وفق القانون وNOM-037 والسياسات والمعدات والمصروفات.", "اختراعات وتطويرات الموظفين والملكية والسرية.", "الأجور ومكافآت الاحتفاظ وخطط الحوافز طويلة الأجل.", "بدء تشغيل المصانع والتوظيف واللائحة الداخلية والعلاقة مع النقابة."],
      ["الخدمات المتخصصة (REPSE) والمسؤولية التضامنية مع المقاولين.", "تسجيل الموقع لدى IMSS ومساهمات الموظفين المؤقتين وإنهاء العمل.", "سلامة الموقع والعمل على ارتفاعات ومعالجة حوادث العمل.", "إدارة العقارات وموظفو الصيانة والأمن والنظافة."],
      ["الموظفون الموثوقون والتوظيف والأجور وإنهاء الخدمة.", "تحقيقات داخلية ومدونات سلوك وبروتوكولات ضد التحرش.", "مكافآت وعمولات وأنظمة أجور متغيرة.", "إعادة هيكلة واندماجات ونقل الموظفين."],
    ],
    cierre: { texto: "تقع كثير من هذه العمليات خارج نويفو ليون في ولايات أخرى من البلاد.", enlace: "شبكة الشركة في الولايات الاتحادية الـ32" },
    mapa: { titulo: "المعيار نفسه في كل مصنع", entrada: "من مونتيري نخدم عملاءنا في الولايات الاتحادية الـ32 عبر تحالف مكاتب حاضر في أكثر من 72 مدينة.", desc: "خريطة المكسيك. من مقر الشركة في سان بيدرو غارسا غارسيا، نويفو ليون، تصل الطرق إلى الولايات الـ31 الأخرى.", sedeTitulo: "مونتيري · المقر", sedeTituloNorte: { a: "مونتيري", sep: " · ", b: "المقر" }, sedeNombre: "المقر في سان بيدرو غارسا غارسيا", pausar: "إيقاف", reanudar: "استئناف", pausarAria: "إيقاف حركة الخريطة", reanudarAria: "استئناف حركة الخريطة", lista: "الولايات الاتحادية في الشبكة", ayuda: "استخدم الأسهم للتنقل، وEnter أو المسافة للتثبيت، وEscape للتحرير.", nombres: {} },
    sigue: { label: "التالي", title: "شركاؤنا", aria: "الصفحة التالية" },
  },
};

function buildLocale(copy: LocaleCopy): IndustriasTexts {
  return {
    cab: copy.cab,
    indice: copy.indice,
    industrias: en.industrias.map((industry, index) => ({
      ...industry,
      nombre: copy.names[index],
      linea: copy.lines[index],
      lista: copy.lists[index],
    })),
    cierre: copy.cierre,
    mapa: copy.mapa,
    sigue: copy.sigue,
  };
}

export const INDUSTRIAS_TEXTS: Record<IndustryLocale, IndustriasTexts> = {
  es,
  en,
  ...Object.fromEntries(Object.entries(localizedCopies).map(([locale, copy]) => [locale, buildLocale(copy)])),
} as Record<IndustryLocale, IndustriasTexts>;
