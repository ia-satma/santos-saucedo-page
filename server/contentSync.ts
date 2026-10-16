import { createHash } from "crypto";
import { practiceGroupsData, teamMembersData } from "./seed";

/* Pone al día, en una base ya poblada, los textos que vienen de la semilla (prácticas y
   equipo). seed() solo inserta en tablas vacías: sin esto, el sitio publicado seguiría con los
   textos anteriores (por ejemplo, la práctica laboral con "más de 35 años").
   Un campo solo se cambia si su valor actual es exactamente uno de los que escribió una versión
   anterior de server/seed.ts; lo que alguien editó desde el panel se respeta. Las huellas
   (sha256, 24 primeros caracteres) salen de todas las versiones de seed.ts en la historia del
   repositorio. Es idempotente: lo ya actualizado no vuelve a cambiar.
   Autorizado por el dueño del proyecto el 2026-10-16 ("actualiza textos"). */

const PRACTICE_FIELDS = ["name", "nameEs", "description", "descriptionEs", "fullDescription", "fullDescriptionEs"] as const;
const TEAM_FIELDS = ["name", "title", "titleEs", "role", "roleEs", "bio", "bioEs"] as const;

type Previous = Record<string, Record<string, string[]>>;

// Huellas de los valores anteriores, por slug y campo
const PREVIOUS_PRACTICE: Previous = {
  "corporativo-contractual": { description: ["6ecfadb6b642e0a3cab9df0d"], descriptionEs: ["aeed60e875e6c02bca866640"], fullDescription: ["aee4bb13448b92bb9e5fdfd5", "c073c12955febabcf3cdb72c"], fullDescriptionEs: ["06ac44b6d0a697e1768aed3c"], name: ["588f72bea4604fe825bdbaad"], nameEs: ["0d63bb033cce38234e4481e1"] },
  "laboral-seguridad-social": { description: ["0e9abb97bbecfe1c60086848", "ba8987a0abe773ca9f3e126f"], descriptionEs: ["344c60f57655380f23da8e24"], fullDescription: ["43df8a1b0f0c5cf92928c7cb", "ad1789ccd979746a2de82d81"], fullDescriptionEs: ["04203acf8b78d0347411d24c"], name: ["0eef421b01aeb4afa1fa2621"], nameEs: ["ba656cd49b532dd3abc3d8d3"] },
  "litigio-contencioso": { description: ["8c4b6f9d9c96c54ab180927f"], descriptionEs: ["5da8a2bb6271ff669e770e83"], fullDescription: ["0d0e28ff72cb8483c4164e71", "a157657b56b54d9989250ccf"], fullDescriptionEs: ["1ea643b8694654db60a3f714"], name: ["15f54774ddd33839214acad6", "ad0bbbe2be4164b4416cf26f"], nameEs: ["59344dc35239215a4669d412", "feb99a4bab4897344c2bde7c"] },
  "migratorio": { description: ["49c43d16e80425924efaea6e", "fa7d6624484a60acb12ef648"], descriptionEs: ["73b15d50cbd9cc6a280cedb6"], fullDescription: ["480e57f2820ff11059f90ac7", "893edeb375ff2e346a4ec554"], fullDescriptionEs: ["23fc800ea2aaaa003bcf6339"] },
};

const PREVIOUS_TEAM: Previous = {
  "ancella-reynoso-pamanes": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "carlos-a-cerda-ramos": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["b51e2b3ab40d5307eec586fd"], titleEs: ["b1f7930bf9c9022df7b704c0"] },
  "carlos-f-rodriguez-mirelles": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["9442be7da01286f53e968867"] },
  "david-martinez-saucedo": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "diana-g-lopez-rodriguez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "eduardo-castillo-cervantes": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "enrique-santos-arce": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["612492b8792d2aff42ad43c0"], titleEs: ["af77c0e85faa08afdf59ca72"] },
  "enrique-santos-guzman": { bio: ["57db97fa419fdf46588e694a"], bioEs: ["68b2457aeaa55c372b30609b"], name: ["02e691c415dd173f7cf5a798"], role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["513f0082c653e3b284a6c1db"], titleEs: ["b041f5fba9392df8dbcaf635"] },
  "erick-estrada-marquez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "gabriela-l-garcia-vasquez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["9442be7da01286f53e968867"] },
  "huan-jose-trevino-cavazos": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "jaime-herrera-de-herrera": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "jorge-a-garza-martinez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["b51e2b3ab40d5307eec586fd"], titleEs: ["b1f7930bf9c9022df7b704c0"] },
  "jorge-a-melchor-ortiz": { bioEs: ["d38418bb2a8eae87e997902e"], role: ["3c0fdeef50d23622da1129cd"], roleEs: ["efadc56e1f29491a666d3385"] },
  "jose-maria-urena-flores": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "lillia-cardoza-diaz-de-leon": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "luis-a-saucedo-rodriguez": { bio: ["e1e18dee6103e60005c20fa4"], bioEs: ["3298b535982ca174aab1014c"], name: ["97bf889dd2ccadc7419411b7"], role: ["3c0fdeef50d23622da1129cd"], roleEs: ["efadc56e1f29491a666d3385"] },
  "maria-elena-mata-martinez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "mario-saucedo-montemayor": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["513f0082c653e3b284a6c1db"], titleEs: ["b041f5fba9392df8dbcaf635"] },
  "mario-saucedo-rodriguez": { bio: ["bb6022b738a4037181499fe3"], role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["36e99d8cfd7f5ca84356689a"], titleEs: ["469bc7279b362f5b53cb8a59"] },
  "misden-castillo-chavez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "orlando-cantu-garza": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["b51e2b3ab40d5307eec586fd"], titleEs: ["b1f7930bf9c9022df7b704c0"] },
  "pedro-a-sanvicente-romero": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "ruben-a-frias-garcia": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "rubi-quintanilla-martinez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["9442be7da01286f53e968867"] },
};

const fingerprint = (value: string) => createHash("sha256").update(value, "utf8").digest("hex").slice(0, 24);

/** Campos de la fila que todavía tienen un texto anterior de la semilla, con su valor nuevo */
function staleFields(
  row: Record<string, unknown>,
  current: Record<string, unknown>,
  previous: Record<string, string[]> | undefined,
  fields: readonly string[],
) {
  const changes: Record<string, string> = {};
  if (!previous) return changes;
  for (const field of fields) {
    const now = row[field];
    const next = current[field];
    if (typeof now !== "string" || typeof next !== "string" || now === next) continue;
    if (previous[field]?.includes(fingerprint(now))) changes[field] = next;
  }
  return changes;
}

export async function syncSeedContent() {
  const { db } = await import("./db");
  const { and, eq } = await import("drizzle-orm");
  const { practiceGroups, teamMembers } = await import("@shared/schema");

  // Condición "el campo aún tiene el valor que se leyó", por cada campo que se cambia
  const unchanged = (table: object, row: Record<string, unknown>, changes: Record<string, string>) =>
    Object.keys(changes).map((field) => eq((table as Record<string, any>)[field], row[field] as string));

  let updated = 0;

  const groups = await db.select().from(practiceGroups);
  for (const item of practiceGroupsData) {
    const row = groups.find((g: { slug: string }) => g.slug === item.slug);
    if (!row) continue;
    const changes = staleFields(row, item, PREVIOUS_PRACTICE[item.slug], PRACTICE_FIELDS);
    if (Object.keys(changes).length === 0) continue;
    // Solo si la fila sigue con los valores leídos: una edición del panel entre la lectura y
    // la escritura no se pisa
    await db.update(practiceGroups).set(changes).where(and(eq(practiceGroups.id, row.id), ...unchanged(practiceGroups, row, changes)));
    updated++;
  }

  const members = await db.select().from(teamMembers);
  for (const item of teamMembersData) {
    const row = members.find((m: { slug: string }) => m.slug === item.slug);
    if (!row) continue;
    const changes = staleFields(row, item, PREVIOUS_TEAM[item.slug], TEAM_FIELDS);
    if (Object.keys(changes).length === 0) continue;
    await db.update(teamMembers).set(changes).where(and(eq(teamMembers.id, row.id), ...unchanged(teamMembers, row, changes)));
    updated++;
  }

  if (updated > 0) console.log(`[seed] Textos de la semilla actualizados en ${updated} filas (prácticas y equipo)`);
}
