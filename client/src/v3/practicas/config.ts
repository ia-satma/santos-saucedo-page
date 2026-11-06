/* Qué lleva cada página de práctica del diseño de la demo v3: su foto de cabecera y sus láminas.
   Las prácticas son las cuatro del sitio (slug de /api/practice-groups); nombre, resumen, texto,
   servicios y equipo vienen de la base y del panel, no de aquí.

   Fotos (las de la demo aprobada; créditos en client/public/v3/creditos-fotos.txt):
   - Laboral y seguridad social: el camino de montaña con su defensa, la foto de la página «laboral» de
     la demo (la de seguridad social, el trabajador asegurado al mástil, queda fuera al unirse las dos).
   - Corporativo y contractual: las vigas de acero, la de la página «corporativo» de la demo.
   - Migratorio: San Pedro desde el dron de la firma, la de la página «migratorio» de la demo.
   - Litigio y penal laboral (sin página en la demo): los rollos de acero en la nave, el patrimonio de la
     empresa que esta práctica defiende (robo, fraude, abuso de confianza); es también su foto en el
     bloque de prácticas del Inicio.

   Láminas: las de la demo para lo que cada práctica hace según su propio texto.
   - Laboral: «Prevención» y «Solución» (anatomía; el lema de la firma, como en la página laboral de la
     demo) y el calendario del IMSS y el INFONAVIT (seguridad social).
   - Corporativo: el archivero. Migratorio: la torre de charolas.
   - Litigio: ninguna. La lámina «Solución» es el juicio LABORAL (Centro de Conciliación, Tribunal
     Laboral, amparo), que en el sitio es parte de la práctica laboral; esta práctica es litigio civil,
     mercantil y penal patrimonial. Para ponerla aquí de todos modos basta con mover
     { kind: "anatomia", sheets: ["solucion"] } a "litigio-contencioso" (y dejar ["orden"] en laboral).
   Las láminas se numeran por página (1/3, 2/3, 3/3 en laboral; 1/1 en las demás). */
import type { V3Lang } from "@/v3/shared";
import type { FgArea } from "./figurasSvg";
import type { SheetId } from "./textos";

export type Plate = { kind: "anatomia"; sheets: SheetId[] } | { kind: "figura"; area: FgArea };

export interface PracticeV3 {
  /** nombre de la página en la demo (data-vista) */
  vista: string;
  photo: { src: string; w: number; h: number; pos: string; alt: Record<V3Lang, string> };
  plates: Plate[];
}

export const PRACTICE_V3: Record<string, PracticeV3> = {
  "laboral-seguridad-social": {
    vista: "laboral",
    photo: {
      src: "v3/c-prevencion.webp", w: 2400, h: 1600, pos: "50% 58%",
      alt: {
        es: "Un camino de montaña sube en curvas por la ladera, visto desde lo alto",
        en: "A mountain road winds up the hillside, seen from above",
      },
    },
    plates: [
      { kind: "anatomia", sheets: ["orden", "solucion"] },
      { kind: "figura", area: "seguridad" },
    ],
  },
  "corporativo-contractual": {
    vista: "corporativo",
    photo: {
      src: "v3/c-estructura.webp", w: 2400, h: 1602, pos: "50% 50%",
      alt: {
        es: "Vigas de acero iluminadas de noche, cruzadas en diagonal",
        en: "Steel beams lit at night, crossing on the diagonal",
      },
    },
    plates: [{ kind: "figura", area: "corporativo" }],
  },
  migratorio: {
    vista: "migratorio",
    photo: {
      src: "v3/c-san-pedro.webp", w: 1920, h: 872, pos: "50% 50%",
      alt: {
        es: "Torres de San Pedro Garza García con el Cerro de la Silla al fondo, vistas desde un dron",
        en: "Towers of San Pedro Garza García with the Cerro de la Silla behind them, seen from a drone",
      },
    },
    plates: [{ kind: "figura", area: "migratorio" }],
  },
  "litigio-contencioso": {
    vista: "litigio",
    photo: {
      src: "v3/c-acumulado.webp", w: 2400, h: 1600, pos: "50% 55%",
      alt: {
        es: "Rollos de lámina de acero alineados en una nave industrial en penumbra",
        en: "Coils of sheet steel lined up in a dim industrial warehouse",
      },
    },
    plates: [],
  },
};

/** Direcciones de la demo (y de enlaces viejos) que apuntaban a prácticas con otro nombre:
    se llevan a la práctica del sitio en lugar de mostrar «no encontrada». */
export const LEGACY_SLUGS: Record<string, string> = {
  "consultoria-litigio-laboral": "laboral-seguridad-social",
  laboral: "laboral-seguridad-social",
  "seguridad-social": "laboral-seguridad-social",
  corporativo: "corporativo-contractual",
  litigio: "litigio-contencioso",
};
