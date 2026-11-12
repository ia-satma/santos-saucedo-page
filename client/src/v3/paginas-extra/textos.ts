/* Textos nuevos de las páginas que no tenían equivalente en la demo (Carreras, Pasantías, Testimonios,
   avisos legales y 404). Solo rótulos de interfaz y textos alternativos: el contenido de cada página
   sigue viniendo de su archivo y del panel (CMS) en diez idiomas. Español e inglés; los demás idiomas
   usan copia localizada con el idioma de la página. */
import type { LanguageCode } from "@shared/constants";
import { localizedRecord } from "@/v3/locales";
import type { V3Lang } from "@/v3/shared";

export type PaginasExtraTexts = {
  /** Índice de los avisos legales */
  indice: string;
  /** Nombre del índice para lectores de pantalla */
  indiceLabel: string;
  /** Foto del mezanine (cabecera de Pasantías): el texto alternativo de la demo (of-mezanine) */
  mezanineAlt: string;
  /** Campo del CV: el botón y el aviso de que aún no hay archivo (el navegador los ponía en su propio idioma) */
  elegirArchivo: string;
  sinArchivo: string;
};

const PX_BASE: Record<V3Lang, PaginasExtraTexts> = {
  es: {
    indice: "Contenido",
    indiceLabel: "Contenido del documento",
    mezanineAlt: "Mezanine con estaciones de trabajo y barandal de cristal",
    elegirArchivo: "Elegir archivo",
    sinArchivo: "Ningún archivo elegido",
  },
  en: {
    indice: "Contents",
    indiceLabel: "Document contents",
    mezanineAlt: "Mezzanine with workstations and a glass railing",
    elegirArchivo: "Choose file",
    sinArchivo: "No file chosen",
  },
};

export const PX: Record<LanguageCode, PaginasExtraTexts> = localizedRecord("px", PX_BASE);
