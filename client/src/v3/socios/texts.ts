/* Textos nuevos de la página «Socios» (demo v3), con copia para los diez idiomas del sitio.
   Salvo los cargos y datos que vienen del CMS,
   traducido en 10 idiomas: el h1 (etiqueta del menú), «Integrantes del equipo», «Of Counsel»,
   los cargos y la nota de los retratos, que siguen leyéndose del CMS (Team.tsx). */
import type { LanguageCode } from "@shared/constants";
import { localizedRecord } from "../locales";
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
};

const SOCIOS_BASE: Record<V3Lang, SociosTexts> = {
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
  },
};
export const SOCIOS_TEXTS: Record<LanguageCode, SociosTexts> = localizedRecord("socios", SOCIOS_BASE);

/* Ficha de cada persona (/team/<slug>): solo lo nuevo de la v3, el final «Siguiente». Lo demás
   (rótulos, cargos, biografía) ya está en 10 idiomas (TeamMemberDetail.tsx, CMS "profile"). */
export type PerfilTexts = {
  /** «Siguiente» hacia el próximo socio (en el orden del panel) */
  nextPartner: string;
  /** «Siguiente» hacia la próxima persona de su grupo (Of Counsel) o hacia Contacto */
  next: string;
  nextAria: string;
  /** Contacto, cuando la ficha es la última de su grupo (fuera de es/en se usa la del menú) */
  nextTitle: string;
};

const PERFIL_BASE: Record<V3Lang, PerfilTexts> = {
  es: { nextPartner: "Siguiente socio", next: "Siguiente", nextAria: "Siguiente página", nextTitle: "Contacto" },
  en: { nextPartner: "Next partner", next: "Next", nextAria: "Next page", nextTitle: "Contact" },
};
export const PERFIL_TEXTS: Record<LanguageCode, PerfilTexts> = localizedRecord("perfil", PERFIL_BASE);
