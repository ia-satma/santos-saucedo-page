import {
  DashboardIcon,
  FileTextIcon,
  PersonIcon,
  LockClosedIcon,
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
  SpeakerLoudIcon,
  VideoIcon,
  CookieIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
export const adminNavigation = [
  {
    id: "panel",
    tone: "teal",
    label: "Panel",
    description: "",
    items: [
      {
        href: "/admin/dashboard",
        label: "Resumen",
        hint: "Estado del CMS",
        icon: DashboardIcon,
      },
      {
        href: "/admin/manual",
        label: "Manual de uso",
        hint: "Guía de publicación y edición",
        icon: QuestionMarkCircledIcon,
      },
    ],
  },
  {
    id: "contenido",
    tone: "blue",
    label: "Contenido del sitio",
    description:
      "Edita las páginas, los perfiles y las publicaciones de Santos & Saucedo.",
    items: [
      {
        href: "/admin/site-config/home",
        label: "Portada",
        hint: "Textos de Inicio",
        icon: FileTextIcon,
      },
      {
        href: "/admin/site-config/about",
        label: "Nuestra firma",
        hint: "Historia, cifras y principios",
        icon: LayersIcon,
      },
      {
        href: "/admin/team",
        label: "Abogados y equipo",
        hint: "Crear, editar y ordenar abogados",
        icon: PersonIcon,
      },
      {
        href: "/admin/site-config/team",
        label: "Portada de abogados",
        hint: "Textos del directorio y perfiles",
        icon: PersonIcon,
      },
      {
        href: "/admin/practice-groups",
        label: "Prácticas",
        hint: "Servicios y profesionales relacionados",
        icon: LayersIcon,
      },
      {
        href: "/admin/industry-groups",
        label: "Grupos por industria",
        hint: "Catálogo de industrias",
        icon: LayersIcon,
      },
      {
        href: "/admin/news",
        label: "Monitor Laboral",
        hint: "Noticias y publicaciones ES/EN",
        icon: ReaderIcon,
      },
      {
        href: "/admin/events",
        label: "Eventos",
        hint: "Catálogo de eventos",
        icon: Component2Icon,
      },
      {
        href: "/admin/site-config/careers",
        label: "Carreras",
        hint: "Textos de reclutamiento",
        icon: FileTextIcon,
      },
      {
        href: "/admin/site-config/interns",
        label: "Semillero S&S",
        hint: "Programa de prácticas profesionales",
        icon: PersonIcon,
      },
      {
        href: "/admin/jobs",
        label: "Vacantes",
        hint: "Convocatorias y vigencia",
        icon: Component2Icon,
      },
      {
        href: "/admin/site-config/contact",
        label: "Contacto",
        hint: "Textos y campos del formulario",
        icon: EnvelopeClosedIcon,
      },
      {
        href: "/admin/site-config/offices",
        label: "La oficina",
        hint: "Textos y horarios",
        icon: LayersIcon,
      },
      {
        href: "/admin/content",
        label: "Todas las páginas y textos",
        hint: "Directorio de secciones editables",
        icon: FileTextIcon,
      },
    ],
  },
  {
    id: "medios",
    tone: "orange",
    label: "Archivos y orden",
    description: "Carga y reutiliza imágenes, video y documentos.",
    items: [
      {
        href: "/admin/media",
        label: "Biblioteca de medios",
        hint: "Cargar imágenes, videos y PDF",
        icon: ImageIcon,
      },
      {
        href: "/admin/gallery",
        label: "Galería de La oficina",
        hint: "Fotografías y orden",
        icon: ImageIcon,
      },
      {
        href: "/admin/site-config/media",
        label: "Logos, imágenes y video",
        hint: "Identidad, portada y mosaico",
        icon: VideoIcon,
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
    id: "registros",
    tone: "green",
    label: "Registros recibidos",
    description:
      "Consulta los envíos que llegan desde los formularios públicos.",
    items: [
      {
        href: "/admin/inbox",
        label: "Contacto y suscripciones",
        hint: "Mensajes y suscriptores del Monitor Laboral",
        icon: EnvelopeClosedIcon,
      },
      {
        href: "/admin/testimonials",
        label: "Testimonios",
        hint: "Invitaciones de un solo uso y aprobación",
        icon: ChatBubbleIcon,
      },
      {
        href: "/admin/applications",
        label: "Candidaturas y CV privados",
        hint: "Solicitudes, seguimiento y descargas",
        icon: PersonIcon,
      },
      {
        href: "/admin/site-config/forms",
        label: "Formularios públicos",
        hint: "Activación y textos de los formularios",
        icon: FileTextIcon,
      },
    ],
  },
  {
    id: "configuracion",
    tone: "amber",
    label: "Configuración",
    description: "Navegación, medición, privacidad y accesos del CMS.",
    items: [
      {
        href: "/admin/navigation",
        label: "Navegación y visibilidad",
        hint: "Menús, submenús, destinos y activación",
        icon: GlobeIcon,
      },
      {
        href: "/admin/site-config/layout",
        label: "Secciones de Inicio",
        hint: "Activar, ocultar y ordenar secciones",
        icon: LayersIcon,
      },
      {
        href: "/admin/site-config/chrome",
        label: "Etiquetas y pie de página",
        hint: "Textos de navegación e interfaz",
        icon: FileTextIcon,
      },
      {
        href: "/admin/site-config/links",
        label: "Enlaces y botones",
        hint: "Destinos de las llamadas a la acción",
        icon: GlobeIcon,
      },
      {
        href: "/admin/site-config/contactData",
        label: "Datos del despacho",
        hint: "Dirección, teléfonos y correos",
        icon: EnvelopeClosedIcon,
      },
      {
        href: "/admin/site-config/seo",
        label: "SEO por página",
        hint: "Títulos y descripciones por idioma",
        icon: MagnifyingGlassIcon,
      },
      {
        href: "/admin/integrations",
        label: "Google Analytics y Search Console",
        hint: "GA4, verificación de Google y Leadinfo",
        icon: BarChartIcon,
      },
      {
        href: "/admin/cookie-consent",
        label: "Privacidad y cookies",
        hint: "Categorías, preferencias y consentimiento",
        icon: CookieIcon,
      },
      {
        href: "/admin/site-config/privacy",
        label: "Aviso de privacidad",
        hint: "Documento legal editable",
        icon: LockClosedIcon,
      },
      {
        href: "/admin/site-config/terms",
        label: "Términos de uso",
        hint: "Documento legal editable",
        icon: FileTextIcon,
      },
      {
        href: "/admin/translations",
        label: "Traducciones",
        hint: "Cobertura y traducción de borradores",
        icon: GlobeIcon,
      },
      {
        href: "/admin/users",
        label: "Usuarios y contraseñas",
        hint: "Crear usuarios, roles y restablecer contraseñas",
        icon: PersonIcon,
      },
      {
        href: "/admin/account",
        label: "Mi seguridad",
        hint: "Cambiar mi contraseña y cerrar sesiones",
        icon: LockClosedIcon,
      },
    ],
  },
  {
    id: "ia",
    tone: "teal",
    label: "Agentes y creación con IA",
    description:
      "Genera textos, imágenes, voz y presentaciones; supervisa los agentes.",
    items: [
      {
        href: "/admin/site-config/voice",
        label: "Voz corporativa",
        hint: "Voz predeterminada e indicaciones editoriales",
        icon: SpeakerLoudIcon,
      },
      {
        href: "/admin/agents",
        label: "Agentes IA",
        hint: "Centro de uso y estado de 14 agentes",
        icon: RocketIcon,
      },
      {
        href: "/admin/copies-ai",
        label: "Copys IA",
        hint: "Historial de textos y resultados",
        icon: ReaderIcon,
      },
      {
        href: "/admin/presentations",
        label: "Diapositivas con IA",
        hint: "Presentaciones, PowerPoint, PDF y PNG",
        icon: LayersIcon,
      },
      {
        href: "/admin/generated-images",
        label: "Imágenes con IA",
        hint: "Generar y reutilizar imágenes",
        icon: ImageIcon,
      },
      {
        href: "/admin/generated-audio",
        label: "Voz con IA",
        hint: "Generar y descargar locuciones",
        icon: SpeakerLoudIcon,
      },
      {
        href: "/admin/processing",
        label: "Procesamiento de artículos",
        hint: "Trabajos editoriales",
        icon: ReaderIcon,
      },
      {
        href: "/admin/knowledge",
        label: "Base de conocimiento",
        hint: "Referencias y voz editorial de agentes",
        icon: ReaderIcon,
      },
    ],
  },
  {
    id: "sistema",
    tone: "slate",
    label: "Sistema y auditorías",
    description: "Diagnóstico y documentación de la aplicación.",
    items: [
      {
        href: "/admin/explorer",
        label: "Explorador del sistema",
        hint: "Mapa de módulos del CMS",
        icon: LayersIcon,
      },
      {
        href: "/admin/health-check",
        label: "Salud del sistema",
        hint: "Diagnóstico y conexiones",
        icon: BarChartIcon,
      },
      {
        href: "/admin/performance",
        label: "Rendimiento",
        hint: "Métricas persistidas",
        icon: BarChartIcon,
      },
      {
        href: "/admin/audits",
        label: "Auditorías del sitio",
        hint: "Hallazgos y revisión técnica",
        icon: MagnifyingGlassIcon,
      },
      {
        href: "/admin/guide",
        label: "Ecosistema de agentes",
        hint: "Documentación operativa",
        icon: QuestionMarkCircledIcon,
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
