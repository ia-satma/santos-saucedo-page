import type { CmsSection } from "@shared/cms";

export type CmsEditorTab = {
  section: CmsSection;
  label: string;
  description: string;
};

export type CmsEditorPage = {
  id: string;
  label: string;
  group: string;
  description: string;
  impact: string;
  manualId: string;
  tabs: CmsEditorTab[];
};

const tab = (section: CmsSection, label: string, description: string): CmsEditorTab => ({ section, label, description });

export const cmsEditorPages: CmsEditorPage[] = [
  {
    id: "home",
    label: "Portada",
    group: "Contenido del sitio",
    description: "Edita el Inicio por bloques, medios, botones y textos que aparecen en la primera pantalla.",
    impact: "Afecta la portada y varios enlaces del sitio",
    manualId: "portada",
    tabs: [
      tab("home", "Inicio", "Hero, frase principal y bloques destacados"),
      tab("layout", "Secciones visibles", "Orden y visibilidad de bloques"),
      tab("media", "Medios", "Video, poster, logos y fotografías"),
      tab("links", "Enlaces y botones", "Destinos de llamadas a la acción"),
      tab("heroLabels", "Etiquetas", "Textos breves sobre los títulos"),
      tab("chrome", "Menú y pie", "Nombres visibles del sitio"),
      tab("contactData", "Datos del despacho", "Dirección, teléfonos y correos"),
    ],
  },
  {
    id: "about",
    label: "Nuestra firma",
    group: "Contenido del sitio",
    description: "Edita la landing institucional completa, organizada por bloques de contenido.",
    impact: "Afecta Nuestra firma y sus enlaces relacionados",
    manualId: "nuestra-firma",
    tabs: [
      tab("about", "Historia y valores", "Introducción, historia, cifras y principios"),
      tab("v3", "Contenido avanzado", "Bloques editoriales, imágenes y accesibilidad"),
      tab("seo", "SEO", "Título y descripción de buscadores"),
    ],
  },
  {
    id: "practices",
    label: "Prácticas",
    group: "Contenido del sitio",
    description: "Edita la portada de Prácticas y administra el catálogo de áreas que puede crecer.",
    impact: "Afecta la portada y las fichas de prácticas",
    manualId: "practicas",
    tabs: [
      tab("practices", "Portada", "Título, entradilla, tarjetas y medios"),
      tab("practice-services", "Servicios", "Qué hacemos en cada área"),
      tab("practice-detail", "Fichas", "Etiquetas y textos de detalle"),
      tab("practice-names", "Idiomas", "Nombres por idioma"),
    ],
  },
  {
    id: "industries",
    label: "Industrias",
    group: "Contenido del sitio",
    description: "Edita la portada de Industrias y el catálogo de grupos que aparece en el sitio.",
    impact: "Afecta la portada y las fichas de industrias",
    manualId: "industrias",
    tabs: [
      tab("industries", "Portada", "Introducción y textos del listado"),
      tab("industry-detail", "Fichas", "Etiquetas de cada industria"),
    ],
  },
  {
    id: "team",
    label: "Socios y equipo",
    group: "Contenido del sitio",
    description: "Edita la portada del equipo y las etiquetas que acompañan cada perfil.",
    impact: "Afecta la portada y los perfiles públicos",
    manualId: "equipo",
    tabs: [
      tab("team", "Portada", "Introducción y títulos del directorio"),
      tab("profile", "Perfiles", "Biografía, formación y contacto"),
    ],
  },
  {
    id: "news",
    label: "Monitor Laboral",
    group: "Contenido del sitio",
    description: "Edita la presentación del Monitor y sus textos de navegación. Las noticias se administran en su catálogo.",
    impact: "Afecta el Monitor Laboral y sus publicaciones",
    manualId: "monitor",
    tabs: [
      tab("news-intro", "Introducción", "Presentación del Monitor"),
      tab("monitor-ui", "Filtros y estados", "Búsqueda, categorías y estados"),
      tab("monitor-subscribe", "Suscripción", "Llamadas del formulario"),
      tab("news-detail", "Notas", "Etiquetas de cada publicación"),
    ],
  },
  {
    id: "contact",
    label: "Contacto",
    group: "Contenido del sitio",
    description: "Edita textos, horarios, consentimiento y campos del formulario de contacto.",
    impact: "Afecta Contacto, pie y datos compartidos",
    manualId: "contacto",
    tabs: [
      tab("contact", "Contenido", "Títulos, instrucciones y estados"),
      tab("contactData", "Datos del despacho", "Dirección, teléfonos y correos"),
      tab("contact-consent", "Consentimiento", "Aviso y casillas del formulario"),
      tab("contact-feedback", "Respuestas", "Mensajes después del envío"),
    ],
  },
  {
    id: "offices",
    label: "Oficinas",
    group: "Contenido del sitio",
    description: "Edita el nombre, presentación, horario y fotografías de la oficina.",
    impact: "Afecta Oficinas, Contacto y el pie",
    manualId: "oficinas",
    tabs: [
      tab("officeLabels", "Nombre de la página", "Nombre visible por idioma"),
      tab("offices", "Contenido", "Introducción, horario y galería"),
    ],
  },
  {
    id: "careers",
    label: "Carreras y pasantías",
    group: "Contenido del sitio",
    description: "Edita la información de Carreras, Pasantías y sus formularios.",
    impact: "Afecta Carreras, Pasantías y postulaciones",
    manualId: "carreras",
    tabs: [
      tab("careers", "Carreras", "Textos de reclutamiento"),
      tab("interns", "Pasantías", "Programa de prácticas profesionales"),
      tab("forms", "Formularios", "Activación y mensajes públicos"),
    ],
  },
  {
    id: "testimonials",
    label: "Testimonios",
    group: "Contenido complementario",
    description: "Edita los textos del módulo y revisa los testimonios desde su bandeja de aprobación.",
    impact: "Afecta la página pública de testimonios",
    manualId: "testimonios",
    tabs: [tab("testimonials", "Contenido", "Título, introducción y formulario")],
  },
];

const sectionToPage = new Map<CmsSection, CmsEditorPage>();
for (const page of cmsEditorPages) for (const item of page.tabs) sectionToPage.set(item.section, page);

export function getCmsEditorPage(section: CmsSection): CmsEditorPage {
  return sectionToPage.get(section) ?? {
    id: section,
    label: "Configuración del sitio",
    group: "Configuración",
    description: "Edita esta configuración del sitio desde un espacio organizado.",
    impact: "Puede afectar varias páginas públicas",
    manualId: "configuracion",
    tabs: [{ section, label: "Contenido", description: "Campos editables de esta sección" }],
  };
}

export function getCmsTab(section: CmsSection): CmsEditorTab {
  return getCmsEditorPage(section).tabs.find((item) => item.section === section) ?? {
    section,
    label: "Contenido",
    description: "Campos editables de esta sección",
  };
}

export function adminHrefForCmsSection(section: CmsSection): string {
  if (section === "navigation") return "/admin/navigation";
  if (section === "integrations") return "/admin/integrations";
  if (section === "consent") return "/admin/cookie-consent";
  return `/admin/site-config/${section}`;
}
