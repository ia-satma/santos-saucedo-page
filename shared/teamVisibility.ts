import type { TeamMember } from "./schema";

// Quién aparece con nombre en el sitio público (/team, "Equipo relacionado", buscador,
// mapa del sitio, JSON-LD). Compartido entre cliente y servidor.

// Socios con retrato 2026 confirmado por nombre (la página "Socios Fundadores" de la
// presentación pone el nombre bajo cada uno). Los demás socios (Jaime Herrera de Herrera,
// David Martínez Saucedo) no se nombran con foto hasta que se identifique su archivo.
export const CONFIRMED_PARTNER_SLUGS = new Set([
  "mario-saucedo-montemayor",
  "enrique-santos-guzman",
  "enrique-santos-arce",
  "mario-saucedo-rodriguez",
]);

type VisibilityFields = { slug: string; isPartner?: boolean | null; title?: string | null; isPublic?: boolean | null };

export function isOfCounselMember(member: Pick<VisibilityFields, "title">): boolean {
  return member.title?.toLowerCase() === "of counsel";
}

/**
 * Socios confirmados y Of Counsel (los asociados van en el mosaico sin nombres).
 */
export function isNamedOnTeamPage(member: VisibilityFields): boolean {
  if (typeof member.isPublic === "boolean") return member.isPublic;
  if (member.isPartner) return CONFIRMED_PARTNER_SLUGS.has(member.slug);
  return isOfCounselMember(member);
}

// DTO públicos de una persona (J1). Listas de campos permitidos: lo que leen las páginas, no
// el registro entero; un campo nuevo del CMS no sale hasta añadirlo aquí. Solo para quien
// isNamedOnTeamPage acepta: asociados y staff no salen en ningún JSON público (el mosaico de
// /team usa fotos estáticas, sin nombres).

// Listas (/api/team, /api/team/partners, buscador): tarjeta de /team, "Equipo relacionado",
// socios de cada práctica y la frase de /contact (correo y teléfono, lib/partnerContact).
const PUBLIC_MEMBER_FIELDS = [
  "id",
  "slug",
  "name",
  "title",
  "titleEs",
  "role",
  "roleEs",
  "isPartner",
  "isPublic",
  "showOnHome",
  "order",
  "imageUrl",
  "email",
  "phone",
] as const satisfies readonly (keyof TeamMember)[];

// Ficha (/api/team/:slug) y autores de una nota: además, biografía (LinkedIn va siempre vacío,
// ver institutionalContact) y las secciones
// de la ficha que se pintan si el registro las trae. Sin representativeMatters: los asuntos
// no se publican (los de la importación eran de plantilla) y la ficha no los pinta sin dato.
const PUBLIC_PROFILE_FIELDS = [
  ...PUBLIC_MEMBER_FIELDS,
  "bio",
  "bioEs",
  "linkedinUrl",
  "education",
  "barAdmissions",
  "languages",
  "affiliations",
  "rankings",
  "publications",
  "experience",
] as const satisfies readonly (keyof TeamMember)[];

export type PublicTeamMember = Pick<TeamMember, (typeof PUBLIC_MEMBER_FIELDS)[number]>;
export type PublicTeamProfile = Pick<TeamMember, (typeof PUBLIC_PROFILE_FIELDS)[number]>;

function pickFields<K extends keyof TeamMember>(member: Partial<TeamMember>, fields: readonly K[]) {
  const out: Record<string, unknown> = {};
  for (const key of fields) out[key] = member[key] ?? null;
  return out as Pick<TeamMember, K>;
}

// Datos personales (junta del 16-10-2026, Gabriel): de los socios solo sale lo institucional.
// El correo y el teléfono públicos son siempre los generales de la firma (info@ y conmutador),
// aunque el panel guarde un celular o un correo propio; el in memoriam, sin contacto. Sin
// LinkedIn ni otras redes personales. Lo usan /api/team*, la vCard, el JSON-LD (que lee la
// ficha pública) y el build estático.
export const FIRM_PUBLIC_EMAIL = "info@santossaucedo.com";
export const FIRM_PUBLIC_PHONE = "+52 81 8335 2086";

function institutionalContact<T extends { email: string | null; phone: string | null; title: string }>(out: T): T {
  const inMemoriam = /in memoriam/i.test(out.title ?? "");
  out.email = out.email && !inMemoriam ? FIRM_PUBLIC_EMAIL : null;
  out.phone = out.phone && !inMemoriam ? FIRM_PUBLIC_PHONE : null;
  return out;
}

export function toPublicTeamMember(member: Partial<TeamMember>): PublicTeamMember {
  return institutionalContact(pickFields(member, PUBLIC_MEMBER_FIELDS));
}

export function toPublicTeamProfile(member: Partial<TeamMember>): PublicTeamProfile {
  const out = institutionalContact(pickFields(member, PUBLIC_PROFILE_FIELDS));
  out.linkedinUrl = null;
  return out;
}
