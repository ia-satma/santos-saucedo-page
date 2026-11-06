/* Textos nuevos de la página «Socios» (demo v3): español tal cual de la demo y su inglés.
   Los demás idiomas ven el inglés (el bloque declara lang="en"), salvo lo que el sitio ya tiene
   traducido en 10 idiomas: el h1 (etiqueta del menú), «Integrantes del equipo», «Of Counsel»,
   los cargos y la nota de los retratos, que siguen leyéndose del CMS (Team.tsx). */
import type { V3Lang } from "../shared";

export type SociosTexts = {
  /** h1 de la página (es/en); los demás idiomas usan la etiqueta del menú */
  title: string;
  /** aria-label de la lista de socios */
  list: string;
  pause: string;
  resume: string;
  pauseAria: string;
  resumeAria: string;
  /** enlace del cintillo a la ficha del socio en turno */
  profile: string;
  /** «El equipo»: título y entrada */
  teamTitle: string;
  teamLead: string;
  /** «Siguiente» al final de la página */
  next: string;
  nextAria: string;
  nextTitle: string;
  loading: string;
};

export const SOCIOS_TEXTS: Record<V3Lang, SociosTexts> = {
  es: {
    title: "Nuestros socios",
    list: "Socios",
    pause: "Pausar",
    resume: "Reanudar",
    pauseAria: "Pausar el cambio automático de socios",
    resumeAria: "Reanudar el cambio automático de socios",
    profile: "Ver perfil",
    teamTitle: "El equipo",
    teamLead: "Abogados y colaboradores que trabajan con los socios en cada asunto, desde la oficina de San Pedro Garza García.",
    next: "Siguiente",
    nextAria: "Siguiente página",
    nextTitle: "Contacto",
    loading: "Cargando a los socios",
  },
  en: {
    title: "Our partners",
    list: "Partners",
    pause: "Pause",
    resume: "Resume",
    pauseAria: "Pause the automatic change of partners",
    resumeAria: "Resume the automatic change of partners",
    profile: "View profile",
    teamTitle: "The team",
    teamLead: "Lawyers and staff who work with the partners on every matter, from the office in San Pedro Garza García.",
    next: "Next",
    nextAria: "Next page",
    nextTitle: "Contact",
    loading: "Loading the partners",
  },
};
