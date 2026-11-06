/* Dibujos de las láminas isométricas «figuras» de la demo v3: tipos y carga. Cada dibujo vive en su
   propio archivo generado (./dibujos/<área>.ts, copiado tal cual de modules/figuras/section.html de la
   demo; no editar a mano) y se pide con import() solo para la lámina de la página, cuando se acerca a la
   ventana (Figura.tsx): ninguna página descarga los dibujos de las otras.
   @N@ = número de la lámina (lo pone Figura.tsx); @ARIA@ = descripción del dibujo. */
export type FgArea = "corporativo" | "seguridad" | "migratorio";
export interface FgDibujo {
  hoja: string;
  plano: string;
  fg: { stagger: string[]; paso?: number; piezas: Record<string, { m: number[]; n: number[] }> };
  escena: string;
  piezas: { x: string; y: string }[];
}

/** El dibujo de un área, bajo demanda (un fragmento de JS por área) */
export function cargarDibujo(area: FgArea): Promise<FgDibujo> {
  switch (area) {
    case "corporativo": return import("./dibujos/corporativo").then((m) => m.default);
    case "seguridad": return import("./dibujos/seguridad").then((m) => m.default);
    case "migratorio": return import("./dibujos/migratorio").then((m) => m.default);
  }
}
