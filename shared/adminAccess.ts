export const adminPermissions = [
  {
    key: "content",
    label: "Abogados y prácticas",
    hint: "Perfiles, servicios y catálogos del despacho.",
  },
  {
    key: "editorial",
    label: "Monitor Laboral",
    hint: "Crear, editar y publicar noticias y artículos.",
  },
  {
    key: "media",
    label: "Biblioteca y galería",
    hint: "Subir archivos, describirlos y ordenar fotografías.",
  },
  {
    key: "config",
    label: "Páginas y configuración",
    hint: "Textos, identidad, navegación, contacto y SEO.",
  },
  {
    key: "jobs",
    label: "Vacantes",
    hint: "Crear y administrar convocatorias.",
  },
  {
    key: "applications",
    label: "Candidaturas y CV privados",
    hint: "Consultar solicitudes, descargar CV y administrar seguimiento.",
  },
  {
    key: "inbox",
    label: "Mensajes y suscripciones",
    hint: "Consultar los datos recibidos por formularios.",
  },
  {
    key: "agents",
    label: "Agentes del proyecto",
    hint: "Consultar y ejecutar procesos y conocimiento de IA.",
  },
  {
    key: "advanced",
    label: "Diagnóstico técnico",
    hint: "Salud del sistema, traducciones y auditorías.",
  },
] as const;
export type AdminPermission = (typeof adminPermissions)[number]["key"];
export const manageableRoles = [
  "super_admin",
  "editor",
  "sistemas",
  "recursos_humanos",
  "redactor",
  "viewer",
] as const;
export type ManagedRole = (typeof manageableRoles)[number];
export const adminRoleLabels: Record<string, string> = {
  super_admin: "Administrador principal",
  editor: "Editor",
  admin: "Editor (heredado)",
  sistemas: "Administrador técnico",
  recursos_humanos: "Recursos Humanos",
  redactor: "Editor de publicaciones",
  viewer: "Solo consulta",
  author: "Consulta editorial (heredado)",
};
const all = adminPermissions.map((p) => p.key);
export const rolePermissions: Record<string, readonly AdminPermission[]> = {
  super_admin: all,
  editor: all,
  admin: all,
  sistemas: ["content", "media", "agents", "advanced"],
  recursos_humanos: ["jobs", "applications"],
  redactor: ["editorial", "media"],
  viewer: ["content", "editorial", "media", "config", "jobs"],
  author: ["editorial", "media"],
};
export type AccessUser = { role: string; permissions?: string[] | null };
export function hasAdminPermission(
  user: AccessUser | null | undefined,
  permission: AdminPermission | "users",
) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (permission === "users") return false;
  return (
    (rolePermissions[user.role] || []).includes(permission) ||
    (user.permissions || []).includes(permission)
  );
}
export function isReadOnlyAdmin(user: AccessUser) {
  return ["viewer", "author"].includes(user.role);
}

/** One policy shared by the API and navigation. Unknown administrative tools fail closed. */
export function adminPermissionForPath(
  raw: string,
): AdminPermission | "users" | null {
  const path = raw.split("?")[0].replace(/\/$/, "");
  if (/^\/api\/(agents|pipeline)(\/|$)/.test(path)) return "agents";
  if (/^\/api\/(audits|health-check|system)(\/|$)/.test(path))
    return "advanced";
  if (
    /^\/api\/translate(\/|$)/.test(path) ||
    /^\/api\/news\/[^/]+\/(team-members|validate|council-review)(\/|$)/.test(
      path,
    )
  )
    return "editorial";
  if (!path.startsWith("/api/admin") && !path.startsWith("/admin")) return null;
  const route = path.replace(/^\/(?:api\/)?admin\/?/, "");
  if (
    /^(?:|dashboard|overview|me|login|logout|setup|init|manual|account|password\/change)$/.test(
      route,
    )
  )
    return null;
  if (/^(users|access-events)(\/|$)/.test(route)) return "users";
  if (/^preview\//.test(route))
    return route.startsWith("preview/news/") ? "editorial" : "content";
  if (/^(media|media-archive|storage|office-images|gallery)(\/|$)/.test(route))
    return "media";
  if (/^(content|site-config|navigation|integrations|cookie-consent)(\/|$)/.test(route)) return "config";
  if (
    /^(team|practice-groups|industry-groups|clients|testimonials|rankings|awards|desks|alliances|offices)(\/|$)/.test(
      route,
    )
  )
    return "content";
  if (/^(editor\/news|news|posts|categories|tags|events)(\/|$)/.test(route))
    return "editorial";
  if (/^catalog-order\//.test(route))
    return route.endsWith("/gallery") ? "media" : "content";
  if (route === "order") return "content";
  if (/^(applications|career-applications)(\/|$)/.test(route)) return "applications";
  if (/^jobs(\/|$)/.test(route)) return "jobs";
  if (/^(inbox|contact-submissions|newsletter-subscribers)(\/|$)/.test(route))
    return "inbox";
  if (
    /^(agents|knowledge|processing|generated-images|generated-audio|generated-presentations|presentations|copies-ai)(\/|$)/.test(
      route,
    )
  )
    return "agents";
  return "advanced";
}
export function canVisitAdminPath(
  user: AccessUser | null | undefined,
  path: string,
) {
  const permission = adminPermissionForPath(path);
  return !permission || hasAdminPermission(user, permission);
}

export interface ManagedAdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[] | null;
  isActive: boolean | null;
  createdAt: string | null;
  lastLogin: string | null;
  revision: string;
}
