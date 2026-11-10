import assert from "node:assert/strict";
import { test } from "node:test";
import { AiGovernanceBlockedError } from "../ai/dataGovernance";
import { summarizeEditorialSources } from "../services/editorialSourceDigest";

test("editorial sources retain dates and discussion of confidentiality, while redacting contact details", async () => {
  const result = await summarizeEditorialSources({
    purpose: "presentation",
    topic: "Periodo 2026-2027",
    sourceNotes: "Una empresa debe proteger la información confidencial y el secreto profesional.\nFechas: 2026-2027.\nContacto: oficina@example.test · +52 81 8335 2086.",
  });
  assert.match(result.topic, /2026-2027/);
  assert.match(result.context, /secreto profesional/);
  assert.match(result.context, /2026-2027/);
  assert.doesNotMatch(result.context, /oficina@|8335 2086/);
  assert.equal(result.summarized, false);
});

test("express confidentiality markings and protected classifications still block outbound processing", async () => {
  await assert.rejects(summarizeEditorialSources({
    purpose: "social",
    documentsText: "CONFIDENCIAL: Borrador interno del expediente\nEl resto del contenido es sintético.",
  }), (error: unknown) => error instanceof AiGovernanceBlockedError && error.reasonCodes.includes("express_confidentiality"));
  await assert.rejects(summarizeEditorialSources({
    purpose: "presentation",
    classification: "privileged",
    topic: "Material de prueba.",
  }), (error: unknown) => error instanceof AiGovernanceBlockedError && error.reasonCodes.includes("classification_privileged_blocked"));
});
