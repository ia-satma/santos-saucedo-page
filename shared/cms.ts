import { integrationSchema, consentSchema } from "./siteIntegrations";
import { navigationSchema, formControlsSchema, siteLink } from "./siteControls";
import defaults from "./cms-defaults.json";

export type CmsValue =
  | string
  | number
  | boolean
  | null
  | CmsValue[]
  | { [key: string]: CmsValue };
export type CmsSection = keyof typeof defaults;
export const cmsDefaults = defaults as Record<CmsSection, CmsValue>;
export const cmsSections: {
  key: CmsSection;
  label: string;
  path: string;
  help: string;
}[] = [
  {
    key: "voice",
    label: "Voz corporativa",
    path: "/",
    help: "Voz predeterminada para locuciones e indicaciones editoriales de Santos. La ejecución con IA real requiere el proveedor configurado.",
  },
  {
    key: "integrations",
    label: "Google Analytics, Search Console y medición",
    path: "/",
    help: "Dominio canónico, verificación de Google y proveedores de analítica. Guardar un ID no concede acceso a una cuenta de Google.",
  },
  {
    key: "consent",
    label: "Privacidad y cookies",
    path: "/",
    help: "Categorías, textos, versión y vigencia de las preferencias. Los servicios opcionales esperan consentimiento.",
  },
  {
    key: "navigation",
    label: "Menús y submenús",
    path: "/",
    help: "Crear, editar, ordenar y activar enlaces de cabecera, submenús y pie. Las etiquetas se administran por idioma.",
  },
  {
    key: "links",
    label: "Destinos de enlaces y botones",
    path: "/",
    help: "Destinos de las llamadas a la acción del sitio. Los enlaces de navegación se administran en Menús y submenús.",
  },
  {
    key: "forms",
    label: "Formularios públicos",
    path: "/contact",
    help: "Activar o pausar contacto y suscripción; mensajes cuando no están disponibles. Los envíos llegan a Mensajes y suscripciones.",
  },
  {
    key: "home",
    label: "Portada",
    path: "/",
    help: "Titulares, párrafos y textos de las secciones de Inicio. Prácticas y socios se editan en sus catálogos.",
  },
  {
    key: "layout",
    label: "Secciones visibles",
    path: "/",
    help: "Mostrar u ocultar secciones de Inicio y elegir cuántas publicaciones mostrar.",
  },
  {
    key: "media",
    label: "Identidad, fotos y video",
    path: "/",
    help: "Logotipos, portada, fotografías y mosaico del equipo. En Galería general de la oficina puede elegir, ordenar y activar fotografías. Sustituya los archivos en Fotografías.",
  },
  {
    key: "chrome",
    label: "Navegación y pie",
    path: "/",
    help: "Nombres de sección, enlaces visibles, orden del menú y textos del pie en cada idioma. Los títulos de página usan el mismo nombre que el menú.",
  },
  {
    key: "contactData",
    label: "Datos del despacho",
    path: "/contact",
    help: "Dirección, teléfono y correo compartidos por contacto, oficina y pie; correo de reclutamiento y enlaces externos.",
  },
  {
    key: "about",
    label: "Nuestra firma",
    path: "/about",
    help: "Introducción, historia, cifras y principios de trabajo.",
  },
  {
    key: "officeLabels",
    label: "Nombre de Nuestras Oficinas",
    path: "/offices",
    help: "Un nombre por idioma para la página, el menú, el SEO y los enlaces a la oficina.",
  },
  {
    key: "offices",
    label: "Nuestras Oficinas",
    path: "/offices",
    help: "Introducción, grupos de fotografías, textos alternativos y horario. Las imágenes se cambian en Identidad, fotos y video.",
  },
  {
    key: "practice-names",
    label: "Prácticas — nombres por idioma",
    path: "/practice-groups",
    help: "Nombres para los idiomas adicionales. Español e inglés usan el catálogo de prácticas.",
  },
  {
    key: "practice-short-names",
    label: "Prácticas — nombres cortos",
    path: "/contact",
    help: "Etiquetas cortas para los idiomas adicionales del formulario de contacto.",
  },
  {
    key: "practices",
    label: "Prácticas — introducción",
    path: "/practice-groups",
    help: "Entradilla del listado. Cada nombre, descripción, servicio y orden se edita en el catálogo de prácticas.",
  },
  {
    key: "practice-detail",
    label: "Prácticas — etiquetas",
    path: "/practice-groups",
    help: "Textos de interfaz de las fichas de prácticas.",
  },
  {
    key: "team",
    label: "Socios y equipo — introducción",
    path: "/team",
    help: "Etiquetas del equipo. Los perfiles, fotos, visibilidad y orden se editan en Equipo.",
  },
  {
    key: "profile",
    label: "Socios — etiquetas de ficha",
    path: "/team",
    help: "Encabezados de biografía, formación y contacto; los datos de cada persona viven en Equipo.",
  },
  {
    key: "news-intro",
    label: "Monitor — introducción",
    path: "/news",
    help: "Introducción del Monitor en otros idiomas. ES/EN comparten la introducción de Portada.",
  },
  {
    key: "monitor-ui",
    label: "Monitor — filtros y estados",
    path: "/news",
    help: "Etiquetas de categorías, búsqueda y estados. Las publicaciones se editan en Noticias.",
  },
  {
    key: "monitor-subscribe",
    label: "Monitor — suscripción",
    path: "/news",
    help: "Llamada a la suscripción que aparece en el Monitor y sus notas.",
  },
  {
    key: "news-detail",
    label: "Monitor — etiquetas de nota",
    path: "/news",
    help: "Compartir, autoría y navegación de las publicaciones.",
  },
  {
    key: "testimonials",
    label: "Testimonios — textos",
    path: "/testimonios",
    help: "Título, introducción y textos del formulario de invitación. Los testimonios y las invitaciones se administran en Testimonios; el enlace de Google, en Datos del despacho.",
  },
  {
    key: "careers",
    label: "Carreras",
    path: "/careers",
    help: "Textos de reclutamiento. Las vacantes abiertas se administran en su catálogo.",
  },
  {
    key: "interns",
    label: "Semillero S&S",
    path: "/careers/interns",
    help: "Textos del programa de prácticas profesionales.",
  },
  {
    key: "contact",
    label: "Contacto — textos y formulario",
    path: "/contact",
    help: "Etiquetas, instrucciones y horarios; los datos compartidos se editan en Datos del despacho.",
  },
  {
    key: "newsletter",
    label: "Boletín",
    path: "/newsletter",
    help: "Texto, instrucciones y estados del formulario de suscripción.",
  },
  {
    key: "privacy",
    label: "Aviso de privacidad",
    path: "/privacy-policy",
    help: "Texto legal por idioma. Requiere revisión humana; guardar lo actualiza en el sitio.",
  },
  {
    key: "terms",
    label: "Términos de uso",
    path: "/terms",
    help: "Texto legal por idioma. Requiere revisión humana; guardar lo actualiza en el sitio.",
  },
  {
    key: "seo",
    label: "SEO por página",
    path: "/",
    help: "Títulos y descripciones por idioma. Las notas y fichas conservan sus metadatos propios.",
  },
  {
    key: "industries",
    label: "Industrias — introducción",
    path: "/industry-groups",
    help: "Textos del listado de industrias.",
  },
  {
    key: "industry-detail",
    label: "Industrias — etiquetas",
    path: "/industry-groups",
    help: "Etiquetas de las fichas de industrias.",
  },
  {
    key: "contact-consent",
    label: "Contacto — consentimiento",
    path: "/contact",
    help: "Texto público por idioma. Mantenga el contenido legal revisado antes de guardarlo.",
  },
  {
    key: "contact-feedback",
    label: "Contacto — respuestas",
    path: "/contact",
    help: "Texto público por idioma. Mantenga el contenido legal revisado antes de guardarlo.",
  },
  {
    key: "privacy-contact",
    label: "Privacidad — instrucciones",
    path: "/privacy-policy",
    help: "Texto público por idioma. Mantenga el contenido legal revisado antes de guardarlo.",
  },
  {
    key: "terms-contact",
    label: "Términos — instrucciones",
    path: "/terms",
    help: "Texto público por idioma. Mantenga el contenido legal revisado antes de guardarlo.",
  },
  {
    key: "not-found",
    label: "Página no encontrada",
    path: "/pagina-no-encontrada",
    help: "Textos de la página 404.",
  },
];

const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);
export function isCmsSection(value: string): value is CmsSection {
  return Object.prototype.hasOwnProperty.call(cmsDefaults, value);
}

// Clone and merge only declared fields. Missing new fields retain the approved fallback.
export function mergeCms<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    if (!base.length) return structuredClone(override) as T;
    return override.map((value, i) => mergeCms(base[i] ?? base[0], value)) as T;
  }
  if (base !== null && typeof base === "object") {
    if (!override || typeof override !== "object" || Array.isArray(override))
      return base;
    const out = { ...base } as Record<string, unknown>;
    for (const key of Object.keys(out)) {
      if (
        !blockedKeys.has(key) &&
        Object.prototype.hasOwnProperty.call(override, key)
      ) {
        out[key] = mergeCms(
          out[key],
          (override as Record<string, unknown>)[key],
        );
      }
    }
    return out as T;
  }
  return typeof base === typeof override ? (override as T) : base;
}

export function validateCmsValue(
  section: CmsSection,
  value: unknown,
): string[] {
  const specialized =
    section === "integrations"
      ? integrationSchema
      : section === "consent"
        ? consentSchema
        : section === "navigation"
          ? navigationSchema
          : section === "forms"
            ? formControlsSchema
            : undefined;
  if (specialized) {
    const result = specialized.safeParse(value);
    return result.success
      ? []
      : result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
  }
  const errors: string[] = [];
  function check(template: CmsValue, item: unknown, parts: string[]) {
    if (errors.length > 20) return;
    const label = parts.join(".");
    if (Array.isArray(template)) {
      if (!Array.isArray(item)) {
        errors.push(`${label}: debe ser una lista.`);
        return;
      }
      // Navigation maps to fixed routes, so the slots stay fixed; order is an explicit field.
      const fixed = ["nav", "place"].includes(parts.at(-1) ?? "");
      if (item.length > 100 || (fixed && item.length !== template.length))
        errors.push(`${label}: cantidad de elementos inválida.`);
      for (let i = 0; i < item.length; i++) {
        if (template[i] === undefined && template[0] === undefined) {
          errors.push(`${label}: esta lista se administra en su catálogo.`);
          break;
        }
        check(template[i] ?? template[0], item[i], [...parts, String(i)]);
      }
      return;
    }
    if (template !== null && typeof template === "object") {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        errors.push(`${label}: objeto inválido.`);
        return;
      }
      for (const key of Object.keys(item)) {
        if (
          blockedKeys.has(key) ||
          !Object.prototype.hasOwnProperty.call(template, key)
        )
          errors.push(`${label}.${key}: campo no permitido.`);
      }
      for (const key of Object.keys(template))
        check(template[key], (item as Record<string, unknown>)[key], [
          ...parts,
          key,
        ]);
      return;
    }
    if (typeof template !== typeof item || item === null) {
      errors.push(`${label}: tipo de valor inválido.`);
      return;
    }
    if (
      typeof item === "number" &&
      (!Number.isFinite(item) || item < 0 || item > 10000)
    )
      errors.push(`${label}: número fuera de rango.`);
    if (typeof item !== "string") return;
    if (
      item.length > 60000 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(item)
    )
      errors.push(`${label}: texto inválido o demasiado largo.`);
    const field = parts.at(-1) ?? "";
    if (["id", "slug", "path", "noindex"].includes(field) && item !== template)
      errors.push(`${label}: identificador de ruta reservado.`);
    if (field === "href" && section === "chrome" && item !== template)
      errors.push(`${label}: el destino del menú está vinculado a su página.`);
    const isMedia =
      section === "media" &&
      (field.toLowerCase().includes("url") ||
        [
          "poster",
          "videoDesktop",
          "videoMobile",
          "logoLight",
          "logoDark",
          "favicon",
        ].includes(field) ||
        parts.includes("teamMosaic"));
    const isLink = /(?:url|href)$/i.test(field);
    if ((isMedia || isLink) && item && !/^(\/(?!\/)|https:\/\/)/i.test(item))
      errors.push(`${label}: use una ruta del sitio o una URL HTTPS.`);
    if (
      (isMedia || isLink || section === "links") &&
      item &&
      !siteLink.safeParse(item).success
    )
      errors.push(`${label}: dirección inválida.`);
    if ((isMedia || isLink) && /[<>"'\\\s\u0000-\u001f]/.test(item))
      errors.push(`${label}: dirección inválida.`);
    if (
      ((section === "contactData" && /email$/i.test(field)) ||
        (section === "contact" && field === "email") ||
        /^(applyEmail|applicationEmail)$/.test(field)) &&
      item &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)
    )
      errors.push(`${label}: correo inválido.`);
  }
  check(cmsDefaults[section], value, []);
  if (
    section === "voice" &&
    ![
      "alloy",
      "ash",
      "ballad",
      "coral",
      "echo",
      "fable",
      "onyx",
      "nova",
      "sage",
      "shimmer",
      "verse",
    ].includes((value as any)?.ttsVoice)
  )
    errors.push("Voz no admitida.");
  if (section === "layout") {
    const order = (value as { homeOrder?: unknown })?.homeOrder;
    const expected = [
      "firma",
      "creemos",
      "practicas",
      "extranjeras",
      "socios",
      "monitor",
    ];
    if (
      !Array.isArray(order) ||
      order.length !== expected.length ||
      new Set(order).size !== expected.length ||
      order.some((key) => !expected.includes(key))
    )
      errors.push("El orden de Inicio debe incluir cada sección una sola vez.");
    const limit = (value as { monitorLimit?: unknown })?.monitorLimit;
    if (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 30)
      errors.push("El Monitor admite entre 1 y 30 publicaciones.");
  }
  if (JSON.stringify(value).length > 900000)
    errors.push("La sección excede el tamaño admitido.");
  return errors;
}
