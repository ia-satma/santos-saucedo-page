import test from "node:test";
import assert from "node:assert/strict";
import { parseAgentPayload } from "../agents/core/contracts";

test("CMS translator requires a source hash and explicit pending-write mode", () => {
  const valid = parseAgentPayload("polyglot_translator", {
    cmsSection: "home",
    sourceHash: "a".repeat(64),
    targetLanguages: ["en", "de", "zh", "ko", "ja", "ar", "ru", "fr", "it"],
    applyChanges: true,
  });
  assert.equal(valid.success, true);

  const missingHash = parseAgentPayload("polyglot_translator", {
    cmsSection: "home",
    targetLanguages: ["en"],
    applyChanges: true,
  });
  assert.equal(missingHash.success, false);
});
