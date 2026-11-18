import type { CmsValue } from "@shared/cms";

export type TranslationQaSeverity = "critical" | "warning";
export interface TranslationQaFinding {
  code: string;
  severity: TranslationQaSeverity;
  path: string;
  message: string;
}

export interface TranslationQaResult {
  status: "passed" | "blocked";
  findings: TranslationQaFinding[];
}

const LANGUAGE_MARKERS: Record<string, RegExp> = {
  en: /\b(?:the|and|with|employment|labor|company)\b/i,
  de: /\b(?:der|die|das|und|arbeit|unternehmen)\b/i,
  zh: /[\u3400-\u9fff]/,
  ko: /[\uac00-\ud7af]/,
  ja: /[\u3040-\u30ff\u3400-\u9fff]/,
  ar: /[\u0600-\u06ff]/,
  ru: /[\u0400-\u04ff]/,
  fr: /\b(?:le|la|les|et|avec|entreprise)\b/i,
  it: /\b(?:il|la|le|e|con|azienda)\b/i,
};
const NON_TRANSLATABLE_PATH = /(?:^|\.)(?:url|href|path|email|phone|linkedin|website|token|placeholder)$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function collectStrings(value: unknown, path: string[] = [], output: Array<{ path: string; text: string }> = []) {
  if (typeof value === "string") {
    if (value.trim()) output.push({ path: path.join("."), text: value });
    return output;
  }
  if (Array.isArray(value)) value.forEach((item, index) => collectStrings(item, [...path, String(index)], output));
  else if (isRecord(value)) Object.entries(value).forEach(([key, item]) => collectStrings(item, [...path, key], output));
  return output;
}

function placeholders(text: string): string[] {
  return Array.from(text.matchAll(/\[\[(?:KEEP|PLACEHOLDER)[^\]]*\]\]/g), (match) => match[0]).sort();
}

function urls(text: string): string[] {
  return Array.from(text.matchAll(/https?:\/\/[^\s<>"]+/gi), (match) => match[0].replace(/[),.;]+$/, "")).sort();
}

function tokens(text: string, pattern: RegExp): string[] {
  return Array.from(text.matchAll(pattern), (match) => match[0]).sort();
}

function htmlTags(text: string): string[] {
  return Array.from(text.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi), (match) => match[1].toLowerCase());
}

/** Deterministic QA for pending CMS translations. It never calls an AI provider. */
export function reviewTranslation(source: CmsValue, translated: CmsValue, targetLanguage: string): TranslationQaResult {
  const findings: TranslationQaFinding[] = [];
  const sourceFields = collectStrings(source);
  const translatedFields = new Map(collectStrings(translated).map((field) => [field.path, field.text]));
  const marker = LANGUAGE_MARKERS[targetLanguage];

  for (const field of sourceFields) {
    const value = translatedFields.get(field.path);
    if (!value?.trim()) {
      findings.push({ code: "missing_field", severity: "critical", path: field.path, message: "Falta la traducción de este campo." });
      continue;
    }
    if (NON_TRANSLATABLE_PATH.test(field.path)) {
      if (JSON.stringify(urls(field.text)) !== JSON.stringify(urls(value))) {
        findings.push({ code: "url_mismatch", severity: "critical", path: field.path, message: "Las URLs no coinciden con la fuente." });
      }
      continue;
    }
    if (value.trim() === field.text.trim()) {
      findings.push({ code: "unchanged_text", severity: "warning", path: field.path, message: "El texto traducido es idéntico al texto fuente." });
    }
    if (marker && field.text.trim().length >= 16 && value.trim().length >= 4 && !marker.test(value)) {
      findings.push({ code: "language_marker_missing", severity: "critical", path: field.path, message: `No se detectaron marcadores esperados para ${targetLanguage}.` });
    }
    if (JSON.stringify(placeholders(field.text)) !== JSON.stringify(placeholders(value))) {
      findings.push({ code: "placeholder_mismatch", severity: "critical", path: field.path, message: "Los placeholders no coinciden con la fuente." });
    }
    if (JSON.stringify(urls(field.text)) !== JSON.stringify(urls(value))) {
      findings.push({ code: "url_mismatch", severity: "critical", path: field.path, message: "Las URLs no coinciden con la fuente." });
    }
    if (JSON.stringify(tokens(field.text, /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi)) !== JSON.stringify(tokens(value, /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi))) {
      findings.push({ code: "email_mismatch", severity: "critical", path: field.path, message: "Los correos no coinciden con la fuente." });
    }
    if (JSON.stringify(tokens(field.text, /(?:\+?\d[\d\s().-]{7,}\d)/g)) !== JSON.stringify(tokens(value, /(?:\+?\d[\d\s().-]{7,}\d)/g))) {
      findings.push({ code: "phone_mismatch", severity: "critical", path: field.path, message: "Los teléfonos no coinciden con la fuente." });
    }
    if (JSON.stringify(tokens(field.text, /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g)) !== JSON.stringify(tokens(value, /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g))) {
      findings.push({ code: "date_mismatch", severity: "critical", path: field.path, message: "Las fechas no coinciden con la fuente." });
    }
    if (JSON.stringify(htmlTags(field.text)) !== JSON.stringify(htmlTags(value))) {
      findings.push({ code: "html_mismatch", severity: "critical", path: field.path, message: "La estructura HTML no coincide con la fuente." });
    }
  }

  return {
    status: findings.some((finding) => finding.severity === "critical") ? "blocked" : "passed",
    findings,
  };
}
