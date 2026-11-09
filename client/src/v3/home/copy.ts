/* Textos nuevos del Inicio v3 (demo aprobada el 5-11-2026). El español es el de la demo, al pie de la
   letra; el inglés, en el mismo registro institucional. NO viven aquí (los edita el panel): la frase de
   la firma (home.firma: title y body[0]), la banda de la filosofía (home.creemos: quote, body[0] y label),
   los titulares de las prácticas y de los socios (home.practicas.title, home.socios.title),
   los nombres y resúmenes de las prácticas y los cargos de los socios (/api/practice-groups, /api/team).
   Cifras: las que el sitio ya afirma (about.stats del panel: más de 40 años de experiencia de los socios,
   más de 72 ciudades en la red de despachos aliados) más las 32 entidades de esa red y las cuatro áreas.
   Sin año de fundación: el sitio dice 2009 en «La firma» y «Desde 2010» en la portada. */
import type { V3Lang } from "@/v3/shared";
import { v3Asset } from "../asset";

export const homeCopy = {
  es: {
    intro: {
      boton: "Conozca la firma",
      cifras: {
        anos: "Años de experiencia",
        ciudades: "Ciudades con presencia",
        entidades: "Entidades federativas",
        areas: "Áreas de práctica",
      },
    },
    practicas: {
      entrada: "La práctica laboral es el centro de la firma; las demás la acompañan.",
      ver: "Ver la práctica",
    },
    industrias: {
      titulo: "Industrias que asesoramos",
      boton: "Ver las industrias",
      ver: "Ver la industria",
    },
    socios: {
      boton: "Conozca a los socios y al equipo",
    },
  },
  en: {
    intro: {
      boton: "About the firm",
      cifras: {
        anos: "Years of experience",
        ciudades: "Cities in our alliance network",
        entidades: "States and Mexico City",
        areas: "Practice areas",
      },
    },
    practicas: {
      entrada: "Labor law is the core of the firm; the other practices support it.",
      ver: "View the practice",
    },
    industrias: {
      titulo: "Industries we advise",
      boton: "View the industries",
      ver: "View the industry",
    },
    socios: {
      boton: "Meet the partners and the team",
    },
  },
} satisfies Record<V3Lang, unknown>;

/* Foto de cada práctica en el bloque de Baker, por el slug de la base. Litigio toma la foto que la
   demo aprobada tenía en ese mismo cuadro (los rollos de acero de «seguridad social», práctica que el
   sitio ya integra en Laboral): no es la cabecera de ninguna página de práctica, así que no le roba
   la imagen a otra, y su tono hondo y monocromo se lee bien bajo el velo. */
export const PRACTICE_PHOTOS: Record<string, { clave: string; img: string; w: number; h: number }> = {
  "laboral-seguridad-social": { clave: "laboral", img: v3Asset("/v3/c-laboral.webp"), w: 2000, h: 1334 },
  "corporativo-contractual": { clave: "corporativo", img: v3Asset("/v3/c-corporativo.webp"), w: 2000, h: 1333 },
  migratorio: { clave: "migratorio", img: v3Asset("/v3/c-migratorio.webp"), w: 2000, h: 1333 },
  "litigio-contencioso": { clave: "litigio", img: v3Asset("/v3/c-acumulado.webp"), w: 2400, h: 1600 },
};

/* Los cuatro socios, siempre en este orden (y su respaldo si /api/team no responde). */
export const PARTNERS_FALLBACK = [
  { slug: "mario-saucedo-montemayor", name: "Mario Saucedo Montemayor", es: "Socio director", en: "Managing partner", imageUrl: v3Asset("/team_photos/mario-saucedo-montemayor.png") },
  { slug: "enrique-santos-guzman", name: "Enrique Santos Guzmán", es: "Socio director", en: "Managing partner", imageUrl: v3Asset("/team_photos/enrique-santos-guzman.png") },
  { slug: "enrique-santos-arce", name: "Enrique Santos Arce", es: "Socio fundador", en: "Founding partner", imageUrl: v3Asset("/team_photos/enrique-santos-arce.png") },
  { slug: "mario-saucedo-rodriguez", name: "Mario Saucedo Rodríguez", es: "Socio fundador (in memoriam)", en: "Founding partner (in memoriam)", imageUrl: v3Asset("/team_photos/mario-saucedo-rodriguez-color.png") },
] as const;
