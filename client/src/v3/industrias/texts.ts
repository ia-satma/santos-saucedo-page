/* Textos de la página «Industrias» (demo v3, aprobada el 5-11-2026).
   Español: tal cual en la demo (r11/paginas.py cab_ind, modules/industrias, modules/mapa).
   Inglés: misma voz institucional y callada; los demás idiomas ven el inglés con lang="en". */
import type { V3Lang } from "@/v3/shared";
import { v3Asset } from "../asset";

export type IndustriaId = "bebidas" | "automotriz" | "acero" | "energia";

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
    sedeNombre: string;
    pausar: string;
    reanudar: string;
    pausarAria: string;
    reanudarAria: string;
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
};

const es: IndustriasTexts = {
  cab: {
    alt: "Monterrey al atardecer, con el Cerro de la Silla sobre la ciudad",
    title: "Industrias que asesoramos",
    lead: "Conocemos su operación: turnos continuos, contratos colectivos, inspecciones y personal especializado.",
    text: "Grupos industriales mexicanos, multinacionales y empresas de capital asiático, con plantas en Nuevo León y en otros estados del país.",
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
      nombre: "Automotriz",
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
      nombre: "Energía",
      linea: "Servicios especializados (REPSE), contratistas y cumplimiento en proyectos de generación y transmisión.",
      lista: [
        "Registro, contratos y verificación de los servicios especializados (REPSE).",
        "Contratistas en obra: responsabilidad solidaria y revisión de su cumplimiento.",
        "Personal de proyecto en distintas entidades, con un mismo criterio.",
        "Altas, bajas y cuotas ante el IMSS del personal asignado a cada proyecto.",
      ],
    },
  ],
  cierre: {
    texto: "Muchas de estas plantas operan fuera de Nuevo León, en otros estados del país.",
    enlace: "La red de la firma en las 32 entidades",
  },
  mapa: {
    titulo: "El mismo criterio en cada planta",
    entrada:
      "Desde Monterrey, la firma atiende a sus clientes en las 32 entidades federativas, a través de una alianza de despachos con presencia en más de 72 ciudades.",
    desc: "Mapa de México. Desde la sede de la firma, en San Pedro Garza García, Nuevo León, una red de rutas llega a las otras 31 entidades federativas.",
    sedeTitulo: "Monterrey · Sede",
    sedeNombre: "Sede en San Pedro Garza García",
    pausar: "Pausar",
    reanudar: "Reanudar",
    pausarAria: "Pausar el movimiento del mapa",
    reanudarAria: "Reanudar el movimiento del mapa",
    nombres: {},
  },
  sigue: { label: "Siguiente", title: "Nuestros socios", aria: "Siguiente página" },
};

const en: IndustriasTexts = {
  cab: {
    alt: "Monterrey at sunset, with Cerro de la Silla above the city",
    title: "Industries we advise",
    lead: "We know how these operations work: continuous shifts, collective bargaining agreements, inspections and specialized personnel.",
    text: "Mexican industrial groups, multinationals and Asian-owned companies, with plants in Nuevo León and in other states of Mexico.",
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
      nombre: "Automotive",
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
      nombre: "Energy",
      linea: "Specialized services (REPSE), contractors and compliance in generation and transmission projects.",
      lista: [
        "Registration, contracts and verification of specialized services (REPSE).",
        "On-site contractors: joint liability and review of their compliance.",
        "Project personnel in different states, under the same standard.",
        "IMSS registrations, terminations and contributions for the personnel assigned to each project.",
      ],
    },
  ],
  cierre: {
    texto: "Many of these plants operate outside Nuevo León, in other states of Mexico.",
    enlace: "The firm’s network across the 32 federal entities",
  },
  mapa: {
    titulo: "The same standard at every plant",
    entrada:
      "From Monterrey, the firm serves its clients in all 32 federal entities of Mexico, through an alliance of law firms present in more than 72 cities.",
    desc: "Map of Mexico. From the firm’s head office in San Pedro Garza García, Nuevo León, a network of routes reaches the other 31 federal entities.",
    sedeTitulo: "Monterrey office",
    sedeNombre: "Head office in San Pedro Garza García",
    pausar: "Pause",
    reanudar: "Resume",
    pausarAria: "Pause the map animation",
    reanudarAria: "Resume the map animation",
    nombres: { df: "Mexico City", mx: "State of Mexico" },
  },
  sigue: { label: "Next", title: "Our partners", aria: "Next page" },
};

export const INDUSTRIAS_TEXTS: Record<V3Lang, IndustriasTexts> = { es, en };
