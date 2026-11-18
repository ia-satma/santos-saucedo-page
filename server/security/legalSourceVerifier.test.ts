import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRadarItem } from "../services/laborRadar";
import { verifyLegalSource } from "../services/legalSourceVerifier";

const source = {
  sourceType: "sjf" as const,
  sourceId: "2032894",
  title: "Registro de tesis laboral",
  summary: "Criterio sobre relación laboral.",
  content: "La tesis analiza una relación laboral y sus efectos.",
  officialUrl: "https://sjfsemanal.scjn.gob.mx/detalle/2032894",
  publishedAt: "2026-11-18",
};

test("legal source verifier accepts an official complete source", () => {
  const item = normalizeRadarItem(source);
  const result = verifyLegalSource(item);
  assert.equal(result.status, "verified");
  assert.equal(result.sourceId, "2032894");
  assert.equal(result.fingerprint, item.fingerprint);
});

test("legal source verifier rejects a lookalike source and duplicate fingerprint", () => {
  const invalid = verifyLegalSource({ ...source, officialUrl: "https://evilscjn.gob.mx/tesis/2032894" });
  assert.equal(invalid.status, "rejected");
  const item = normalizeRadarItem(source);
  const duplicate = verifyLegalSource(item, new Set([item.fingerprint]));
  assert.equal(duplicate.status, "rejected");
  assert.match(duplicate.reasons.join(" "), /huella/i);
});

test("legal source verifier keeps a summary-only source reviewable", () => {
  const result = verifyLegalSource({ ...source, content: "" });
  assert.equal(result.status, "partial");
});
