interface LeadParagraphProps {
  eyebrow?: string;
  firstParagraph: string;
  restParagraphs?: string[];
  /**
   * "text" (por defecto): el texto propio de la firma (biografía, resumen, cuerpo de la nota),
   * alineado con el eje del titular, sin filete. "quote": solo para citas reales; lleva el
   * filete de 1 px en Línea al inicio y su sangría, desde md.
   */
  variant?: "text" | "quote";
  className?: string;
  testId?: string;
}

// Una entrada en romana se lee como entrada hasta unas 60 palabras; más larga es texto.
const LEAD_MAX_WORDS = 60;
// Sin espacios entre palabras (chino, japonés): se cuentan caracteres
const LEAD_MAX_CJK_CHARS = 150;
const LEAD_MIN_WORDS = 4;

function words(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function fitsLead(text: string) {
  const count = words(text);
  if (count <= 3) return text.length <= LEAD_MAX_CJK_CHARS;
  return count <= LEAD_MAX_WORDS;
}

// Fin de oración: punto, cierre de interrogación o exclamación seguido de espacio y
// mayúscula (así "S.C. es…" no corta), o los signos de cierre del chino y el japonés.
// Con new RegExp: el tsconfig no fija target y el literal con /u daría error de tsc.
const SENTENCE_END = new RegExp("[.!?…](?=\\s+[\"“«¿¡(]?\\p{Lu})|[。！？](?=\\S)", "gu");

/**
 * Separa la entrada del resto: si el primer párrafo es corto, entero; si es largo
 * (el "Resumen" de las prácticas es un solo párrafo de 12 líneas), su primera
 * oración es la entrada y lo demás pasa a texto. Sin oración utilizable, todo es texto.
 */
function splitLead(text: string): [lead: string, body: string] {
  const paragraph = text.trim();
  if (fitsLead(paragraph)) return [paragraph, ""];
  SENTENCE_END.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SENTENCE_END.exec(paragraph)) !== null) {
    const cut = match.index + match[0].length;
    const lead = paragraph.slice(0, cut).trim();
    if (!fitsLead(lead)) break;
    const isCjk = words(lead) <= 3;
    if (isCjk || words(lead) >= LEAD_MIN_WORDS) {
      return [lead, paragraph.slice(cut).trim()];
    }
  }
  return ["", paragraph];
}

/**
 * Entrada de texto sobre fondo claro: solo el primer párrafo (o su primera oración, si es
 * largo) va en la romana grande 400 en Gris Tinta (.ss-lead), sin capitular; el resto, en el
 * texto corrido (.ss-prose). Sin filete por defecto: el texto se alinea con el titular.
 */
export function LeadParagraph({
  eyebrow,
  firstParagraph,
  restParagraphs = [],
  variant = "text",
  className = "",
  testId,
}: LeadParagraphProps) {
  const [lead, firstBody] = splitLead(firstParagraph);
  const body = [firstBody, ...restParagraphs].filter((p) => p.trim().length > 0);
  const quote = variant === "quote" ? "md:border-s md:border-ss-rule md:ps-8" : "";

  return (
    <div
      className={`${quote} ${className}`.trim()}
      data-testid={testId}
    >
      {eyebrow && (
        <p className="ss-label text-ss-marino mb-4">
          {eyebrow}
        </p>
      )}
      {lead && <p className="ss-lead">{lead}</p>}
      {body.map((p, i) => (
        <p
          key={i}
          className={`ss-prose text-ss-tinta text-[17px] md:text-[18px] ${lead || i > 0 ? "mt-5" : ""}`}
        >
          {p}
        </p>
      ))}
    </div>
  );
}
