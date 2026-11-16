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
  path: string;
  aliases: string[];
  blocks: string[];
  tabs: CmsEditorTab[];
};

const tab = (section: CmsSection, label: string, description: string): CmsEditorTab => ({ section, label, description });

export const cmsEditorPages: CmsEditorPage[] = [
  {
    id: "home",
    label: "Portada",
    group: "Contenido del sitio",
    path: "/",
    aliases: [],
    blocks: ["Hero", "Nuestra firma", "Cifras", "Filosofía", "Prácticas", "Industrias", "Empresas extranjeras", "Socios", "Monitor Laboral", "Pie de página"],
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
      tab("seo", "SEO", "Título y descripción para buscadores y compartir"),
    ],
  },
  {
    id: "about",
    label: "Nuestra firma",
    group: "Contenido del sitio",
    path: "/about",
    aliases: ["/nuestra-firma"],
    blocks: ["Encabezado", "Introducción", "Historia", "Cifras", "Valores y principios", "Prioridad", "Siempre hacia adelante", "Capacidad de reacción", "Oficina y fotografías", "Navegación siguiente", "SEO"],
    description: "Edita la landing institucional completa, organizada por bloques de contenido.",
    impact: "Afecta Nuestra firma y sus enlaces relacionados",
    manualId: "nuestra-firma",
    tabs: [
      tab("about", "Historia y valores", "Introducción, historia, cifras y principios"),
      tab("v3", "Láminas visuales", "Láminas animadas, textos, medios y accesibilidad"),
      tab("seo", "SEO", "Título y descripción de buscadores"),
    ],
  },
  {
    id: "practices",
    label: "Prácticas",
    group: "Contenido del sitio",
    path: "/practice-groups",
    aliases: ["/practicas"],
    blocks: ["Hero", "Introducción", "Listado de prácticas", "Servicios", "Capacidad de reacción", "Navegación siguiente", "SEO"],
    description: "Edita la portada de Prácticas y administra el catálogo de áreas que puede crecer.",
    impact: "Afecta la portada y las fichas de prácticas",
    manualId: "practicas",
    tabs: [
      tab("practices", "Portada", "Título, entradilla, tarjetas y medios"),
      tab("practice-services", "Servicios", "Qué hacemos en cada área"),
      tab("practice-detail", "Fichas", "Etiquetas y textos de detalle"),
      tab("practice-names", "Idiomas", "Nombres por idioma"),
      tab("layout", "Visibilidad", "Bloques visibles de Prácticas"),
      tab("seo", "SEO", "Título y descripción para buscadores"),
    ],
  },
  {
    id: "industries",
    label: "Industrias",
    group: "Contenido del sitio",
    path: "/industries",
    aliases: ["/industrias", "/industry-groups", "/industry-groups/:slug"],
    blocks: ["Hero", "Introducción", "Buscador y filtros", "Listado de industrias", "Animación y mapa", "Navegación siguiente", "SEO"],
    description: "Edita la portada de Industrias y el catálogo de grupos que aparece en el sitio.",
    impact: "Afecta la portada y las fichas de industrias",
    manualId: "industrias",
    tabs: [
      tab("industries", "Portada", "Introducción y textos del listado"),
      tab("industry-detail", "Fichas", "Etiquetas de cada industria"),
      tab("layout", "Visibilidad", "Bloques visibles de Industrias"),
      tab("seo", "SEO", "Título y descripción para buscadores"),
    ],
  },
  {
    id: "team",
    label: "Socios y equipo",
    group: "Contenido del sitio",
    path: "/team",
    aliases: ["/socios"],
    blocks: ["Hero", "Introducción", "Mosaico de fotografías", "Socios", "Asociados", "Presencia y mapa", "Navegación siguiente", "SEO"],
    description: "Edita la portada del equipo y las etiquetas que acompañan cada perfil.",
    impact: "Afecta la portada y los perfiles públicos",
    manualId: "equipo",
    tabs: [
      tab("team", "Portada", "Introducción y títulos del directorio"),
      tab("profile", "Perfiles", "Biografía, formación y contacto"),
      tab("layout", "Visibilidad", "Bloques visibles de Socios y equipo"),
      tab("media", "Medios", "Mosaico y fotografías compartidas"),
      tab("seo", "SEO", "Título y descripción para buscadores"),
    ],
  },
  {
    id: "news",
    label: "Monitor Laboral",
    group: "Contenido del sitio",
    path: "/news",
    aliases: ["/monitor-laboral", "/articles", "/events"],
    blocks: ["Hero", "Introducción", "Filtros", "Búsqueda", "Notas", "Paginación", "Suscripción", "Navegación siguiente", "SEO"],
    description: "Edita la presentación del Monitor y sus textos de navegación. Las noticias se administran en su catálogo.",
    impact: "Afecta el Monitor Laboral y sus publicaciones",
    manualId: "monitor",
    tabs: [
      tab("news-intro", "Introducción", "Presentación del Monitor"),
      tab("monitor-ui", "Filtros y estados", "Búsqueda, categorías y estados"),
      tab("monitor-subscribe", "Suscripción", "Llamadas del formulario"),
      tab("news-detail", "Notas", "Etiquetas de cada publicación"),
      tab("layout", "Visibilidad", "Bloques visibles del Monitor"),
      tab("seo", "SEO", "Título y descripción para buscadores"),
    ],
  },
  {
    id: "contact",
    label: "Contacto",
    group: "Contenido del sitio",
    path: "/contact",
    aliases: ["/contacto"],
    blocks: ["Hero", "Datos de contacto", "Oficinas y mapa", "Fotografías", "Formulario", "Consentimiento", "Respuestas", "Barra de teléfono", "SEO"],
    description: "Edita textos, horarios, consentimiento y campos del formulario de contacto.",
    impact: "Afecta Contacto, pie y datos compartidos",
    manualId: "contacto",
    tabs: [
      tab("contact", "Contenido", "Títulos, instrucciones y estados"),
      tab("contactData", "Datos del despacho", "Dirección, teléfonos y correos"),
      tab("contact-consent", "Consentimiento", "Aviso y casillas del formulario"),
      tab("contact-feedback", "Respuestas", "Mensajes después del envío"),
      tab("forms", "Controles del formulario", "Activación y mensajes cuando se pausa"),
      tab("layout", "Visibilidad", "Bloques visibles de Contacto"),
      tab("seo", "SEO", "Título y descripción para buscadores"),
    ],
  },
  {
    id: "offices",
    label: "Oficinas",
    group: "Contenido del sitio",
    path: "/offices",
    aliases: ["/oficinas"],
    blocks: ["Hero", "Introducción", "Dirección", "Mapa y direcciones", "Horario", "Recorrido fotográfico", "Lightbox", "Navegación siguiente", "SEO"],
    description: "Edita el nombre, presentación, horario y fotografías de la oficina.",
    impact: "Afecta Oficinas, Contacto y el pie",
    manualId: "oficinas",
    tabs: [
      tab("officeLabels", "Nombre de la página", "Nombre visible por idioma"),
      tab("offices", "Contenido", "Introducción, horario y galería"),
      tab("layout", "Visibilidad", "Bloques visibles de Oficinas"),
      tab("media", "Medios", "Fotografías de la oficina"),
      tab("contactData", "Datos del despacho", "Datos compartidos de contacto"),
      tab("seo", "SEO", "Título y descripción para buscadores"),
    ],
  },
  {
    id: "careers",
    label: "Carreras",
    group: "Contenido del sitio",
    path: "/careers",
    aliases: ["/carreras"],
    blocks: ["Hero", "A quién buscamos", "Cultura y entorno", "Pasantías", "Vacantes", "Cómo postularse", "Formulario", "Navegación siguiente", "SEO"],
    description: "Edita la información de Carreras, Pasantías y sus formularios.",
    impact: "Afecta Carreras, Pasantías y postulaciones",
    manualId: "carreras",
    tabs: [
      tab("careers", "Carreras", "Textos de reclutamiento"),
      tab("interns", "Pasantías", "Programa de prácticas profesionales"),
      tab("forms", "Formularios", "Activación y mensajes públicos"),
      tab("layout", "Visibilidad", "Bloques visibles de Carreras"),
      tab("media", "Medios", "Fotografías de Carreras"),
      tab("contactData", "Datos del despacho", "Datos compartidos de contacto"),
      tab("seo", "SEO", "Título y descripción para buscadores"),
    ],
  },
  {
    id: "testimonials",
    label: "Testimonios",
    group: "Contenido complementario",
    path: "/testimonios",
    aliases: ["/testimonials"],
    blocks: ["Hero", "Enlace a Google Reviews", "Estados", "Lista de testimonios", "Formulario de invitación", "SEO"],
    description: "Edita los textos del módulo y revisa los testimonios desde su bandeja de aprobación.",
    impact: "Afecta la página pública de testimonios",
    manualId: "testimonios",
    tabs: [tab("testimonials", "Contenido", "Título, introducción y formulario"), tab("layout", "Visibilidad", "Bloques visibles de Testimonios"), tab("media", "Medios", "Imagen del encabezado"), tab("contactData", "Datos del despacho", "Datos compartidos de contacto"), tab("seo", "SEO", "Título y descripción para buscadores")],
  },
  {
    id: "media",
    label: "Biblioteca de medios",
    group: "Contenido del sitio",
    path: "/",
    aliases: [],
    blocks: ["Logos", "Video y póster", "Fotografías", "Galerías", "Carrusel del equipo", "App Storage"],
    description: "Carga y reutiliza imágenes, videos, documentos y otros medios del sitio.",
    impact: "Afecta los recursos visuales de las páginas públicas",
    manualId: "medios",
    tabs: [
      tab("media", "Biblioteca", "Imágenes, videos, documentos y almacenamiento"),
    ],
  },
  {
    id: "interns",
    label: "Pasantías S&S",
    group: "Contenido del sitio",
    path: "/careers/interns",
    aliases: ["/pasantias"],
    blocks: ["Hero", "Cómo postularse", "Formulario", "Navegación siguiente", "SEO"],
    description: "Edita la página de Pasantías S&S y su llamada a postularse.",
    impact: "Afecta Pasantías S&S y sus postulaciones",
    manualId: "pasantias",
    tabs: [tab("interns", "Pasantías", "Hero, postulación y mensajes del formulario"), tab("forms", "Formularios", "Controles y estados"), tab("contactData", "Datos del despacho", "Datos compartidos de contacto"), tab("seo", "SEO", "Título y descripción para buscadores")],
  },
  {
    id: "newsletter",
    label: "Boletín",
    group: "Contenido del sitio",
    path: "/newsletter",
    aliases: ["/boletin"],
    blocks: ["Título", "Formulario", "Consentimiento", "Estados", "Notas relacionadas", "SEO"],
    description: "Edita la suscripción al Monitor Laboral y sus mensajes.",
    impact: "Afecta el Boletín y sus formularios",
    manualId: "boletin",
    tabs: [tab("newsletter", "Contenido", "Título, formulario y estados"), tab("forms", "Formularios", "Activación y estados"), tab("news-detail", "Notas relacionadas", "Etiquetas de notas relacionadas"), tab("chrome", "Menú y pie", "Etiquetas compartidas"), tab("seo", "SEO", "Título y descripción para buscadores")],
  },
  {
    id: "privacy",
    label: "Aviso de privacidad",
    group: "Contenido legal",
    path: "/privacy-policy",
    aliases: ["/aviso-de-privacidad"],
    blocks: ["Hero", "Fecha de actualización", "Secciones legales", "Contacto", "Navegación siguiente", "SEO"],
    description: "Edita el Aviso de privacidad por bloques y por idioma.",
    impact: "Afecta el Aviso de privacidad y sus enlaces",
    manualId: "privacidad",
    tabs: [tab("privacy", "Contenido", "Hero, texto legal y contacto"), tab("privacy-contact", "Contacto", "Texto de contacto del aviso"), tab("media", "Medios", "Imagen del encabezado"), tab("contactData", "Datos del despacho", "Datos compartidos de contacto"), tab("chrome", "Menú y pie", "Etiquetas compartidas"), tab("seo", "SEO", "Título y descripción para buscadores")],
  },
  {
    id: "terms",
    label: "Términos de uso",
    group: "Contenido legal",
    path: "/terms",
    aliases: ["/terminos"],
    blocks: ["Hero", "Fecha de actualización", "Secciones legales", "Contacto", "Navegación siguiente", "SEO"],
    description: "Edita los Términos de uso por bloques y por idioma.",
    impact: "Afecta los Términos de uso y sus enlaces",
    manualId: "terminos",
    tabs: [tab("terms", "Contenido", "Hero, texto legal y contacto"), tab("terms-contact", "Contacto", "Texto de contacto de los términos"), tab("media", "Medios", "Imagen del encabezado"), tab("contactData", "Datos compartidos", "Datos de contacto"), tab("chrome", "Menú y pie", "Etiquetas compartidas"), tab("seo", "SEO", "Título y descripción para buscadores")],
  },
  {
    id: "not-found",
    label: "Página no encontrada",
    group: "Contenido legal",
    path: "",
    aliases: [],
    blocks: ["Título", "Subtítulo", "Enlaces", "SEO"],
    description: "Edita la página que aparece cuando una ruta no existe.",
    impact: "Afecta la experiencia de rutas no encontradas",
    manualId: "pagina-no-encontrada",
    tabs: [tab("not-found", "Contenido", "Título, texto y enlaces"), tab("chrome", "Menú y pie", "Etiquetas compartidas"), tab("seo", "SEO", "Título y descripción para buscadores")],
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
    path: "/",
    aliases: [],
    blocks: ["Contenido"],
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

export const canonicalPageOrder = [
  "home",
  "about",
  "practices",
  "industries",
  "team",
  "news",
  "contact",
  "careers",
  "interns",
  "offices",
  "newsletter",
  "testimonials",
  "privacy",
  "terms",
  "not-found",
] as const;

export function getCmsPage(pageId: string): CmsEditorPage | undefined {
  return cmsEditorPages.find((page) => page.id === pageId);
}

export function getCmsPageForSection(section: CmsSection): CmsEditorPage {
  return getCmsEditorPage(section);
}
