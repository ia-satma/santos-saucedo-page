/* Láminas comerciales de las prácticas (24-11-2026): cada una parte de lo que le preocupa a quien contrata
   (dirección de recursos humanos, de planta o de finanzas) y termina en el servicio que lo resuelve.
   Reemplazan a las láminas que explicaban procesos (junta del 13-11-2026: «no vamos a poner tanta
   información»). Números solo de la ley, con su artículo; nada de porcentajes ni plazos inventados.
   - diagnostico (Laboral): siete situaciones del negocio; las que no están resueltas abren el dique.
   - despido (Laboral): lo que cuesta un despido que no se puede probar, mes a mes de juicio.
   - compra (Corporativo): lo que se hereda al comprar una empresa y lo que detecta la revisión previa.
   - estancias (Migratorio): la estancia que corresponde a cada persona que la empresa trae. */
import type { VivaTexto } from "./vivas";

export type ComercialId = "diagnostico" | "despido" | "compra" | "estancias";

/** Salario mínimo general diario 2026 (DOF, vigente desde el 1-1-2026): tope de la prima de antigüedad */
export const SALARIO_MINIMO = 315.04;
/** Meses de cada parada del despido (piezas 0–6 de la figura) */
export const MESES_DESPIDO = [0, 1.5, 6, 12, 18, 24, 36];

export interface CuentaDespido { indemnizacion: number; prima: number; vencidos: number; intereses: number; total: number; primaMeses: number }

/** Lo que cuesta un despido que no se puede probar a los m meses (LFT, arts. 48, 50, 162, 485 y 486).
    S: sueldo mensual integrado; A: años de antigüedad. Intereses simples del 2% mensual sobre quince meses
    de salario a partir del mes 13 (art. 48, párrafo tercero). */
export function cuentaDespido(S: number, A: number, m: number): CuentaDespido {
  const sd = S / 30;
  const indemnizacion = 90 * sd;
  const prima = 12 * A * Math.min(sd, 2 * SALARIO_MINIMO);
  const vencidos = S * Math.min(m, 12);
  const intereses = m > 12 ? 15 * S * 0.02 * (m - 12) : 0;
  return { indemnizacion, prima, vencidos, intereses, total: indemnizacion + prima + vencidos + intereses, primaMeses: S > 0 ? prima / S : 0 };
}

export interface TextosDiagnostico {
  /** [situación, lo que entra si está abierta, fundamento] */
  preguntas: [string, string, string][];
  /** {n} resueltas de {t} */
  resueltas: string;
  /** {k} abiertas */
  abiertas: string;
  cerrado: string;
  /** el rótulo de cada renglón cuando la situación está resuelta */
  si: string;
  no: string;
}

export interface TextosDespido {
  sueldo: string;
  antiguedad: string;
  anios: string;
  total: string;
  partes: { indemnizacion: string; prima: string; vencidos: string; intereses: string };
  nota: string;
  /** separador de miles y moneda */
  moneda: (n: number) => string;
}

export type TextoComercial = VivaTexto & { cap: string };

const pesos = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");

export const ES_COMERCIALES: Record<ComercialId, TextoComercial> = {
  diagnostico: {
    cap: "Diagnóstico de su empresa",
    titulo: "¿Por dónde le puede entrar una demanda a su empresa?",
    entrada: "En toda empresa con personal hay conflictos posibles. Lo que decide si llegan al tribunal es si la empresa puede probar lo que hizo. Marque las situaciones que su empresa ya tiene resueltas y vea dónde queda abierto el muro.",
    instruccion: "Marque lo que su empresa hoy tiene resuelto",
    pie: ["Dique de siete bloques", "Lo que queda abierto llega abajo"],
    piezas: [],
    diagnostico: {
      preguntas: [
        ["Si mañana tuviera que despedir a alguien, podría probar la causa y entregar el aviso por escrito.", "Despidos que el Tribunal considera injustificados por falta de prueba o de aviso.", "LFT, art. 47."],
        ["Cuando un supervisor sanciona a alguien, la sanción se sostiene porque hay una regla previa que el trabajador conoce.", "Sanciones y despidos que se caen porque no había regla previa ni constancia de que el trabajador la conocía.", "LFT, arts. 422 a 425."],
        ["Si un extrabajador reclama horas extra de un año, la empresa puede probar la jornada real.", "Reclamos de tiempo extra que la empresa paga porque la carga de la prueba es suya.", "LFT, art. 784, fr. VIII."],
        ["Si su proveedor de limpieza, vigilancia o maniobras deja de pagarle a su gente, su empresa queda fuera.", "Responder por los trabajadores de un proveedor sin registro o que no cumple.", "LFT, arts. 13 a 15."],
        ["Si mañana llega un emplazamiento a huelga por firma de contrato colectivo, la empresa ya tiene uno legitimado.", "Emplazamientos a huelga y disputas por la titularidad del contrato.", "LFT, art. 390 Ter."],
        ["Si hoy llega una inspección de la STPS, la empresa puede mostrar la NOM-035 aplicada y difundida.", "Multas por inspección y quejas por riesgo psicosocial sin política ni protocolo.", "NOM-035-STPS-2018; LFT, art. 132, fr. XXXI."],
        ["Cuando alguien se va, queda firmado un finiquito que cierra el asunto.", "Demandas de quien ya se fue, por renuncias o convenios que no se pueden probar o que no se ratificaron.", "LFT, art. 33."],
      ],
      resueltas: "Su empresa tiene resueltas {n} de {t} situaciones.",
      abiertas: "Por las {k} restantes le puede entrar una demanda. Esto es lo que hoy puede llegar al tribunal:",
      cerrado: "El muro está cerrado. Conviene confirmar que cada respaldo esté firmado y al día.",
      si: "Resuelto",
      no: "Abierto",
    },
    cierre: "Revisamos estas siete situaciones con recursos humanos y dejamos cada una con su respaldo por escrito, antes de que se necesite.",
    aria: "Dique de siete bloques entre un embalse y una charola baja. Cada situación resuelta levanta su bloque y cierra el paso; por cada bloque abierto corre un hilo de cuentas hasta la charola, que representa al tribunal.",
  },
  despido: {
    cap: "Lo que cuesta un conflicto",
    titulo: "Un despido que no se puede probar cuesta más cada mes",
    entrada: "Si la empresa no puede probar la causa, paga la indemnización y, además, un mes de sueldo por cada mes que dure el juicio, hasta un año; después corren intereses. Escriba el sueldo y la antigüedad de la persona y vea cómo crece la cuenta.",
    instruccion: "Elija hasta dónde llega el asunto",
    pie: ["Una hoja por mes de sueldo", "El marco es el tope de un año"],
    etiquetas: [],
    piezas: [
      ["El despido", "Si el despido no se puede probar, la base es la indemnización de tres meses y la prima de antigüedad."],
      ["Conciliación prejudicial", "Es la primera salida. Antes de que haya demanda se puede cerrar con un convenio; el trámite dura hasta 45 días."],
      ["Seis meses de juicio", "Cada mes de juicio suma un mes de sueldo a la cuenta."],
      ["Un año de juicio", "Los salarios vencidos llegan a su tope. Desde aquí corre un interés de 2% mensual sobre quince meses de sueldo."],
      ["Año y medio", "Ya no crecen los salarios vencidos, pero los intereses siguen sumando cada mes."],
      ["Dos años", "Los intereses ya equivalen a varios meses de sueldo."],
      ["Tres años", "Un juicio largo puede costar varias veces lo que se habría pagado al principio."],
    ],
    despido: {
      sueldo: "Sueldo mensual integrado",
      antiguedad: "Antigüedad",
      anios: "años",
      total: "Cuenta estimada",
      partes: { indemnizacion: "Indemnización (tres meses)", prima: "Prima de antigüedad (12 días por año)", vencidos: "Salarios vencidos", intereses: "Intereses (2% mensual)" },
      nota: "Cálculo orientativo con el salario mínimo de 2026 ($315.04 diarios) para el tope de la prima de antigüedad. No incluye partes proporcionales, prestaciones de contrato ni otros reclamos.",
      moneda: pesos,
    },
    cierre: "Por eso preparamos cada asunto como si fuera a llegar a juicio desde el primer día: así se negocia temprano, desde una posición firme, y la cuenta se detiene.",
    fuente: "LFT, arts. 48, 50, 162, 485, 486 y 684-D.",
    aria: "Pila de hojas sobre una base; cada hoja es un mes de sueldo. Al frente, un riel con siete postes del mes 0 al 36. Al elegir un poste la pila crece; a los doce meses un marco marca el tope de los salarios vencidos y encima siguen hojas más delgadas, los intereses. Del poste de la conciliación sale un desvío a una plataforma.",
  },
  compra: {
    cap: "Compras y fusiones",
    titulo: "Al comprar una empresa, sus pendientes con el personal pasan a ser suyos",
    entrada: "Si compra las acciones, los pendientes siguen dentro de la empresa que ahora es suya. Si compra el negocio, la ley lo hace responsable como patrón sustituto. Elija lo que puede venir dentro y vea qué detecta la revisión antes de firmar.",
    instruccion: "Elija lo que viene en la empresa que compra",
    pie: ["La empresa que se compra y la suya", "La revisión los detiene en medio"],
    etiquetas: ["Cómo aparece después de firmar", "Lo que hacemos antes"],
    piezas: [
      ["Demandas en curso", "Juicios que el vendedor no reportó o que valuó por debajo; la condena llega cuando el dueño ya es usted.", "Revisamos cada expediente, estimamos la contingencia real y la llevamos al precio o a una garantía en el contrato."],
      ["Cuotas del IMSS y del INFONAVIT", "Diferencias de salario base y cuotas omitidas que la autoridad cobra después, con actualizaciones y recargos.", "Cotejamos la nómina contra lo declarado ante el IMSS y el INFONAVIT y cuantificamos la diferencia antes del cierre."],
      ["Contrato colectivo", "Prestaciones, aumentos pactados y revisiones pendientes que obligan al nuevo dueño desde el primer día.", "Revisamos el contrato colectivo, su legitimación y su próxima revisión, y calculamos su costo."],
      ["Personal subcontratado", "Trabajadores de proveedores que la autoridad considera de la empresa, con sus cuotas y su antigüedad.", "Revisamos a cada proveedor de servicios: su registro REPSE, sus pagos y si el servicio es realmente especializado."],
      ["Antigüedad acumulada", "Primas de antigüedad y compromisos de retiro que crecen con cada año de servicio y no siempre aparecen en el balance.", "Cuantificamos el pasivo por persona y lo dejamos reflejado en el precio."],
      ["Prestaciones no escritas", "Bonos y beneficios que se pagan por costumbre y que el personal puede exigir como derecho adquirido.", "Identificamos lo que se paga fuera de contrato y decidimos con usted cómo regularizarlo."],
    ],
    cierre: "La revisión laboral antes de firmar deja cada pendiente en el precio, en una garantía o resuelto antes del cierre.",
    fuente: "LFT, art. 41 (sustitución patronal).",
    aria: "Dos edificios unidos por una banda: atrás, la empresa que se compra, con seis cajas en su patio; al frente, la empresa del comprador. A la mitad de la banda hay un arco de revisión. La caja elegida viaja por la banda y queda detenida dentro del arco.",
  },
  estancias: {
    cap: "Personal extranjero",
    titulo: "A cada persona que trae, la estancia que corresponde a lo que viene a hacer",
    entrada: "Una visita de negocios, unos meses de trabajo o dirigir la planta son trámites distintos ante el INM. Con la estancia equivocada, la persona no puede trabajar legalmente y el trámite empieza de nuevo.",
    instruccion: "Elija a quién trae",
    pie: ["Cinco puertas", "Una por cada estancia"],
    etiquetas: ["La estancia", "Lo que tramitamos"],
    piezas: [
      ["A juntas, visitas de planta o negociaciones", "Visitante sin permiso para realizar actividades remuneradas: hasta 180 días, sin recibir pago en México.", "Revisamos que lo que viene a hacer sea compatible con esa estancia y preparamos los documentos de la empresa."],
      ["A trabajar unos meses con sueldo en México", "Visitante con permiso para realizar actividades remuneradas: hasta 180 días, con una oferta de empleo.", "Tramitamos la oferta de empleo ante el INM, la visa en el consulado y la inscripción de la empresa como empleador."],
      ["A dirigir la operación de uno a cuatro años", "Residente temporal con permiso para trabajar, sujeto a una oferta de empleo; hasta cuatro años.", "Llevamos la solicitud ante el INM, la visa, el canje de la tarjeta en México y sus renovaciones."],
      ["Con su familia", "Residencia temporal por unidad familiar para su pareja y sus hijos.", "Tramitamos a la familia al mismo tiempo que al trabajador, para que lleguen juntos."],
      ["Para quedarse", "Residente permanente: estancia indefinida, con permiso para trabajar.", "Revisamos cuándo procede el cambio, por ejemplo después de cuatro años como residente temporal, y lo tramitamos."],
    ],
    cierre: "Llevamos los trámites de la empresa, del trabajador y de su familia al mismo tiempo, para que la persona llegue a trabajar con la estancia correcta.",
    fuente: "Ley de Migración, arts. 52 y 54.",
    aria: "Fachada con cinco puertas de tamaño creciente y una plaza al frente. Una persona camina desde la entrada hasta la puerta elegida, que se abre; para la familia caminan dos adultos y un niño.",
  },
};

const dolaresMx = (n: number) => "MXN " + Math.round(n).toLocaleString("en-US");

export const EN_COMERCIALES: Record<ComercialId, TextoComercial> = {
  diagnostico: {
    cap: "Your company's check-up",
    titulo: "Where could a lawsuit get into your company?",
    entrada: "Every company with employees has possible conflicts. What decides whether they reach the labor court is whether the company can prove what it did. Mark the situations your company already has covered and see where the wall is still open.",
    instruccion: "Mark what your company has covered today",
    pie: ["A dam of seven blocks", "What stays open flows down"],
    piezas: [],
    diagnostico: {
      preguntas: [
        ["If you had to dismiss someone tomorrow, you could prove the cause and deliver the written notice.", "Dismissals the Labor Court finds unjustified for lack of proof or notice.", "LFT, art. 47."],
        ["When a supervisor disciplines someone, the sanction holds because there is a prior rule the employee knows.", "Sanctions and dismissals that fall apart because there was no prior rule or proof that the employee knew it.", "LFT, arts. 422 to 425."],
        ["If a former employee claims a year of overtime, the company can prove the actual working hours.", "Overtime claims the company pays because the burden of proof is on it.", "LFT, art. 784, sec. VIII."],
        ["If your cleaning, security or handling contractor stops paying its people, your company stays out of it.", "Being liable for the workers of a contractor that is unregistered or noncompliant.", "LFT, arts. 13 to 15."],
        ["If a strike notice to sign a collective agreement arrived tomorrow, the company already has a legitimated one.", "Strike notices and disputes over who holds the agreement.", "LFT, art. 390 Ter."],
        ["If a STPS inspection arrived today, the company could show NOM-035 applied and communicated.", "Inspection fines and psychosocial-risk complaints with no policy or protocol.", "NOM-035-STPS-2018; LFT, art. 132, sec. XXXI."],
        ["When someone leaves, a signed settlement closes the matter.", "Claims from people who already left, over resignations or agreements that cannot be proven or were not ratified.", "LFT, art. 33."],
      ],
      resueltas: "Your company has {n} of {t} situations covered.",
      abiertas: "A lawsuit could get in through the other {k}. This is what could reach the court today:",
      cerrado: "The wall is closed. It is worth confirming that each record is signed and up to date.",
      si: "Covered",
      no: "Open",
    },
    cierre: "We review these seven situations with human resources and leave each one backed in writing, before it is needed.",
    aria: "A dam of seven blocks between a reservoir and a low tray. Each covered situation raises its block and closes the way; through each open block a thread of beads runs down to the tray, which stands for the court.",
  },
  despido: {
    cap: "What a conflict costs",
    titulo: "A dismissal that cannot be proven costs more every month",
    entrada: "If the company cannot prove the cause, it pays the severance and, on top of it, one month of salary for every month the trial lasts, up to a year; after that, interest runs. Enter the person's salary and seniority and watch the bill grow.",
    instruccion: "Choose how far the matter goes",
    pie: ["One sheet per month of salary", "The frame is the one-year cap"],
    etiquetas: [],
    piezas: [
      ["The dismissal", "If the dismissal cannot be proven, the base is three months' severance plus the seniority premium."],
      ["Pre-trial conciliation", "The first way out. Before there is a lawsuit, it can be closed with an agreement; the procedure lasts up to 45 days."],
      ["Six months of trial", "Every month of trial adds one month of salary to the bill."],
      ["One year of trial", "Back pay reaches its cap. From here, 2% monthly interest runs on fifteen months of salary."],
      ["A year and a half", "Back pay no longer grows, but interest keeps adding up every month."],
      ["Two years", "Interest alone now equals several months of salary."],
      ["Three years", "A long trial can cost several times what would have been paid at the start."],
    ],
    despido: {
      sueldo: "Monthly integrated salary",
      antiguedad: "Seniority",
      anios: "years",
      total: "Estimated bill",
      partes: { indemnizacion: "Severance (three months)", prima: "Seniority premium (12 days per year)", vencidos: "Back pay", intereses: "Interest (2% monthly)" },
      nota: "Indicative estimate using the 2026 minimum wage (MXN 315.04 per day) for the seniority premium cap. It excludes proportional benefits, contractual benefits and other claims.",
      moneda: dolaresMx,
    },
    cierre: "That is why we prepare every matter as if it were going to trial from day one: that is how you negotiate early, from a firm position, and stop the bill.",
    fuente: "LFT, arts. 48, 50, 162, 485, 486 and 684-D.",
    aria: "A stack of sheets on a base; each sheet is one month of salary. In front, a rail with seven posts from month 0 to 36. Choosing a post makes the stack grow; at twelve months a frame marks the back-pay cap and thinner sheets, the interest, keep piling above it. From the conciliation post a branch leads to a platform.",
  },
  compra: {
    cap: "Acquisitions and mergers",
    titulo: "When you buy a company, its pending employee matters become yours",
    entrada: "If you buy the shares, the pending matters stay inside the company that is now yours. If you buy the business, the law makes you liable as the substitute employer. Choose what may come inside and see what the review catches before signing.",
    instruccion: "Choose what comes with the company you buy",
    pie: ["The company you buy and yours", "The review stops them halfway"],
    etiquetas: ["How it shows up after signing", "What we do before"],
    piezas: [
      ["Pending lawsuits", "Cases the seller did not report or undervalued; the judgment arrives when the owner is already you.", "We review each case file, estimate the real exposure and take it to the price or to a guarantee in the agreement."],
      ["IMSS and INFONAVIT contributions", "Salary-base differences and unpaid contributions the authority collects later, with adjustments and surcharges.", "We check payroll against what was reported to the IMSS and INFONAVIT and quantify the difference before closing."],
      ["Collective agreement", "Benefits, agreed raises and pending reviews that bind the new owner from day one.", "We review the collective agreement, its legitimation and its next review, and calculate its cost."],
      ["Subcontracted staff", "Contractor workers the authority treats as the company's own, with their contributions and seniority.", "We review each service contractor: its REPSE registration, its payments and whether the service is truly specialized."],
      ["Accrued seniority", "Seniority premiums and retirement commitments that grow with every year of service and do not always show on the balance sheet.", "We quantify the liability per person and have it reflected in the price."],
      ["Unwritten benefits", "Bonuses and perks paid by custom that employees can claim as acquired rights.", "We identify what is paid outside the contract and decide with you how to regularize it."],
    ],
    cierre: "The labor review before signing puts each pending matter into the price, into a guarantee or resolves it before closing.",
    fuente: "LFT, art. 41 (employer substitution).",
    aria: "Two buildings joined by a conveyor: at the back, the company being bought, with six crates in its yard; in front, the buyer's company. Halfway along the conveyor stands a review arch. The chosen crate travels along the conveyor and is held inside the arch.",
  },
  estancias: {
    cap: "Foreign staff",
    titulo: "For each person you bring, the immigration status that matches what they come to do",
    entrada: "A business visit, a few months of work or running the plant are different procedures before the INM. With the wrong status, the person cannot work legally and the process starts over.",
    instruccion: "Choose who you are bringing",
    pie: ["Five doors", "One for each status"],
    etiquetas: ["The status", "What we handle"],
    piezas: [
      ["For meetings, plant visits or negotiations", "Visitor without permission to engage in paid activities: up to 180 days, with no pay in Mexico.", "We check that what they come to do fits that status and prepare the company's documents."],
      ["To work a few months, paid in Mexico", "Visitor with permission to engage in paid activities: up to 180 days, with a job offer.", "We file the job offer with the INM, the visa at the consulate and the company's registration as an employer."],
      ["To run the operation for one to four years", "Temporary resident with a work permit, subject to a job offer; up to four years.", "We handle the INM application, the visa, the card exchange in Mexico and its renewals."],
      ["With their family", "Temporary residence on family-unity grounds for their partner and children.", "We file for the family at the same time as the employee, so they arrive together."],
      ["To stay", "Permanent resident: indefinite stay, with permission to work.", "We check when the change applies, for example after four years as a temporary resident, and file it."],
    ],
    cierre: "We handle the company's, the employee's and the family's procedures at the same time, so the person arrives to work with the right status.",
    fuente: "Mexican Migration Law, arts. 52 and 54.",
    aria: "A facade with five doors of growing size and a plaza in front. A person walks from the entrance to the chosen door, which opens; for the family, two adults and a child walk.",
  },
};
