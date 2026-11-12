import path from "node:path";

export const PRESENTATION_REFERENCE_TEMPLATE = {
  id: "santos-saucedo-reference-2026-11",
  label: "Presentación institucional Santos & Saucedo",
  pptx: path.join(process.cwd(), "server/assets/presentation-templates/santos-saucedo-reference/Presentacion Santos Saucedo.pptx"),
  html: path.join(process.cwd(), "server/assets/presentation-templates/santos-saucedo-reference/Presentacion Santos Saucedo.html"),
} as const;

// Esta guía resume la plantilla entregada por el despacho. El agente la usa para estructurar el
// contenido, mientras el renderer conserva el logo, la paleta y los exportables editables.
export const PRESENTATION_REFERENCE_GUIDANCE = `
PLANTILLA APROBADA DE REFERENCIA — ${PRESENTATION_REFERENCE_TEMPLATE.label}
- Portada institucional sobria con título, promesa de valor y ubicación. No inventes cifras ni credenciales.
- Orden editorial recomendado: agenda, quiénes somos, cifras verificables, servicios, metodología, cita, actualidad, alianza nacional y contacto.
- Alterna divisores oscuros, láminas de cifras, listas numeradas, procesos, citas y cierre institucional. No uses bullets en todas las diapositivas.
- Usa mucho espacio en blanco, tipografía serif para títulos, sans serif para datos, azul profundo (#0B2850), lima (#BBF741), papel claro y líneas finas.
- Mantén las cifras verificadas del material fuente. La plantilla de referencia contiene ejemplos de 40 años, 72 ciudades y 2010, que solo se pueden usar si aparecen en la fuente actual.
- El renderer añade portada y cierre institucionales cuando están activados. El agente devuelve únicamente las diapositivas de contenido solicitadas.
`;
