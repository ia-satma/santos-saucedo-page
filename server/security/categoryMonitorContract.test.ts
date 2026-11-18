import test from "node:test";
import assert from "node:assert/strict";
import { categoryOutputSchema, parseAgentPayload } from "../agents/core/contracts";

test("monitor category payload accepts enriched labor fields", () => {
  const parsed = parseAgentPayload("category_agent", {
    articleId: "11111111-1111-4111-8111-111111111111",
    mode: "monitor",
    applyChanges: false,
  });
  assert.equal(parsed.success, true);

  const output = categoryOutputSchema.parse({
    primaryCategory: "Laboral",
    practiceAreas: ["Laboral"],
    industrySectors: ["Automotriz"],
    confidence: 0.91,
    jurisdiction: "Nuevo León",
    riskType: "Relaciones colectivas",
    authority: "SJF",
    relevance: "high",
  });
  assert.equal(output.relevance, "high");
});
