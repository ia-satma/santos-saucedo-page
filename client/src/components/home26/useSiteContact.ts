import { useQuery } from "@tanstack/react-query";
import type { SiteContent } from "@shared/schema";
import { home26, type Lang26 } from "./content";

// content.ts no trae correo: mismo respaldo que el pie anterior (Footer.tsx).
const FALLBACK_EMAIL = "info@santossaucedo.com";

// La API da la dirección en una línea. Se compone como membrete en cuatro líneas:
// calle / colonia / ciudad y estado / código postal y país.
function splitAddress(address: string): string[] {
  const p = address.split(/,\s*/).filter(Boolean);
  return p.length >= 4 ? [p[0], p[1], p.slice(2, -2).join(", "), p.slice(-2).join(", ")] : p;
}

/** Datos de contacto de /api/site-content (lo estático de content.ts queda como respaldo).
 *  Pie y menú móvil comparten la consulta; React Query la hace una sola vez. */
export function useSiteContact(lang: Lang26) {
  const t = home26[lang].footer;
  const { data: site } = useQuery<SiteContent>({ queryKey: ["/api/site-content"] });
  const apiAddress = site?.address?.trim();
  const apiPhone = site?.phone?.trim();
  return {
    address: apiAddress ? splitAddress(apiAddress) : [...t.address],
    phone: apiPhone || t.phone,
    phoneHref: apiPhone ? `tel:${apiPhone.replace(/[^\d+]/g, "")}` : t.phoneHref,
    email: site?.email?.trim() || FALLBACK_EMAIL,
  };
}
