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

type VisibilityFields = { slug: string; isPartner?: boolean | null; title?: string | null };

export function isOfCounselMember(member: Pick<VisibilityFields, "title">): boolean {
  return member.title?.toLowerCase() === "of counsel";
}

/**
 * Socios confirmados y Of Counsel (los asociados van en el mosaico sin nombres).
 */
export function isNamedOnTeamPage(member: VisibilityFields): boolean {
  if (member.isPartner) return CONFIRMED_PARTNER_SLUGS.has(member.slug);
  return isOfCounselMember(member);
}
