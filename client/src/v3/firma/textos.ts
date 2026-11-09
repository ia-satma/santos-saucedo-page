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
      // Junta del 6-11-2026: Mario leyó el carnero como «choque, litigio» y preguntó por qué; lo que lo
      // convenció fue la otra lectura: va siempre hacia adelante y persiste hasta conseguir. La lámina
      // la dice ella misma, porque el visitante no tendrá a nadie que se la explique.
      h: "Siempre hacia adelante",
      p: [
        "El borrego cimarrón sube por las sierras del norte de México donde no parece haber camino. No retrocede ni se detiene hasta llegar. Así llevamos cada asunto: con paso firme y con persistencia, hasta conseguir el resultado.",
        "Esa persistencia descansa en la preparación. Cada asunto se prepara como si fuera a llegar a juicio; por eso se negocia desde una posición firme y casi siempre se resuelve antes.",
      ],
      listaLabel: "Guías del plano y lo que significan para la firma",
      piezas: [
        { nom: "Determinación", parte: "Cuerno", tag: "Cuerno", desc: "Cada asunto tiene un objetivo claro desde el primer día, y la firma no lo suelta hasta conseguirlo." },
        { nom: "Sin retroceder", parte: "Línea de avance", tag: "Línea de avance", desc: "Ante un obstáculo, la firma no retrocede: busca el camino y sigue. Una negociación respaldada por un caso bien preparado avanza mejor." },
        { nom: "La prevención", parte: "Centro de masa", tag: "Centro de masa", desc: "El cumplimiento al día —contratos, reglamento interior, contrato colectivo e IMSS— es el peso que da estabilidad a la empresa antes de cualquier conflicto." },
        { nom: "Paso firme", parte: "Apoyo en la roca", tag: "Apoyo en la roca", desc: "Un expediente en orden es la roca donde se apoya cada paso: documentos completos, firmados y localizables." },
        { nom: "Persistencia", parte: "Postura", tag: "Postura", desc: "Prevención primero. Si el conflicto llega, la empresa ya está de pie, y la firma sigue con ella hasta el final." },
      ],
      svgLabel: "Plano de un borrego cimarrón de perfil, con el cuerno en espiral trazado sobre sus líneas de construcción y guías que marcan la línea de avance, el centro de masa, el peso, el apoyo de las pezuñas en la roca y el ángulo de la postura.",
      cajetin: "Siempre hacia adelante",
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
      h: "Always forward",
      p: [
        "The bighorn sheep climbs the mountain ranges of northern Mexico where there seems to be no path. It does not turn back or stop until it gets there. That is how we carry every matter: with a steady step and with persistence, until the result is achieved.",
        "That persistence rests on preparation. Every matter is prepared as if it were going to trial; that is why we negotiate from a firm position and most matters are resolved sooner.",
      ],
      listaLabel: "Guides on the drawing and what they mean for the firm",
      piezas: [
        { nom: "Determination", parte: "Horn", tag: "Horn", desc: "Every matter has a clear objective from the first day, and the firm does not let go of it until it is achieved." },
        { nom: "No turning back", parte: "Line of advance", tag: "Line of advance", desc: "In the face of an obstacle, the firm does not turn back: it finds the way and keeps going. A negotiation backed by a well-prepared case moves forward better." },
        { nom: "Prevention", parte: "Center of mass", tag: "Center of mass", desc: "Up-to-date compliance — contracts, internal work rules, the collective bargaining agreement and IMSS — is the weight that keeps the company stable before any dispute." },
        { nom: "A steady step", parte: "Footing on the rock", tag: "Footing on the rock", desc: "A file in order is the rock on which every step rests: documents that are complete, signed and easy to locate." },
        { nom: "Persistence", parte: "Stance", tag: "Stance", desc: "Prevention first. If a dispute comes, the company is already on its feet, and the firm stays with it to the end." },
      ],
      svgLabel: "Drawing of a bighorn sheep in profile, with its spiral horn traced over the construction lines and guides that mark the line of advance, the center of mass, the weight, the footing of the hooves on the rock and the angle of the stance.",
      cajetin: "Always forward",
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
