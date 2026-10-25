type EyebrowTone = "navy" | "paper" | "light";

interface EyebrowProps {
  /** Texto de la etiqueta ("Socio", "Noticia"…). Opcional en los encabezados de sección. */
  label?: string;
  /**
   * Número de sección del menú ("01" … "06"). Si se pasa (también "" para el § solo),
   * el eyebrow lleva el expediente "§ 02 ——" delante de la etiqueta.
   */
  num?: string;
  /** navy: encabezado Azul Profundo · paper: encabezado Hueso · light: cuerpo blanco */
  tone?: EyebrowTone;
  className?: string;
  testId?: string;
  /** data-testid de la etiqueta (p. ej. "badge-seniority" en el perfil) */
  labelTestId?: string;
}

// Colores por fondo. La lima solo toca el glifo § y solo sobre Azul Profundo
// (regla de la lima, §4 de la especificación); las cifras y la etiqueta van en
// blanco al 74 %. Sobre claro: § y cifras en Azul Marino, etiqueta en Gris Medio
// (Azul Marino si no hay expediente: es una etiqueta clave, como "Resumen").
const TONES: Record<EyebrowTone, { glyph: string; num: string; rule: string; label: string }> = {
  // Los encabezados internos ya no son Azul Profundo (encabezado «Folio», en papel): el tono navy
  // se pinta como papel, con el § en el color de las marcas de la paleta
  navy: { glyph: "text-[color:var(--ss-mark)]", num: "text-ss-marino", rule: "bg-ss-input", label: "text-ss-medio" },
  paper: { glyph: "text-ss-marino", num: "text-ss-marino", rule: "bg-ss-input", label: "text-ss-medio" },
  light: { glyph: "text-ss-marino", num: "text-ss-marino", rule: "bg-ss-rule", label: "text-ss-medio" },
};

/**
 * Eyebrow del expediente: "§ 03 —— Socio". Marcado de dos piezas (§ y cifras) porque
 * Chromium no aplica ::first-letter a "§ 03" y el glifo necesita su propio color.
 * Las dimensiones están en .ss-eyebrow (index.css).
 */
export function Eyebrow({ label, num, tone = "light", className = "", testId, labelTestId }: EyebrowProps) {
  const c = TONES[tone];
  const hasFile = num !== undefined;
  const labelColor = !hasFile && tone === "light" ? "text-ss-marino" : c.label;

  return (
    <p className={`ss-eyebrow ${className}`} data-testid={testId}>
      {hasFile && (
        <>
          <span aria-hidden="true" className={`shrink-0 whitespace-nowrap ${c.num}`}>
            <span className={c.glyph}>§</span>
            {num ? ` ${num}` : ""}
          </span>
          <span aria-hidden="true" className={`block h-px w-6 shrink-0 ${c.rule}`} />
        </>
      )}
      {label && (
        <span className={labelColor} data-testid={labelTestId}>
          {label}
        </span>
      )}
    </p>
  );
}
