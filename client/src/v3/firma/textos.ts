/* «Nuestra firma» (/about): los textos nuevos de la demo v3, en español (tal cual la demo) y en inglés.
   Los demás idiomas ven el inglés con lang="en" en su bloque (useV3Lang). Los textos que el sitio ya
   tenía en diez idiomas (historia, «Cómo trabajamos», cifras) siguen en pages/About.tsx y el CMS. */
import type { V3Lang } from "@/v3/shared";

export type Pieza = { nom: string; parte: string; desc: string; tag: string };
export type Lamina = {
  h: string;
  p: string[];
  listaLabel: string;
  piezas: Pieza[];
  svgLabel: string;
  cajetin: string;
  nota?: string;
};

export type FirmaTextos = {
  cabAlt: string;
  lead: string;
  cabP: string;
  cuadroAlt: string;
  cuadroCap: string;
  cuadroTexto: string;
  lema: [{ antes: string; em: string; fin: string }, { antes: string; em: string; fin: string }];
  notas: [string, string];
  lamina: string;
  lugar: string;
  carnero: Lamina;
  reaccion: Lamina;
  siguiente: string;
  siguienteLabel: string;
};

export const TEXTOS: Record<V3Lang, FirmaTextos> = {
  es: {
    cabAlt: "La luna llena sale entre dos crestas de la sierra, al anochecer",
    lead: "Santos & Saucedo nació en San Pedro Garza García con una práctica dedicada a las empresas. Desde entonces asesora a grupos industriales mexicanos, a multinacionales y a empresas de capital asiático en las decisiones que involucran a su personal.",
    cabP: "La contratación, la organización del trabajo, la relación con el sindicato, la terminación de una relación laboral y la defensa ante las autoridades y los tribunales. Un cliente con plantas en varios estados recibe el mismo criterio en todas ellas, a través de una alianza de despachos especializados.",
    cuadroAlt: "Sala de juntas de Santos & Saucedo con el tríptico de la firma: tres lienzos abstractos de color con las líneas del Cerro de la Silla",
    cuadroCap: "El cuadro principal",
    cuadroTexto: "Tríptico de la sala de juntas, con las líneas del Cerro de la Silla.",
    lema: [
      { antes: "Nuestra prioridad: la ", em: "prevención", fin: "." },
      { antes: "En caso de conflicto: la ", em: "solución", fin: "." },
    ],
    notas: [
      "Preparamos a cada empresa para cumplir con la ley laboral antes de que surja un conflicto: contratos bien redactados, expedientes en orden, negociaciones preparadas con tiempo. El mejor cumplimiento laboral es la mejor defensa.",
      "Cuando el conflicto llega, trabajamos como abogados de juicio: el mismo equipo que conoce la operación del cliente prepara cada asunto como si fuera a llegar al tribunal. Esa preparación es la que nos permite negociar mejor y, muchas veces, resolver antes.",
    ],
    lamina: "Lámina",
    lugar: "San Pedro Garza García",
    carnero: {
      h: "Preparados para el litigio",
      p: [
        "Preparamos cada asunto como si fuera a llegar a juicio. Esa preparación es la que respalda cada negociación: se negocia mejor cuando el caso ya está listo para defenderse.",
        "Nuestra prioridad es la prevención. Si hay un conflicto, la empresa ya está lista.",
      ],
      listaLabel: "Guías del plano y lo que significan para la firma",
      piezas: [
        { nom: "Preparación de juicio", parte: "Cuerno", tag: "Cuerno", desc: "Cada asunto se arma como si fuera a llegar a juicio: hechos, documentos, testigos y estrategia. Esa preparación es la que resiste el impacto." },
        { nom: "Negociación respaldada", parte: "Línea de impacto", tag: "Línea de impacto", desc: "Una negociación respaldada por una defensa bien preparada se sostiene mejor. La otra parte sabe que el asunto puede llegar a juicio." },
        { nom: "La prevención", parte: "Centro de masa", tag: "Centro de masa", desc: "El cumplimiento al día —contratos, reglamento interior, contrato colectivo e IMSS— es el peso que da estabilidad a la empresa antes de cualquier conflicto." },
        { nom: "Un expediente en orden", parte: "Reacción del suelo", tag: "Reacción del suelo", desc: "La base sobre la que se apoya la defensa: documentos completos, firmados y localizables." },
        { nom: "Listos si hay conflicto", parte: "Postura", tag: "Postura", desc: "Prevención primero. Si el conflicto llega, la empresa ya está de pie y preparada." },
      ],
      svgLabel: "Plano de un borrego cimarrón de perfil, con el cuerno en espiral trazado sobre sus líneas de construcción y guías que marcan la línea de impacto, el centro de masa, el peso, la reacción del suelo en las pezuñas y el ángulo de la postura.",
      cajetin: "Preparados para el litigio",
      nota: "Borrego cimarrón (Ovis canadensis), de las sierras del norte de México.",
    },
    reaccion: {
      h: "Capacidad de reacción",
      p: [
        "Una empresa preparada no improvisa cuando llega el conflicto. El orden que construimos para prevenir —contratos, contrato colectivo, nóminas y registros ante el IMSS— es el mismo que sostiene la defensa cuando llega un emplazamiento a huelga, una inspección o una demanda.",
        "Por eso la prevención y la reacción no son dos servicios distintos: son la misma pieza, armada antes de necesitarla.",
      ],
      listaLabel: "Etapas del motor y lo que hacemos en cada una cuando llega un conflicto",
      piezas: [
        { nom: "Emplazamiento, inspección o demanda", parte: "Fan", tag: "Fan", desc: "Llega el conflicto: un emplazamiento a huelga, una visita de inspección de la STPS o una demanda individual o colectiva. Se lee completo y se identifica qué se pide y ante quién." },
        { nom: "El expediente ya armado", parte: "Compresor", tag: "Compresor", desc: "Contratos individuales, contrato colectivo, nóminas y registros ante el IMSS: lo que la prevención dejó en orden se reúne para el caso." },
        { nom: "La estrategia", parte: "Combustión", tag: "Combustión", desc: "Con los hechos y las pruebas a la vista se decide la ruta: negociar, conciliar o defender." },
        { nom: "La conciliación", parte: "Turbina", tag: "Turbina", desc: "La audiencia de conciliación ante el Centro Federal de Conciliación y Registro Laboral o el centro local que corresponda, con la empresa preparada para negociar." },
        { nom: "La defensa en juicio", parte: "Tobera", tag: "Tobera", desc: "Si no hay acuerdo, la defensa ante el Tribunal Laboral con el mismo expediente: contestación, pruebas y audiencias." },
      ],
      svgLabel: "Plano isométrico de un turbofán de avión de combate con el cárter recortado. Se separa en cinco etapas a lo largo de su eje, del fan a la tobera, y después vuelve a armarse dentro del fuselaje de un avión de combate de dos derivas, que se dibuja alrededor del motor.",
      cajetin: "Capacidad de reacción",
    },
    siguiente: "Siguiente",
    siguienteLabel: "Siguiente página",
  },
  en: {
    cabAlt: "The full moon rises between two mountain ridges at dusk",
    lead: "Santos & Saucedo was founded in San Pedro Garza García with a practice devoted to employers. Since then it has advised Mexican industrial groups, multinational companies and Asian-owned businesses on the decisions that involve their workforce.",
    cabP: "Hiring, the organization of work, the relationship with the union, the termination of employment, and the defense before the authorities and the courts. A client with plants in several states receives the same judgment in all of them, through an alliance of specialized firms.",
    cuadroAlt: "The Santos & Saucedo boardroom with the firm’s triptych: three abstract canvases in color with the lines of the Cerro de la Silla",
    cuadroCap: "The principal painting",
    cuadroTexto: "The boardroom triptych, with the lines of the Cerro de la Silla.",
    lema: [
      { antes: "Our priority: ", em: "prevention", fin: "." },
      { antes: "In the event of a dispute: ", em: "resolution", fin: "." },
    ],
    notas: [
      "We prepare each company to comply with labor law before a dispute arises: well-drafted contracts, files in order, negotiations prepared well in advance. Sound labor compliance is the best defense.",
      "When a dispute arrives, we work as trial lawyers: the same team that knows the client’s operations prepares each matter as if it were going to court. That preparation is what allows us to negotiate better and, often, to resolve matters sooner.",
    ],
    lamina: "Plate",
    lugar: "San Pedro Garza García",
    carnero: {
      h: "Prepared for litigation",
      p: [
        "We prepare every matter as if it were going to trial. That preparation is what stands behind every negotiation: one negotiates better when the case is already ready to be defended.",
        "Our priority is prevention. If a dispute arises, the company is already prepared.",
      ],
      listaLabel: "Guides on the drawing and what they mean for the firm",
      piezas: [
        { nom: "Trial preparation", parte: "Horn", tag: "Horn", desc: "Every matter is built as if it were going to trial: facts, documents, witnesses and strategy. That preparation is what withstands the impact." },
        { nom: "Negotiation with backing", parte: "Line of impact", tag: "Line of impact", desc: "A negotiation backed by a well-prepared defense holds up better. The other party knows the matter can go to trial." },
        { nom: "Prevention", parte: "Center of mass", tag: "Center of mass", desc: "Up-to-date compliance — contracts, internal work rules, the collective bargaining agreement and IMSS — is the weight that keeps the company stable before any dispute." },
        { nom: "A file in order", parte: "Ground reaction", tag: "Ground reaction", desc: "The base on which the defense rests: documents that are complete, signed and easy to locate." },
        { nom: "Ready if a dispute arises", parte: "Stance", tag: "Stance", desc: "Prevention first. If a dispute comes, the company is already on its feet and prepared." },
      ],
      svgLabel: "Drawing of a bighorn sheep in profile, with its spiral horn traced over the construction lines and guides that mark the line of impact, the center of mass, the weight, the ground reaction at the hooves and the angle of the stance.",
      cajetin: "Prepared for litigation",
      nota: "Bighorn sheep (Ovis canadensis), from the mountain ranges of northern Mexico.",
    },
    reaccion: {
      h: "Capacity to respond",
      p: [
        "A prepared company does not improvise when a dispute arrives. The order we build to prevent conflict — contracts, the collective bargaining agreement, payroll and IMSS filings — is the same order that sustains the defense when a strike notice, an inspection or a lawsuit arrives.",
        "That is why prevention and response are not two separate services: they are the same piece, assembled before it is needed.",
      ],
      listaLabel: "Stages of the engine and what we do at each one when a dispute arrives",
      piezas: [
        { nom: "Strike notice, inspection or lawsuit", parte: "Fan", tag: "Fan", desc: "The dispute arrives: a strike notice, an inspection visit by the STPS (the federal labor ministry) or an individual or collective lawsuit. It is read in full to identify what is being sought and before whom." },
        { nom: "The file, already assembled", parte: "Compressor", tag: "Compressor", desc: "Individual contracts, the collective bargaining agreement, payroll and IMSS filings: what prevention left in order is gathered for the case." },
        { nom: "The strategy", parte: "Combustor", tag: "Combustor", desc: "With the facts and the evidence in view, the course is set: negotiate, conciliate or defend." },
        { nom: "Conciliation", parte: "Turbine", tag: "Turbine", desc: "The conciliation hearing before the Federal Center for Labor Conciliation and Registration or the competent local center, with the company prepared to negotiate." },
        { nom: "The defense at trial", parte: "Nozzle", tag: "Nozzle", desc: "If there is no agreement, the defense before the Labor Court with the same file: the answer to the claim, the evidence and the hearings." },
      ],
      svgLabel: "Isometric drawing of a fighter-jet turbofan with a cutaway casing. It separates into five stages along its axis, from the fan to the nozzle, and then reassembles inside the fuselage of a twin-tail fighter jet that is drawn around the engine.",
      cajetin: "Capacity to respond",
    },
    siguiente: "Next",
    siguienteLabel: "Next page",
  },
};

/* La fachada de la oficina: su pie y su texto alternativo son los que la portada usaba en «La firma»
   (CMS home.firma, en español y en inglés). Se leen del CMS con estos valores de respaldo. */
export const HOME_FIRMA = {
  es: {
    firma: {
      caption: "Río Tamazunchale 205 Norte, San Pedro Garza García. En el cristal, el Cerro de la Silla.",
      alt: "Fachada de cristal de las oficinas de Santos & Saucedo con el Cerro de la Silla reflejado",
    },
  },
  en: {
    firma: {
      caption: "Río Tamazunchale 205 Norte, San Pedro Garza García. In the glass, the Cerro de la Silla.",
      alt: "Glass facade of the Santos & Saucedo offices reflecting the Cerro de la Silla",
    },
  },
};
