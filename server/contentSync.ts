import { createHash } from "crypto";
import { practiceGroupsData, teamMembersData } from "./seed";
import { cmsDefaults, isCmsSection } from "@shared/cms";

/* Pone al día, en una base ya poblada, los textos que vienen de la semilla (prácticas y
   equipo). seed() solo inserta en tablas vacías: sin esto, el sitio publicado seguiría con los
   textos anteriores (por ejemplo, la práctica laboral con "más de 35 años").
   Un campo solo se cambia si su valor actual es exactamente uno de los que escribió una versión
   anterior de server/seed.ts; lo que alguien editó desde el panel se respeta. Las huellas
   (sha256, 24 primeros caracteres) salen de todas las versiones de seed.ts en la historia del
   repositorio. Es idempotente: lo ya actualizado no vuelve a cambiar.
   Autorizado por el dueño del proyecto el 2026-10-16 ("actualiza textos").
   Junta del 16-10-2026: "más de 40 años de experiencia acumulada" de los socios (antes "35
   años" de la firma, que es de 2009), "presencia en más de 72 ciudades" y la práctica
   "Litigio y penal laboral" (slug litigio-contencioso, sin cambio). Además de prácticas y equipo,
   pone al día las secciones del contenido editable (site_config "editorial.*") que se guardaron
   desde el panel con el texto predeterminado anterior: solo el campo que aún es idéntico al
   predeterminado anterior; lo que alguien escribió en el panel se respeta. */

const PRACTICE_FIELDS = ["name", "nameEs", "description", "descriptionEs", "fullDescription", "fullDescriptionEs"] as const;
const TEAM_FIELDS = ["name", "title", "titleEs", "role", "roleEs", "bio", "bioEs"] as const;

type Previous = Record<string, Record<string, string[]>>;

// Huellas de los valores anteriores, por slug y campo
const PREVIOUS_PRACTICE: Previous = {
  "corporativo-contractual": { description: ["6ecfadb6b642e0a3cab9df0d"], descriptionEs: ["aeed60e875e6c02bca866640"], fullDescription: ["aee4bb13448b92bb9e5fdfd5", "c073c12955febabcf3cdb72c"], fullDescriptionEs: ["06ac44b6d0a697e1768aed3c"], name: ["588f72bea4604fe825bdbaad"], nameEs: ["0d63bb033cce38234e4481e1"] },
  "laboral-seguridad-social": { description: ["0e9abb97bbecfe1c60086848", "ba8987a0abe773ca9f3e126f"], descriptionEs: ["344c60f57655380f23da8e24"], fullDescription: ["43df8a1b0f0c5cf92928c7cb", "ad1789ccd979746a2de82d81", "f1e5f2fd72a8ec546f8630e2"], fullDescriptionEs: ["04203acf8b78d0347411d24c", "66bdca7dd48be0e68f4d549d"], name: ["0eef421b01aeb4afa1fa2621"], nameEs: ["ba656cd49b532dd3abc3d8d3"] },
  "litigio-contencioso": { description: ["8c4b6f9d9c96c54ab180927f", "213edd48f62531e50c7cab7c"], descriptionEs: ["5da8a2bb6271ff669e770e83", "c6e54aaa26bbfa964a114b3b"], fullDescription: ["0d0e28ff72cb8483c4164e71", "a157657b56b54d9989250ccf"], fullDescriptionEs: ["1ea643b8694654db60a3f714"], name: ["15f54774ddd33839214acad6", "ad0bbbe2be4164b4416cf26f", "f0a2a3136bc5606b667dd368"], nameEs: ["59344dc35239215a4669d412", "feb99a4bab4897344c2bde7c", "33e3143f444ba541508b1011"] },
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
  "mario-saucedo-montemayor": { bio: ["59d5ded979e4f439148f75b6"], bioEs: ["4a13cef19e46e4c255333d1c"], role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["513f0082c653e3b284a6c1db"], titleEs: ["b041f5fba9392df8dbcaf635"] },
  "mario-saucedo-rodriguez": { bio: ["bb6022b738a4037181499fe3"], role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["36e99d8cfd7f5ca84356689a"], titleEs: ["469bc7279b362f5b53cb8a59"] },
  "misden-castillo-chavez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "orlando-cantu-garza": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["b51e2b3ab40d5307eec586fd"], titleEs: ["b1f7930bf9c9022df7b704c0"] },
  "pedro-a-sanvicente-romero": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "ruben-a-frias-garcia": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"] },
  "rubi-quintanilla-martinez": { role: ["2fbb4996c114380d424830ee"], roleEs: ["98dd8db9d9326b81a100ee6e"], title: ["9442be7da01286f53e968867"] },
};

// Contenido editable (cms-defaults.json): huellas del texto predeterminado anterior, por sección
// y ruta dentro de la sección (los índices de listas como números)
const PREVIOUS_CMS: Previous = {
  "seo": {
    "home.description.en": ["0c24ab9c819464f6549a97f3"],
    "home.description.es": ["a9ea4afcf2a1c65835c6bc05"],
    "home.description.de": ["a926d2696f5d7378f2560e24"],
    "home.description.zh": ["6b26dde005e37bd7ee65c96d"],
    "home.description.ko": ["e82afede0cf74bc016a6d016"],
    "home.description.ja": ["e4d4d399d0e8295f00ab85fc"],
    "home.description.ar": ["70446c9f729f790989cc45a7"],
    "home.description.ru": ["08e7e80c17c2788a0c52c0d0"],
    "home.description.fr": ["92449266e3298ba62df14f0e"],
    "home.description.it": ["8cedc94ea67179a2513d13ad"],
    "about.description.en": ["bb017b7c0c9648e32b1f7fe5"],
    "about.description.es": ["31349868dcc781c6237ceb35"],
    "about.description.de": ["b339ad534512dbfbfa2ac979"],
    "about.description.zh": ["1fd81832b0605e2161b6dc81"],
    "about.description.ko": ["a08432e9d5b9444eeac41e4e"],
    "about.description.ja": ["95c8acb2d208092c6354a051"],
    "about.description.ar": ["888c72167bb08016ff0e0d29"],
    "about.description.ru": ["b0b29551246549766626f67d"],
    "about.description.fr": ["ab4c81c7957d8d672c765745"],
    "about.description.it": ["d98f0345e3c71b48c9da7e76"],
    "practiceGroups.description.en": ["7710929bd09b7623b928a46a"],
    "practiceGroups.description.es": ["7f73f95f91b314e6f1721efe"],
    "practiceGroups.description.de": ["b6675d42010c2cbcb755c008"],
    "practiceGroups.description.zh": ["a3682ae7c631a949286a57ce"],
    "practiceGroups.description.ko": ["3874d9869c36b88716cea01b"],
    "practiceGroups.description.ja": ["fc689f8928034eac89df41fc"],
    "practiceGroups.description.ar": ["1ea8dc189765cb53fbd2cf01"],
    "practiceGroups.description.ru": ["4211f1ad234477233b7fb57c"],
    "practiceGroups.description.fr": ["55c12aab7620f6d99e967e49"],
    "practiceGroups.description.it": ["5df46eb381ca0976b14b5795"],
  },
  "about": {
    "en.historyText1": ["8192f4823e700c913778323f"],
    "en.stats.0.value": ["48f1733c2419f920df340e58"],
    "en.stats.0.label": ["dfa80a281c6c02340f2d41ff"],
    "en.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "en.stats.1.label": ["1624c1099c818d01e99ceeb4"],
    "es.historyText1": ["3dd55a45c637e892adb66cb6"],
    "es.stats.0.value": ["48f1733c2419f920df340e58"],
    "es.stats.0.label": ["b4ade80ad9e7ed9994e91986"],
    "es.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "es.stats.1.label": ["736b9cc8f26ab730ad111624"],
    "de.subtitle": ["fcc98672b99a6e5c1ebc8628"],
    "de.historyText1": ["f71daee648a0c3f3468f3e39"],
    "de.stats.0.value": ["48f1733c2419f920df340e58"],
    "de.stats.0.label": ["0c1e088052d5a8c7af4a1334"],
    "de.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "de.stats.1.label": ["d0d72ba631e75e0b78101e4d"],
    "zh.subtitle": ["d30c1ee9956c3cdd6b09b0d7"],
    "zh.historyText1": ["686d5493cbc2f3148c3bc616"],
    "zh.stats.0.value": ["48f1733c2419f920df340e58"],
    "zh.stats.0.label": ["fcc415cfac4dda07ca84a884"],
    "zh.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "zh.stats.1.label": ["08da52f5b2e753c1b5bf280c"],
    "ko.subtitle": ["0bc95cda6b72397e530c4e8d"],
    "ko.historyText1": ["f5fd81b1e84dd0a864427ce0"],
    "ko.stats.0.value": ["48f1733c2419f920df340e58"],
    "ko.stats.0.label": ["a548146493ed7a8993422e7a"],
    "ko.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "ko.stats.1.label": ["847a5e0d8b8d06e97fb42026"],
    "ja.subtitle": ["6b85007a68fb37b25debb497"],
    "ja.historyText1": ["8e8fd2b0c36ab744a49fe5ed"],
    "ja.stats.0.value": ["48f1733c2419f920df340e58"],
    "ja.stats.0.label": ["4b0292b33e24d17c385aea37"],
    "ja.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "ja.stats.1.label": ["510a608f071fe180c26f92e1"],
    "ar.subtitle": ["aa2725e6d6052083be7d7c67"],
    "ar.historyText1": ["207b47b5e2c956de652384ea"],
    "ar.stats.0.value": ["48f1733c2419f920df340e58"],
    "ar.stats.0.label": ["c8105feda294bfe5ad177a5e"],
    "ar.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "ar.stats.1.label": ["4d70ce0f3a1903bf6407cd37"],
    "ru.subtitle": ["325fa5407f2683823a8890e2"],
    "ru.historyText1": ["009ed3acca1b258fdf83c208"],
    "ru.stats.0.value": ["48f1733c2419f920df340e58"],
    "ru.stats.0.label": ["24081ded2eab5075af55e30b"],
    "ru.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "ru.stats.1.label": ["4e40e02b09bf5cf4c24b16c2"],
    "fr.subtitle": ["9a4d907c6e2d6c8265a092c3"],
    "fr.historyText1": ["1d6acc6c0e8368d3e8b5469b"],
    "fr.stats.0.value": ["48f1733c2419f920df340e58"],
    "fr.stats.0.label": ["102dff3e2a1fb0e0f67ea938"],
    "fr.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "fr.stats.1.label": ["c6e4a68f4970c535f24c7afd"],
    "it.subtitle": ["85c62f53578f24ea1629b9d1"],
    "it.historyText1": ["2e451cfddfb5b396c8992a71"],
    "it.stats.0.value": ["48f1733c2419f920df340e58"],
    "it.stats.0.label": ["6458106f626f22c0f113b3c5"],
    "it.stats.1.value": ["a3e7273c1bc9a76f3d2aeb06"],
    "it.stats.1.label": ["af3f36d12d6db75831e37527"],
  },
  "careers": {
    "en.environmentText": ["391c265a45f6258c338edd32"],
    "es.environmentText": ["d550f71753a37e1e28dd5d37"],
    "de.environmentText": ["9bba7dea8a34f3e794255445"],
    "zh.environmentText": ["ee64ec51d85c8e69586b8f49"],
    "ko.environmentText": ["96b7a0e329f8d38132f229f0"],
    "ja.environmentText": ["7360e521459bfaee77a39cc9"],
    "ar.environmentText": ["d744bc18efbaadf8508069de"],
    "ru.environmentText": ["dc6d250bbb48225abef46cfe"],
    "fr.environmentText": ["3cf522653ed199748c76251e"],
    "it.environmentText": ["8a720e0dc839ff9f0fd3c2a5"],
  },
  "practices": {
    "en.subtitle": ["873891a2d02a124ace82358d"],
    "es.subtitle": ["65f693aa6b357ec61f3c5cf3"],
    "de.subtitle": ["ca96577e29641a5109af292a"],
    "zh.subtitle": ["f6801608d990f51aeb6b3c98"],
    "ko.subtitle": ["94469f18d343897a317a5390"],
    "ja.subtitle": ["002e686fac3b4bdaa809ce75"],
    "ar.subtitle": ["46cd81ff95ce6cb4357814d9"],
    "ru.subtitle": ["9042aef119799b64034df2ef"],
    "fr.subtitle": ["28bdcf82fcf0dd612c06e8f9"],
    "it.subtitle": ["6dbb2855a5118c2c34303808"],
  },
  "practice-names": {
    "litigio-contencioso.es": ["33e3143f444ba541508b1011"],
    "litigio-contencioso.en": ["f0a2a3136bc5606b667dd368"],
    "litigio-contencioso.de": ["6a8d594f8d38336f04836f0d"],
    "litigio-contencioso.zh": ["ab146fee147e438a5911b0d9"],
    "litigio-contencioso.ko": ["631ecbac5a7ae29d38db385d"],
    "litigio-contencioso.ja": ["bf8182e2fa3962eaf954c90f"],
    "litigio-contencioso.ar": ["a264771d8ddbfeff239c15d1"],
    "litigio-contencioso.ru": ["b94a3c08b20519c7fc1d6fbd"],
    "litigio-contencioso.fr": ["ee2f884c4dee21536a8367a3"],
    "litigio-contencioso.it": ["cf9fba883b3d63994a0ad000"],
  },
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

  const sections = await syncCmsDefaults(db);
  if (sections > 0) console.log(`[seed] Textos predeterminados actualizados en ${sections} secciones guardadas del contenido editable`);
}

/** Valor de una ruta ("es.stats.0.value") dentro de un objeto o lista */
function valueAt(root: unknown, path: string[]): unknown {
  let node = root;
  for (const key of path) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/** Secciones de site_config ("editorial.<sección>") guardadas desde el panel: cambia por el
    predeterminado actual cada campo que todavía tiene el predeterminado anterior */
async function syncCmsDefaults(db: typeof import("./db").db) {
  const { and, eq, like } = await import("drizzle-orm");
  const { siteConfig } = await import("@shared/schema");
  const rows = await db.select().from(siteConfig).where(like(siteConfig.key, "editorial.%"));
  let updated = 0;
  for (const row of rows) {
    const section = row.key.slice("editorial.".length);
    const previous = PREVIOUS_CMS[section];
    if (!previous || !isCmsSection(section) || !row.value) continue;
    let stored: { content?: unknown };
    try { stored = JSON.parse(row.value); } catch { continue; }
    let changed = 0;
    for (const [route, prints] of Object.entries(previous)) {
      const path = route.split(".");
      const holder = valueAt(stored.content, path.slice(0, -1));
      const key = path[path.length - 1];
      if (holder === null || typeof holder !== "object") continue;
      const now = (holder as Record<string, unknown>)[key];
      const next = valueAt(cmsDefaults[section], path);
      if (typeof now !== "string" || typeof next !== "string" || now === next) continue;
      if (!prints.includes(fingerprint(now))) continue;
      (holder as Record<string, unknown>)[key] = next;
      changed++;
    }
    if (changed === 0) continue;
    // Solo si la sección sigue como se leyó: un guardado del panel entretanto no se pisa
    const result = await db.update(siteConfig).set({ value: JSON.stringify(stored), updatedAt: new Date() })
      .where(and(eq(siteConfig.key, row.key), eq(siteConfig.value, row.value))).returning();
    if (result.length) updated++;
  }
  return updated;
}
