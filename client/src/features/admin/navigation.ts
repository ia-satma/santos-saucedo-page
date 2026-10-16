import {
  DashboardIcon,
  FileTextIcon,
  PersonIcon,
  ImageIcon,
  ReaderIcon,
  EnvelopeClosedIcon,
  GearIcon,
  LayersIcon,
  Component2Icon,
  MixerHorizontalIcon,
  GlobeIcon,
  QuestionMarkCircledIcon,
  MagnifyingGlassIcon,
  BarChartIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
export const adminNavigation = [
  {
    label: "Espacio de trabajo",
    items: [
      {
        href: "/admin/dashboard",
        label: "Resumen",
        hint: "Estado del sitio y tareas frecuentes",
        icon: DashboardIcon,
      },
      {
        href: "/admin/content",
        label: "Páginas y textos",
        hint: "Todos los textos del sitio por sección",
        icon: FileTextIcon,
      },
      {
        href: "/admin/team",
        label: "Abogados y equipo",
        hint: "Perfiles, biografías y fotografía",
        icon: PersonIcon,
      },
      {
        href: "/admin/practice-groups",
        label: "Prácticas",
        hint: "Servicios y profesionales relacionados",
        icon: LayersIcon,
      },
      {
        href: "/admin/news",
        label: "Monitor Laboral",
        hint: "Noticias, artículos y borradores",
        icon: ReaderIcon,
      },
      {
        href: "/admin/media",
        label: "Biblioteca de medios",
        hint: "Imágenes, videos y documentos",
        icon: ImageIcon,
      },
      {
        href: "/admin/order",
        label: "Orden del contenido",
        hint: "Prioridad de abogados, prácticas y galería",
        icon: MixerHorizontalIcon,
      },
    ],
  },
  {
    label: "Operación",
    items: [
      {
        href: "/admin/jobs",
        label: "Vacantes",
        hint: "Convocatorias publicadas y vigencia",
        icon: Component2Icon,
      },
      {
        href: "/admin/inbox",
        label: "Mensajes y suscripciones",
        hint: "Formularios recibidos y Monitor Laboral",
        icon: EnvelopeClosedIcon,
      },
      {
        href: "/admin/gallery",
        label: "Galería de La oficina",
        hint: "Fotografías, descripciones y orden",
        icon: ImageIcon,
      },
    ],
  },
  {
    label: "Configuración",
    items: [
      {
        href: "/admin/site-config/chrome",
        label: "Navegación y pie",
        hint: "Etiquetas, enlaces y visibilidad",
        icon: GlobeIcon,
      },
      {
        href: "/admin/site-config/media",
        label: "Identidad y portada",
        hint: "Logos, fotos y video principal",
        icon: GearIcon,
      },
      {
        href: "/admin/site-config/contactData",
        label: "Datos del despacho",
        hint: "Contacto: dirección, teléfonos y correos",
        icon: EnvelopeClosedIcon,
      },
      {
        href: "/admin/site-config/seo",
        label: "SEO y buscadores",
        hint: "Títulos y descripciones por página",
        icon: MagnifyingGlassIcon,
      },
      {
        href: "/admin/manual",
        label: "Guía de uso",
        hint: "Cómo guardar, publicar y ordenar contenido",
        icon: QuestionMarkCircledIcon,
      },
    ],
  },
  {
    label: "Avanzado",
    advanced: true,
    items: [
      {
        href: "/admin/industry-groups",
        label: "Industrias",
        hint: "Catálogo complementario sin menú público propio",
        icon: LayersIcon,
      },
      {
        href: "/admin/translations",
        label: "Traducciones",
        hint: "Herramientas de idiomas",
        icon: GlobeIcon,
      },
      {
        href: "/admin/agents",
        label: "Agentes del proyecto",
        hint: "Automatizaciones y procesos",
        icon: RocketIcon,
      },
      {
        href: "/admin/processing",
        label: "Procesamiento editorial",
        hint: "Trabajos de artículos",
        icon: ReaderIcon,
      },
      {
        href: "/admin/knowledge",
        label: "Base de conocimiento",
        hint: "Referencias de los agentes",
        icon: ReaderIcon,
      },
      {
        href: "/admin/health-check",
        label: "Salud del sistema",
        hint: "Diagnóstico técnico",
        icon: BarChartIcon,
      },
      {
        href: "/admin/audits",
        label: "Auditorías",
        hint: "Revisión técnica del sitio",
        icon: MagnifyingGlassIcon,
      },
      {
        href: "/admin/operations",
        label: "Herramientas anteriores",
        hint: "Estadísticas y accesos heredados",
        icon: GearIcon,
      },
    ],
  },
];
export const allAdminLinks = adminNavigation.flatMap((g) => g.items);
export function activeAdminLink(path: string) {
  return (
    [...allAdminLinks]
      .sort((a, b) => b.href.length - a.href.length)
      .find((x) => path === x.href || path.startsWith(x.href + "/")) ??
    (path.startsWith("/admin/site-config")
      ? allAdminLinks.find((x) => x.href === "/admin/content")
      : undefined)
  );
}
