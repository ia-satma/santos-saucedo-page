/* Textos de la página «Industrias» (demo v3, aprobada el 5-11-2026).
   Español: tal cual en la demo (r11/paginas.py cab_ind, modules/industrias, modules/mapa).
   Inglés: misma voz institucional y callada; los demás idiomas ven el inglés con lang="en". */
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
  consumo: { img: v3Asset("/v3/c-ind-consumo.webp"), w: 2000, h: 1333, pos: "50% 62%" },
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

export const INDUSTRIAS_TEXTS: Record<V3Lang, IndustriasTexts> = { es, en };
