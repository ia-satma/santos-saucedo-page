/* Los socios de la firma, para /team y las fichas. La API pública es la fuente de verdad de
   visibilidad. Los defaults solo sirven para la forma inicial de los datos, nunca para reinsertar
   un socio que el CMS haya ocultado. */
import type { TeamMember } from "@shared/schema";
import { CONFIRMED_PARTNER_SLUGS, isNamedOnTeamPage } from "@/lib/teamPhotoSources";
import { PARTNERS_FALLBACK } from "@/v3/home/copy";

const byOrder = (a: TeamMember, b: TeamMember) => ((a.order ?? 0) - (b.order ?? 0)) || a.name.localeCompare(b.name);

/** Socio confirmado (uno de los cuatro) que pertenece al catálogo público. */
export const isFirmPartnerSlug = (slug: string | undefined | null) => !!slug && CONFIRMED_PARTNER_SLUGS.has(slug);

/** Socios confirmados primero, seguidos por los demás socios públicos en el orden del panel. */
export function firmPartners(members: TeamMember[] | undefined | null): TeamMember[] {
  const list = (members ?? []).filter((member) => member.isPartner && isNamedOnTeamPage(member));
  const confirmedOrder = new Map<string, number>(PARTNERS_FALLBACK.map((item, index) => [item.slug, index]));
  return list.sort((a, b) => {
    const aConfirmed = confirmedOrder.get(a.slug);
    const bConfirmed = confirmedOrder.get(b.slug);
    if (aConfirmed !== undefined || bConfirmed !== undefined) {
      if (aConfirmed === undefined) return 1;
      if (bConfirmed === undefined) return -1;
      return aConfirmed - bConfirmed;
    }
    return byOrder(a, b);
  });
}
