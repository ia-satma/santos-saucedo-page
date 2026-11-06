/* Los socios de la firma, para /team y las fichas. Regla del cliente: «Nuestros socios» muestra
   SIEMPRE a los cuatro, en este orden: Mario Saucedo Montemayor, Enrique Santos Guzmán, Enrique
   Santos Arce y Mario Saucedo Rodríguez (in memoriam). Como la banda del inicio (v3/home/Socios.tsx):
   los datos de /api/team cuando los trae; si la API falla, todavía no llega o el panel marca a uno
   como no público (la API entonces no lo da), los de PARTNERS_FALLBACK. Los demás socios (y los Of
   Counsel) siguen la visibilidad del panel (isNamedOnTeamPage). */
import type { TeamMember } from "@shared/schema";
import { CONFIRMED_PARTNER_SLUGS, isNamedOnTeamPage } from "@/lib/teamPhotoSources";
import { PARTNERS_FALLBACK } from "@/v3/home/copy";

type Fallback = (typeof PARTNERS_FALLBACK)[number];

/** Registro mínimo de un socio cuando la API no lo da: nombre, cargo (es/en) y retrato. Sin
    biografía ni contacto (la ficha no pinta lo que no tiene). */
function fallbackMember(p: Fallback, order: number): TeamMember {
  return {
    id: `socio-${p.slug}`,
    slug: p.slug,
    name: p.name,
    title: p.en,
    titleEs: p.es,
    role: "",
    roleEs: "",
    isPartner: true,
    isPublic: true,
    showOnHome: null,
    order,
    imageUrl: p.imageUrl,
    email: null,
    phone: null,
  } as unknown as TeamMember;
}

const byOrder = (a: TeamMember, b: TeamMember) => ((a.order ?? 0) - (b.order ?? 0)) || a.name.localeCompare(b.name);

/** Socio confirmado (uno de los cuatro): siempre se nombra y tiene ficha. */
export const isFirmPartnerSlug = (slug: string | undefined | null) => !!slug && CONFIRMED_PARTNER_SLUGS.has(slug);

/** El registro de uno de los cuatro cuando la API no lo da (para su ficha). */
export function firmPartnerFallback(slug: string | undefined | null): TeamMember | undefined {
  const i = PARTNERS_FALLBACK.findIndex((p) => p.slug === slug);
  return i >= 0 && isFirmPartnerSlug(slug) ? fallbackMember(PARTNERS_FALLBACK[i], i + 1) : undefined;
}

/** Los cuatro, en el orden de la firma (de la API o del respaldo), y después los demás socios que el
    panel marca como públicos, en el orden del panel. */
export function firmPartners(members: TeamMember[] | undefined | null): TeamMember[] {
  const list = members ?? [];
  const bySlug = new Map(list.map((m) => [m.slug, m]));
  const four = PARTNERS_FALLBACK
    .filter((p) => CONFIRMED_PARTNER_SLUGS.has(p.slug))
    .map((p, i) => bySlug.get(p.slug) ?? fallbackMember(p, i + 1));
  const others = list
    .filter((m) => m.isPartner && !CONFIRMED_PARTNER_SLUGS.has(m.slug) && isNamedOnTeamPage(m))
    .sort(byOrder);
  return [...four, ...others];
}
