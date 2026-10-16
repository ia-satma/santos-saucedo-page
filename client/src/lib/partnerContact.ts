import { isNamedOnTeamPage } from "@shared/teamVisibility";

// Datos de contacto directos de un socio (G6). Un correo o teléfono solo es "directo" si es
// distinto de los generales de la firma (pie y /contact, useSiteContact). Hoy todas las fichas
// repiten info@ y el conmutador: ninguna tiene datos directos, y el sitio no lo da a entender
// (ni botones "Enviar correo"/"Llamar" en la ficha, ni la frase de /contact).

/** Lo que se compara: el teléfono y el correo generales (basta lo que devuelve useSiteContact). */
export type FirmContact = { phone: string; email: string };

type ContactFields = {
  email?: string | null;
  phone?: string | null;
  title?: string | null;
};

type PartnerFields = ContactFields & { slug: string; isPartner?: boolean | null };

// Teléfonos comparados solo por sus cifras: "+52 81 8335 2086" = "+528183352086". Sin lada de
// país, los diez dígitos nacionales ("81 8335 2086") también cuentan como el mismo número.
function samePhone(a: string, b: string): boolean {
  const da = a.replace(/\D/g, "");
  const db = b.replace(/\D/g, "");
  if (!da || !db) return false;
  return da === db || da.slice(-10) === db.slice(-10);
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Socio fundador in memoriam: sin datos de contacto aunque el registro trajera alguno. */
export function isInMemoriamMember(member: Pick<ContactFields, "title">): boolean {
  return /in memoriam/i.test(member.title ?? "");
}

/** Correo y teléfono propios de la persona (los que no son los generales de la firma). */
export function directContact(
  member: ContactFields | null | undefined,
  siteContact: FirmContact,
): { email?: string; phone?: string } {
  if (!member || isInMemoriamMember(member)) return {};
  const email = member.email?.trim();
  const phone = member.phone?.trim();
  return {
    email: email && !sameEmail(email, siteContact.email) ? email : undefined,
    phone: phone && !samePhone(phone, siteContact.phone) ? phone : undefined,
  };
}

/** La persona tiene correo o teléfono distintos de los generales de la firma. */
export function hasDirectContact(member: ContactFields | null | undefined, siteContact: FirmContact): boolean {
  const own = directContact(member, siteContact);
  return !!(own.email || own.phone);
}

/** Algún socio nombrado en el sitio (isNamedOnTeamPage) tiene datos directos: solo entonces
    /contact puede decir que "los datos de contacto de cada socio aparecen en su ficha". */
export function anyPartnerHasDirectContact(
  members: readonly PartnerFields[] | null | undefined,
  siteContact: FirmContact,
): boolean {
  return (members ?? []).some(
    (m) => !!m.isPartner && isNamedOnTeamPage(m) && hasDirectContact(m, siteContact),
  );
}
