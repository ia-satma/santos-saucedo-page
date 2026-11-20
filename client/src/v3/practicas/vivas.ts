/* Láminas vivas 3/7 a 7/7 de las prácticas (demo del 9-11-2026, «Láminas que se entienden al moverlas»).
   Cada figura vive en su propio documento (public/v3/laminas/<id>.html, lienzo y motor de las láminas);
   a la derecha, el texto que cambia con lo que hace el visitante. Textos de la demo; inglés propio.
   Otros idiomas usan el inglés hasta que tengan traducción. */
import type { LanguageCode } from "@shared/constants";

export type VivaId = "prevencion" | "juicio" | "corporativo" | "seguridad" | "migratorio";

export interface VivaTexto {
  titulo: string;
  entrada: string;
  instruccion: string;
  pie: [string, string];
  /** etiquetas de las columnas del detalle (las piezas traen [nombre, ...valores]) */
  etiquetas?: string[];
  piezas?: string[][];
  /** seguridad social: los doce meses en lugar de piezas */
  meses?: boolean;
  cierre: string;
  fuente?: string;
  /** lo que la figura dibuja, para quien no la ve */
  aria: string;
}

export interface VivasComun {
  lamina: string;
  lugar: string;
  espera: string;
  figura: string;
  meses: string[];
  todoElAnio: string;
  idse: [string, string];
  obligaciones: { cuotas: [string, string]; bimestre: [string, string]; repse: [string, string]; prima: [string, string] };
}

const ES_COMUN: VivasComun = {
  lamina: "Lámina",
  lugar: "San Pedro Garza García",
  espera: "Cargando la figura…",
  figura: "figura interactiva",
  meses: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  todoElAnio: "Todo el año",
  idse: ["Altas, bajas y cambios de salario por IDSE dentro de los cinco días hábiles siguientes.", "LSS, art. 15, fr. I."],
  obligaciones: {
    cuotas: ["Cuotas obrero-patronales del IMSS del mes anterior, a más tardar el día 17.", "LSS, art. 39."],
    bimestre: ["Retiro, cesantía y vejez, e INFONAVIT, del bimestre anterior, a más tardar el día 17.", "LSS, art. vigésimo séptimo transitorio; Ley del INFONAVIT, art. sexto transitorio."],
    repse: ["ICSOE ante el IMSS y SISUB ante el INFONAVIT, para empresas con registro REPSE, a más tardar el día 17.", "LSS, art. 15-A; Ley del INFONAVIT, art. 29 Bis."],
    prima: ["Determinación anual de la prima de riesgo de trabajo, en febrero.", "LSS, art. 74; RACERF, art. 32, fr. V."],
  },
};

const EN_COMUN: VivasComun = {
  lamina: "Plate",
  lugar: "San Pedro Garza García",
  espera: "Loading the figure…",
  figura: "interactive figure",
  meses: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  todoElAnio: "All year",
  idse: ["Hires, terminations and salary changes through IDSE within the following five business days.", "LSS, art. 15, sec. I."],
  obligaciones: {
    cuotas: ["IMSS employer and employee contributions for the previous month, by the 17th at the latest.", "LSS, art. 39."],
    bimestre: ["Retirement, severance and old age, and INFONAVIT, for the previous two-month period, by the 17th at the latest.", "LSS, twenty-seventh transitory article; INFONAVIT Law, sixth transitory article."],
    repse: ["ICSOE with the IMSS and SISUB with INFONAVIT, for companies registered with REPSE, by the 17th at the latest.", "LSS, art. 15-A; INFONAVIT Law, art. 29 Bis."],
    prima: ["Annual determination of the occupational risk premium, in February.", "LSS, art. 74; RACERF, art. 32, sec. V."],
  },
};

const ES: Record<VivaId, VivaTexto> = {
  prevencion: {
    titulo: "Lo que se previene no llega al tribunal",
    entrada: "Cada documento en orden detiene un tipo de conflicto antes de que se convierta en demanda. Retire una capa y vea qué se cuela hasta abajo.",
    instruccion: "Elija una criba",
    pie: ["Siete cribas", "La charola de abajo es el tribunal"],
    etiquetas: ["Lo que detiene", "Fundamento"],
    piezas: [
      ["Contrato individual de trabajo", "Reclamos por un salario, un puesto o una jornada que nunca quedaron por escrito.", "Si no hay contrato escrito, la falta se imputa al patrón. LFT, art. 26."],
      ["Reglamento interior de trabajo", "Sanciones y despidos que se caen porque no había una regla previa que los sostuviera.", "Contenido, depósito ante el Tribunal y difusión. LFT, arts. 422 a 425."],
      ["Contrato colectivo legitimado", "Emplazamientos a huelga por firma de contrato y disputas por la titularidad.", "Aprobación de los trabajadores por voto personal, libre y secreto. LFT, art. 390 Ter."],
      ["Registro de asistencia", "Reclamos de horas extra sin prueba en contrario: en juicio, la jornada la prueba la empresa.", "LFT, art. 784, fr. VIII."],
      ["REPSE · servicios especializados", "Responder por los trabajadores de un proveedor que no cumple con ellos.", "Responsabilidad solidaria. LFT, arts. 13 a 15."],
      ["NOM-035 · riesgo psicosocial", "Multas y reclamos por riesgo psicosocial o violencia laboral sin política ni atención.", "NOM-035-STPS-2018."],
      ["Expediente de cada trabajador", "Una defensa sin documentos: si la empresa no exhibe lo que debe conservar, se presumen ciertos los hechos que afirma el trabajador.", "LFT, arts. 804 y 805."],
    ],
    cierre: "Por eso empezamos por el expediente: ordenar un documento cuesta menos que defender su ausencia.",
    aria: "Pila de siete cribas redondas entre una tolva y una charola. Cada criba retiene sus propias cuentas; al retirar una, sus cuentas caen por el hueco hasta la charola, que es el tribunal.",
  },
  juicio: {
    titulo: "Cada etapa es una oportunidad de cerrar bien el asunto",
    entrada: "En cada etapa del juicio laboral se puede llegar a un convenio. Llegamos a todas preparados para la siguiente: así se negocia desde una posición firme y, si no hay acuerdo, el juicio ya está listo.",
    instruccion: "Elija una etapa",
    pie: ["Siete esclusas", "Cada una con su salida por convenio"],
    etiquetas: ["Qué pasa", "Qué hacemos", "Fundamento"],
    piezas: [
      ["Conciliación prejudicial", "Antes de demandar, las partes acuden al Centro de Conciliación. El procedimiento no debe pasar de 45 días naturales, y el convenio que ahí se firma tiene fuerza de cosa juzgada.", "Llegamos con el expediente revisado y un rango de arreglo autorizado por la empresa.", "LFT, arts. 684-A a 684-E."],
      ["Demanda", "Sin convenio, el trabajador demanda ante el Tribunal Laboral con la constancia de no conciliación.", "Contrastamos cada hecho y cada monto de la demanda con el expediente de la empresa.", ""],
      ["Emplazamiento", "El Tribunal notifica la demanda a la empresa. Desde ese día corren quince días para contestar.", "Ese mismo día se reúne el equipo que conoce la operación del cliente.", "LFT, art. 873-A."],
      ["Contestación y pruebas", "La empresa contesta, opone sus excepciones y defensas, y ofrece sus pruebas.", "Cada hecho se contesta con el documento o el testigo que lo prueba.", "LFT, art. 873-A."],
      ["Audiencia preliminar", "Se depura el procedimiento, se fijan los hechos que no están en disputa y se admiten las pruebas. Aquí también puede cerrarse un convenio ante el Tribunal.", "Llevamos una propuesta de convenio junto con la estrategia de juicio.", ""],
      ["Audiencia de juicio", "Se desahogan las pruebas y se formulan los alegatos.", "Interrogatorios y alegatos preparados desde la contestación.", ""],
      ["Sentencia y amparo directo", "El Tribunal dicta sentencia. Contra ella procede el amparo directo ante el Tribunal Colegiado de Circuito.", "Evaluamos el amparo con el expediente completo y el mismo equipo.", ""],
    ],
    cierre: "Pocas cosas acercan tanto un buen convenio como una contraparte que sabe que el juicio ya está preparado.",
    aria: "Escalera de siete esclusas con compuertas en V. Una barca baja de esclusa en esclusa; cada una tiene a un costado una rampa hacia un estanque, la salida por convenio, que se abre en la etapa elegida.",
  },
  corporativo: {
    titulo: "Cada documento de la empresa toca a su personal",
    entrada: "Un contrato mercantil o un acuerdo de asamblea también tienen efectos con los trabajadores. Abra un cajón: este es el efecto laboral que revisamos en cada uno.",
    instruccion: "Abra un cajón",
    pie: ["Archivero de cinco cajones", "Una hoja por cajón"],
    etiquetas: ["Efecto laboral", "Qué revisamos", "Fundamento"],
    piezas: [
      ["Acta constitutiva y poderes", "Quien comparece por la empresa ante el Centro de Conciliación o el Tribunal debe acreditar su personalidad con un poder suficiente.", "Poderes vigentes, con facultades en materia laboral, para cada apoderado.", "LFT, art. 692."],
      ["Contratos con proveedores y clientes", "Un contrato que pone personal propio a disposición de otra empresa es subcontratación prohibida.", "Que ningún contrato de servicios oculte una relación de trabajo.", "LFT, art. 12."],
      ["Servicios especializados (REPSE)", "Si el prestador no cumple con sus trabajadores, la empresa que lo contrató responde solidariamente.", "Registro vigente, objeto especializado y comprobantes periódicos del prestador.", "LFT, arts. 13 a 15."],
      ["Asambleas, fusiones y escisiones", "En una fusión, una escisión o la venta de una unidad, las obligaciones laborales pasan al nuevo patrón.", "Pasivos laborales y plantillas antes de cada operación.", "Sustitución patronal. LFT, art. 41."],
      ["Políticas y cumplimiento", "Sin protocolo contra el hostigamiento y el acoso, ni política de riesgo psicosocial, no hay base para investigar ni para sancionar.", "El protocolo, la política de NOM-035 y su difusión entre el personal.", "LFT, art. 132, fr. XXXI; NOM-035-STPS-2018."],
    ],
    cierre: "Por eso cada documento corporativo pasa también por la mirada laboral.",
    aria: "Archivero metálico de cinco cajones junto a la plantilla de una empresa, doce figuras sobre una plataforma. Al abrir un cajón sube una hoja y un hilo la une con las personas a las que ese documento afecta.",
  },
  seguridad: {
    titulo: "Cada mes vence algo ante el IMSS y el INFONAVIT",
    entrada: "Recorra el año. Estas son las obligaciones que vencen en cada mes: las llevamos al día y defendemos a la empresa cuando la autoridad las revisa.",
    instruccion: "Recorra los meses",
    pie: ["Doce hojas de mes", "Se levanta lo que vence"],
    meses: true,
    cierre: "Un plazo vencido genera actualizaciones y recargos; por eso el calendario se lleva al día con cada nómina.",
    fuente: "LSS: Ley del Seguro Social. RACERF: su Reglamento en materia de Afiliación, Clasificación de Empresas, Recaudación y Fiscalización. Textos vigentes, consultados en noviembre de 2026.",
    aria: "Fichero de doce hojas de mes sobre un tablero con un riel. En el día 17 de cada hoja hay fichas; la hoja elegida se levanta y sus fichas flotan al frente.",
  },
  migratorio: {
    titulo: "Tres expedientes que tienen que coincidir",
    entrada: "Para que un directivo, técnico o especialista extranjero trabaje en la planta deben coincidir tres expedientes: el suyo, el de la empresa que lo contrata y el de su familia. Alinee los tres.",
    instruccion: "Elija cada disco para alinear su ranura",
    pie: ["Tres discos con ranura", "El perno pasa cuando coinciden"],
    etiquetas: ["Qué incluye", "Qué hacemos"],
    piezas: [
      ["El trabajador", "Visa por oferta de empleo, tarjeta de residencia y permiso para trabajar.", "Llevamos cada vigencia y su renovación antes de que venza."],
      ["La empresa", "Constancia de inscripción del empleador ante el INM y la oferta de empleo que respalda el trámite.", "Mantenemos la constancia al día: es la base de cada trámite de la empresa."],
      ["La familia", "Trámites por unidad familiar para el cónyuge y los hijos que acompañan al trabajador.", "Coordinamos sus fechas con las del trabajador para que nadie quede fuera."],
      ["Los tres en orden", "El trabajador entra al país y se queda en regla, con su familia.", "Avisamos al INM cada cambio de condición, de domicilio o de empleador, junto con recursos humanos."],
    ],
    cierre: "Llevamos los tres expedientes con recursos humanos, de la visa a la residencia.",
    aria: "Tres discos gruesos con una ranura cada uno, apilados sobre un eje, con un perno arriba y una base con puerta abajo. Al alinear las tres ranuras, el perno baja por ellas y la puerta se abre.",
  },
};

const EN: Record<VivaId, VivaTexto> = {
  prevencion: {
    titulo: "What is prevented never reaches the court",
    entrada: "Each document kept in order stops one kind of dispute before it turns into a lawsuit. Pull out a layer and see what falls through to the bottom.",
    instruccion: "Choose a sieve",
    pie: ["Seven sieves", "The tray below is the labor court"],
    etiquetas: ["What it stops", "Legal basis"],
    piezas: [
      ["Individual employment contract", "Claims over a wage, a position or working hours that were never put in writing.", "Without a written contract, the omission is attributed to the employer. LFT, art. 26."],
      ["Internal work regulations", "Sanctions and dismissals that fall apart because no prior rule supported them.", "Content, filing with the Court and publication. LFT, arts. 422 to 425."],
      ["Legitimized collective agreement", "Strike notices to force a signature, and disputes over who holds the agreement.", "Approval by the workers through a personal, free and secret vote. LFT, art. 390 Ter."],
      ["Attendance records", "Overtime claims with no evidence to the contrary: at trial, the company must prove the working hours.", "LFT, art. 784, sec. VIII."],
      ["REPSE · specialized services", "Answering for a supplier's workers when the supplier fails them.", "Joint liability. LFT, arts. 13 to 15."],
      ["NOM-035 · psychosocial risk", "Fines and claims for psychosocial risk or workplace violence with no policy or response in place.", "NOM-035-STPS-2018."],
      ["Each employee's file", "A defense without documents: if the company does not produce what it must keep, the facts the worker asserts are presumed true.", "LFT, arts. 804 and 805."],
    ],
    cierre: "That is why we start with the file: putting a document in order costs less than defending its absence.",
    aria: "A stack of seven round sieves between a hopper and a tray. Each sieve holds its own beads; when one is pulled out, its beads fall through to the tray, which is the court.",
  },
  juicio: {
    titulo: "Every stage is a chance to close the matter well",
    entrada: "A settlement can be reached at every stage of a labor trial. We arrive at each one prepared for the next: that is how we negotiate from a firm position and, if there is no agreement, the trial is already prepared.",
    instruccion: "Choose a stage",
    pie: ["Seven locks", "Each with its settlement exit"],
    etiquetas: ["What happens", "What we do", "Legal basis"],
    piezas: [
      ["Pre-trial conciliation", "Before suing, the parties go to the Conciliation Center. The procedure may not exceed 45 calendar days, and a settlement signed there has the force of a final judgment.", "We arrive with the file reviewed and a settlement range authorized by the company.", "LFT, arts. 684-A to 684-E."],
      ["Complaint", "Without a settlement, the worker sues before the Labor Court with the certificate of non-conciliation.", "We test every fact and every amount in the complaint against the company's file.", ""],
      ["Service of process", "The Court serves the complaint on the company. From that day, it has fifteen days to answer.", "That same day, the team that knows the client's operations meets.", "LFT, art. 873-A."],
      ["Answer and evidence", "The company answers, raises its exceptions and defenses, and offers its evidence.", "Every fact is answered with the document or witness that proves it.", "LFT, art. 873-A."],
      ["Preliminary hearing", "The proceedings are narrowed, the undisputed facts are set and the evidence is admitted. A settlement before the Court can also be closed here.", "We bring a settlement proposal together with the trial strategy.", ""],
      ["Trial hearing", "The evidence is presented and closing arguments are made.", "Examinations and arguments prepared from the answer onward.", ""],
      ["Judgment and direct amparo", "The Court issues its judgment. A direct amparo before the Collegiate Circuit Court may be filed against it.", "We assess the amparo with the complete file and the same team.", ""],
    ],
    cierre: "Few things bring a good settlement closer than an opponent who knows the trial is already prepared.",
    aria: "A staircase of seven locks with V-shaped gates. A boat goes down from lock to lock; each lock has a side ramp to a pond, the settlement exit, which opens at the chosen stage.",
  },
  corporativo: {
    titulo: "Every company document touches its people",
    entrada: "A commercial contract or a shareholders' resolution also has effects on the workforce. Open a drawer: this is the labor effect we review in each one.",
    instruccion: "Open a drawer",
    pie: ["Five-drawer cabinet", "One sheet per drawer"],
    etiquetas: ["Labor effect", "What we review", "Legal basis"],
    piezas: [
      ["Articles of incorporation and powers", "Whoever appears for the company before the Conciliation Center or the Court must prove their standing with a sufficient power of attorney.", "Current powers of attorney, with authority in labor matters, for each representative.", "LFT, art. 692."],
      ["Contracts with suppliers and clients", "A contract that places the company's own staff at another company's disposal is prohibited subcontracting.", "That no services contract hides an employment relationship.", "LFT, art. 12."],
      ["Specialized services (REPSE)", "If the provider fails its workers, the company that hired it is jointly liable.", "Current registration, specialized purpose and the provider's periodic proof of compliance.", "LFT, arts. 13 to 15."],
      ["Shareholders' meetings, mergers and spin-offs", "In a merger, a spin-off or the sale of a business unit, labor obligations pass to the new employer.", "Labor liabilities and headcount before each transaction.", "Employer substitution. LFT, art. 41."],
      ["Policies and compliance", "Without a protocol against harassment, or a psychosocial risk policy, there is no basis to investigate or to sanction.", "The protocol, the NOM-035 policy and how they are communicated to staff.", "LFT, art. 132, sec. XXXI; NOM-035-STPS-2018."],
    ],
    cierre: "That is why every corporate document also goes through a labor review.",
    aria: "A five-drawer metal cabinet next to a company's workforce, twelve figures on a platform. When a drawer opens, a sheet rises and a thread links it to the people that document affects.",
  },
  seguridad: {
    titulo: "Something falls due with the IMSS and INFONAVIT every month",
    entrada: "Move through the year. These are the obligations that fall due each month: we keep them current and defend the company when the authorities review them.",
    instruccion: "Move through the months",
    pie: ["Twelve month sheets", "What falls due rises"],
    meses: true,
    cierre: "A missed deadline triggers adjustments and surcharges; that is why the calendar is kept current with every payroll.",
    fuente: "LSS: Social Security Law. RACERF: its Regulations on Registration, Classification of Companies, Collection and Audit. Current texts, consulted in November 2026.",
    aria: "A file of twelve month sheets on a board with a rail. On the 17th of each sheet there are tokens; the chosen sheet lifts and its tokens float forward.",
  },
  migratorio: {
    titulo: "Three files that have to line up",
    entrada: "For a foreign executive, technician or specialist to work at the plant, three files must line up: theirs, the hiring company's and their family's. Line up all three.",
    instruccion: "Choose each disc to line up its slot",
    pie: ["Three slotted discs", "The bolt drops when they line up"],
    etiquetas: ["What it includes", "What we do"],
    piezas: [
      ["The worker", "Visa based on a job offer, residence card and work permit.", "We track each expiry date and its renewal before it lapses."],
      ["The company", "The employer's registration certificate with the INM and the job offer that supports the application.", "We keep the certificate current: it is the basis of every application the company files."],
      ["The family", "Family-unit applications for the spouse and children who accompany the worker.", "We coordinate their dates with the worker's so no one is left out."],
      ["All three in order", "The worker enters the country and stays in good standing, with their family.", "We notify the INM of every change of status, address or employer, together with human resources."],
    ],
    cierre: "We handle all three files with human resources, from the visa to residence.",
    aria: "Three thick discs with a slot each, stacked on a shaft, with a bolt above and a base with a door below. When the three slots line up, the bolt drops through them and the door opens.",
  },
};

export function vivasTexto(lang: LanguageCode): { L: Record<VivaId, VivaTexto>; C: VivasComun; lang: "es" | "en" } {
  return lang === "es" ? { L: ES, C: ES_COMUN, lang: "es" } : { L: EN, C: EN_COMUN, lang: "en" };
}

/** Obligaciones del mes m (0 = enero): los mismos plazos y artículos de la lámina anterior */
export function obligaciones(m: number, C: VivasComun): [string, string][] {
  const o: [string, string][] = [C.obligaciones.cuotas];
  if (m % 2 === 0) o.push(C.obligaciones.bimestre);
  if (m === 0 || m === 4 || m === 8) o.push(C.obligaciones.repse);
  if (m === 1) o.push(C.obligaciones.prima);
  return o;
}
