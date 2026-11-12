/* Textos de las láminas de las páginas de práctica (demo v3, aprobada el 5-11-2026).
   Español: tal cual en la demo (modules/anatomia/section.html y modules/figuras/section.html).
   Inglés: misma voz institucional y callada. Los demás idiomas usan su copia localizada.
   El texto de cada práctica (descripción, servicios, equipo) NO vive aquí: viene de la base y del panel. */
import type { LanguageCode } from "@shared/constants";
import { localizedRecord } from "@/v3/locales";
import type { V3Lang } from "@/v3/shared";
import type { FgArea } from "./figurasSvg";

export type SheetId = "orden" | "solucion";

export interface AnRow { t: string; d?: string }
export interface AnSheetText { h: string; p: string; listLabel: string; rows: AnRow[]; key: string; tab: string }
export interface AnatomiaTexts {
  /** descripción de la sección (una o las dos láminas) */
  aria: { both: string; orden: string; solucion: string };
  tabsLabel: string;
  tabShort: string;
  hint: string;
  modesLabel: string;
  assembled: string;
  exploded: string;
  sheetWord: string;
  sheets: Record<SheetId, AnSheetText>;
}

export interface FgItem { nom: string; dato?: string; desc: string }
export interface FiguraText {
  titulo: string;
  entrada: string;
  fuente?: string;
  /** descripción del dibujo; {a} y {b} son el primer y el último número de pieza */
  aria: string;
  items: FgItem[];
}
export interface FigurasTexts {
  listLabel: (n: number) => string;
  sheetWord: string;
  lugar: string;
  meses?: Record<string, string>;
  laminas: Record<FgArea, FiguraText>;
}

const ANATOMIA_BASE: Record<V3Lang, AnatomiaTexts> = {
  es: {
    aria: {
      both: "Anatomía de nuestra práctica laboral: prevención y solución",
      orden: "Anatomía de nuestra práctica laboral: la prevención",
      solucion: "Anatomía de nuestra práctica laboral: la solución",
    },
    tabsLabel: "Lámina",
    tabShort: "Lám. ",
    hint: "Arrastre para girar",
    modesLabel: "Vista del plano",
    assembled: "Ensamblado",
    exploded: "Despiece",
    sheetWord: "Lámina",
    sheets: {
      orden: {
        h: "Un expediente en orden",
        p: "Muchos conflictos laborales pueden resolverse antes de llegar a un tribunal: en un contrato bien redactado y en un expediente en orden. Estas son las capas que revisamos con cada cliente.",
        listLabel: "Capas de un expediente laboral en orden",
        tab: "Prevención",
        rows: [
          { t: "Contrato individual de trabajo" },
          { t: "Reglamento interior de trabajo" },
          { t: "Contrato colectivo legitimado" },
          { t: "Registro de asistencia" },
          { t: "REPSE · servicios especializados" },
          { t: "NOM-035 · riesgo psicosocial" },
          { t: "Expediente de cada trabajador" },
        ],
        key: "Se lee de arriba abajo, como se revisa un expediente: del contrato de cada persona a su expediente completo.",
      },
      solucion: {
        h: "El juicio, etapa por etapa",
        p: "Cuando el conflicto llega, lo conduce el mismo equipo que conoce la operación del cliente: desde la conciliación prejudicial hasta la sentencia y, en su caso, el amparo.",
        listLabel: "Etapas del juicio laboral, de la conciliación al amparo",
        tab: "Solución",
        rows: [
          { t: "Conciliación prejudicial", d: "Ante el Centro de Conciliación: convenio o constancia de no conciliación" },
          { t: "Demanda", d: "Ante el Tribunal Laboral" },
          { t: "Emplazamiento", d: "Notificación formal de la demanda a la empresa" },
          { t: "Contestación y pruebas", d: "Excepciones, defensas y ofrecimiento de pruebas" },
          { t: "Audiencia preliminar", d: "Se depura el procedimiento y se admiten las pruebas" },
          { t: "Audiencia de juicio", d: "Desahogo de pruebas y alegatos" },
          { t: "Sentencia y amparo directo", d: "Amparo directo ante el Tribunal Colegiado de Circuito" },
        ],
        key: "Un folder por etapa, en el orden del procedimiento laboral que rige desde la reforma de 2019.",
      },
    },
  },
  en: {
    aria: {
      both: "Anatomy of our labor practice: prevention and resolution",
      orden: "Anatomy of our labor practice: prevention",
      solucion: "Anatomy of our labor practice: resolution",
    },
    tabsLabel: "Sheet",
    tabShort: "Sheet ",
    hint: "Drag to rotate",
    modesLabel: "Drawing view",
    assembled: "Assembled",
    exploded: "Exploded",
    sheetWord: "Sheet",
    sheets: {
      orden: {
        h: "A file in order",
        p: "Many labor disputes can be resolved before they reach a court: in a well-drafted contract and in a file kept in order. These are the layers we review with each client.",
        listLabel: "Layers of a labor file kept in order",
        tab: "Prevention",
        rows: [
          { t: "Individual employment contract" },
          { t: "Internal work regulations" },
          { t: "Legitimated collective agreement" },
          { t: "Attendance record" },
          { t: "REPSE · specialized services" },
          { t: "NOM-035 · psychosocial risk" },
          { t: "Each employee’s personnel file" },
        ],
        key: "It reads from top to bottom, the way a file is reviewed: from each person’s contract to their complete file.",
      },
      solucion: {
        h: "The trial, stage by stage",
        p: "When a dispute arises, it is conducted by the same team that knows the client’s operation: from pre-judicial conciliation to judgment and, where applicable, amparo.",
        listLabel: "Stages of a labor trial, from conciliation to amparo",
        tab: "Resolution",
        rows: [
          { t: "Pre-judicial conciliation", d: "Before the Conciliation Center: settlement or certificate of non-conciliation" },
          { t: "Complaint", d: "Before the Labor Court" },
          { t: "Service of process", d: "Formal notice of the complaint to the company" },
          { t: "Answer and evidence", d: "Exceptions, defenses and offer of evidence" },
          { t: "Preliminary hearing", d: "The proceeding is narrowed and the evidence is admitted" },
          { t: "Trial hearing", d: "Presentation of evidence and closing arguments" },
          { t: "Judgment and direct amparo", d: "Direct amparo before the Collegiate Circuit Court" },
        ],
        key: "One folder per stage, in the order of the labor procedure in force since the 2019 reform.",
      },
    },
  },
};

const FIGURAS_BASE: Record<V3Lang, FigurasTexts> = {
  es: {
    listLabel: (n) => `Componentes de la lámina ${n}`,
    sheetWord: "Lámina",
    lugar: "San Pedro Garza García",
    laminas: {
      corporativo: {
        titulo: "El orden corporativo, cajón por cajón",
        entrada: "Cada cajón guarda una parte del orden de una empresa que emplea personal. Lo revisamos completo y con la mirada laboral puesta en cada documento, porque un contrato mercantil también tiene efectos con los trabajadores.",
        aria: "Plano isométrico de un archivero metálico de cinco cajones abiertos en escalera. Cada cajón corresponde a un componente del orden corporativo, del {a} al {b}.",
        items: [
          { nom: "Acta constitutiva y poderes", desc: "Escritura constitutiva, sus reformas y los poderes vigentes de quienes firman por la empresa." },
          { nom: "Contratos con proveedores y clientes", desc: "Contratos mercantiles redactados y revisados con su efecto laboral a la vista." },
          { nom: "Contratos de servicios especializados (REPSE)", desc: "Servicios y obras especializados contratados con prestadores que cuentan con su registro, y revisados antes de firmar." },
          { nom: "Gobierno corporativo y asambleas", desc: "Asambleas, sesiones de consejo y libros corporativos al día." },
          { nom: "Cumplimiento y políticas internas", desc: "Políticas, códigos de conducta y controles internos que la operación conoce y aplica." },
        ],
      },
      seguridad: {
        titulo: "Un registro que corre con cada nómina",
        entrada: "Lo que la empresa presenta y paga ante el IMSS y el INFONAVIT tiene fecha: cada mes, cada bimestre, cada cuatrimestre y una vez al año, además de los avisos que corren desde cada alta o baja. Llevamos ese calendario al día y defendemos a la empresa cuando la autoridad lo revisa.",
        fuente: "Fundamento: el artículo de cada plazo va en la descripción de su letrero. LSS: Ley del Seguro Social. RACERF: Reglamento de la LSS en materia de Afiliación, Clasificación de Empresas, Recaudación y Fiscalización. Textos vigentes, consultados en noviembre de 2026.",
        aria: "Plano isométrico de un calendario de obligaciones del patrón: doce hojas de mes, de enero a diciembre, con la cuadrícula de sus días, levantadas sobre un tablero, y a la izquierda una regleta de siete días con los cinco hábiles numerados. El día 17 está encerrado en un círculo en las doce hojas y lleva además un punto en los meses impares; enero, mayo y septiembre llevan un cuadro y febrero un triángulo. Cada letrero, del {a} al {b}, corresponde a una de esas marcas.",
        items: [
          { nom: "Avisos afiliatorios", dato: "Altas, bajas y salarios por IDSE · 5 días hábiles", desc: "Altas, bajas y modificaciones de salario de cada trabajador ante el IMSS, por IDSE, dentro de los cinco días hábiles siguientes. LSS, art. 15, fr. I." },
          { nom: "Servicios especializados (REPSE)", dato: "ICSOE y SISUB · enero, mayo y septiembre", desc: "Para empresas con registro REPSE: informativas cuatrimestrales de contratos de servicios especializados, ICSOE ante el IMSS y SISUB ante el INFONAVIT, a más tardar el día 17 de enero, mayo y septiembre. LSS, art. 15-A; Ley del INFONAVIT, art. 29 Bis." },
          { nom: "Prima de riesgo de trabajo", dato: "Una vez al año · en febrero", desc: "Revisión anual de la siniestralidad de la empresa para determinar su prima en el seguro de riesgos de trabajo; se presenta en febrero. LSS, art. 74; RACERF, art. 32, fr. V." },
          { nom: "Retiro, cesantía y vejez, e INFONAVIT", dato: "Cada bimestre · día 17 de los meses impares", desc: "Aportaciones de retiro, cesantía en edad avanzada y vejez, y del INFONAVIT, por bimestre: a más tardar el día 17 de enero, marzo, mayo, julio, septiembre y noviembre. LSS, artículo vigésimo séptimo transitorio; Ley del INFONAVIT, artículo sexto transitorio." },
          { nom: "Cuotas obrero-patronales", dato: "Cada mes · a más tardar el día 17 del mes siguiente", desc: "Determinación y pago de las cuotas del IMSS de cada mes, a más tardar el día 17 del mes siguiente. LSS, art. 39." },
        ],
      },
      migratorio: {
        titulo: "La entrada ordenada de talento extranjero",
        entrada: "Para que un directivo, técnico o especialista extranjero trabaje en la planta deben coincidir tres expedientes: el suyo, el de la empresa que lo contrata y el de su familia. Los llevamos con recursos humanos, de la visa a la residencia.",
        aria: "Plano isométrico de una torre de cinco charolas de documentos separadas a lo largo de sus postes, con un sello de mano sobre la charola superior. Cada charola guarda los documentos de un trámite migratorio, del {a} al {b}.",
        items: [
          { nom: "Visa de trabajo", desc: "Visa por oferta de empleo para directivos, técnicos y especialistas, desde la solicitud hasta el sello de entrada." },
          { nom: "Permiso y residencia", desc: "Tarjeta de residencia y permiso para trabajar, con su vigencia bajo control." },
          { nom: "Registro del empleador ante el INM", desc: "Constancia de inscripción del empleador, la base de cada trámite de la empresa." },
          { nom: "Cambios de condición", desc: "Cambios de condición de estancia y avisos ante el INM cuando cambia la situación del trabajador." },
          { nom: "Familias y dependientes", desc: "Trámites por unidad familiar para cónyuge e hijos que acompañan al trabajador." },
        ],
      },
    },
  },
  en: {
    listLabel: (n) => `Components of sheet ${n}`,
    sheetWord: "Sheet",
    lugar: "San Pedro Garza García",
    // las hojas del calendario llevan el mes en tres letras
    meses: { ENE: "JAN", ABR: "APR", AGO: "AUG", DIC: "DEC" },
    laminas: {
      corporativo: {
        titulo: "Corporate order, drawer by drawer",
        entrada: "Each drawer holds one part of the order of a company that employs people. We review all of it, with a labor perspective on every document, because a commercial contract also has effects on the workforce.",
        aria: "Isometric drawing of a five-drawer metal filing cabinet with its drawers open in a staircase. Each drawer corresponds to one component of corporate order, from {a} to {b}.",
        items: [
          { nom: "Articles of incorporation and powers of attorney", desc: "The deed of incorporation, its amendments and the current powers of attorney of those who sign on behalf of the company." },
          { nom: "Contracts with suppliers and customers", desc: "Commercial contracts drafted and reviewed with their labor effects in view." },
          { nom: "Specialized services contracts (REPSE)", desc: "Specialized services and works engaged with providers that hold their registration, reviewed before signing." },
          { nom: "Corporate governance and shareholders’ meetings", desc: "Shareholders’ meetings, board sessions and corporate books kept up to date." },
          { nom: "Compliance and internal policies", desc: "Policies, codes of conduct and internal controls that the operation knows and applies." },
        ],
      },
      seguridad: {
        titulo: "A record that runs with every payroll",
        entrada: "What the company files and pays before the IMSS and INFONAVIT has a date: every month, every two months, every four months and once a year, in addition to the notices that run from each hiring or termination. We keep that calendar up to date and defend the company when the authority reviews it.",
        fuente: "Legal basis: the article for each deadline appears in the description of its label. LSS: Social Security Law (Ley del Seguro Social). RACERF: Regulations of the LSS on Affiliation, Classification of Companies, Collection and Audit. Texts in force, consulted in November 2026.",
        aria: "Isometric drawing of an employer’s calendar of obligations: twelve month sheets, January to December, each with the grid of its days, raised above a board, and on the left a seven-day strip with the five business days numbered. Day 17 is circled on all twelve sheets and also carries a dot in the odd-numbered months; January, May and September carry a square and February a triangle. Each label, from {a} to {b}, corresponds to one of those marks.",
        items: [
          { nom: "Affiliation notices", dato: "Hirings, terminations and wages via IDSE · 5 business days", desc: "Registration, termination and wage changes of each employee before the IMSS, via IDSE, within the following five business days. LSS, art. 15, sec. I." },
          { nom: "Specialized services (REPSE)", dato: "ICSOE and SISUB · January, May and September", desc: "For companies registered with REPSE: four-monthly informative returns on specialized services contracts, ICSOE before the IMSS and SISUB before INFONAVIT, no later than the 17th of January, May and September. LSS, art. 15-A; INFONAVIT Law, art. 29 Bis." },
          { nom: "Occupational risk premium", dato: "Once a year · in February", desc: "Annual review of the company’s accident rate to determine its premium in the occupational risk insurance; it is filed in February. LSS, art. 74; RACERF, art. 32, sec. V." },
          { nom: "Retirement (RCV) and INFONAVIT", dato: "Every two months · the 17th of odd-numbered months", desc: "Contributions for retirement, unemployment at advanced age and old age (RCV), and to INFONAVIT, every two months: no later than the 17th of January, March, May, July, September and November. LSS, twenty-seventh transitory article; INFONAVIT Law, sixth transitory article." },
          { nom: "Employer–employee contributions", dato: "Every month · by the 17th of the following month", desc: "Calculation and payment of each month’s IMSS contributions, no later than the 17th of the following month. LSS, art. 39." },
        ],
      },
      migratorio: {
        titulo: "The orderly arrival of foreign talent",
        entrada: "For a foreign executive, technician or specialist to work at the plant, three files must match: their own, that of the company that hires them and that of their family. We handle them with human resources, from the visa to residence.",
        aria: "Isometric drawing of a tower of five document trays separated along their posts, with a hand stamp on the top tray. Each tray holds the documents of one immigration filing, from {a} to {b}.",
        items: [
          { nom: "Work visa", desc: "Visa based on a job offer for executives, technicians and specialists, from the application to the entry stamp." },
          { nom: "Permit and residence", desc: "Residence card and work permit, with their validity kept under control." },
          { nom: "Employer registration with the INM", desc: "The employer’s registration certificate, the basis of every filing the company makes." },
          { nom: "Changes of status", desc: "Changes of immigration status and notices to the INM when the employee’s situation changes." },
          { nom: "Families and dependents", desc: "Family-unit filings for the spouse and children who accompany the employee." },
        ],
      },
    },
  },
};

export const ANATOMIA: Record<LanguageCode, AnatomiaTexts> = localizedRecord("anatomia", ANATOMIA_BASE);
export const FIGURAS: Record<LanguageCode, FigurasTexts> = localizedRecord("figuras", FIGURAS_BASE, (value) => {
  const translated = value as Omit<FigurasTexts, "listLabel"> & { listLabel: string };
  return { ...translated, listLabel: (n: number) => translated.listLabel.replace("{{n}}", String(n)) };
});

/** Textos de la página que no vienen de la base: fotos de cabecera, «Siguiente», etc. */
const PAGINA_BASE: Record<V3Lang, { next: string; nextAria: string; practicesAria: string; industries: string }> = {
  es: { next: "Siguiente", nextAria: "Siguiente página", practicesAria: "Prácticas", industries: "Industrias que asesoramos" },
  en: { next: "Next", nextAria: "Next page", practicesAria: "Practices", industries: "Industries we advise" },
};
export const PAGINA: Record<LanguageCode, { next: string; nextAria: string; practicesAria: string; industries: string }> = localizedRecord("pagina", PAGINA_BASE);
