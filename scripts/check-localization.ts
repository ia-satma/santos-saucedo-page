import { readFile } from "node:fs/promises";
import { SUPPORTED_LANGUAGES } from "../shared/constants";

const expected = ["es", "en", "de", "zh", "ko", "ja", "ar", "ru", "fr", "it"];
const actual = SUPPORTED_LANGUAGES.map((item) => item.code);
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Catálogo inesperado: ${actual.join(",")}`);
}
const zh = SUPPORTED_LANGUAGES.find((item) => item.code === "zh");
const ko = SUPPORTED_LANGUAGES.find((item) => item.code === "ko");
if (zh?.locale !== "zh-CN" || !/Mandarin/i.test(zh.name)) throw new Error("zh no está configurado como mandarín simplificado.");
if (ko?.locale !== "ko-KR") throw new Error("ko no está configurado como coreano ko-KR.");

const i18n = await readFile("client/src/i18n.ts", "utf8");
for (const code of expected) {
  if (!i18n.includes(`const ${code}Common`)) throw new Error(`Falta el recurso i18n ${code}.`);
}
const snapshot = JSON.parse(await readFile("shared/translation-snapshot.json", "utf8"));
if (snapshot.version !== 1 || !snapshot.entries || typeof snapshot.entries !== "object") {
  throw new Error("El snapshot de traducciones no tiene el formato esperado.");
}
const translationCounts: Record<string, number> = {};
for (const key of Object.keys(snapshot.entries)) {
  const language = key.split("|")[2];
  if (language) translationCounts[language] = (translationCounts[language] || 0) + 1;
}
for (const code of expected.slice(1)) {
  if (!translationCounts[code]) throw new Error(`El snapshot no contiene traducciones para ${code}.`);
}

const cmsSnapshot = JSON.parse(await readFile("shared/cms-static-snapshot.json", "utf8"));
if (cmsSnapshot.version !== 1 || !cmsSnapshot.content || typeof cmsSnapshot.content !== "object") {
  throw new Error("El snapshot CMS no tiene el formato esperado.");
}
const cmsSections = Object.keys(cmsSnapshot.content).length;
if (cmsSections === 0) throw new Error("El snapshot CMS está vacío.");

console.log(`localization ok: ${expected.length}/10 idiomas; ${Object.keys(snapshot.entries).length} entradas y ${cmsSections} secciones estáticas; zh-CN y ko-KR verificados`);
