import { createHash } from "node:crypto";
import { normalizeRadarItem, type RadarItem, type RadarSourceInput } from "./laborRadar";

export type LegalSourceVerificationStatus = "verified" | "partial" | "rejected";

export interface LegalSourceVerification {
  status: LegalSourceVerificationStatus;
  sourceType: RadarItem["sourceType"];
  sourceId: string;
  officialUrl?: string;
  fingerprint?: string;
  contentSha256?: string;
  checkedAt: string;
  reasons: string[];
}

function canonicalContent(item: Pick<RadarItem, "sourceType" | "sourceId" | "title" | "summary" | "content" | "officialUrl">): string {
  return JSON.stringify({
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    title: item.title,
    summary: item.summary,
    content: item.content,
    officialUrl: item.officialUrl,
  });
}

function isDate(value: string | null | undefined): boolean {
  return Boolean(value && !Number.isNaN(new Date(value).getTime()));
}

/** Deterministic preflight used before a Radar item becomes a Monitor draft. */
export function verifyLegalSource(input: RadarSourceInput | RadarItem, seenFingerprints: ReadonlySet<string> = new Set()): LegalSourceVerification {
  const checkedAt = new Date().toISOString();
  let item: RadarItem;
  try {
    item = "fingerprint" in input ? input : normalizeRadarItem(input);
  } catch (error) {
    return {
      status: "rejected",
      sourceType: (input.sourceType || "manual") as RadarItem["sourceType"],
      sourceId: String(input.sourceId || ""),
      checkedAt,
      reasons: [error instanceof Error ? error.message : "La fuente no pudo normalizarse."],
    };
  }

  const reasons: string[] = [];
  if (!item.sourceId.trim()) reasons.push("Falta el identificador oficial de la fuente.");
  if (!item.title.trim()) reasons.push("Falta el rubro o título de la publicación.");
  if (!item.officialUrl.startsWith("https://")) reasons.push("La fuente oficial debe usar HTTPS.");
  if (!item.publishedAt && !item.effectiveAt && !isDate(item.detectedAt)) {
    reasons.push("Falta una fecha verificable de publicación, vigencia o detección.");
  }
  if (seenFingerprints.has(item.fingerprint)) reasons.push("La huella de la fuente ya está presente en este lote.");
  const hasSubstance = Boolean(item.content.trim() || item.summary.trim());
  if (!hasSubstance) reasons.push("La fuente no contiene resumen ni contenido verificable.");

  const status: LegalSourceVerificationStatus = reasons.some((reason) =>
    /falta el identificador|falta el rubro|HTTPS|huella|no contiene/i.test(reason),
  ) ? "rejected" : hasSubstance && item.content.trim() ? "verified" : "partial";

  return {
    status,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    officialUrl: item.officialUrl,
    fingerprint: item.fingerprint,
    contentSha256: item.contentSha256 || createHash("sha256").update(canonicalContent(item), "utf8").digest("hex"),
    checkedAt,
    reasons,
  };
}
